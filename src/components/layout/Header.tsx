import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  onOpenSearch: () => void;
  onQuickOrder: () => void;
  onOpenAuthModal?: () => void;
  onOpenStaffPin?: () => void;
  onNavigateTables?: () => void;
  onNavigateKitchen?: () => void;
  onNavigateSettings?: () => void;
  onToggleMobileMenu?: () => void;
  isConnected?: boolean;
  latencyMs?: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSearch,
  onQuickOrder,
  onOpenAuthModal,
  onOpenStaffPin,
  onNavigateTables,
  onNavigateKitchen,
  onNavigateSettings,
  onToggleMobileMenu,
  isConnected = true,
  latencyMs = 12,
}) => {
  const { user, signOut } = useAuth();
  const [timeString, setTimeString] = useState<string>('19:42:15');
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleTimeString('en-GB', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 left-0 lg:left-72 right-0 h-16 bg-surface-container-low/90 backdrop-blur-xl z-40 px-space-md lg:px-space-lg flex items-center justify-between shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-surface-container-high/50">
      {/* Left: Mobile Toggle & Search */}
      <div className="flex items-center gap-space-sm lg:gap-space-md flex-1 max-w-xl">
        {/* Mobile Hamburger Toggle */}
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors"
          title="Open Menu"
        >
          <span className="material-symbols-outlined text-[24px]">menu</span>
        </button>

        {/* Search Input Button / Bar */}
        <div className="relative w-full max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">
            search
          </span>
          <input
            className="w-full pl-10 pr-12 py-2 bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant rounded-lg font-body-sm text-body-sm cursor-pointer outline-none focus:ring-1 focus:ring-primary-container border border-surface-container-high/40 transition-all"
            placeholder="Press ⌘K to quick search tables, orders, guests..."
            readOnly
            onClick={onOpenSearch}
            type="text"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant font-label-sm text-label-sm border border-surface-container-high/60">
            ⌘K
          </kbd>
        </div>

        {/* Quick Status Pills for Desktop */}
        <div className="hidden xl:flex items-center gap-space-xs shrink-0">
          <button
            onClick={onQuickOrder}
            className="px-space-sm py-1 rounded-full bg-surface-container text-on-surface hover:bg-surface-container-high font-label-sm text-label-sm flex items-center gap-1 transition-colors"
          >
            <span>⚡</span>
            <span>Quick Sale</span>
          </button>
          <button
            onClick={onNavigateTables}
            className="px-space-sm py-1 rounded-full bg-surface-container text-on-surface hover:bg-surface-container-high font-label-sm text-label-sm flex items-center gap-1 transition-colors"
          >
            <span>🍽️</span>
            <span>Tables</span>
          </button>
          <button
            onClick={onNavigateKitchen}
            className="px-space-sm py-1 rounded-full bg-surface-container text-on-surface hover:bg-surface-container-high font-label-sm text-label-sm flex items-center gap-1 transition-colors"
          >
            <span>🔔</span>
            <span>KDS Kitchen</span>
          </button>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-space-sm lg:gap-space-md">
        <div className="hidden md:flex items-center gap-space-sm px-space-sm py-1 rounded-lg bg-surface-container-lowest border border-surface-container-high/40">
          <span
            className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-secondary animate-pulse' : 'bg-error'
            }`}
          />
          <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
            {isConnected ? `InsForge Live (${latencyMs}ms)` : 'Reconnecting...'}
          </span>
        </div>

        <div className="hidden lg:flex items-center gap-1 text-on-surface-variant font-mono-metric text-mono-metric">
          <span className="material-symbols-outlined text-[16px]">schedule</span>
          <span>{timeString}</span>
        </div>

        {/* PIN Switcher Shortcut */}
        <button
          onClick={onOpenStaffPin}
          title="Staff PIN Switcher"
          className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs text-on-surface border border-surface-container-high/40 font-bold transition-all"
        >
          <span className="material-symbols-outlined text-[16px] text-primary">pin</span>
          <span>PIN Switch</span>
        </button>

        <button
          onClick={onQuickOrder}
          className="flex items-center gap-space-xs px-space-md py-2 bg-primary-container text-on-primary-container hover:opacity-95 active:scale-95 font-label-lg text-label-lg rounded-lg shadow-sm transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          <span className="hidden sm:inline">New Order</span>
        </button>

        {/* Profile Avatar & Interactive Auth Dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-primary/40 transition-all focus:outline-none"
            title="User Profile & Staff Session"
          >
            {user?.avatarUrl ? (
              <img
                alt={user.name}
                className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-surface-container-high shadow-sm"
                src={user.avatarUrl}
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-sm shadow-sm ring-1 ring-surface-container-high">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
          </button>

          {/* Popover Menu */}
          {isProfileMenuOpen && (
            <div className="absolute right-0 top-12 w-72 bg-surface-container rounded-2xl shadow-2xl border border-surface-container-high p-3 flex flex-col gap-2.5 z-50 animate-fadeIn">
              {/* User Info Header */}
              <div className="p-3 bg-surface-container-lowest rounded-xl flex items-center gap-3 border border-surface-container-high/40">
                <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold font-headline-md shrink-0">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-sm text-on-surface truncate">{user?.name || 'Staff User'}</span>
                  <span className="text-[11px] text-on-surface-variant font-mono truncate">{user?.email || 'authenticated'}</span>
                  <span className="text-[10px] text-secondary font-bold font-mono mt-0.5">
                    {user?.role || 'Staff'} · {user?.pinAuthLevel || 'Floor (L2)'}
                  </span>
                </div>
              </div>

              {/* Menu Actions */}
              <div className="flex flex-col gap-1 text-xs">
                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    onOpenStaffPin?.();
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface flex items-center gap-2 font-semibold transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px] text-primary">pin</span>
                  <span>Quick Staff PIN Switch</span>
                </button>

                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    onOpenAuthModal?.();
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface flex items-center gap-2 font-semibold transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px] text-secondary">switch_account</span>
                  <span>Sign In / Switch InsForge Account</span>
                </button>

                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    onNavigateSettings?.();
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface flex items-center gap-2 font-semibold transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px] text-on-surface-variant">database</span>
                  <span>InsForge BaaS &amp; Cloud Settings</span>
                </button>
              </div>

              {/* Sign Out Button */}
              <div className="pt-2 border-t border-surface-container-high/40">
                <button
                  onClick={() => {
                    signOut();
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-error/10 hover:bg-error/20 text-error flex items-center justify-center gap-1.5 font-bold transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">logout</span>
                  <span>Sign Out Session</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
