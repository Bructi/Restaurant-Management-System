import { useState, useEffect, useCallback } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { useRealtimeSync } from './hooks/useRealtimeSync';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { LandingPage } from './components/landing/LandingPage';
import { DashboardView } from './components/dashboard/DashboardView';
import { PosTerminalView } from './components/pos/PosTerminalView';
import { OrderManagementView } from './components/orders/OrderManagementView';
import { TableManagementView } from './components/tables/TableManagementView';
import { KitchenDisplayView } from './components/kitchen/KitchenDisplayView';
import { ReservationsView } from './components/reservations/ReservationsView';
import { MenuManagementView } from './components/menu/MenuManagementView';
import { InventoryManagementView } from './components/inventory/InventoryManagementView';
import { CustomerCrmView } from './components/customers/CustomerCrmView';
import { StaffManagementView } from './components/staff/StaffManagementView';
import { ReportsAnalyticsView } from './components/analytics/ReportsAnalyticsView';
import { SettingsView } from './components/settings/SettingsView';
import { CheckoutTerminalView } from './components/checkout/CheckoutTerminalView';
import { QuickOrderModal } from './components/modals/QuickOrderModal';
import { SearchModal } from './components/modals/SearchModal';
import { DailySummaryModal } from './components/modals/DailySummaryModal';
import { OrderTicketModal } from './components/modals/OrderTicketModal';
import { FloorManagerModal } from './components/modals/FloorManagerModal';
import { AuthModal } from './components/auth/AuthModal';
import { StaffPinModal } from './components/auth/StaffPinModal';
import { NAV_ITEMS } from './data/dashboardData';
import { NavPath, LiveOrder, FloorTable, PopularDish } from './types';

function AppContent() {
  const [currentPath, setCurrentPath] = useState<NavPath>('landing');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Real-time backend WebSocket sync
  const { isConnected, latencyMs } = useRealtimeSync((event) => {
    console.log('[App] Received Realtime Event:', event.type, event.payload);
  });

  // Modals state
  const [isQuickOrderOpen, setIsQuickOrderOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDailySummaryOpen, setIsDailySummaryOpen] = useState(false);
  const [isFloorManagerOpen, setIsFloorManagerOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isStaffPinOpen, setIsStaffPinOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<LiveOrder | null>(null);

  // Keyboard shortcut bindings: F1 for Quick Order, Cmd/Ctrl + K for Search, Esc to close
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'F1') {
        e.preventDefault();
        setIsQuickOrderOpen((prev) => !prev);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setIsQuickOrderOpen(false);
        setIsSearchOpen(false);
        setIsDailySummaryOpen(false);
        setIsFloorManagerOpen(false);
        setIsAuthModalOpen(false);
        setIsStaffPinOpen(false);
        setSelectedOrder(null);
        setIsMobileMenuOpen(false);
      }
    },
    []
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleRefresh = () => {
    console.log('RestoFlow telemetry synchronized');
  };

  const handleSelectTable = (table: FloorTable) => {
    console.log('Selected Table:', table);
    setCurrentPath('tables');
  };

  const handleSelectDish = (dish: PopularDish) => {
    console.log('Selected Dish:', dish);
    setCurrentPath('menu');
  };

  const renderActiveScreen = () => {
    switch (currentPath) {
      case 'landing':
        return (
          <LandingPage
            onEnterApp={(path) => setCurrentPath(path || 'dashboard')}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            onOpenStaffPin={() => setIsStaffPinOpen(true)}
          />
        );
      case 'dashboard':
        return (
          <DashboardView
            onQuickOrder={() => setIsQuickOrderOpen(true)}
            onDailySummary={() => setIsDailySummaryOpen(true)}
            onRefresh={handleRefresh}
            onSelectOrder={(order) => setSelectedOrder(order)}
            onOpenFloorManager={() => setIsFloorManagerOpen(true)}
            onSelectTable={handleSelectTable}
            onSelectDish={handleSelectDish}
            onNavigateToOrders={() => setCurrentPath('orders')}
          />
        );
      case 'pos-new-order':
        return <PosTerminalView />;
      case 'orders':
        return <OrderManagementView />;
      case 'tables':
        return <TableManagementView />;
      case 'kitchen':
        return <KitchenDisplayView />;
      case 'reservations':
        return <ReservationsView />;
      case 'menu':
        return <MenuManagementView />;
      case 'inventory':
        return <InventoryManagementView />;
      case 'customers':
        return <CustomerCrmView />;
      case 'staff':
        return <StaffManagementView />;
      case 'reports-analytics':
        return <ReportsAnalyticsView />;
      case 'settings':
        return <SettingsView />;
      case 'checkout':
        return <CheckoutTerminalView />;
      default:
        return (
          <DashboardView
            onQuickOrder={() => setIsQuickOrderOpen(true)}
            onDailySummary={() => setIsDailySummaryOpen(true)}
            onRefresh={handleRefresh}
            onSelectOrder={(order) => setSelectedOrder(order)}
            onOpenFloorManager={() => setIsFloorManagerOpen(true)}
            onSelectTable={handleSelectTable}
            onSelectDish={handleSelectDish}
            onNavigateToOrders={() => setCurrentPath('orders')}
          />
        );
    }
  };

  if (currentPath === 'landing') {
    return (
      <div className="min-h-screen bg-surface-container-lowest text-on-surface font-body-md text-body-md antialiased selection:bg-primary-container selection:text-on-primary-container">
        <LandingPage
          onEnterApp={(path) => setCurrentPath(path || 'dashboard')}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onOpenStaffPin={() => setIsStaffPinOpen(true)}
        />
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
        <StaffPinModal
          isOpen={isStaffPinOpen}
          onClose={() => setIsStaffPinOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-container-lowest text-on-surface font-body-md text-body-md antialiased selection:bg-primary-container selection:text-on-primary-container">
      {/* Persistent Left Sidebar Navigation */}
      <Sidebar
        navItems={NAV_ITEMS}
        currentPath={currentPath}
        onNavigate={(path) => {
          setCurrentPath(path);
        }}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Viewport Frame */}
      <div className="pl-0 lg:pl-72 flex flex-col min-h-screen">
        {/* Fixed Top Status & Utility Bar */}
        <Header
          onOpenSearch={() => setIsSearchOpen(true)}
          onQuickOrder={() => setCurrentPath('pos-new-order')}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onOpenStaffPin={() => setIsStaffPinOpen(true)}
          onNavigateTables={() => setCurrentPath('tables')}
          onNavigateKitchen={() => setCurrentPath('kitchen')}
          onNavigateSettings={() => setCurrentPath('settings')}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          isConnected={isConnected}
          latencyMs={latencyMs}
        />

        {/* Dynamic Route Container */}
        <main className="w-full pt-16 bg-surface-container-lowest px-space-md sm:px-space-lg min-h-screen">
          {renderActiveScreen()}
        </main>
      </div>

      {/* Modals & Dialogs */}
      <QuickOrderModal
        isOpen={isQuickOrderOpen}
        onClose={() => setIsQuickOrderOpen(false)}
      />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectResult={(type, item) => {
          console.log('Selected from search:', type, item);
          if (type === 'table') setCurrentPath('tables');
          else if (type === 'order') setCurrentPath('orders');
          else if (type === 'dish') setCurrentPath('menu');
          else if (type === 'guest') setCurrentPath('customers');
        }}
      />

      <DailySummaryModal
        isOpen={isDailySummaryOpen}
        onClose={() => setIsDailySummaryOpen(false)}
      />

      <OrderTicketModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />

      <FloorManagerModal
        isOpen={isFloorManagerOpen}
        onClose={() => setIsFloorManagerOpen(false)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <StaffPinModal
        isOpen={isStaffPinOpen}
        onClose={() => setIsStaffPinOpen(false)}
      />
    </div>
  );
}

export function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
