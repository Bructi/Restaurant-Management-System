import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { fetchLiveWeatherAndDiningRush, WeatherForecastData } from '../../services/weather';
import { api } from '../../services/api';

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
  const { user, userType, switchRole, signOut } = useAuth();
  const [timeString, setTimeString] = useState<string>('19:42:15');
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [weather, setWeather] = useState<WeatherForecastData | null>(null);
  const [simulating, setSimulating] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchLiveWeatherAndDiningRush().then((w) => setWeather(w)).catch(() => {});
  }, []);

  const handlePulseSim = async () => {
    try {
      setSimulating(true);
      await api.pulseSimulation();
    } catch {} finally {
      setTimeout(() => setSimulating(false), 500);
    }
  };

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
    <header className="fixed top-0 left-0 lg:left-72 right-0 h-16 bg-surface-container-low/95 backdrop-blur-xl z-40 px-3 sm:px-6 flex items-center justify-between shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-surface-container-high/50 overflow-hidden">
      {/* Left: Mobile Toggle & Quick Search */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-lg min-w-0">
        {/* Mobile Hamburger Toggle */}
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors shrink-0"
          title="Open Menu"
        >
          <span className="material-symbols-outlined text-[22px]">menu</span>
        </button>

        {/* Search Input Button */}
        <div className="relative w-full max-w-sm min-w-0">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">
            search
          </span>
          <input
            className="w-full pl-9 pr-10 py-1.5 bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant rounded-xl text-xs cursor-pointer outline-none border border-surface-container-high/40 truncate"
            placeholder="⌘K Search dishes, tables, orders..."
            readOnly
            onClick={onOpenSearch}
            type="text"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1 py-0.5 rounded bg-surface-container text-on-surface-variant text-[10px] font-mono border border-surface-container-high/60">
            ⌘K
          </kbd>
        </div>

        {/* Live Weather Indicator Pill (Desktop) */}
        {weather && (
          <div
            className="hidden 2xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container text-on-surface text-xs border border-outline-variant/30 shrink-0 cursor-help"
            title={`${weather.weatherDescription} · ${weather.diningImpact}`}
          >
            <span className="material-symbols-outlined text-[15px] text-primary">{weather.weatherIcon}</span>
            <span className="font-bold">{weather.temperature}°C</span>
            <span className="text-[11px] text-on-surface-variant max-w-[100px] truncate">{weather.weatherDescription}</span>
          </div>
        )}

        {/* Fast Jump Shortcuts for Desktop */}
        <div className="hidden xl:flex items-center gap-1 shrink-0">
          <button
            onClick={onNavigateTables}
            className="px-2 py-1 rounded-lg text-xs font-semibold text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
          >
            🍽️ Tables
          </button>
          <button
            onClick={onNavigateKitchen}
            className="px-2 py-1 rounded-lg text-xs font-semibold text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
          >
            🔔 KDS
          </button>
        </div>
      </div>

      {/* Right: Quick Action Controls */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Live Simulation Pulse */}
        <button
          onClick={handlePulseSim}
          disabled={simulating}
          className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#ff6d5a]/10 hover:bg-[#ff6d5a]/20 text-[#ff6d5a] text-xs font-bold border border-[#ff6d5a]/30 transition-all shrink-0"
          title="Inject an instant live order pulse into the floor and KDS"
        >
          <span className={`material-symbols-outlined text-[15px] ${simulating ? 'animate-spin' : ''}`}>
            {simulating ? 'sync' : 'auto_mode'}
          </span>
          <span className="hidden md:inline">{simulating ? 'Pulsing...' : '⚡ Demo Pulse'}</span>
        </button>

        {/* InsForge Status Pill */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-container-lowest border border-surface-container-high/40 shrink-0">
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-secondary animate-pulse' : 'bg-error'}`} />
          <span className="text-[11px] text-on-surface-variant font-medium">
            {isConnected ? `InsForge Live (${latencyMs}ms)` : 'Connecting...'}
          </span>
        </div>

        {/* Clock */}
        <div className="hidden lg:flex items-center gap-1 text-on-surface-variant font-mono text-xs shrink-0">
          <span className="material-symbols-outlined text-[15px]">schedule</span>
          <span>{timeString}</span>
        </div>

        {/* Fast PIN Switcher */}
        <button
          onClick={onOpenStaffPin}
          title="Staff PIN Switcher"
          className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs text-on-surface border border-surface-container-high/40 font-bold transition-all shrink-0"
        >
          <span className="material-symbols-outlined text-[15px] text-primary">pin</span>
          <span>PIN</span>
        </button>

        {/* Quick Order Button */}
        <button
          onClick={onQuickOrder}
          className="flex items-center gap-1 px-3 py-1.5 bg-primary-container text-on-primary-container hover:opacity-95 active:scale-95 text-xs font-bold rounded-xl shadow-sm transition-all shrink-0"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          <span className="hidden sm:inline">New Order</span>
        </button>

        {/* Profile Avatar Dropdown */}
        <div className="relative shrink-0" ref={menuRef}>
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center gap-1.5 p-0.5 rounded-full hover:ring-2 hover:ring-primary/40 transition-all focus:outline-none"
            title="User Profile & Staff Session"
          >
            {user?.avatarUrl ? (
              <img
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-surface-container-high shadow-sm"
                src={user.avatarUrl}
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-xs shadow-sm ring-1 ring-surface-container-high">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
          </button>

          {/* Interactive Dropdown */}
          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-surface-container rounded-2xl shadow-2xl border border-surface-container-high/60 p-space-sm flex flex-col gap-2 animate-fadeIn z-50">
              <div className="p-space-sm bg-surface-container-lowest rounded-xl flex items-center gap-space-sm border border-surface-container-high/40">
                {user?.avatarUrl ? (
                  <img
                    alt={user.name}
                    className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-primary-container"
                    src={user.avatarUrl}
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-sm shrink-0">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-xs text-on-surface truncate">
                    {user?.name || 'User'}
                  </span>
                  <span className="text-[10px] text-on-surface-variant truncate">
                    {user?.email || 'user@restoflow.internal'}
                  </span>
                  <span className="text-[10px] text-primary font-bold uppercase font-mono mt-0.5">
                    {userType.toUpperCase()} MODE
                  </span>
                </div>
              </div>

              {/* Fast Role Switch in Dropdown */}
              <div className="flex flex-col gap-1 p-1 bg-surface-container-lowest rounded-xl border border-outline-variant/30">
                <span className="text-[10px] uppercase font-bold text-on-surface-variant px-1.5 py-0.5">Switch Profile Mode</span>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { id: 'customer', label: '👤 Guest' },
                    { id: 'staff', label: '👨🍳 Staff' },
                    { id: 'admin', label: '👑 Admin' },
                  ].map((r) => (
                    <button
                      key={r.id}
                      onClick={() => {
                        switchRole(r.id as any);
                        setIsProfileMenuOpen(false);
                      }}
                      className={`py-1 rounded-lg text-[10px] font-bold transition-all ${
                        userType === r.id
                          ? 'bg-primary text-on-primary shadow-sm'
                          : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-0.5">
                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    onOpenAuthModal?.();
                  }}
                  className="w-full flex items-center gap-2 px-space-md py-2 rounded-lg text-xs text-on-surface hover:bg-surface-container-high transition-colors font-medium text-left"
                >
                  <span className="material-symbols-outlined text-[16px] text-primary">account_circle</span>
                  <span>Authentication Hub</span>
                </button>
                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    onNavigateSettings?.();
                  }}
                  className="w-full flex items-center gap-2 px-space-md py-2 rounded-lg text-xs text-on-surface hover:bg-surface-container-high transition-colors font-medium text-left"
                >
                  <span className="material-symbols-outlined text-[16px] text-tertiary">settings</span>
                  <span>System Settings</span>
                </button>
                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    signOut();
                  }}
                  className="w-full flex items-center gap-2 px-space-md py-2 rounded-lg text-xs text-error hover:bg-error-container/20 transition-colors font-bold text-left border-t border-surface-container-high/30 mt-1 pt-2"
                >
                  <span className="material-symbols-outlined text-[16px]">logout</span>
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
