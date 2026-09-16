import { NavItem, KpiMetric, LiveOrder, PopularDish, FloorTable } from '../types';

export const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { id: 'pos-new-order', label: 'POS / New Order', icon: 'shopping_bag', badge: 'Fast POS', badgeType: 'fast-pos' },
  { id: 'orders', label: 'Orders', icon: 'receipt_long', badge: '8', badgeType: 'default' },
  { id: 'tables', label: 'Tables', icon: 'grid_view' },
  { id: 'kitchen', label: 'Kitchen', icon: 'local_fire_department', badge: 'Urgent', badgeType: 'urgent' },
  { id: 'reservations', label: 'Reservations', icon: 'calendar_today' },
  { id: 'menu', label: 'Menu', icon: 'menu_book' },
  { id: 'inventory', label: 'Inventory', icon: 'inventory_2', badgeType: 'dot' },
  { id: 'customers', label: 'Customers', icon: 'group' },
  { id: 'staff', label: 'Staff', icon: 'badge' },
  { id: 'reports-analytics', label: 'Reports & Analytics', icon: 'analytics' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
];

export const KPI_METRICS: KpiMetric[] = [
  {
    id: 'revenue',
    title: "Today's Revenue",
    icon: 'currency_rupee',
    iconColorClass: 'text-primary',
    value: '₹48,620',
    changeText: "vs ₹41,050 y'day",
    changeValue: '+18.4%',
    changePositive: true,
    type: 'sparkline',
  },
  {
    id: 'orders',
    title: 'Total Orders',
    icon: 'receipt',
    iconColorClass: 'text-tertiary',
    value: '127',
    changeText: 'vs yesterday',
    changeValue: '+12 orders',
    changePositive: true,
    type: 'breakdown',
    breakdown: [
      { label: 'Dine', count: 94 },
      { label: 'Take', count: 26 },
      { label: 'Del', count: 7 },
    ],
  },
  {
    id: 'aov',
    title: 'Average Order Value',
    icon: 'equalizer',
    iconColorClass: 'text-primary',
    value: '₹383',
    changeText: 'pace target ₹375',
    changeValue: '+₹28',
    changePositive: true,
    type: 'progress',
    progressValue: 82,
  },
  {
    id: 'occupancy',
    title: 'Table Occupancy',
    icon: 'table_restaurant',
    iconColorClass: 'text-secondary',
    value: '78%',
    changeText: 'Tables Active',
    changeValue: '19 / 24',
    type: 'occupancy',
    occupancyDetail: {
      active: 19,
      total: 24,
      turnovers: 5,
      avgTime: '~22m avg',
    },
  },
  {
    id: 'pending',
    title: 'Pending Orders',
    icon: 'pending_actions',
    iconColorClass: 'text-primary',
    value: '08',
    changeText: 'Kitchen Action',
    changeValue: '08',
    type: 'pipeline-count',
    kitchenActionDetail: {
      prep: 3,
      ready: 2,
      queue: 3,
    },
  },
];

export const LIVE_ORDERS: LiveOrder[] = [
  {
    id: '#ORD-10482',
    tableOrType: 'Table T-12',
    tableType: 'table',
    customer: 'Ananya Verma',
    itemsCount: 5,
    amount: 1840,
    status: 'paid-completed',
    statusLabel: 'Paid - Completed',
    time: '8:42 PM',
    actionIcon: 'receipt',
  },
  {
    id: '#ORD-10481',
    tableOrType: 'Table T-04',
    tableType: 'table',
    customer: 'Vikram Malhotra',
    itemsCount: 3,
    amount: 1260,
    status: 'preparing',
    statusLabel: 'Preparing',
    time: '8:38 PM',
    actionIcon: 'restaurant',
  },
  {
    id: '#ORD-10480',
    tableOrType: 'Takeaway #22',
    tableType: 'takeaway',
    customer: 'Priya Singh',
    itemsCount: 2,
    amount: 680,
    status: 'ready',
    statusLabel: 'Ready for Pickup',
    time: '8:35 PM',
    actionIcon: 'check_circle',
  },
  {
    id: '#ORD-10479',
    tableOrType: 'Table T-08',
    tableType: 'table',
    customer: 'Rahul Kapoor',
    itemsCount: 6,
    amount: 2450,
    status: 'paid-dinein',
    statusLabel: 'Paid - Dine-In',
    time: '8:29 PM',
    actionIcon: 'print',
  },
  {
    id: '#ORD-10478',
    tableOrType: 'Table T-16',
    tableType: 'table',
    customer: 'Rohan Mehta',
    itemsCount: 4,
    amount: 1590,
    status: 'seated-ordering',
    statusLabel: 'Seated - Ordering',
    time: '8:21 PM',
    actionIcon: 'edit_note',
  },
];

export const POPULAR_DISHES: PopularDish[] = [
  {
    id: 'dish-1',
    name: 'Butter Chicken',
    isVeg: false,
    ordersCount: 142,
    revenue: 42600,
    growth: '+18%',
    isPositiveGrowth: true,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDH8LH1fdiIdDAAuM87hOyrSr5o0N_k21tQrJ62lukG9qcewaJ3scqOfcOI8BTTj0kp5I7WxsdMEhkIDsgIddnzgGIkknVVFk4OPoTBnXY1zeyz7kFzDVa_s5BQFHdWy-zQchP8Jki9oFwlcj1REaKmgoXsiKRs4tHCJXUV93jNIH3eTbsjuyD33aqAqPsKcoEtlT-4EGRlxKbXUVTXIGci17x0zWNBxPLSV2-W6Lc90T-fxaV7E-Vq',
    altText:
      'A gourmet bowl of creamy Butter Chicken curry with aromatic rich orange gravy, fresh coriander garnish, and dollop of white cream on dark obsidian restaurant plating',
  },
  {
    id: 'dish-2',
    name: 'Paneer Tikka',
    isVeg: true,
    ordersCount: 118,
    revenue: 29500,
    growth: '+9%',
    isPositiveGrowth: true,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCt6tS1yZeVJXYs7xnTN1ccvHa2HW2saDI3CsZiEgyQpS9cf75gOQWe5gm_HVxvY5TfSP3mUaHKQ8UnRKrpZ9Dn8Fj0mZvYFKUwDhYqb81xz4RPZsnyXTofmCcDaPPmvH9yyKK0DwKET7UtFW7mdiCHDNaPenqqjyDVtmrNpWWhwtBoreECBuC21r4YOYhmEiNPc_4HE76B3ZKmgXlKMjbZKR5S4nshmDa2oQ4SO9jom5MsfNTDtFfF',
    altText:
      'Golden grilled Paneer Tikka cubes with charred capsicum and onion rings, seasoned with rich spices on a dark slate board with mint chutney',
  },
  {
    id: 'dish-3',
    name: 'Masala Dosa',
    isVeg: true,
    ordersCount: 97,
    revenue: 14550,
    growth: '+12%',
    isPositiveGrowth: true,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA7pjnSgzgmnWKTPKu-iUDGLnfyQiKoam6yaKlLuNEZ0psekD2VAa5mcYLgWybtFk3_fXMo315tWkRJcr5GEV8HcwvtSnF7m2tYnfdBzXWGUWdP3LoIrs00PTlFbFb4xQkcBipm8BT3SvmcN8vR_pjI4EQ1Ssa7TmOq6JUdoQynWUW7HZCK9cVA0OoZ9j3s-__uhJBCfrhY_dbunNRU-haE0YOB6_wmRP27zrQ7zsswCklCmm01lL19',
    altText:
      'Crispy rolled golden South Indian Masala Dosa served with stainless steel bowls of coconut chutney, tomato chutney, and steaming lentil sambar',
  },
  {
    id: 'dish-4',
    name: 'Chicken Dum Biryani',
    isVeg: false,
    ordersCount: 84,
    revenue: 26880,
    growth: '+22%',
    isPositiveGrowth: true,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBENWDfx1-d0UWSah0Kgdyaer1PRWXCJeC4hQf9ZyVg2qPQoOixLFLTRdidHssPfL_tRyv6Qs5RAoV8JwV2UtPrDImdSZ-5WiTJKd1y1nuVM-saxxWYA1asa5zFqkALDG0ptHc9g-pwJXl5SkFc6A_Qszb8Tr6Y0qrg7odVsGF6f1LejRHiyTGqdtICtMH8lWeHky0LwakwaMT4-xJhiLDBh2LgTEtNOZbMwemeeAYzjJdEpJSBa6RK',
    altText:
      'Hyderabadi Chicken Dum Biryani in traditional brass handi with long fragrant basmati rice grains, fried brown onions, mint, and boiled egg garnish',
  },
  {
    id: 'dish-5',
    name: 'Garlic Naan',
    isVeg: true,
    ordersCount: 195,
    revenue: 15600,
    growth: 'Stable',
    isPositiveGrowth: false,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA9PrUCnLDZ8dc0ytNrGsbbI2GnDy44k38_XZUDxdNWj6hYxTUAbxylXQkaJ6q8c_ubW-v_m23TgSScf5uw19nZSsapsF1CuJCjvsePNavpa4tGCnXJJOnSQa-2JTpOd_jCbEAQxshoB4XKQQlMAjMYFGTdWtf7P6NXlc3abJIFwpAVFFjuTHtnV5K38xqHwsZrl8YtbE7nwBpISqsdl48c3bPD-VWW2Zwi0Fl2RZ0AtTaajBFh6EsK',
    altText:
      'Freshly baked tandoori Garlic Naan bread brushed with molten golden butter and topped with roasted garlic and chopped cilantro leaves',
  },
];

export const FLOOR_TABLES: FloorTable[] = [
  // Row 1
  { id: 'T01', name: 'T01', capacity: 4, status: 'occupied', orderInfo: 'Occupied (30m)' },
  { id: 'T02', name: 'T02', capacity: 2, status: 'occupied', orderInfo: 'Occupied (15m)' },
  { id: 'T03', name: 'T03', capacity: 2, status: 'available', orderInfo: 'Available' },
  { id: 'T04', name: 'T04', capacity: 4, status: 'occupied', orderInfo: 'Occupied (ORD-10481)' },
  { id: 'T05', name: 'T05', capacity: 6, status: 'reserved', orderInfo: 'Reserved (20:45 PM)' },
  { id: 'T06', name: 'T06', capacity: 4, status: 'occupied', orderInfo: 'Occupied (50m)' },

  // Row 2
  { id: 'T07', name: 'T07', capacity: 4, status: 'available', orderInfo: 'Available' },
  { id: 'T08', name: 'T08', capacity: 6, status: 'occupied', orderInfo: 'Occupied (Rahul K.)' },
  { id: 'T09', name: 'T09', capacity: 2, status: 'cleaning', orderInfo: 'Cleaning' },
  { id: 'T10', name: 'T10', capacity: 4, status: 'occupied', orderInfo: 'Occupied' },
  { id: 'T11', name: 'T11', capacity: 2, status: 'occupied', orderInfo: 'Occupied' },
  {
    id: 'T12',
    name: 'T12',
    capacity: 4,
    status: 'occupied',
    orderInfo: 'Occupied • #ORD-10482',
    timeSeated: '42m',
    amount: 1840,
    activeTarget: true,
  },

  // Row 3
  { id: 'T13', name: 'T13', capacity: 4, status: 'available', orderInfo: 'Available' },
  { id: 'T14', name: 'T14', capacity: 8, status: 'occupied', orderInfo: 'Occupied' },
  { id: 'T15', name: 'T15', capacity: 2, status: 'reserved', orderInfo: 'Reserved' },
  { id: 'T16', name: 'T16', capacity: 4, status: 'occupied', orderInfo: 'Occupied (Rohan M.)' },
  { id: 'T17', name: 'T17', capacity: 2, status: 'occupied', orderInfo: 'Occupied' },
  { id: 'T18', name: 'T18', capacity: 4, status: 'cleaning', orderInfo: 'Cleaning' },

  // Row 4
  { id: 'T19', name: 'T19', capacity: 2, status: 'available', orderInfo: 'Available' },
  { id: 'T20', name: 'T20', capacity: 4, status: 'occupied', orderInfo: 'Occupied' },
  { id: 'T21', name: 'T21', capacity: 6, status: 'occupied', orderInfo: 'Occupied' },
  { id: 'T22', name: 'T22', capacity: 2, status: 'reserved', orderInfo: 'Reserved' },
  { id: 'T23', name: 'T23', capacity: 4, status: 'available', orderInfo: 'Available' },
  { id: 'T24', name: 'T24', capacity: 8, status: 'occupied', orderInfo: 'Occupied' },
];

export const PIPELINE_SEGMENTS = [
  { id: 'new', label: 'New Queue', count: 8, color: 'bg-primary-container', dotColor: 'bg-primary-container', width: '6.2%', textClass: 'text-on-surface' },
  { id: 'preparing', label: 'Preparing', count: 5, color: 'bg-tertiary-container', dotColor: 'bg-tertiary', width: '3.9%', textClass: 'text-tertiary' },
  { id: 'ready', label: 'Ready', count: 3, color: 'bg-secondary', dotColor: 'bg-secondary', width: '2.3%', textClass: 'text-secondary' },
  { id: 'completed', label: 'Completed', count: 111, color: 'bg-surface-bright', dotColor: 'bg-surface-variant', width: '87.6%', textClass: 'text-on-surface' },
  { id: 'cancelled', label: 'Cancelled', count: 0, color: 'bg-error', dotColor: 'bg-error', width: '0%', textClass: 'text-on-surface-variant' },
];
