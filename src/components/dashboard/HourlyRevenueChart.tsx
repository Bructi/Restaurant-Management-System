import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import { subscribeRealtime } from '../../hooks/useRealtimeSync';

interface HourlyDataPoint {
  hour: string;
  revenue: number;
  orders: number;
  isPeak?: boolean;
}

const DEFAULT_HOURLY: HourlyDataPoint[] = [
  { hour: '12 PM', revenue: 2400, orders: 8 },
  { hour: '2 PM', revenue: 4200, orders: 14 },
  { hour: '4 PM', revenue: 1800, orders: 6 },
  { hour: '6 PM', revenue: 5600, orders: 18 },
  { hour: '7 PM', revenue: 7800, orders: 22 },
  { hour: '8:30 PM', revenue: 9400, orders: 24, isPeak: true },
  { hour: '10 PM', revenue: 6200, orders: 16 },
  { hour: '11 PM', revenue: 3100, orders: 9 },
];

export const HourlyRevenueChart: React.FC = () => {
  const [data, setData] = useState<HourlyDataPoint[]>(DEFAULT_HOURLY);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const fetchHourly = useCallback(() => {
    api.getHourlyAnalytics()
      .then((res) => {
        if (res.success && res.data && res.data.length > 0) {
          setData(res.data);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchHourly();

    const unsub = subscribeRealtime((event) => {
      if (
        event.type === 'ORDER_CREATED' ||
        event.type === 'ORDER_UPDATED' ||
        event.type === 'ORDER_SETTLED' ||
        event.type === 'ANALYTICS_UPDATED'
      ) {
        fetchHourly();
      }
    });

    return () => unsub();
  }, [fetchHourly]);

  // Compute scale and SVG points
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 10000);
  const maxOrders = Math.max(...data.map((d) => d.orders), 30);
  const peakPoint = data.find((d) => d.isPeak) || data[data.length - 3] || data[0];

  const width = 760;
  const topPadding = 20;
  const bottomPadding = 140;

  // Generate SVG coordinates
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    // Map revenue to Y (higher revenue = smaller Y in SVG)
    const yRev = bottomPadding - (d.revenue / maxRevenue) * (bottomPadding - topPadding);
    const yOrd = bottomPadding - (d.orders / maxOrders) * (bottomPadding - topPadding - 10);
    return { ...d, x, yRev, yOrd };
  });

  // Build SVG path
  const revenuePath = points.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x},${p.yRev}`;
    const prev = points[i - 1];
    const cx = (prev.x + p.x) / 2;
    return `${acc} C ${cx},${prev.yRev} ${cx},${p.yRev} ${p.x},${p.yRev}`;
  }, '');

  const areaPath = `${revenuePath} L ${width},${bottomPadding} L 0,${bottomPadding} Z`;

  const ordersPath = points.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x},${p.yOrd}`;
    const prev = points[i - 1];
    const cx = (prev.x + p.x) / 2;
    return `${acc} C ${cx},${prev.yOrd} ${cx},${p.yOrd} ${p.x},${p.yOrd}`;
  }, '');

  const peakSvgPoint = points.find((p) => p.isPeak) || points[points.length - 3] || points[0];
  const activeHover = hoveredIdx !== null ? points[hoveredIdx] : null;

  return (
    <div className="bg-surface-container-low rounded-xl p-space-lg shadow-md flex flex-col gap-space-md border border-surface-container-high/30">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">
              Hourly Revenue &amp; Order Flow
            </h2>
            <span className="px-2 py-0.5 rounded bg-surface-container font-label-sm text-label-sm text-secondary font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
              Live Feed
            </span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
            Peak reached ₹{peakPoint.revenue.toLocaleString('en-IN')}/hr at {peakPoint.hour} ({peakPoint.orders} orders)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-label-sm text-label-sm text-on-surface-variant">
            <span className="w-2.5 h-2.5 rounded-full bg-primary" />
            <span className="font-bold text-on-surface">Revenue (₹)</span>
          </div>
          <div className="flex items-center gap-1.5 font-label-sm text-label-sm text-on-surface-variant">
            <span className="w-2.5 h-2.5 rounded-full bg-tertiary" />
            <span className="font-bold text-tertiary">Orders</span>
          </div>
        </div>
      </div>

      {/* Inline Dynamic SVG Area / Line Chart */}
      <div className="relative w-full h-56 mt-2 bg-surface-container-lowest/60 rounded-lg p-2 sm:p-4 border border-surface-container-high/20">
        <svg
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
          viewBox={`0 0 ${width} 170`}
        >
          <defs>
            <linearGradient id="revenueGrad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid lines */}
          <line opacity="0.3" stroke="#333537" strokeDasharray="4 4" strokeWidth="0.8" x1="0" x2={width} y1="20" y2="20" />
          <line opacity="0.3" stroke="#333537" strokeDasharray="4 4" strokeWidth="0.8" x1="0" x2={width} y1="65" y2="65" />
          <line opacity="0.3" stroke="#333537" strokeDasharray="4 4" strokeWidth="0.8" x1="0" x2={width} y1="110" y2="110" />
          <line opacity="0.6" stroke="#333537" strokeWidth="0.8" x1="0" x2={width} y1="140" y2="140" />

          {/* Area fill */}
          <path d={areaPath} fill="url(#revenueGrad)" />

          {/* Revenue Trend Curve */}
          <path
            d={revenuePath}
            fill="none"
            stroke="#f97316"
            strokeLinecap="round"
            strokeWidth="3.5"
          />

          {/* Order Volume Line */}
          <path
            d={ordersPath}
            fill="none"
            stroke="#7bd0ff"
            strokeDasharray="4 4"
            strokeWidth="2.2"
          />

          {/* Peak Highlight Point */}
          <circle
            className="animate-ping origin-center"
            cx={peakSvgPoint.x}
            cy={peakSvgPoint.yRev}
            fill="#f97316"
            opacity="0.5"
            r="7"
          />
          <circle cx={peakSvgPoint.x} cy={peakSvgPoint.yRev} fill="#f97316" r="5" />
          <circle cx={peakSvgPoint.x} cy={peakSvgPoint.yRev} fill="#121416" r="2.5" />

          {/* Interactive hover points */}
          {points.map((p, idx) => (
            <g key={p.hour} onMouseEnter={() => setHoveredIdx(idx)} onMouseLeave={() => setHoveredIdx(null)} className="cursor-pointer">
              <circle cx={p.x} cy={p.yRev} r="8" fill="transparent" />
              {hoveredIdx === idx && (
                <>
                  <line x1={p.x} x2={p.x} y1="15" y2="140" stroke="#f97316" strokeDasharray="2 2" strokeWidth="1" opacity="0.8" />
                  <circle cx={p.x} cy={p.yRev} r="6" fill="#f97316" />
                  <circle cx={p.x} cy={p.yOrd} r="5" fill="#7bd0ff" />
                </>
              )}
            </g>
          ))}
        </svg>

        {/* Dynamic Peak / Hover Annotation */}
        <div
          className="absolute bg-surface-container-high px-2.5 py-1 rounded shadow-lg text-on-surface font-label-sm text-label-sm border border-surface-container-highest/60 flex flex-col items-center pointer-events-none transition-all"
          style={{
            top: '8px',
            left: activeHover
              ? `${Math.max(10, Math.min(80, (activeHover.x / width) * 100))}%`
              : `${Math.max(10, Math.min(80, (peakSvgPoint.x / width) * 100))}%`,
            transform: 'translateX(-50%)',
          }}
        >
          <span className="text-primary font-bold">
            ₹{(activeHover ? activeHover.revenue : peakPoint.revenue).toLocaleString('en-IN')} {activeHover?.isPeak || (!activeHover && peakPoint.isPeak) ? '(Peak)' : ''}
          </span>
          <span className="text-[10px] text-on-surface-variant font-mono-metric">
            {activeHover ? activeHover.hour : peakPoint.hour} · {activeHover ? activeHover.orders : peakPoint.orders} Orders
          </span>
        </div>

        {/* X-Axis Labels */}
        <div className="flex justify-between items-center text-on-surface-variant font-label-sm text-label-sm pt-2 px-1">
          {data.map((d) => (
            <span
              key={d.hour}
              className={`transition-colors ${
                d.isPeak ? 'text-primary font-bold' : 'text-on-surface-variant'
              }`}
            >
              {d.hour}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
