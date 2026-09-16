import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectResult?: (type: string, item: string) => void;
}

interface SearchResultItem {
  type: string;
  title: string;
  subtitle: string;
  icon: string;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectResult,
}) => {
  const [query, setQuery] = useState('');
  const [liveResults, setLiveResults] = useState<SearchResultItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);

      // Preload search items from backend
      Promise.all([
        api.getTables().catch(() => ({ data: [] })),
        api.getOrders().catch(() => ({ data: [] })),
        api.getMenu().catch(() => ({ data: [] })),
        api.getCustomers().catch(() => ({ data: [] })),
      ]).then(([tablesRes, ordersRes, menuRes, custRes]) => {
        const results: SearchResultItem[] = [];

        (tablesRes.data || []).forEach((t: any) => {
          results.push({
            type: 'table',
            title: `Table ${t.name || t.id}`,
            subtitle: `${t.status?.toUpperCase()} · ${t.capacity} Pax · Section: ${t.section || 'main'}`,
            icon: 'table_restaurant',
          });
        });

        (ordersRes.data || []).forEach((o: any) => {
          results.push({
            type: 'order',
            title: o.id,
            subtitle: `${o.customer || 'Walk-in'} · ${o.table || 'Takeaway'} · ₹${o.total || 0}`,
            icon: 'receipt_long',
          });
        });

        (menuRes.data || []).forEach((m: any) => {
          results.push({
            type: 'dish',
            title: m.name,
            subtitle: `₹${m.price} · ${m.category} · ${m.isVeg ? 'Veg' : 'Non-Veg'}`,
            icon: 'restaurant_menu',
          });
        });

        (custRes.data || []).forEach((c: any) => {
          results.push({
            type: 'guest',
            title: c.name,
            subtitle: `${c.tier || 'Standard'} Member · ${c.phone}`,
            icon: 'person',
          });
        });

        setLiveResults(results);
      });
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredResults = liveResults.filter(
    (item) =>
      !query ||
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-xl bg-surface-container rounded-2xl shadow-2xl border border-surface-container-high overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 bg-surface-container-low flex items-center gap-3 border-b border-surface-container-high">
          <span className="material-symbols-outlined text-[22px] text-primary">search</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tables (T12), orders (#10482), dishes (Butter Chicken), or guests..."
            className="flex-1 bg-transparent text-on-surface placeholder:text-on-surface-variant font-body-md outline-none"
          />
          <kbd className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-label-sm text-xs border border-surface-container-high">
            ESC
          </kbd>
        </div>

        {/* Search Results List */}
        <div className="max-h-80 overflow-y-auto p-2 flex flex-col gap-1">
          {filteredResults.length > 0 ? (
            filteredResults.map((result, idx) => (
              <button
                key={idx}
                onClick={() => {
                  onSelectResult?.(result.type, result.title);
                  onClose();
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-surface-container-high transition-colors text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-surface-container-lowest text-on-surface-variant group-hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-[20px]">{result.icon}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-lg text-on-surface group-hover:text-primary transition-colors font-semibold">
                      {result.title}
                    </span>
                    <span className="text-body-sm text-on-surface-variant">
                      {result.subtitle}
                    </span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity">
                  arrow_forward
                </span>
              </button>
            ))
          ) : (
            <div className="py-8 text-center text-on-surface-variant text-body-md">
              No results found for "{query}"
            </div>
          )}
        </div>

        {/* Search Shortcuts Footer */}
        <div className="px-4 py-2 bg-surface-container-lowest flex items-center justify-between text-xs text-on-surface-variant border-t border-surface-container-high/40">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1 rounded bg-surface-container">↑</kbd>{' '}
              <kbd className="px-1 rounded bg-surface-container">↓</kbd> to navigate
            </span>
            <span>
              <kbd className="px-1 rounded bg-surface-container">↵</kbd> to select
            </span>
          </div>
          <span>RestoFlow Universal Search</span>
        </div>
      </div>
    </div>
  );
};
