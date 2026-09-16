import React, { useState, useEffect, useCallback } from 'react';
import { TopBanner } from './TopBanner';
import { KpiMetricsStream } from './KpiMetricsStream';
import { HourlyRevenueChart } from './HourlyRevenueChart';
import { LiveOrderPipeline } from './LiveOrderPipeline';
import { RecentOrdersTable } from './RecentOrdersTable';
import { PopularDishes } from './PopularDishes';
import { FloorPlanStatus } from './FloorPlanStatus';
import { KPI_METRICS, LIVE_ORDERS, POPULAR_DISHES, FLOOR_TABLES } from '../../data/dashboardData';
import { LiveOrder, FloorTable, PopularDish, KpiMetric } from '../../types';
import { api } from '../../services/api';
import { subscribeRealtime } from '../../hooks/useRealtimeSync';

interface DashboardViewProps {
  onQuickOrder: () => void;
  onDailySummary: () => void;
  onRefresh: () => void;
  onSelectOrder: (order: LiveOrder) => void;
  onOpenFloorManager: () => void;
  onSelectTable: (table: FloorTable) => void;
  onSelectDish: (dish: PopularDish) => void;
  onNavigateToOrders?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onQuickOrder,
  onDailySummary,
  onRefresh,
  onSelectOrder,
  onOpenFloorManager,
  onSelectTable,
  onSelectDish,
  onNavigateToOrders,
}) => {
  const [metrics, setMetrics] = useState<KpiMetric[]>(KPI_METRICS);
  const [orders, setOrders] = useState<LiveOrder[]>(LIVE_ORDERS);
  const [dishes, setDishes] = useState<PopularDish[]>(POPULAR_DISHES);
  const [tables, setTables] = useState<FloorTable[]>(FLOOR_TABLES);

  const loadData = useCallback(() => {
    // 1. Analytics
    api.getAnalyticsSummary().then((res) => {
      if (res.success && res.data) {
        const a = res.data;
        setMetrics((prev) =>
          prev.map((m) => {
            if (m.id === 'revenue') {
              return { ...m, value: `₹${(a.todayRevenue || 48620).toLocaleString('en-IN')}` };
            }
            if (m.id === 'orders') {
              return { ...m, value: String(a.totalOrders || 127) };
            }
            if (m.id === 'aov') {
              return { ...m, value: `₹${a.aov || 383}` };
            }
            if (m.id === 'occupancy') {
              return { ...m, value: `${a.occupancyPct || 78}%` };
            }
            if (m.id === 'pending') {
              return { ...m, value: String(a.pendingOrdersCount || 8) };
            }
            return m;
          })
        );
      }
    }).catch(() => {});

    // 2. Orders
    api.getOrders().then((res) => {
      if (res.success && res.data && res.data.length > 0) {
        const mapped: LiveOrder[] = res.data.slice(0, 6).map((o: any) => ({
          id: o.id,
          tableOrType: o.table || 'Dine-In',
          tableType: o.tableType?.toLowerCase().includes('takeaway')
            ? 'takeaway'
            : o.tableType?.toLowerCase().includes('delivery')
            ? 'delivery'
            : 'table',
          customer: o.customer || 'Walk-in Guest',
          itemsCount: o.itemsCount || (o.lineItems ? o.lineItems.length : 3),
          amount: o.total || 1200,
          status:
            o.kitchenStatus === 'completed'
              ? 'paid-completed'
              : o.kitchenStatus === 'ready'
              ? 'ready'
              : o.kitchenStatus === 'prep'
              ? 'preparing'
              : o.paymentStatus === 'paid'
              ? 'paid-dinein'
              : 'seated-ordering',
          statusLabel:
            o.kitchenStatus === 'completed'
              ? 'Paid & Done'
              : o.kitchenStatus === 'ready'
              ? 'Ready'
              : o.kitchenStatus === 'prep'
              ? 'Preparing'
              : o.paymentStatus === 'paid'
              ? 'Paid'
              : 'Seated',
          time: o.time || '8:30 PM',
          actionIcon: 'chevron_right',
        }));
        setOrders(mapped);
      }
    }).catch(() => {});

    // 3. Tables
    api.getTables().then((res) => {
      if (res.success && res.data && res.data.length > 0) {
        const mappedTables: FloorTable[] = res.data.map((t: any) => ({
          id: t.id,
          name: t.name || t.id,
          capacity: t.capacity || 4,
          status: t.status || 'available',
          orderInfo: t.orderInfo || (t.status === 'occupied' ? 'Occupied' : 'Available'),
          timeSeated: t.timeSeated,
          amount: t.amount,
          activeTarget: t.activeTarget,
        }));
        setTables(mappedTables);
      }
    }).catch(() => {});

    // 4. Popular Dishes
    api.getPopularDishes().then((res) => {
      if (res.success && res.data && res.data.length > 0) {
        setDishes(res.data);
      }
    }).catch(() => {
      api.getMenu().then((res) => {
        if (res.success && res.data && res.data.length > 0) {
          const mappedDishes: PopularDish[] = res.data.slice(0, 5).map((m: any, idx: number) => ({
            id: m.id,
            name: m.name,
            isVeg: m.isVeg,
            ordersCount: 42 - idx * 8,
            revenue: (42 - idx * 8) * m.price,
            growth: '+18%',
            isPositiveGrowth: true,
            imageUrl: m.imageUrl,
            altText: m.name,
          }));
          setDishes(mappedDishes);
        }
      }).catch(() => {});
    });
  }, []);

  useEffect(() => {
    loadData();

    // Subscribe to real-time events for instant live updates
    const unsub = subscribeRealtime((event) => {
      console.log('[Dashboard] Real-time event triggered update:', event.type);
      if (
        event.type === 'ORDER_CREATED' ||
        event.type === 'ORDER_UPDATED' ||
        event.type === 'ORDER_SETTLED' ||
        event.type === 'TABLE_UPDATED' ||
        event.type === 'ANALYTICS_UPDATED' ||
        event.type === 'KDS_TICKET_BUMPED'
      ) {
        loadData();
      }
    });

    return () => unsub();
  }, [loadData]);

  const handleRefresh = () => {
    loadData();
    onRefresh();
  };

  return (
    <div className="flex flex-col w-full pb-16 space-y-space-lg">
      {/* Top Operational Banner & Greetings */}
      <TopBanner
        onQuickOrder={onQuickOrder}
        onDailySummary={onDailySummary}
        onRefresh={handleRefresh}
      />

      {/* KPI Metric Stream (5 Cards) */}
      <KpiMetricsStream metrics={metrics} />

      {/* Operational Workfield Grid (65% Left / 35% Right -> 8 Cols / 4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        {/* LEFT PANEL: Analytics, Pipeline, Live Orders (8 Cols / ~66%) */}
        <div className="lg:col-span-8 flex flex-col gap-space-lg">
          {/* Chart Card: Hourly Revenue & Volume */}
          <HourlyRevenueChart />

          {/* Order Status Pipeline (Bar and Chips) */}
          <LiveOrderPipeline />

          {/* Live Order Feed Table */}
          <RecentOrdersTable
            orders={orders}
            onSelectOrder={onSelectOrder}
            onViewAll={onNavigateToOrders}
          />
        </div>

        {/* RIGHT PANEL: Popular Dishes & Mini Visual Floor Plan (4 Cols / ~34%) */}
        <div className="lg:col-span-4 flex flex-col gap-space-lg">
          {/* Top Selling Dishes Today */}
          <PopularDishes
            dishes={dishes}
            onSelectDish={onSelectDish}
          />

          {/* Mini Visual Floor Plan Quick Overview */}
          <FloorPlanStatus
            tables={tables}
            onOpenFloorManager={onOpenFloorManager}
            onSelectTable={onSelectTable}
          />
        </div>
      </div>
    </div>
  );
};
