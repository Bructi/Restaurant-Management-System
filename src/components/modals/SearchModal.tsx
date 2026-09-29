import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectResult?: (type: string, item: string) => void;
}

interface SearchResultItem {
  type: string;
  id?: string;
  title: string;
  subtitle: string;
  icon: string;
}

const QUICK_LINKS: Array<{ label: string; hint: string; query: string; icon: string }> = [
  { label: 'Table T12', hint: 'Occupied · Ananya Verma', query: 'T12', icon: 'table_restaurant' },
  { label: 'Butter Chicken', hint: 'Dish · main-course', query: 'Butter Chicken', icon: 'restaurant_menu' },
  { label: 'Order 10482', hint: 'Use #10482 or 10482', query: '10482', icon: 'receipt_long' },
];

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectResult,
}) => {
  const [query, setQuery] = useState('');
  const [liveResults, setLiveResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const requestIdRef = useRef(0);

  // Reset + autofocus on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setLiveResults([]);
      setLoading(false);
      setError(null);
      setActiveIndex(0);
      requestIdRef.current += 1;
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Debounced live search. Empty query => no backend call, show quick links instead.
  useEffect(() => {
    if (!isOpen) return;

    const trimmed = query.trim();
    if (!trimmed) {
      setLiveResults([]);
      setLoading(false);
      setError(null);
      setActiveIndex(0);
      return;
    }

    setLoading(true);
    setError(null);
    const myRequest = ++requestIdRef.current;
    const timer = setTimeout(() => {
      api
        .searchUniversal(trimmed)
        .then((res) => {
          if (requestIdRef.current !== myRequest) return; // stale response
          setLoading(false);
          if (res.success && Array.isArray(res.data)) {
            setLiveResults(res.data);
            setActiveIndex(0);
          } else {
            setLiveResults([]);
          }
        })
        .catch(() => {
          if (requestIdRef.current !== myRequest) return;
          setLoading(false);
          setError('Search is unavailable. Is the backend running on :5000? Type to retry.');
          setLiveResults([]);
        });
    }, 200);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  if (!isOpen) return null;

  const trimmedQuery = query.trim();
  const isEmptyQuery = trimmedQuery.length === 0;

  const pickResult = (result: SearchResultItem) => {
    onSelectResult?.(result.type, result.title);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (liveResults.length ? (prev + 1) % liveResults.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) =>
        liveResults.length ? (prev - 1 + liveResults.length) % liveResults.length : 0
      );
    } else if (e.key === 'Enter') {
      const chosen = liveResults[activeIndex];
      if (chosen) {
        e.preventDefault();
        pickResult(chosen);
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/75 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Universal search"
        className="w-full max-w-xl bg-surface-container rounded-2xl shadow-2xl border border-surface-container-high overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
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
            aria-label="Search tables, orders, dishes, or guests"
            className="flex-1 bg-transparent text-on-surface placeholder:text-on-surface-variant font-body-md outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="text-on-surface-variant hover:text-on-surface text-sm px-1"
            >
              ✕
            </button>
          )}
          <kbd className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-label-sm text-xs border border-surface-container-high">
            ESC
          </kbd>
        </div>

        {/* Search Results List */}
        <div className="max-h-80 overflow-y-auto p-2 flex flex-col gap-1">
          {loading ? (
            <div className="py-8 text-center text-on-surface-variant text-body-md flex items-center justify-center gap-2">
              <span className="material-symbols-outlined animate-spin text-[20px] text-primary">sync</span>
              <span>Searching RestoFlow Index...</span>
            </div>
          ) : error ? (
            <div className="py-8 px-4 text-center">
              <p className="text-on-surface font-medium">Search failed to load</p>
              <p className="text-on-surface-variant text-sm mt-1">{error}</p>
              <button
                onClick={() => setQuery((q) => q + ' ')}
                className="mt-3 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:opacity-90"
              >
                Retry
              </button>
            </div>
          ) : isEmptyQuery ? (
            <div className="py-3">
              <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
                Try searching for
              </p>
              {QUICK_LINKS.map((link) => (
                <button
                  key={link.query}
                  onClick={() => setQuery(link.query)}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-surface-container-high transition-colors text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-surface-container-lowest text-on-surface-variant group-hover:text-primary transition-colors">
                      <span className="material-symbols-outlined text-[20px]">{link.icon}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-lg text-on-surface group-hover:text-primary transition-colors font-semibold">
                        {link.label}
                      </span>
                      <span className="text-body-sm text-on-surface-variant">{link.hint}</span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-[18px] text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity">
                    arrow_forward
                  </span>
                </button>
              ))}
              <p className="px-3 pt-2 text-xs text-on-surface-variant">
                Tip: order numbers work with or without “#” — try 10482.
              </p>
            </div>
          ) : liveResults.length > 0 ? (
            liveResults.map((result, idx) => (
              <button
                key={`${result.type}-${result.id ?? result.title}-${idx}`}
                onMouseEnter={() => setActiveIndex(idx)}
                onClick={() => pickResult(result)}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors text-left group ${
                  idx === activeIndex ? 'bg-surface-container-high' : 'hover:bg-surface-container-high'
                }`}
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
            <div className="py-8 px-4 text-center text-on-surface-variant text-body-md">
              <p>
                No results found for “{trimmedQuery}”
              </p>
              <p className="text-sm mt-1">
                Try a table (T12), dish (Butter Chicken), order number (10482), or guest name.
              </p>
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
