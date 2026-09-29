import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import { api } from '../../services/api';
import { subscribeRealtime } from '../../hooks/useRealtimeSync';

export interface DeliveryDriverLocation {
  id: string;
  orderId?: string;
  activeOrderId?: string;
  driverName?: string;
  name?: string;
  driverPhone?: string;
  phone?: string;
  customerName?: string;
  destinationName?: string;
  destination?: string;
  lat: number;
  lng: number;
  status: 'picking_up' | 'on_the_way' | 'delivered' | 'idle';
  etaMinutes: number;
  itemsSummary?: string;
  vehicle?: string;
}

const RESTAURANT_HUB = {
  name: 'SpiceRoute Kitchen Hub (#01 MG Road)',
  lat: 12.9716,
  lng: 77.5946,
};

interface LiveDeliveryMapProps {
  height?: string;
  selectedOrderId?: string;
  onSelectDriver?: (driver: DeliveryDriverLocation) => void;
  showRadiusZones?: boolean;
}

export const LiveDeliveryMap: React.FC<LiveDeliveryMapProps> = ({
  height = '420px',
  selectedOrderId,
  onSelectDriver,
  showRadiusZones = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const routesRef = useRef<{ [key: string]: L.Polyline }>({});
  const [activeView, setActiveView] = useState<'fleet' | 'zones'>('fleet');
  const [drivers, setDrivers] = useState<DeliveryDriverLocation[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<DeliveryDriverLocation | null>(null);

  const fetchDrivers = useCallback(() => {
    api.getDeliveryDrivers()
      .then((res) => {
        if (res.success && res.data && res.data.length > 0) {
          setDrivers(res.data);
          if (!selectedDriver) {
            setSelectedDriver(res.data[0]);
          }
        }
      })
      .catch(() => {});
  }, [selectedDriver]);

  useEffect(() => {
    fetchDrivers();

    const unsub = subscribeRealtime((event) => {
      if (event.type === 'DRIVER_LOCATION_UPDATED' || event.type === 'DELIVERY_ASSIGNED') {
        fetchDrivers();
      }
    });

    return () => unsub();
  }, [fetchDrivers]);

  // Simulate driver GPS step
  const handleSimulateStep = async (driverId: string) => {
    const d = drivers.find((drv) => drv.id === driverId);
    if (!d) return;

    // Small random walk closer to hub or destination
    const deltaLat = (Math.random() - 0.5) * 0.004;
    const deltaLng = (Math.random() - 0.5) * 0.004;
    const newLat = d.lat + deltaLat;
    const newLng = d.lng + deltaLng;
    const nextEta = Math.max(1, d.etaMinutes - 1);

    await api.updateDriverLocation(driverId, {
      lat: newLat,
      lng: newLng,
      etaMinutes: nextEta,
      status: nextEta <= 1 ? 'delivered' : 'on_the_way',
    }).catch(() => {});
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Initialize map
      const map = L.map(mapContainerRef.current, {
        center: [RESTAURANT_HUB.lat, RESTAURANT_HUB.lng],
        zoom: 13,
        zoomControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // OpenStreetMap Dark Theme Tiles via CartoDB Dark Matter
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://carto.com/">CartoDB</a> OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear previous markers and routes
    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};
    Object.values(routesRef.current).forEach((r) => r.remove());
    routesRef.current = {};

    // 1. Restaurant Hub Marker (Gold/Primary)
    const restaurantIcon = L.divIcon({
      className: 'custom-hub-marker',
      html: `
        <div style="
          background: #f59e0b;
          color: #000;
          font-weight: 900;
          width: 38px;
          height: 38px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 20px rgba(245, 158, 11, 0.6);
          border: 2px solid #ffffff;
          font-size: 18px;
        ">
          🍲
        </div>
      `,
      iconSize: [38, 38],
      iconAnchor: [19, 19],
    });

    const hubMarker = L.marker([RESTAURANT_HUB.lat, RESTAURANT_HUB.lng], { icon: restaurantIcon })
      .addTo(map)
      .bindPopup(`
        <div style="color: #111; font-family: sans-serif; padding: 4px;">
          <strong style="font-size: 13px; color: #b45309;">📍 ${RESTAURANT_HUB.name}</strong><br/>
          <span style="font-size: 11px; color: #555;">Kitchen Base Station • Real-Time Dispatch</span>
        </div>
      `);

    markersRef.current['hub'] = hubMarker;

    // 2. Delivery Circles (Zones: 3km, 6km, 9km)
    if (showRadiusZones) {
      L.circle([RESTAURANT_HUB.lat, RESTAURANT_HUB.lng], {
        radius: 3000,
        color: '#10b981',
        fillColor: '#10b981',
        fillOpacity: 0.06,
        weight: 1.5,
        dashArray: '4, 6',
      }).addTo(map);

      L.circle([RESTAURANT_HUB.lat, RESTAURANT_HUB.lng], {
        radius: 6000,
        color: '#f59e0b',
        fillColor: '#f59e0b',
        fillOpacity: 0.04,
        weight: 1,
        dashArray: '4, 6',
      }).addTo(map);
    }

    // 3. Driver & Destination Markers from real backend data
    drivers.forEach((driver) => {
      const orderTag = driver.activeOrderId || driver.orderId || '#ORD-DELIVERY';
      const drvName = driver.name || driver.driverName || 'Fleet Driver';
      const dest = driver.destination || driver.destinationName || 'Bangalore City';
      const cust = driver.customerName || 'Customer';

      const driverIcon = L.divIcon({
        className: 'custom-driver-marker',
        html: `
          <div style="
            background: ${driver.status === 'delivered' ? '#10b981' : '#3b82f6'};
            color: #fff;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 0 15px rgba(59, 130, 246, 0.7);
            border: 2px solid #ffffff;
            font-size: 14px;
            animation: pulse 2s infinite;
          ">
            ${driver.status === 'delivered' ? '✓' : '🛵'}
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const driverMarker = L.marker([driver.lat, driver.lng], { icon: driverIcon })
        .addTo(map)
        .bindPopup(`
          <div style="color: #111; font-family: sans-serif; padding: 4px; min-width: 180px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <strong style="color: #2563eb; font-size: 13px;">${orderTag}</strong>
              <span style="background: #e0e7ff; color: #3730a3; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold;">
                ETA ${driver.etaMinutes}m
              </span>
            </div>
            <div style="font-size: 12px; font-weight: bold;">${cust}</div>
            <div style="font-size: 11px; color: #555;">📍 ${dest}</div>
            <div style="font-size: 11px; color: #666; margin-top: 4px;">📞 ${drvName} (${driver.phone || driver.driverPhone || ''})</div>
            ${driver.vehicle ? `<div style="font-size: 10px; color: #888; font-family: monospace;">🏍 ${driver.vehicle}</div>` : ''}
          </div>
        `);

      driverMarker.on('click', () => {
        setSelectedDriver(driver);
        onSelectDriver?.(driver);
      });

      markersRef.current[driver.id] = driverMarker;

      // Draw Route Polyline from Hub to Driver
      const poly = L.polyline(
        [
          [RESTAURANT_HUB.lat, RESTAURANT_HUB.lng],
          [driver.lat, driver.lng],
        ],
        {
          color: driver.status === 'delivered' ? '#10b981' : '#3b82f6',
          weight: 3,
          opacity: 0.7,
          dashArray: '6, 8',
        }
      ).addTo(map);

      routesRef.current[driver.id] = poly;
    });

    // Invalidate size to ensure proper rendering inside containers
    setTimeout(() => {
      map.invalidateSize();
    }, 200);
  }, [drivers, showRadiusZones, onSelectDriver]);

  useEffect(() => {
    if (selectedOrderId && markersRef.current) {
      const match = drivers.find((d) => (d.activeOrderId || d.orderId) === selectedOrderId);
      if (match && mapInstanceRef.current) {
        setSelectedDriver(match);
        mapInstanceRef.current.setView([match.lat, match.lng], 14, { animate: true });
        markersRef.current[match.id]?.openPopup();
      }
    }
  }, [selectedOrderId, drivers]);

  return (
    <div className="flex flex-col bg-surface-container-low rounded-2xl border border-outline-variant/30 shadow-md overflow-hidden animate-fadeIn">
      {/* Map Control Ribbon */}
      <div className="p-3 sm:p-4 bg-surface-container flex flex-wrap items-center justify-between gap-2 border-b border-outline-variant/30">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[22px]">map</span>
          <div>
            <h3 className="font-bold text-sm text-on-surface">Live Delivery Fleet &amp; Geo-Radar Map</h3>
            <p className="text-[11px] text-on-surface-variant">Real-time GPS coordinates backed by backend Express &amp; WebSocket gateway</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {selectedDriver && (
            <button
              onClick={() => handleSimulateStep(selectedDriver.id)}
              className="px-2.5 py-1 rounded-md bg-primary-container text-on-primary-container text-xs font-bold shadow-sm hover:brightness-110 flex items-center gap-1"
              title="Simulate driver movement & update GPS on backend"
            >
              <span className="material-symbols-outlined text-[14px]">sports_motorsports</span>
              <span>Pulse Driver GPS</span>
            </button>
          )}

          <div className="flex items-center gap-1 bg-surface-container-high p-0.5 rounded-lg text-xs font-bold border border-outline-variant/40">
            <button
              onClick={() => setActiveView('fleet')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                activeView === 'fleet' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              🛵 Active Drivers ({drivers.length})
            </button>
            <button
              onClick={() => setActiveView('zones')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                activeView === 'zones' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              🌐 Delivery Zones (9km)
            </button>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative w-full" style={{ height }}>
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Floating Active Delivery Card */}
        {selectedDriver && (
          <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-sm bg-surface-container/95 backdrop-blur-md p-3 rounded-xl border border-primary/40 shadow-xl z-20 flex flex-col gap-1.5 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                <span className="font-mono text-xs font-bold text-primary">
                  {selectedDriver.activeOrderId || selectedDriver.orderId || '#ORD-DELIVERY'}
                </span>
              </div>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                selectedDriver.status === 'delivered' ? 'bg-emerald-500/20 text-emerald-600' : 'bg-secondary/15 text-secondary'
              }`}>
                ⚡ ETA: {selectedDriver.etaMinutes} mins ({selectedDriver.status.toUpperCase()})
              </span>
            </div>

            <div className="flex flex-col text-xs">
              <span className="font-bold text-on-surface">{selectedDriver.customerName || 'Direct Customer Order'}</span>
              <span className="text-[11px] text-on-surface-variant font-mono">
                📍 {selectedDriver.destination || selectedDriver.destinationName || 'Koramangala, Bengaluru'}
              </span>
              <span className="text-[11px] text-on-surface-variant mt-1">
                Driver: <strong>{selectedDriver.name || selectedDriver.driverName}</strong> ({selectedDriver.phone || selectedDriver.driverPhone})
              </span>
              {selectedDriver.vehicle && (
                <span className="text-[10px] text-on-surface-variant font-mono">
                  Vehicle: {selectedDriver.vehicle}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
