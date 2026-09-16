export type NavPath =
  | 'landing'
  | 'dashboard'
  | 'pos-new-order'
  | 'orders'
  | 'tables'
  | 'kitchen'
  | 'reservations'
  | 'menu'
  | 'inventory'
  | 'customers'
  | 'staff'
  | 'reports-analytics'
  | 'settings'
  | 'checkout';

export interface NavItem {
  id: NavPath;
  label: string;
  icon: string;
  badge?: string;
  badgeType?: 'default' | 'fast-pos' | 'urgent' | 'dot';
}

export interface KpiMetric {
  id: string;
  title: string;
  icon: string;
  iconColorClass: string;
  value: string;
  changeText: string;
  changeValue: string;
  changePositive?: boolean;
  extraInfo?: string;
  type: 'sparkline' | 'breakdown' | 'progress' | 'occupancy' | 'pipeline-count';
  progressValue?: number;
  breakdown?: { label: string; count: number }[];
  occupancyDetail?: { active: number; total: number; turnovers: number; avgTime: string };
  kitchenActionDetail?: { prep: number; ready: number; queue: number };
}

export interface LiveOrder {
  id: string;
  tableOrType: string;
  tableType: 'table' | 'takeaway' | 'delivery';
  customer: string;
  itemsCount: number;
  amount: number;
  status: 'paid-completed' | 'preparing' | 'ready' | 'paid-dinein' | 'seated-ordering';
  statusLabel: string;
  time: string;
  actionIcon: string;
}

export interface PopularDish {
  id: string;
  name: string;
  isVeg: boolean;
  ordersCount: number;
  revenue: number;
  growth: string;
  isPositiveGrowth?: boolean;
  imageUrl: string;
  altText: string;
}

export type TableStatus = 'available' | 'occupied' | 'reserved' | 'cleaning';

export interface FloorTable {
  id: string;
  name: string;
  capacity: number;
  status: TableStatus;
  orderInfo?: string;
  timeSeated?: string;
  amount?: number;
  activeTarget?: boolean;
}
