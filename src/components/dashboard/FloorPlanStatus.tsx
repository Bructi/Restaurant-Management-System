import React, { useState } from 'react';
import { FloorTable } from '../../types';

interface FloorPlanStatusProps {
  tables: FloorTable[];
  onOpenFloorManager?: () => void;
  onSelectTable?: (table: FloorTable) => void;
}

export const FloorPlanStatus: React.FC<FloorPlanStatusProps> = ({
  tables,
  onOpenFloorManager,
  onSelectTable,
}) => {
  const [selectedTableId, setSelectedTableId] = useState<string>('T12');

  const getTableStyle = (table: FloorTable) => {
    if (table.id === selectedTableId || table.activeTarget) {
      return 'relative p-2 rounded bg-primary-container text-on-primary-container font-bold flex flex-col items-center justify-center cursor-pointer shadow-lg ring-2 ring-primary';
    }

    switch (table.status) {
      case 'available':
        return 'p-2 rounded bg-secondary/20 text-secondary flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition-transform';
      case 'occupied':
        return 'p-2 rounded bg-primary-container/20 text-primary flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition-transform';
      case 'reserved':
        return 'p-2 rounded bg-tertiary/20 text-tertiary flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition-transform';
      case 'cleaning':
        return 'p-2 rounded bg-surface-container-high text-on-surface-variant flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition-transform';
      default:
        return 'p-2 rounded bg-surface-container text-on-surface flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition-transform';
    }
  };

  return (
    <div className="bg-surface-container-low rounded-xl p-space-md sm:p-space-lg shadow-md flex flex-col gap-space-md border border-surface-container-high/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">
            Floor Plan Status
          </h2>
          <span className="material-symbols-outlined text-on-surface-variant text-[20px]">
            grid_view
          </span>
        </div>
        <span className="font-label-sm text-label-sm font-mono-metric text-primary font-semibold">
          Main Dining Hall
        </span>
      </div>

      {/* Status Legend Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-surface-container text-on-surface font-label-sm text-label-sm">
          <span className="w-2 h-2 rounded-full bg-secondary" />
          <span className="truncate">Avail (5)</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-surface-container text-on-surface font-label-sm text-label-sm">
          <span className="w-2 h-2 rounded-full bg-primary-container" />
          <span className="truncate">Occ (14)</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-surface-container text-on-surface font-label-sm text-label-sm">
          <span className="w-2 h-2 rounded-full bg-tertiary" />
          <span className="truncate">Res (3)</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-surface-container text-on-surface font-label-sm text-label-sm">
          <span className="w-2 h-2 rounded-full bg-surface-bright" />
          <span className="truncate">Clean (2)</span>
        </div>
      </div>

      {/* 24 Interactive Mini Table Tiles Grid (6 columns x 4 rows) */}
      <div className="relative grid grid-cols-6 gap-2 pt-2 select-none">
        {tables.map((table) => {
          const isSelected = table.id === selectedTableId || (table.activeTarget && selectedTableId === 'T12');

          return (
            <div
              key={table.id}
              onClick={() => {
                setSelectedTableId(table.id);
                onSelectTable?.(table);
              }}
              className={getTableStyle(table)}
              title={`${table.name} • ${table.orderInfo || table.status}`}
            >
              <span className="font-label-sm text-label-sm font-bold">{table.name}</span>
              <span className={`text-[9px] ${isSelected ? 'opacity-90' : 'opacity-80'}`}>
                {table.capacity}p
              </span>

              {/* Persistent / Active Tooltip for T12 or selected active table */}
              {isSelected && (
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-surface-container-highest text-on-surface px-2 py-1 rounded shadow-xl whitespace-nowrap z-20 pointer-events-none flex items-center gap-1.5 border border-surface-container-high/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                  <span className="font-label-sm text-label-sm font-bold">
                    ₹{(table.amount || 1840).toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-on-surface-variant font-mono-metric">
                    {table.timeSeated || '42m'}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-surface-container-high/30 mt-1">
        <span className="font-body-sm text-body-sm text-on-surface-variant">
          Need rearrangement?
        </span>
        <button
          onClick={onOpenFloorManager}
          className="font-label-md text-label-md text-primary hover:underline font-semibold"
        >
          Open Floor Manager
        </button>
      </div>
    </div>
  );
};
