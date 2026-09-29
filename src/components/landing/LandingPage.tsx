import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { api } from '../../services/api';
import { NavPath } from '../../types';

interface LandingPageProps {
  onEnterApp: (path?: NavPath) => void;
  onOpenAuthModal: () => void;
  onOpenStaffPin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterApp,
  onOpenAuthModal,
  onOpenStaffPin,
}) => {
  const { user, switchRole, signInWithOAuth } = useAuth();
  const toast = useToast();

  const [analytics, setAnalytics] = useState<any>({
    todayRevenue: 50210,
    totalOrders: 128,
    occupancyPct: 78,
    activeTables: 19,
    totalTables: 24,
  });

  const [testCustomer, setTestCustomer] = useState('');
  const [testDish, setTestDish] = useState('Butter Chicken');
  const [isPlacingDemo, setIsPlacingDemo] = useState(false);

  useEffect(() => {
    api.getAnalyticsSummary().then((res) => {
      if (res.success && res.data) {
        setAnalytics(res.data);
      }
    }).catch(() => {});
  }, []);

  const handlePlaceDemoOrder = async () => {
    setIsPlacingDemo(true);
    try {
      const res = await api.createOrder({
        table: 'Table T-01',
        tableType: 'Dine-In · 2 Pax',
        customer: testCustomer || 'Landing Demo Guest',
        phone: '+91 98201 00000',
        total: 780,
        subtotal: 680,
        taxes: 50,
        serviceCharge: 50,
        paymentStatus: 'unpaid',
        paymentMethod: 'Pending',
        lineItems: [
          { name: testDish, qty: 1, price: 380, station: 'Curry' },
          { name: 'Garlic Naan', qty: 2, price: 160, station: 'Tandoor' },
          { name: 'Gulab Jamun (2 pcs)', qty: 1, price: 140, station: 'Pantry' },
        ],
      });

      setIsPlacingDemo(false);
      toast.success(
        `Order ${res.data?.order?.id || '#ORD-LIVE'} placed in live database! KDS ticket ${res.data?.kdsTicket?.id || '#KOT-LIVE'} generated.`,
        'Order Dispatched'
      );

      // Refresh analytics
      api.getAnalyticsSummary().then((r) => {
        if (r.success && r.data) setAnalytics(r.data);
      }).catch(() => {});
    } catch (err: any) {
      setIsPlacingDemo(false);
      toast.error(err.message || 'Error creating order', 'Failed');
    }
  };

  const handleGoogleLogin = async () => {
    toast.info('Redirecting to Google OAuth authentication...', 'InsForge Auth');
    const res = await signInWithOAuth('google');
    if (!res.success && res.error) {
      toast.error(res.error, 'OAuth Failed');
    }
  };

  return (
    <div className="min-h-screen bg-surface-container-lowest text-on-surface font-body-md selection:bg-primary-container selection:text-on-primary-container flex flex-col">
      {/* Top Fixed Navigation Bar */}
      <header className="sticky top-0 z-40 h-20 bg-surface-container-low/90 backdrop-blur-xl border-b border-surface-container-high/40 px-4 sm:px-8 lg:px-16 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onEnterApp('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center font-black shadow-md shadow-primary-container/20">
              <span className="material-symbols-outlined text-[24px]">restaurant</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-md text-headline-md font-black tracking-tight text-on-surface">
                Resto<span className="text-primary">Flow</span>
              </span>
              <span className="text-[10px] text-on-surface-variant font-mono tracking-widest uppercase">
                Enterprise POS OS
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 ml-4 px-3 py-1 rounded-full bg-surface-container border border-surface-container-high/40">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            <span className="text-xs text-on-surface-variant font-medium">
              InsForge BaaS Linked · <strong className="text-on-surface">RMS (ap-southeast)</strong>
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-on-surface-variant">
          <button onClick={() => onEnterApp('pos-new-order')} className="hover:text-on-surface transition-colors">
            POS Terminal
          </button>
          <button onClick={() => onEnterApp('kitchen')} className="hover:text-on-surface transition-colors">
            KDS Kitchen
          </button>
          <button onClick={() => onEnterApp('tables')} className="hover:text-on-surface transition-colors">
            Floor Plan
          </button>
          <button onClick={() => onEnterApp('menu')} className="hover:text-on-surface transition-colors">
            Menu Catalog
          </button>
          <button onClick={() => onEnterApp('reports-analytics')} className="hover:text-on-surface transition-colors">
            Analytics &amp; GST
          </button>
        </nav>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2.5">
              <div
                onClick={() => onEnterApp('dashboard')}
                className="hidden sm:flex flex-col text-right cursor-pointer"
              >
                <span className="text-xs font-bold text-on-surface">{user.name}</span>
                <span className="text-[10px] text-secondary font-mono font-bold">{user.role}</span>
              </div>
              <button
                onClick={() => onEnterApp('dashboard')}
                className="px-4 py-2.5 rounded-xl bg-primary-container text-on-primary-container font-label-lg font-bold shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">dashboard</span>
                <span>Open Dashboard</span>
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={onOpenStaffPin}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-xs border border-surface-container-high/60 transition-all shadow-sm"
              >
                <span className="material-symbols-outlined text-[16px] text-primary">pin</span>
                <span>Staff PIN</span>
              </button>
              <button
                onClick={onOpenAuthModal}
                className="px-3.5 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-xs border border-surface-container-high/60 transition-all shadow-sm"
              >
                Sign In
              </button>
              <button
                onClick={() => onEnterApp('dashboard')}
                className="px-4 py-2.5 rounded-xl bg-primary-container text-on-primary-container font-label-lg font-bold shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
              >
                <span>Launch App</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 px-4 sm:px-8 lg:px-16 flex flex-col items-center text-center">
        {/* Decorative background gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-primary/10 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[400px] h-[300px] bg-secondary/10 rounded-full blur-3xl -z-10 pointer-events-none" />

        {/* Top Badges */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-container-low border border-surface-container-high/60 text-xs text-on-surface shadow-sm mb-6 animate-fadeIn">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="font-semibold text-primary">Next-Gen Restaurant OS</span>
          <span className="text-surface-container-highest">•</span>
          <span className="text-on-surface-variant">Real-time InsForge PostgreSQL Backend</span>
        </div>

        {/* Main Headline */}
        <h1 className="font-display-lg text-4xl sm:text-5xl lg:text-6xl font-black text-on-surface tracking-tight max-w-4xl leading-[1.15]">
          High-Velocity POS, Kitchen KDS &amp; Table Operations in <span className="text-primary">One Unified Hub</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-5 text-base sm:text-lg text-on-surface-variant max-w-2xl leading-relaxed">
          Engineered for busy kitchens, high-turnover dining rooms, and multi-station restaurants. Touch-first POS, automated station routing, live table statuses, recipe food costing, and instant GST compliance.
        </p>

        {/* 3 Dedicated Role Portals */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl w-full text-left">
          {/* Role 1: Customer */}
          <div
            onClick={() => {
              switchRole('customer');
              onEnterApp('customer-portal');
            }}
            className="p-5 bg-surface-container-low hover:bg-surface-container rounded-2xl border border-emerald-500/30 hover:border-emerald-500 shadow-md cursor-pointer transition-all hover:scale-[1.02] flex flex-col justify-between gap-3 group"
          >
            <div className="flex items-center justify-between">
              <span className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-xl">
                👤
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold text-[10px] uppercase font-mono">
                Customer App
              </span>
            </div>
            <div>
              <h3 className="font-bold text-base text-on-surface group-hover:text-emerald-600 transition-colors">
                Customer Dining Portal
              </h3>
              <p className="text-xs text-on-surface-variant mt-1">
                Order dishes at table, reserve VIP cabanas, and track food preparation live.
              </p>
            </div>
            <div className="flex items-center text-xs font-bold text-emerald-600 gap-1 pt-2 border-t border-outline-variant/20">
              <span>Enter as Guest Dining</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </div>
          </div>

          {/* Role 2: Staff */}
          <div
            onClick={() => {
              switchRole('staff');
              onEnterApp('pos-new-order');
            }}
            className="p-5 bg-surface-container-low hover:bg-surface-container rounded-2xl border border-secondary/30 hover:border-secondary shadow-md cursor-pointer transition-all hover:scale-[1.02] flex flex-col justify-between gap-3 group"
          >
            <div className="flex items-center justify-between">
              <span className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center font-bold text-xl">
                👨🍳
              </span>
              <span className="px-2 py-0.5 rounded-full bg-secondary/10 text-secondary font-bold text-[10px] uppercase font-mono">
                Staff Station
              </span>
            </div>
            <div>
              <h3 className="font-bold text-base text-on-surface group-hover:text-secondary transition-colors">
                Floor &amp; Kitchen KDS
              </h3>
              <p className="text-xs text-on-surface-variant mt-1">
                High-speed POS dispatch, station tickets, table turnover, and settlement till.
              </p>
            </div>
            <div className="flex items-center text-xs font-bold text-secondary gap-1 pt-2 border-t border-outline-variant/20">
              <span>Enter as Floor Staff</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </div>
          </div>

          {/* Role 3: Admin */}
          <div
            onClick={() => {
              switchRole('admin');
              onEnterApp('dashboard');
            }}
            className="p-5 bg-surface-container-low hover:bg-surface-container rounded-2xl border border-primary/30 hover:border-primary shadow-md cursor-pointer transition-all hover:scale-[1.02] flex flex-col justify-between gap-3 group"
          >
            <div className="flex items-center justify-between">
              <span className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xl">
                👑
              </span>
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold text-[10px] uppercase font-mono">
                Administrator
              </span>
            </div>
            <div>
              <h3 className="font-bold text-base text-on-surface group-hover:text-primary transition-colors">
                Executive Operations Hub
              </h3>
              <p className="text-xs text-on-surface-variant mt-1">
                AI inventory supply, n8n orchestrator, menu matrix, CRM, and analytics.
              </p>
            </div>
            <div className="flex items-center text-xs font-bold text-primary gap-1 pt-2 border-t border-outline-variant/20">
              <span>Enter as Administrator</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </div>
          </div>
        </div>

        {/* Quick OAuth & Sign-in Row */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={handleGoogleLogin}
            className="px-4 py-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface text-xs font-bold border border-surface-container-high/60 shadow-sm flex items-center gap-2 transition-all"
          >
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Continue with Google OAuth</span>
          </button>
          <button
            onClick={onOpenStaffPin}
            className="px-4 py-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface text-xs font-bold border border-surface-container-high/60 shadow-sm flex items-center gap-1.5 transition-all"
          >
            <span className="material-symbols-outlined text-[16px] text-primary">pin</span>
            <span>Fast Staff PIN Switch</span>
          </button>
        </div>

        {/* Live Interactive Telemetry Preview Bar */}
        <div className="mt-14 w-full max-w-5xl bg-surface-container-low rounded-3xl p-6 sm:p-8 shadow-2xl border border-surface-container-high/50 flex flex-col gap-6 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-container-high/30">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-secondary animate-ping" />
              <div>
                <h3 className="font-headline-md font-bold text-on-surface">Live Operational Telemetry</h3>
                <p className="text-xs text-on-surface-variant">Real-time metrics streaming from InsForge PostgreSQL</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onEnterApp('dashboard')}
                className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs font-bold text-on-surface flex items-center gap-1 transition-colors"
              >
                <span>Full Executive View</span>
                <span className="material-symbols-outlined text-[14px]">open_in_new</span>
              </button>
            </div>
          </div>

          {/* 4 Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-surface-container border border-surface-container-high/40 flex flex-col gap-1">
              <span className="text-[11px] uppercase font-bold text-on-surface-variant">Today's Revenue</span>
              <span className="font-display-lg text-2xl font-black text-on-surface">
                ₹{(analytics.todayRevenue || 50210).toLocaleString('en-IN')}
              </span>
              <span className="text-[11px] text-secondary font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">arrow_upward</span>
                +18.4% pace
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-surface-container border border-surface-container-high/40 flex flex-col gap-1">
              <span className="text-[11px] uppercase font-bold text-on-surface-variant">Active Orders</span>
              <span className="font-display-lg text-2xl font-black text-primary">
                {analytics.totalOrders || 128} Orders
              </span>
              <span className="text-[11px] text-on-surface-variant font-medium">Avg Check: ₹383</span>
            </div>

            <div className="p-4 rounded-2xl bg-surface-container border border-surface-container-high/40 flex flex-col gap-1">
              <span className="text-[11px] uppercase font-bold text-on-surface-variant">Table Occupancy</span>
              <span className="font-display-lg text-2xl font-black text-secondary">
                {analytics.occupancyPct || 78}%
              </span>
              <span className="text-[11px] text-on-surface-variant font-medium">
                {analytics.activeTables || 19} / {analytics.totalTables || 24} Seated
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-surface-container border border-surface-container-high/40 flex flex-col gap-1">
              <span className="text-[11px] uppercase font-bold text-on-surface-variant">KDS Average Turn</span>
              <span className="font-display-lg text-2xl font-black text-tertiary">
                16.4m
              </span>
              <span className="text-[11px] text-secondary font-bold">● Within 20m SLA</span>
            </div>
          </div>

          {/* Interactive Live Demo Dispatcher Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-surface-container-lowest border border-surface-container-high/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
              <div className="w-10 h-10 rounded-xl bg-primary-container/20 text-primary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">flash_on</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-sm text-on-surface">Test Live Order Dispatcher</span>
                <span className="text-xs text-on-surface-variant truncate">
                  Dispatches a real order directly into InsForge database &amp; kitchen queue
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap">
              <input
                type="text"
                value={testCustomer}
                onChange={(e) => setTestCustomer(e.target.value)}
                placeholder="Guest Name (e.g. Priya S.)"
                className="bg-surface-container p-2.5 rounded-xl text-xs text-on-surface border border-surface-container-high/50 outline-none flex-1 sm:w-44"
              />
              <select
                value={testDish}
                onChange={(e) => setTestDish(e.target.value)}
                className="bg-surface-container p-2.5 rounded-xl text-xs text-on-surface border border-surface-container-high/50 outline-none font-semibold"
              >
                <option value="Butter Chicken">Butter Chicken (₹380)</option>
                <option value="Paneer Tikka">Paneer Tikka (₹290)</option>
                <option value="Chicken Dum Biryani">Chicken Dum Biryani (₹340)</option>
                <option value="Margherita Pizza">Margherita Pizza (₹310)</option>
              </select>
              <button
                onClick={handlePlaceDemoOrder}
                disabled={isPlacingDemo}
                className="px-4 py-2.5 rounded-xl bg-primary-container text-on-primary-container font-bold text-xs shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 shrink-0"
              >
                <span className="material-symbols-outlined text-[16px]">send</span>
                <span>{isPlacingDemo ? 'Posting...' : 'Dispatch'}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Deep Dive Grid */}
      <section className="py-16 px-4 sm:px-8 lg:px-16 bg-surface-container-low/50 border-t border-surface-container-high/30">
        <div className="max-w-6xl mx-auto flex flex-col gap-12">
          <div className="text-center max-w-2xl mx-auto flex flex-col gap-2">
            <span className="text-xs uppercase font-bold text-primary tracking-widest">
              Core Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-on-surface tracking-tight">
              Designed for Speed, Reliability &amp; Control
            </h2>
            <p className="text-sm text-on-surface-variant">
              Every subsystem works together seamlessly from front-of-house table service to back-of-house kitchen prep.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1: POS */}
            <div
              onClick={() => onEnterApp('pos-new-order')}
              className="p-6 rounded-3xl bg-surface-container border border-surface-container-high/40 hover:border-primary/50 transition-all cursor-pointer flex flex-col gap-4 shadow-sm hover:shadow-lg group"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary-container/20 text-primary flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[26px]">point_of_sale</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <h3 className="font-headline-md font-bold text-on-surface group-hover:text-primary transition-colors">
                  High-Velocity Touch POS
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Sub-second item adding, modifiers routing, split payments (UPI, Card, Cash), auto-coupons, and thermal ESC/POS receipt generation.
                </p>
              </div>
              <span className="text-xs text-primary font-bold flex items-center gap-1 mt-auto">
                Open POS Terminal <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </span>
            </div>

            {/* Feature 2: KDS */}
            <div
              onClick={() => onEnterApp('kitchen')}
              className="p-6 rounded-3xl bg-surface-container border border-surface-container-high/40 hover:border-primary/50 transition-all cursor-pointer flex flex-col gap-4 shadow-sm hover:shadow-lg group"
            >
              <div className="w-12 h-12 rounded-2xl bg-tertiary/20 text-tertiary flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[26px]">local_fire_department</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <h3 className="font-headline-md font-bold text-on-surface group-hover:text-primary transition-colors">
                  Kitchen Display System (KDS)
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Multi-station auto-routing (Tandoor, Curry, Bar, Pantry), priority timers, urgent allergy warnings, and one-tap ticket bumping.
                </p>
              </div>
              <span className="text-xs text-tertiary font-bold flex items-center gap-1 mt-auto">
                Open Kitchen KDS <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </span>
            </div>

            {/* Feature 3: Floor Plan */}
            <div
              onClick={() => onEnterApp('tables')}
              className="p-6 rounded-3xl bg-surface-container border border-surface-container-high/40 hover:border-primary/50 transition-all cursor-pointer flex flex-col gap-4 shadow-sm hover:shadow-lg group"
            >
              <div className="w-12 h-12 rounded-2xl bg-secondary/20 text-secondary flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[26px]">grid_view</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <h3 className="font-headline-md font-bold text-on-surface group-hover:text-primary transition-colors">
                  Interactive Floor &amp; Tables
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Live occupancy visualizer across Main, Patio, VIP, and Bar sections. Seamless table party merges, transfers, and turnover timers.
                </p>
              </div>
              <span className="text-xs text-secondary font-bold flex items-center gap-1 mt-auto">
                Open Floor Plan <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </span>
            </div>

            {/* Feature 4: Menu & Recipe */}
            <div
              onClick={() => onEnterApp('menu')}
              className="p-6 rounded-3xl bg-surface-container border border-surface-container-high/40 hover:border-primary/50 transition-all cursor-pointer flex flex-col gap-4 shadow-sm hover:shadow-lg group"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary-container/20 text-primary flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[26px]">menu_book</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <h3 className="font-headline-md font-bold text-on-surface group-hover:text-primary transition-colors">
                  Menu &amp; Recipe Engineering
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  BCG Matrix classifications (Star, Plowhorse, Puzzle), food cost % guardrails, gross margin analytics, and 86 out-of-stock switches.
                </p>
              </div>
              <span className="text-xs text-primary font-bold flex items-center gap-1 mt-auto">
                Explore Menu <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </span>
            </div>

            {/* Feature 5: Inventory */}
            <div
              onClick={() => onEnterApp('inventory')}
              className="p-6 rounded-3xl bg-surface-container border border-surface-container-high/40 hover:border-primary/50 transition-all cursor-pointer flex flex-col gap-4 shadow-sm hover:shadow-lg group"
            >
              <div className="w-12 h-12 rounded-2xl bg-secondary/20 text-secondary flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[26px]">inventory_2</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <h3 className="font-headline-md font-bold text-on-surface group-hover:text-primary transition-colors">
                  Stock Control &amp; Waste Logs
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Real-time ingredient deduction upon order placement, par-level alerts, one-click purchase orders, and shift wastage logging.
                </p>
              </div>
              <span className="text-xs text-secondary font-bold flex items-center gap-1 mt-auto">
                Manage Stock <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </span>
            </div>

            {/* Feature 6: InsForge BaaS */}
            <div
              onClick={() => onEnterApp('settings')}
              className="p-6 rounded-3xl bg-surface-container border border-surface-container-high/40 hover:border-primary/50 transition-all cursor-pointer flex flex-col gap-4 shadow-sm hover:shadow-lg group"
            >
              <div className="w-12 h-12 rounded-2xl bg-tertiary/20 text-tertiary flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[26px]">database</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <h3 className="font-headline-md font-bold text-on-surface group-hover:text-primary transition-colors">
                  InsForge BaaS Cloud Engine
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Enterprise Postgres BaaS backend with automatic migrations, cloud storage buckets, Google OAuth PKCE auth, and multi-client realtime sync.
                </p>
              </div>
              <span className="text-xs text-tertiary font-bold flex items-center gap-1 mt-auto">
                Cloud Settings <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing / Enterprise Section */}
      <section className="py-16 px-4 sm:px-8 lg:px-16 max-w-5xl mx-auto flex flex-col items-center text-center gap-10">
        <div className="flex flex-col gap-2">
          <span className="text-xs uppercase font-bold text-secondary tracking-widest">
            Flexible Deployment
          </span>
          <h2 className="text-3xl font-black text-on-surface">Ready for Every Restaurant Tier</h2>
          <p className="text-xs text-on-surface-variant max-w-lg">
            Whether managing a single boutique cafe or a nationwide 50-outlet chain, RestoFlow scales with zero downtime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
          <div className="p-6 rounded-3xl bg-surface-container border border-surface-container-high/40 flex flex-col justify-between gap-6 shadow-sm">
            <div className="flex flex-col gap-2">
              <span className="text-xs uppercase font-bold text-on-surface-variant">Single Outlet</span>
              <h3 className="text-2xl font-black text-on-surface">Free Starter</h3>
              <p className="text-xs text-on-surface-variant">Full POS, KDS Kitchen, Tables, and InsForge Postgres cloud database.</p>
            </div>
            <button
              onClick={() => onEnterApp('dashboard')}
              className="w-full py-3 rounded-xl bg-surface-container-high hover:bg-surface-bright text-xs font-bold text-on-surface transition-all"
            >
              Get Started Free
            </button>
          </div>

          <div className="p-6 rounded-3xl bg-surface-container-low border-2 border-primary flex flex-col justify-between gap-6 shadow-xl relative">
            <span className="absolute -top-3 right-6 bg-primary text-on-primary text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Most Popular
            </span>
            <div className="flex flex-col gap-2">
              <span className="text-xs uppercase font-bold text-primary">Pro Restaurant</span>
              <h3 className="text-2xl font-black text-on-surface">₹2,499<span className="text-xs font-normal text-on-surface-variant"> / month</span></h3>
              <p className="text-xs text-on-surface-variant">Multi-terminal sync, staff PIN roles, automated KOT print routing, and WhatsApp CRM loyalty.</p>
            </div>
            <button
              onClick={() => onEnterApp('dashboard')}
              className="w-full py-3 rounded-xl bg-primary-container text-on-primary-container font-bold text-xs shadow-md hover:brightness-110 transition-all"
            >
              Start 14-Day Free Trial
            </button>
          </div>

          <div className="p-6 rounded-3xl bg-surface-container border border-surface-container-high/40 flex flex-col justify-between gap-6 shadow-sm">
            <div className="flex flex-col gap-2">
              <span className="text-xs uppercase font-bold text-on-surface-variant">Multi-Chain</span>
              <h3 className="text-2xl font-black text-on-surface">Enterprise</h3>
              <p className="text-xs text-on-surface-variant">Central recipe catalog, franchise inventory pooling, multi-store rollups, and SLA support.</p>
            </div>
            <button
              onClick={() => onEnterApp('dashboard')}
              className="w-full py-3 rounded-xl bg-surface-container-high hover:bg-surface-bright text-xs font-bold text-on-surface transition-all"
            >
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 px-4 sm:px-8 lg:px-16 bg-surface-container-low border-t border-surface-container-high/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-on-surface-variant">
        <div className="flex items-center gap-2 font-bold text-on-surface">
          <span>RestoFlow Enterprise POS OS</span>
          <span>•</span>
          <span className="font-mono text-[11px] text-secondary">InsForge 2026</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => onEnterApp('dashboard')} className="hover:text-on-surface transition-colors">
            Dashboard
          </button>
          <button onClick={() => onEnterApp('pos-new-order')} className="hover:text-on-surface transition-colors">
            POS
          </button>
          <button onClick={() => onEnterApp('kitchen')} className="hover:text-on-surface transition-colors">
            KDS
          </button>
          <button onClick={() => onEnterApp('settings')} className="hover:text-on-surface transition-colors">
            InsForge Settings
          </button>
        </div>
      </footer>
    </div>
  );
};
