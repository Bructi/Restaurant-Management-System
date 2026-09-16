import React, { useState } from 'react';

interface TopBannerProps {
  onQuickOrder: () => void;
  onDailySummary: () => void;
  onRefresh?: () => void;
}

export const TopBanner: React.FC<TopBannerProps> = ({
  onQuickOrder,
  onDailySummary,
  onRefresh,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    if (onRefresh) onRefresh();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 650);
  };

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md pt-2">
      {/* Greeting & Subtitle */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-space-sm">
          <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight font-bold">
            Good evening, Aniket
          </h1>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary/15 text-secondary font-label-sm text-label-sm font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-ping" />
            FLOOR LIVE
          </span>
        </div>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
          Here’s what’s happening at your restaurant today. Dinner rush is pacing{' '}
          <span className="text-primary font-semibold">+14% ahead</span> of yesterday at this hour.
        </p>
      </div>

      {/* Quick Action Bar */}
      <div className="flex flex-wrap items-center gap-space-sm shrink-0">
        <button
          className="flex items-center gap-2 px-space-md py-2.5 rounded-lg bg-primary-container text-on-primary-container font-label-lg text-label-lg shadow-lg shadow-primary-container/20 hover:brightness-110 active:scale-95 transition-all font-semibold"
          onClick={onQuickOrder}
        >
          <span className="material-symbols-outlined text-[18px]">bolt</span>
          <span>Quick Order (F1)</span>
        </button>
        <button
          className="flex items-center gap-2 px-space-md py-2.5 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high active:scale-95 transition-all font-label-lg text-label-lg shadow-sm font-semibold"
          onClick={onDailySummary}
        >
          <span className="material-symbols-outlined text-[18px]">print</span>
          <span>Daily Summary</span>
        </button>
        <button
          className={`flex items-center justify-center p-2.5 rounded-lg bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-all shadow-sm ${
            isRefreshing ? 'animate-spin text-primary' : 'active:rotate-180'
          }`}
          onClick={handleRefresh}
          title="Refresh Live Data"
        >
          <span className="material-symbols-outlined text-[20px]">sync</span>
        </button>
      </div>
    </div>
  );
};
