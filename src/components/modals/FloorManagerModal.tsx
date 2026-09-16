import React from 'react';
import { useToast } from '../../contexts/ToastContext';

interface FloorManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FloorManagerModal: React.FC<FloorManagerModalProps> = ({ isOpen, onClose }) => {
  const toast = useToast();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-xl bg-surface-container rounded-2xl shadow-2xl border border-surface-container-high overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-space-lg py-space-md bg-surface-container-low flex items-center justify-between border-b border-surface-container-high">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-surface-container text-primary">
              <span className="material-symbols-outlined text-[20px]">grid_view</span>
            </span>
            <div>
              <h3 className="font-headline-md text-headline-md text-on-surface font-bold">
                Floor Plan Layout &amp; Table Arrangement
              </h3>
              <p className="text-body-sm text-on-surface-variant">
                Main Dining Hall • 24 active nodes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="p-space-lg flex flex-col gap-4 font-body-sm text-body-sm">
          <div className="p-3 bg-surface-container-lowest rounded-xl border border-surface-container-high/30 flex items-center justify-between">
            <div>
              <span className="font-semibold text-on-surface block">Layout Preset</span>
              <span className="text-xs text-on-surface-variant">
                Dinner Rush Standard (24 Tables • 96 Max Capacity)
              </span>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-secondary/15 text-secondary text-xs font-bold">
              ACTIVE
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-surface-container-lowest rounded-xl border border-surface-container-high/30">
              <span className="text-xs text-on-surface-variant block">Main Dining</span>
              <span className="font-bold text-on-surface text-lg">18 Tables</span>
            </div>
            <div className="p-3 bg-surface-container-lowest rounded-xl border border-surface-container-high/30">
              <span className="text-xs text-on-surface-variant block">Outdoor Terrace</span>
              <span className="font-bold text-on-surface text-lg">4 Tables</span>
            </div>
            <div className="p-3 bg-surface-container-lowest rounded-xl border border-surface-container-high/30">
              <span className="text-xs text-on-surface-variant block">VIP Lounge</span>
              <span className="font-bold text-on-surface text-lg">2 Tables</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
              Quick Operations
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => toast.info('Table merge mode activated. Tap tables to combine.', 'Merge Mode')}
                className="p-2.5 rounded-lg bg-surface-container-lowest hover:bg-surface-container-high text-left flex items-center gap-2 border border-surface-container-high/30 text-on-surface"
              >
                <span className="material-symbols-outlined text-[18px] text-primary">merge</span>
                <span className="font-medium">Merge Tables</span>
              </button>
              <button
                onClick={() => toast.info('Table transfer mode activated. Select source and target tables.', 'Transfer Mode')}
                className="p-2.5 rounded-lg bg-surface-container-lowest hover:bg-surface-container-high text-left flex items-center gap-2 border border-surface-container-high/30 text-on-surface"
              >
                <span className="material-symbols-outlined text-[18px] text-tertiary">swap_horiz</span>
                <span className="font-medium">Transfer Table</span>
              </button>
              <button
                onClick={() => toast.success('All empty tables marked as cleaned and ready for seating.', 'Tables Ready')}
                className="p-2.5 rounded-lg bg-surface-container-lowest hover:bg-surface-container-high text-left flex items-center gap-2 border border-surface-container-high/30 text-on-surface"
              >
                <span className="material-symbols-outlined text-[18px] text-secondary">cleaning_services</span>
                <span className="font-medium">Mark All Clean</span>
              </button>
              <button
                onClick={() => toast.info('Floor layout configuration locked for current active shift.', 'Grid Locked')}
                className="p-2.5 rounded-lg bg-surface-container-lowest hover:bg-surface-container-high text-left flex items-center gap-2 border border-surface-container-high/30 text-on-surface"
              >
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant">lock</span>
                <span className="font-medium">Lock Grid Layout</span>
              </button>
            </div>
          </div>
        </div>

        <div className="px-space-lg py-space-md bg-surface-container-low flex items-center justify-end gap-2 border-t border-surface-container-high">
          <button
            onClick={onClose}
            className="px-space-md py-2 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high font-label-md"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
