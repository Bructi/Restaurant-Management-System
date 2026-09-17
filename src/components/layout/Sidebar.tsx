import React from 'react';
import { NavItem, NavPath } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  navItems: NavItem[];
  currentPath: NavPath;
  onNavigate: (path: NavPath) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  navItems,
  currentPath,
  onNavigate,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const { user, userType, switchRole, signOut } = useAuth();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-screen w-72 bg-surface-container-low z-50 flex flex-col justify-between shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-r border-outline-variant/30 transition-transform duration-300 ease-in-out overflow-hidden ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Header & Role Switcher (Fixed at top) */}
        <div className="shrink-0 p-space-md flex flex-col gap-space-xs bg-surface-container-low border-b border-outline-variant/20">
          <div className="flex items-center justify-between">
            <div
              className="flex items-center gap-space-sm cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => {
                onNavigate('landing');
                onCloseMobile?.();
              }}
              title="Return to Landing Page"
            >
              <img
                alt="RestoFlow Brand Icon"
                className="h-8 w-auto object-contain"
                src="/brand-icon.svg"
              />
              <div className="flex flex-col">
                <span className="font-headline-md text-headline-md text-on-surface leading-none font-bold">
                  RestoFlow
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider text-[10px]">
                  {userType === 'customer' ? 'Guest Dining' : userType === 'staff' ? 'Staff Terminal' : 'Operations Hub'}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                onNavigate('landing');
                onCloseMobile?.();
              }}
              className="p-space-xs text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-lg transition-colors"
              title="Back to Landing Page"
            >
              <span className="material-symbols-outlined text-[18px]">home</span>
            </button>
          </div>

          {/* 1-Click Role Switcher Bar */}
          <div className="flex items-center gap-1 p-1 bg-surface-container rounded-xl border border-outline-variant/30 mt-1">
            {[
              { id: 'customer', label: '👤 Guest', path: 'customer-portal' },
              { id: 'staff', label: '👨🍳 Staff', path: 'pos-new-order' },
              { id: 'admin', label: '👑 Admin', path: 'dashboard' },
            ].map((r) => (
              <button
                key={r.id}
                onClick={() => {
                  switchRole(r.id as any);
                  onNavigate(r.path as any);
                  onCloseMobile?.();
                }}
                className={`flex-1 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  userType === r.id
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation Links (Scrollable area) */}
        <nav className="flex-1 overflow-y-auto px-space-md py-space-sm flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = currentPath === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-space-md py-2.5 transition-all text-left ${
                  isActive
                    ? 'bg-primary-container text-on-primary-container font-headline-md font-bold rounded-xl shadow-sm'
                    : 'rounded-xl text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
                data-path={item.id}
              >
                <div className="flex items-center gap-space-md min-w-0">
                  <span className="material-symbols-outlined text-[20px] shrink-0">
                    {item.icon}
                  </span>
                  <span className="font-label-md text-label-md truncate">{item.label}</span>
                </div>

                {item.badge && item.badgeType === 'fast-pos' && (
                  <span className="px-1.5 py-0.5 rounded bg-primary-container/20 text-primary font-label-sm text-[10px] font-bold shrink-0">
                    {item.badge}
                  </span>
                )}

                {item.badge && item.badgeType === 'default' && (
                  <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface font-label-sm text-[10px] font-bold shrink-0">
                    {item.badge}
                  </span>
                )}

                {item.badge && item.badgeType === 'urgent' && (
                  <span className="px-1.5 py-0.5 rounded bg-error-container text-error font-label-sm text-[10px] font-bold animate-pulse shrink-0">
                    {item.badge}
                  </span>
                )}

                {item.badgeType === 'dot' && (
                  <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                )}
              </button>
            );
          })}
        </nav>

        {/* User / Profile Footer (Fixed at bottom) */}
        <div className="shrink-0 p-space-md m-space-sm bg-surface-container rounded-2xl border border-outline-variant/30 flex items-center justify-between gap-space-sm">
          <div className="flex items-center gap-space-sm min-w-0">
            {user?.avatarUrl ? (
              <img
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-surface-container-high"
                src={user.avatarUrl}
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-xs shrink-0">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
            <div className="flex flex-col min-w-0">
              <span className="font-label-md text-label-md text-on-surface truncate font-semibold text-xs">
                {user?.name || 'User'}
              </span>
              <span className="text-[10px] text-on-surface-variant truncate">
                {user?.role || 'Operations'}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${userType === 'customer' ? 'bg-amber-500' : userType === 'staff' ? 'bg-secondary' : 'bg-primary'}`} />
                <span className="text-[10px] text-on-surface-variant truncate font-mono">
                  {userType === 'customer' ? `${user?.vipTier || 'Gold'} Member` : user?.pinAuthLevel || 'Operations (L2)'}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              signOut();
              onNavigate('landing');
              onCloseMobile?.();
            }}
            className="p-space-xs text-on-surface-variant hover:text-error hover:bg-surface-container-high rounded-lg transition-colors shrink-0"
            title="Sign Out & Return to Landing"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};
