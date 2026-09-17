import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';

export interface DeliveryDriverLocation {
  id: string;
  orderId: string;
  driverName: string;
  driverPhone: string;
  customerName: string;
  destinationName: string;
  lat: number;
  lng: number;
  status: 'picking_up' | 'on_the_way' | 'delivered';
  etaMinutes: number;
  itemsSummary: string;
}

const RESTAURANT_HUB = {
  name: 'SpiceRoute Kitchen Hub (#01 MG Road)',
  lat: 12.9716,
  lng: 77.5946,
};

const SAMPLE_DELIVERIES: DeliveryDriverLocation[] = [
  {
    id: 'DRV-101',
    orderId: '#ORD-10477',
    driverName: 'Ramesh Kumar (Shadowfax)',
    driverPhone: '+91 98450 11992',
    customerName: 'Amit Joshi',
    destinationName: 'Koramangala 4th Block',
    lat: 12.9352,
    lng: 77.6245,
    status: 'on_the_way',
    etaMinutes: 8,
    itemsSummary: '1x Butter Chicken, 2x Naan',
  },
  {
    id: 'DRV-102',
    orderId: '#ORD-10476',
    driverName: 'Suresh Gowda (Dunzo)',
    driverPhone: '+91 98220 44511',
    customerName: 'Sneha Roy',
    destinationName: 'Indiranagar 100ft Road',
    lat: 12.9784,
    lng: 77.6408,
    status: 'on_the_way',
    etaMinutes: 12,
    itemsSummary: '2x Chicken Dum Biryani, 1x Raita',
  },
  {
    id: 'DRV-103',
    orderId: '#ORD-10474',
    driverName: 'Vikas Patil (Zomato Express)',
    driverPhone: '+91 98110 33420',
    customerName: 'Rohan Deshmukh',
    destinationName: 'Lavelle Road Residency',
    lat: 12.9698,
    lng: 77.5998,
    status: 'picking_up',
    etaMinutes: 4,
    itemsSummary: '1x Paneer Tikka, 1x Dal Makhani',
  },
];

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
  const [activeView, setActiveView] = useState<'fleet' | 'zones'>('fleet');
  const [selectedDriver, setSelectedDriver] = useState<DeliveryDriverLocation>(SAMPLE_DELIVERIES[0]);

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

    // Clear previous markers
    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

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

    // 3. Driver & Destination Markers
    SAMPLE_DELIVERIES.forEach((driver) => {
      const driverIcon = L.divIcon({
        className: 'custom-driver-marker',
        html: `
          <div style="
            background: #3b82f6;
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
            🛵
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
              <strong style="color: #2563eb; font-size: 13px;">${driver.orderId}</strong>
              <span style="background: #e0e7ff; color: #3730a3; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold;">
                ETA ${driver.etaMinutes}m
              </span>
            </div>
            <div style="font-size: 12px; font-weight: bold;">${driver.customerName}</div>
            <div style="font-size: 11px; color: #555;">📍 ${driver.destinationName}</div>
            <div style="font-size: 11px; color: #666; margin-top: 4px;">📞 ${driver.driverName}</div>
            <div style="font-size: 10px; color: #888; font-family: monospace; margin-top: 2px;">${driver.itemsSummary}</div>
          </div>
        `);

      driverMarker.on('click', () => {
        setSelectedDriver(driver);
        onSelectDriver?.(driver);
      });

      markersRef.current[driver.id] = driverMarker;

      // Draw Route Polyline from Hub to Driver
      L.polyline(
        [
          [RESTAURANT_HUB.lat, RESTAURANT_HUB.lng],
          [driver.lat, driver.lng],
        ],
        {
          color: '#3b82f6',
          weight: 3,
          opacity: 0.7,
          dashArray: '6, 8',
        }
      ).addTo(map);
    });

    // Invalidate size to ensure proper rendering inside containers
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      // Keep map alive or cleanup
    };
  }, [showRadiusZones, onSelectDriver]);

  useEffect(() => {
    if (selectedOrderId && markersRef.current) {
      const match = SAMPLE_DELIVERIES.find((d) => d.orderId === selectedOrderId);
      if (match && mapInstanceRef.current) {
        setSelectedDriver(match);
        mapInstanceRef.current.setView([match.lat, match.lng], 14, { animate: true });
        markersRef.current[match.id]?.openPopup();
      }
    }
  }, [selectedOrderId]);

  return (
    <div className="flex flex-col bg-surface-container-low rounded-2xl border border-outline-variant/30 shadow-md overflow-hidden animate-fadeIn">
      {/* Map Control Ribbon */}
      <div className="p-3 sm:p-4 bg-surface-container flex flex-wrap items-center justify-between gap-2 border-b border-outline-variant/30">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[22px]">map</span>
          <div>
            <h3 className="font-bold text-sm text-on-surface">Live Delivery Fleet &amp; Geo-Radar Map</h3>
            <p className="text-[11px] text-on-surface-variant">Real-time OpenStreetMap tracking powered by Leaflet</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 bg-surface-container-high p-0.5 rounded-lg text-xs font-bold border border-outline-variant/40">
            <button
              onClick={() => setActiveView('fleet')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                activeView === 'fleet' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              🛵 Active Drivers ({SAMPLE_DELIVERIES.length})
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
                <span className="font-mono text-xs font-bold text-primary">{selectedDriver.orderId}</span>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-secondary/15 text-secondary text-[10px] font-bold">
                ⚡ ETA: {selectedDriver.etaMinutes} mins
              </span>
            </div>

            <div className="flex flex-col text-xs">
              <span className="font-bold text-on-surface">{selectedDriver.customerName}</span>
              <span className="text-[11px] text-on-surface-variant font-mono">📍 {selectedDriver.destinationName}</span>
              <span className="text-[11px] text-on-surface-variant mt-1">
                Driver: <strong>{selectedDriver.driverName}</strong> ({selectedDriver.driverPhone})
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
