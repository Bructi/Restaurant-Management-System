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
  const { user, signOut } = useAuth();
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
        className={`fixed left-0 top-0 h-full w-72 bg-surface-container-low z-50 flex flex-col justify-between shadow-[0_1px_8px_rgba(0,0,0,0.04)] transition-transform duration-300 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col">
          {/* Brand Header */}
          <div className="p-space-lg flex flex-col gap-space-sm bg-surface-container-low">
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
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                    Operations Hub
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

            {/* Location & Status */}
            <div className="flex flex-col gap-space-xs pt-space-xs">
              <div className="flex items-center justify-between text-on-surface-variant">
                <span className="font-label-md text-label-md truncate text-on-surface">
                  SpiceRoute Kitchen
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  MG Road
                </span>
              </div>
              <div className="inline-flex items-center gap-space-xs px-space-sm py-0.5 rounded-full bg-secondary/10 w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                <span className="font-label-sm text-label-sm text-secondary uppercase font-semibold">
                  Dinner Rush Active
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1 px-space-md py-space-sm overflow-y-auto max-h-[calc(100vh-280px)]">
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
                      ? 'bg-primary-container text-on-primary-container font-headline-md font-bold rounded-lg shadow-sm'
                      : 'rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                  }`}
                  data-path={item.id}
                >
                  <div className="flex items-center gap-space-md">
                    <span className="material-symbols-outlined text-[20px]">
                      {item.icon}
                    </span>
                    <span className="font-label-lg text-label-lg">{item.label}</span>
                  </div>

                  {item.badge && item.badgeType === 'fast-pos' && (
                    <span className="px-space-xs py-0.5 rounded bg-primary-container/20 text-primary font-label-sm text-label-sm">
                      {item.badge}
                    </span>
                  )}

                  {item.badge && item.badgeType === 'default' && (
                    <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface font-label-sm text-label-sm">
                      {item.badge}
                    </span>
                  )}

                  {item.badge && item.badgeType === 'urgent' && (
                    <span className="px-space-xs py-0.5 rounded bg-error-container text-error font-label-sm text-label-sm animate-pulse">
                      {item.badge}
                    </span>
                  )}

                  {item.badgeType === 'dot' && (
                    <span className="w-2 h-2 rounded-full bg-primary-container" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User / Profile Footer */}
        <div className="p-space-md m-space-md bg-surface-container rounded-xl flex items-center justify-between gap-space-sm">
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
              <span className="font-label-md text-label-md text-on-surface truncate font-semibold">
                {user?.name || 'Staff User'}
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                {user?.role || 'Operations'}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                <span className="font-label-sm text-label-sm text-secondary truncate font-mono">
                  {user?.pinAuthLevel || 'Floor (L2)'}
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
            className="p-space-sm text-on-surface-variant hover:text-error hover:bg-surface-container-high rounded-lg transition-colors shrink-0"
            title="Sign Out & Return to Landing"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};
