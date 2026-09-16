import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import { subscribeRealtime } from '../../hooks/useRealtimeSync';
import { PIPELINE_SEGMENTS } from '../../data/dashboardData';

interface PipelineSegment {
  id: string;
  label: string;
  count: number;
  color: string;
  dotColor: string;
  width: string;
  textClass: string;
}

export const LiveOrderPipeline: React.FC = () => {
  const [segments, setSegments] = useState<PipelineSegment[]>(PIPELINE_SEGMENTS);

  const fetchPipeline = useCallback(() => {
    api.getPipelineAnalytics()
      .then((res) => {
        if (res.success && res.data && res.data.length > 0) {
          setSegments(res.data);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchPipeline();

    const unsub = subscribeRealtime((event) => {
      if (
        event.type === 'ORDER_CREATED' ||
        event.type === 'ORDER_UPDATED' ||
        event.type === 'ORDER_SETTLED' ||
        event.type === 'KDS_TICKET_BUMPED' ||
        event.type === 'ANALYTICS_UPDATED'
      ) {
        fetchPipeline();
      }
    });

    return () => unsub();
  }, [fetchPipeline]);

  const totalCount = segments.reduce((acc, s) => acc + s.count, 0);

  return (
    <div className="bg-surface-container-low rounded-xl p-space-md shadow-md flex flex-col gap-space-sm border border-surface-container-high/30">
      <div className="flex items-center justify-between">
        <span className="font-headline-md text-headline-md text-on-surface font-semibold">
          Live Order Pipeline
        </span>
        <span className="font-body-sm text-body-sm text-on-surface-variant">
          {totalCount} Active &amp; Processed Today
        </span>
      </div>

      {/* Proportional Pipeline Strip */}
      <div className="w-full h-3 rounded-full bg-surface-container overflow-hidden flex gap-0.5">
        {segments.map((segment) =>
          segment.width !== '0%' ? (
            <div
              key={segment.id}
              className={`${segment.color} h-full transition-all duration-300`}
              style={{ width: segment.width }}
              title={`${segment.label} (${segment.count})`}
            />
          ) : null
        )}
      </div>

      {/* Pipeline Category Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
        {segments.map((segment) => (
          <div
            key={segment.id}
            className="flex items-center gap-2 p-2 rounded-lg bg-surface-container border border-surface-container-high/20 transition-all hover:bg-surface-container-high"
          >
            <span className={`w-2.5 h-2.5 rounded-full ${segment.dotColor} shrink-0`} />
            <div className="flex flex-col min-w-0">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase truncate font-medium">
                {segment.label}
              </span>
              <span
                className={`font-headline-md text-headline-md ${segment.textClass} leading-tight font-bold`}
              >
                {segment.count}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
