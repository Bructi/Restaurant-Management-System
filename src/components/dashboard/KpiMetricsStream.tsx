import React from 'react';
import { KpiMetric } from '../../types';

interface KpiMetricsStreamProps {
  metrics: KpiMetric[];
}

export const KpiMetricsStream: React.FC<KpiMetricsStreamProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-space-md">
      {metrics.map((stat) => {
        if (stat.id === 'revenue') {
          return (
            <div
              key={stat.id}
              className="bg-surface-container-low rounded-xl p-space-md flex flex-col justify-between shadow-md relative overflow-hidden group border border-surface-container-high/30 hover:border-surface-container-high transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
                  {stat.title}
                </span>
                <span className={`material-symbols-outlined ${stat.iconColorClass} text-[20px]`}>
                  {stat.icon}
                </span>
              </div>
              <div className="my-space-sm">
                <div className="font-display-lg-mobile lg:font-display-lg text-display-lg-mobile lg:text-display-lg text-on-surface tracking-tight font-extrabold">
                  {stat.value}
                </div>
                <div className="flex items-center gap-1 mt-1 font-label-sm text-label-sm text-secondary">
                  <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
                  <span className="font-bold">{stat.changeValue}</span>
                  <span className="text-on-surface-variant font-normal">{stat.changeText}</span>
                </div>
              </div>
              {/* Mini Sparkline inline SVG */}
              <div className="w-full h-8 pt-1">
                <svg
                  className="w-full h-full text-secondary stroke-current fill-none"
                  preserveAspectRatio="none"
                  viewBox="0 0 100 24"
                >
                  <path
                    d="M0,20 Q15,18 28,14 T52,11 T75,4 T100,2"
                    strokeLinecap="round"
                    strokeWidth="2.2"
                  />
                  <path
                    className="fill-secondary/10"
                    d="M0,20 Q15,18 28,14 T52,11 T75,4 T100,2 L100,24 L0,24 Z"
                    strokeWidth="0"
                  />
                </svg>
              </div>
            </div>
          );
        }

        if (stat.id === 'orders') {
          return (
            <div
              key={stat.id}
              className="bg-surface-container-low rounded-xl p-space-md flex flex-col justify-between shadow-md border border-surface-container-high/30 hover:border-surface-container-high transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
                  {stat.title}
                </span>
                <span className={`material-symbols-outlined ${stat.iconColorClass} text-[20px]`}>
                  {stat.icon}
                </span>
              </div>
              <div className="my-space-sm">
                <div className="font-display-lg-mobile lg:font-display-lg text-display-lg-mobile lg:text-display-lg text-on-surface tracking-tight font-extrabold">
                  {stat.value}
                </div>
                <div className="flex items-center gap-1 mt-1 font-label-sm text-label-sm text-secondary">
                  <span className="material-symbols-outlined text-[14px]">trending_up</span>
                  <span className="font-bold">{stat.changeValue}</span>
                  <span className="text-on-surface-variant font-normal">{stat.changeText}</span>
                </div>
              </div>
              <div className="font-body-sm text-body-sm text-on-surface-variant truncate pt-1 border-t-0">
                <span className="text-on-surface font-medium">94</span> Dine ·{' '}
                <span className="text-on-surface font-medium">26</span> Take ·{' '}
                <span className="text-on-surface font-medium">7</span> Del
              </div>
            </div>
          );
        }

        if (stat.id === 'aov') {
          return (
            <div
              key={stat.id}
              className="bg-surface-container-low rounded-xl p-space-md flex flex-col justify-between shadow-md border border-surface-container-high/30 hover:border-surface-container-high transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
                  {stat.title}
                </span>
                <span className={`material-symbols-outlined ${stat.iconColorClass} text-[20px]`}>
                  {stat.icon}
                </span>
              </div>
              <div className="my-space-sm">
                <div className="font-display-lg-mobile lg:font-display-lg text-display-lg-mobile lg:text-display-lg text-on-surface tracking-tight font-extrabold">
                  {stat.value}
                </div>
                <div className="flex items-center gap-1 mt-1 font-label-sm text-label-sm text-secondary">
                  <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
                  <span className="font-bold">{stat.changeValue}</span>
                  <span className="text-on-surface-variant font-normal">{stat.changeText}</span>
                </div>
              </div>
              <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-primary-container h-full rounded-full transition-all duration-500"
                  style={{ width: `${stat.progressValue || 82}%` }}
                />
              </div>
            </div>
          );
        }

        if (stat.id === 'occupancy') {
          return (
            <div
              key={stat.id}
              className="bg-surface-container-low rounded-xl p-space-md flex flex-col justify-between shadow-md border border-surface-container-high/30 hover:border-surface-container-high transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
                  {stat.title}
                </span>
                <span className={`material-symbols-outlined ${stat.iconColorClass} text-[20px]`}>
                  {stat.icon}
                </span>
              </div>
              <div className="my-space-sm">
                <div className="font-display-lg-mobile lg:font-display-lg text-display-lg-mobile lg:text-display-lg text-on-surface tracking-tight font-extrabold">
                  {stat.value}
                </div>
                <div className="flex items-center gap-1 mt-1 font-label-sm text-label-sm text-on-surface-variant">
                  <span className="text-secondary font-bold">19 / 24</span>
                  <span>Tables Active</span>
                </div>
              </div>
              <div className="flex items-center justify-between font-body-sm text-body-sm text-on-surface-variant">
                <span>5 Turnovers Exp.</span>
                <span className="font-mono-metric text-primary text-xs">~22m avg</span>
              </div>
            </div>
          );
        }

        // Pending Orders
        return (
          <div
            key={stat.id}
            className="bg-surface-container-low rounded-xl p-space-md flex flex-col justify-between shadow-md relative overflow-hidden border border-surface-container-high/30 hover:border-surface-container-high transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
                {stat.title}
              </span>
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary-container/20 text-primary-container font-label-sm text-label-sm font-bold">
                8
              </span>
            </div>
            <div className="my-space-sm flex items-baseline gap-2">
              <div className="font-display-lg-mobile lg:font-display-lg text-display-lg-mobile lg:text-display-lg text-primary tracking-tight font-extrabold">
                {stat.value}
              </div>
              <span className="px-2 py-0.5 rounded-full bg-primary-container/20 text-primary font-label-sm text-label-sm uppercase tracking-wider font-semibold">
                Kitchen Action
              </span>
            </div>
            <div className="font-body-sm text-body-sm text-on-surface-variant flex items-center justify-between">
              <span className="text-tertiary font-medium">3 Prep</span>
              <span>•</span>
              <span className="text-secondary font-medium">2 Ready</span>
              <span>•</span>
              <span className="text-on-surface font-medium">3 Queue</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
