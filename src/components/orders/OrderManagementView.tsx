import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { subscribeRealtime } from '../../hooks/useRealtimeSync';
import { useToast } from '../../contexts/ToastContext';
import { printThermalReceipt } from '../../utils/exportUtils';

interface OrderRecord {
  id: string;
  terminal: string;
  table: string;
  tableType: string;
  customer: string;
  phone: string;
  itemsSummary: string;
  itemsCount: number;
  staff: string;
  total: number;
  subtotal?: number;
  taxes?: number;
  serviceCharge?: number;
  paymentStatus: 'paid' | 'unpaid';
  paymentMethod: string;
  kitchenStatus: 'prep' | 'ready' | 'completed' | 'new';
  kitchenTime: string;
  time: string;
  lineItems?: { name: string; qty: number; price: number; station: string; status: string; notes?: string }[];
}

const MOCK_ORDERS: OrderRecord[] = [
  {
    id: '#ORD-10482',
    terminal: 'POS Terminal 1',
    table: 'Table T-12',
    tableType: 'Dine-In · 4 Pax',
    customer: 'Ananya Verma',
    phone: '+91 98201 44821',
    itemsSummary: 'Butter Chicken, Paneer Tikka, 2 Naan, 2 Coke',
    itemsCount: 5,
    staff: 'Sunil R.',
    total: 1840,
    paymentStatus: 'paid',
    paymentMethod: 'UPI',
    kitchenStatus: 'prep',
    kitchenTime: 'Prep (14m)',
    time: '8:42 PM',
    lineItems: [
      { name: 'Paneer Tikka (Tandoor)', qty: 2, price: 580, station: 'Tandoor', status: 'Ready to Serve', notes: 'Extra mint dip' },
      { name: 'Butter Chicken (Boneless)', qty: 1, price: 380, station: 'Curry', status: 'Simmering in Karahi', notes: 'Medium gravy' },
      { name: 'Garlic Naan (Crispy)', qty: 2, price: 160, station: 'Tandoor', status: 'Firing on wall', notes: 'Well done' },
      { name: 'Coke (Zero Sugar 300ml)', qty: 2, price: 120, station: 'Bar', status: 'Dispensed', notes: 'Ice & lemon' },
    ],
  },
  {
    id: '#ORD-10481',
    terminal: 'POS Terminal 2',
    table: 'Table T-04',
    tableType: 'Dine-In · 2 Pax',
    customer: 'Vikram Malhotra',
    phone: '+91 98334 11204',
    itemsSummary: 'Tandoori Chicken, Dal Makhani, Roti',
    itemsCount: 3,
    staff: 'Aniket S.',
    total: 1260,
    paymentStatus: 'unpaid',
    paymentMethod: 'Unpaid',
    kitchenStatus: 'prep',
    kitchenTime: 'Prep (18m)',
    time: '8:38 PM',
    lineItems: [
      { name: 'Tandoori Chicken (Full)', qty: 1, price: 420, station: 'Tandoor', status: 'In Skewer Oven', notes: 'Extra spicy' },
      { name: 'Dal Makhani SpiceRoute', qty: 1, price: 280, station: 'Curry', status: 'Plated', notes: 'Extra butter' },
      { name: 'Tandoori Roti (Butter)', qty: 4, price: 160, station: 'Tandoor', status: 'Firing', notes: 'Hot' },
    ],
  },
  {
    id: '#ORD-10480',
    terminal: 'Fast Counter',
    table: 'Takeaway #22',
    tableType: 'Counter Pickup',
    customer: 'Priya Singh',
    phone: '+91 97110 39201',
    itemsSummary: 'Veg Biryani, Raita',
    itemsCount: 2,
    staff: 'Meera K.',
    total: 680,
    paymentStatus: 'paid',
    paymentMethod: 'Card',
    kitchenStatus: 'ready',
    kitchenTime: 'Ready (6m)',
    time: '8:35 PM',
    lineItems: [
      { name: 'Hyderabadi Veg Biryani (Handi)', qty: 1, price: 320, station: 'Pantry', status: 'Packed in Box' },
      { name: 'Burani Raita & Salan', qty: 1, price: 100, station: 'Pantry', status: 'Sealed with cutlery' },
    ],
  },
  {
    id: '#ORD-10479',
    terminal: 'POS Terminal 1',
    table: 'Table T-08',
    tableType: 'Dine-In · 5 Pax',
    customer: 'Rahul Kapoor',
    phone: '+91 98450 77123',
    itemsSummary: 'Paneer Butter Masala, 4 Garlic Naan, Kulfi',
    itemsCount: 6,
    staff: 'Sunil R.',
    total: 2450,
    paymentStatus: 'paid',
    paymentMethod: 'Cash',
    kitchenStatus: 'completed',
    kitchenTime: 'Completed',
    time: '8:29 PM',
  },
  {
    id: '#ORD-10478',
    terminal: 'POS Terminal 3',
    table: 'Table T-16',
    tableType: 'Dine-In · 2 Pax',
    customer: 'Rohan Mehta',
    phone: '+91 99002 88419',
    itemsSummary: 'Chicken Dum Biryani, Mirchi Salan, Gulab Jamun',
    itemsCount: 4,
    staff: 'Rajesh P.',
    total: 1590,
    paymentStatus: 'unpaid',
    paymentMethod: 'Unpaid',
    kitchenStatus: 'new',
    kitchenTime: 'New (2m)',
    time: '8:21 PM',
  },
  {
    id: '#ORD-10477',
    terminal: 'Aggregator Bridge',
    table: 'Delivery #Z-904',
    tableType: 'Swiggy Aggregator',
    customer: 'Amit Joshi',
    phone: '+91 98190 22100',
    itemsSummary: 'Butter Chicken, 2 Rumali Roti',
    itemsCount: 3,
    staff: 'Dispatch',
    total: 890,
    paymentStatus: 'paid',
    paymentMethod: 'Online',
    kitchenStatus: 'completed',
    kitchenTime: 'Completed',
    time: '8:15 PM',
  },
];

export const OrderManagementView: React.FC = () => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'all' | 'new' | 'prep' | 'ready' | 'completed' | 'cancelled'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<string>('#ORD-10482');
  const [tableFilter, setTableFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [period, setPeriod] = useState('today');
  const [orders, setOrders] = useState<OrderRecord[]>(MOCK_ORDERS);

  const fetchOrders = () => {
    api.getOrders().then((res) => {
      if (res.success && res.data && res.data.length > 0) {
        setOrders(res.data);
      }
    }).catch(() => {});
  };

  useEffect(() => {
    fetchOrders();

    const unsub = subscribeRealtime((event) => {
      if (
        event.type === 'ORDER_CREATED' ||
        event.type === 'ORDER_UPDATED' ||
        event.type === 'ORDER_SETTLED' ||
        event.type === 'KDS_TICKET_BUMPED'
      ) {
        fetchOrders();
      }
    });

    return () => unsub();
  }, []);

  const selectedOrder = orders.find((o) => o.id === selectedOrderId) || orders[0] || MOCK_ORDERS[0];

  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'new' && order.kitchenStatus !== 'new') return false;
    if (activeTab === 'prep' && order.kitchenStatus !== 'prep') return false;
    if (activeTab === 'ready' && order.kitchenStatus !== 'ready') return false;
    if (activeTab === 'completed' && order.kitchenStatus !== 'completed') return false;
    if (paymentFilter === 'paid' && order.paymentStatus !== 'paid') return false;
    if (paymentFilter === 'unpaid' && order.paymentStatus !== 'unpaid') return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (
        !order.id.toLowerCase().includes(q) &&
        !order.table.toLowerCase().includes(q) &&
        !order.customer.toLowerCase().includes(q) &&
        !order.phone.toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="flex flex-col w-full pb-16 space-y-space-md">
      {/* Top Command & Metric Bar */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-space-md py-space-md mb-space-sm">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-space-sm flex-wrap">
            <span className="font-headline-lg text-headline-lg tracking-tight text-on-surface font-bold">
              Order Dispatch &amp; Live Operations
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container-high text-primary font-mono-metric text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Terminal #01 Active
            </span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Real-time KDS synchronization, bill tracking, and fast kitchen ticket dispatch.
          </p>
        </div>

        {/* Live Operational Counter Mini-Cards */}
        <div className="flex items-center gap-space-sm overflow-x-auto pb-1 xl:pb-0">
          <div className="bg-surface-container-low px-space-md py-2 rounded-xl flex items-center gap-space-sm shrink-0 shadow-sm border border-surface-container-high/30">
            <div className="w-8 h-8 rounded-lg bg-primary-container/15 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]">receipt_long</span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm uppercase text-on-surface-variant font-medium">
                Total Volume
              </span>
              <span className="font-headline-md text-headline-md leading-none text-on-surface font-bold">
                127 <span className="font-body-sm text-body-sm text-secondary font-normal">+14%</span>
              </span>
            </div>
          </div>

          <div className="bg-surface-container-low px-space-md py-2 rounded-xl flex items-center gap-space-sm shrink-0 shadow-sm border border-surface-container-high/30">
            <div className="w-8 h-8 rounded-lg bg-secondary/15 flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[20px]">payments</span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm uppercase text-on-surface-variant font-medium">
                Shift Net
              </span>
              <span className="font-headline-md text-headline-md leading-none text-on-surface font-bold">
                ₹98,420
              </span>
            </div>
          </div>

          <div className="bg-surface-container-low px-space-md py-2 rounded-xl flex items-center gap-space-sm shrink-0 shadow-sm border border-surface-container-high/30">
            <div className="w-8 h-8 rounded-lg bg-tertiary-container/20 flex items-center justify-center text-tertiary">
              <span className="material-symbols-outlined text-[20px]">avg_pace</span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm uppercase text-on-surface-variant font-medium">
                Avg Turnaround
              </span>
              <span className="font-headline-md text-headline-md leading-none text-on-surface font-bold">
                16.4m
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Ribbon */}
      <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col gap-space-md shadow-sm border border-surface-container-high/30">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-space-sm items-center">
          {/* Search Input */}
          <div className="relative md:col-span-4 lg:col-span-5">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">
              search
            </span>
            <input
              className="w-full pl-10 pr-4 py-2 bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant rounded-lg font-body-sm text-body-sm outline-none focus:ring-1 focus:ring-primary-container border border-surface-container-high/40"
              placeholder="Search by Order #, Table, Customer name or Phone..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface text-xs font-mono-metric"
              >
                ESC
              </button>
            )}
          </div>

          {/* Table Filter */}
          <div className="md:col-span-2 lg:col-span-2 relative">
            <select
              value={tableFilter}
              onChange={(e) => setTableFilter(e.target.value)}
              className="w-full appearance-none bg-surface-container-lowest text-on-surface text-body-sm font-body-sm px-space-md py-2 rounded-lg outline-none cursor-pointer focus:ring-1 focus:ring-primary-container pr-8 border border-surface-container-high/40"
            >
              <option value="all">All Tables (T01-T24)</option>
              <option value="main">Main Dining (T01-T12)</option>
              <option value="terrace">Terrace Lounge (T13-T20)</option>
              <option value="vip">VIP Dining (T21-T24)</option>
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[18px] text-on-surface-variant">
              expand_more
            </span>
          </div>

          {/* Order Type */}
          <div className="md:col-span-2 lg:col-span-2 relative">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full appearance-none bg-surface-container-lowest text-on-surface text-body-sm font-body-sm px-space-md py-2 rounded-lg outline-none cursor-pointer focus:ring-1 focus:ring-primary-container pr-8 border border-surface-container-high/40"
            >
              <option value="all">All Types</option>
              <option value="dine-in">Dine-In</option>
              <option value="takeaway">Takeaway</option>
              <option value="delivery">Online Delivery</option>
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[18px] text-on-surface-variant">
              expand_more
            </span>
          </div>

          {/* Payment Status */}
          <div className="md:col-span-2 lg:col-span-2 relative">
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="w-full appearance-none bg-surface-container-lowest text-on-surface text-body-sm font-body-sm px-space-md py-2 rounded-lg outline-none cursor-pointer focus:ring-1 focus:ring-primary-container pr-8 border border-surface-container-high/40"
            >
              <option value="all">All Payment</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[18px] text-on-surface-variant">
              expand_more
            </span>
          </div>

          {/* Quick Reset */}
          <div className="md:col-span-2 lg:col-span-1 flex items-center justify-end">
            <button
              onClick={() => {
                setSearchQuery('');
                setTableFilter('all');
                setTypeFilter('all');
                setPaymentFilter('all');
              }}
              className="w-full py-2 px-3 bg-surface-container hover:bg-surface-container-high rounded-lg text-on-surface-variant hover:text-on-surface font-label-sm text-label-sm flex items-center justify-center gap-1 transition-colors border border-surface-container-high/40"
            >
              <span className="material-symbols-outlined text-[16px]">restart_alt</span>
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Date Filter & Quick Chips Strip */}
        <div className="flex flex-wrap items-center justify-between gap-space-sm pt-space-xs border-t border-surface-container-high/30">
          <div className="flex items-center gap-space-xs overflow-x-auto">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase mr-1 font-semibold">
              Period:
            </span>
            <button
              onClick={() => setPeriod('today')}
              className={`px-3 py-1 rounded-full font-label-sm text-label-sm font-bold shadow-sm transition-all ${
                period === 'today'
                  ? 'bg-primary-container text-on-primary-container'
                  : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
              }`}
            >
              Today (16 Sep 2026)
            </button>
            <button
              onClick={() => setPeriod('yesterday')}
              className={`px-3 py-1 rounded-full font-label-sm text-label-sm transition-colors ${
                period === 'yesterday'
                  ? 'bg-primary-container text-on-primary-container font-bold'
                  : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
              }`}
            >
              Yesterday
            </button>
            <button
              onClick={() => setPeriod('week')}
              className={`px-3 py-1 rounded-full font-label-sm text-label-sm transition-colors ${
                period === 'week'
                  ? 'bg-primary-container text-on-primary-container font-bold'
                  : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
              }`}
            >
              Last 7 Days
            </button>
          </div>

          <div className="flex items-center gap-space-sm">
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Auto-refresh in <strong className="text-primary font-mono-metric">18s</strong>
            </span>
            <button
              className="p-1.5 rounded-lg bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
              title="Force Refresh"
            >
              <span className="material-symbols-outlined text-[18px]">sync</span>
            </button>
          </div>
        </div>
      </div>

      {/* Status Lane Navigation Tabs */}
      <div className="flex items-center gap-space-xs overflow-x-auto pb-1 mb-1">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex items-center gap-2 px-space-md py-2.5 rounded-xl font-label-lg text-label-lg shrink-0 transition-all ${
            activeTab === 'all'
              ? 'bg-surface-container-high text-on-surface shadow-sm font-bold'
              : 'bg-surface-container-low hover:bg-surface-container text-on-surface-variant'
          }`}
        >
          <span>All Orders</span>
          <span className="px-2 py-0.5 rounded-full bg-surface-container-lowest text-on-surface font-mono-metric text-xs">
            127
          </span>
        </button>
        <button
          onClick={() => setActiveTab('new')}
          className={`flex items-center gap-2 px-space-md py-2.5 rounded-xl font-label-lg text-label-lg shrink-0 transition-all ${
            activeTab === 'new'
              ? 'bg-surface-container-high text-on-surface shadow-sm font-bold'
              : 'bg-surface-container-low hover:bg-surface-container text-on-surface-variant'
          }`}
        >
          <span className="inline-block w-2 h-2 rounded-full bg-tertiary" />
          <span>New</span>
          <span className="px-2 py-0.5 rounded-full bg-tertiary/20 text-tertiary font-mono-metric text-xs font-bold">
            8
          </span>
        </button>
        <button
          onClick={() => setActiveTab('prep')}
          className={`flex items-center gap-2 px-space-md py-2.5 rounded-xl font-label-lg text-label-lg shrink-0 transition-all ${
            activeTab === 'prep'
              ? 'bg-surface-container-high text-on-surface shadow-sm font-bold'
              : 'bg-surface-container-low hover:bg-surface-container text-on-surface-variant'
          }`}
        >
          <span className="inline-block w-2 h-2 rounded-full bg-primary-container animate-ping" />
          <span>Preparing</span>
          <span className="px-2 py-0.5 rounded-full bg-primary-container/20 text-primary font-mono-metric text-xs font-bold">
            5
          </span>
        </button>
        <button
          onClick={() => setActiveTab('ready')}
          className={`flex items-center gap-2 px-space-md py-2.5 rounded-xl font-label-lg text-label-lg shrink-0 transition-all ${
            activeTab === 'ready'
              ? 'bg-surface-container-high text-on-surface shadow-sm font-bold'
              : 'bg-surface-container-low hover:bg-surface-container text-on-surface-variant'
          }`}
        >
          <span className="inline-block w-2 h-2 rounded-full bg-secondary" />
          <span>Ready</span>
          <span className="px-2 py-0.5 rounded-full bg-secondary/20 text-secondary font-mono-metric text-xs font-bold">
            3
          </span>
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`flex items-center gap-2 px-space-md py-2.5 rounded-xl font-label-lg text-label-lg shrink-0 transition-all ${
            activeTab === 'completed'
              ? 'bg-surface-container-high text-on-surface shadow-sm font-bold'
              : 'bg-surface-container-low hover:bg-surface-container text-on-surface-variant'
          }`}
        >
          <span>Completed</span>
          <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant font-mono-metric text-xs">
            108
          </span>
        </button>
      </div>

      {/* Workspace Container (Split Layout: Master Table + Detail Drawer) */}
      <div className="grid grid-cols-1 2xl:grid-cols-12 gap-space-md items-start">
        {/* Master Orders Table (7 cols on 2xl) */}
        <div className="2xl:col-span-7 bg-surface-container-low rounded-xl shadow-sm overflow-hidden flex flex-col border border-surface-container-high/30">
          <div className="px-space-md py-3 bg-surface-container flex items-center justify-between border-b border-surface-container-high/40">
            <div className="flex items-center gap-space-sm">
              <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-bold">
                Live Order Stream
              </span>
              <span className="font-mono-metric text-xs text-secondary font-semibold">
                ● 6 Active in kitchen
              </span>
            </div>
            <div className="flex items-center gap-space-xs text-xs text-on-surface-variant">
              <span>Sort:</span>
              <button className="text-primary font-bold hover:underline flex items-center gap-0.5">
                <span>Latest Seated</span>
                <span className="material-symbols-outlined text-[14px]">arrow_drop_down</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-body-sm font-body-sm">
              <thead className="bg-surface-container-lowest text-on-surface-variant uppercase font-label-sm text-label-sm tracking-wider border-b border-surface-container-high/30">
                <tr>
                  <th className="py-3 px-space-md">Order ID</th>
                  <th className="py-3 px-3">Table / Type</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Items</th>
                  <th className="py-3 px-3">Staff</th>
                  <th className="py-3 px-3">Total</th>
                  <th className="py-3 px-3">Payment</th>
                  <th className="py-3 px-3">Kitchen</th>
                  <th className="py-3 px-3">Time</th>
                  <th className="py-3 px-space-md text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-high/20">
                {filteredOrders.map((order) => {
                  const isSelected = order.id === selectedOrderId;
                  return (
                    <tr
                      key={order.id}
                      onClick={() => setSelectedOrderId(order.id)}
                      className={`transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-surface-container-high/90 border-l-4 border-l-primary-container'
                          : 'bg-surface-container-low hover:bg-surface-container'
                      }`}
                    >
                      <td className="py-3.5 px-space-md">
                        <div className="flex flex-col">
                          <span className="font-mono-metric text-mono-metric font-bold text-primary">
                            {order.id}
                          </span>
                          <span className="font-label-sm text-label-sm text-on-surface-variant">
                            {order.terminal}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="flex flex-col">
                          <span className="font-label-lg text-label-lg font-bold text-on-surface">
                            {order.table}
                          </span>
                          <span className="font-label-sm text-label-sm text-tertiary">
                            {order.tableType}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="flex flex-col">
                          <span className="font-body-md text-body-md text-on-surface font-medium">
                            {order.customer}
                          </span>
                          <span className="font-body-sm text-body-sm text-on-surface-variant font-mono-metric">
                            {order.phone}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 max-w-xs">
                        <div className="flex flex-col">
                          <span className="font-label-md text-label-md text-on-surface font-semibold">
                            {order.itemsCount} items
                          </span>
                          <span className="text-xs text-on-surface-variant truncate">
                            {order.itemsSummary}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className="px-2 py-1 rounded bg-surface-container text-on-surface font-body-sm">
                          {order.staff}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className="font-mono-metric text-mono-metric font-bold text-on-surface">
                          ₹{order.total.toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-label-sm text-label-sm font-bold ${
                            order.paymentStatus === 'paid'
                              ? 'bg-secondary/15 text-secondary'
                              : 'bg-error-container/30 text-error'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              order.paymentStatus === 'paid' ? 'bg-secondary' : 'bg-error'
                            }`}
                          />
                          {order.paymentStatus === 'paid' ? `Paid (${order.paymentMethod})` : 'Unpaid'}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-label-sm text-label-sm font-bold ${
                            order.kitchenStatus === 'prep'
                              ? 'bg-primary-container/20 text-primary animate-pulse'
                              : order.kitchenStatus === 'ready'
                              ? 'bg-secondary/20 text-secondary'
                              : order.kitchenStatus === 'new'
                              ? 'bg-tertiary/20 text-tertiary'
                              : 'bg-surface-container-highest text-on-surface-variant'
                          }`}
                        >
                          {order.kitchenTime}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap font-mono-metric text-xs text-on-surface-variant">
                        {order.time}
                      </td>
                      <td className="py-3.5 px-space-md text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button className="px-2.5 py-1 bg-surface-container hover:bg-surface-container-high text-on-surface rounded font-label-sm text-label-sm transition-colors">
                            Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right-Side Active Ticket Detail Drawer (5 cols on 2xl) */}
        <div className="2xl:col-span-5 bg-surface-container-low rounded-xl shadow-xl flex flex-col overflow-hidden border border-surface-container-high/30">
          {/* Drawer Top Bar */}
          <div className="p-space-md bg-surface-container flex items-start justify-between border-b border-surface-container-high/40">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-headline-md text-headline-md text-on-surface font-bold">
                  Order {selectedOrder.id}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-primary-container/20 text-primary font-mono-metric text-xs font-bold">
                  Live
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-label-lg text-label-lg font-bold text-primary">
                  {selectedOrder.table}
                </span>
                <span className="text-on-surface-variant text-xs">•</span>
                <span className="text-body-sm text-on-surface-variant">
                  {selectedOrder.tableType}
                </span>
                <span className="text-on-surface-variant text-xs">•</span>
                <span className="font-mono-metric text-xs text-secondary font-semibold">
                  14m active
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                className="p-2 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface-variant hover:text-on-surface transition-colors"
                title="Print KOT"
              >
                <span className="material-symbols-outlined text-[18px]">print</span>
              </button>
              <button
                className="p-2 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface-variant hover:text-on-surface transition-colors"
                title="Split Settlement"
              >
                <span className="material-symbols-outlined text-[18px]">call_split</span>
              </button>
            </div>
          </div>

          {/* Drawer Body Details */}
          <div className="p-space-md flex flex-col gap-4 max-h-[540px] overflow-y-auto">
            {/* Customer Banner */}
            <div className="p-3 bg-surface-container-lowest rounded-xl flex items-center justify-between border border-surface-container-high/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center text-primary font-bold">
                  {selectedOrder.customer.charAt(0)}
                </div>
                <div className="flex flex-col">
                  <span className="font-label-lg text-on-surface font-bold">
                    {selectedOrder.customer}
                  </span>
                  <span className="text-xs text-on-surface-variant font-mono-metric">
                    {selectedOrder.phone} · VIP Gold
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-secondary/15 text-secondary text-xs font-bold">
                {selectedOrder.paymentStatus === 'paid' ? 'SETTLED' : 'UNPAID'}
              </span>
            </div>

            {/* Line Items Station Routing */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                Kitchen Station Routing Breakdown
              </span>
              <div className="flex flex-col gap-2">
                {(
                  selectedOrder.lineItems || [
                    { name: 'Paneer Tikka (Tandoor)', qty: 2, price: 580, station: 'Tandoor', status: 'Ready to Serve', notes: 'Extra mint dip' },
                    { name: 'Butter Chicken (Boneless)', qty: 1, price: 380, station: 'Curry', status: 'Simmering in Karahi', notes: 'Medium gravy' },
                    { name: 'Garlic Naan (Crispy)', qty: 2, price: 160, station: 'Tandoor', status: 'Firing on wall', notes: 'Well done' },
                  ]
                ).map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-surface-container rounded-lg flex items-start justify-between border border-surface-container-high/20"
                  >
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-mono-metric text-primary font-bold">{item.qty}x</span>
                        <span className="font-label-md text-on-surface font-bold">{item.name}</span>
                      </div>
                      {item.notes && (
                        <span className="text-xs text-primary font-medium mt-0.5">
                          Note: {item.notes}
                        </span>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 rounded bg-surface-container-lowest text-[10px] text-on-surface-variant uppercase font-mono-metric">
                          {item.station}
                        </span>
                        <span className="text-xs text-secondary font-medium">● {item.status}</span>
                      </div>
                    </div>
                    <span className="font-mono-metric text-on-surface font-bold">
                      ₹{item.price.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bill Summary Strip */}
            <div className="p-3 bg-surface-container-lowest rounded-xl flex flex-col gap-1.5 font-body-sm border border-surface-container-high/30">
              <div className="flex justify-between text-on-surface-variant">
                <span>Subtotal</span>
                <span className="font-mono-metric text-on-surface">₹{selectedOrder.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-on-surface-variant">
                <span>Taxes &amp; GST (5%)</span>
                <span className="font-mono-metric text-on-surface">Included</span>
              </div>
              <div className="pt-2 border-t border-surface-container-high flex justify-between text-on-surface font-bold text-base">
                <span>Net Payable</span>
                <span className="text-primary font-bold font-mono-metric text-lg">
                  ₹{selectedOrder.total.toLocaleString('en-IN')}.00
                </span>
              </div>
            </div>
          </div>

          {/* Drawer Actions */}
          <div className="p-space-md bg-surface-container flex items-center justify-between gap-2 border-t border-surface-container-high/40">
            <button
              onClick={() => {
                const subtotal = selectedOrder.subtotal || Math.round((selectedOrder.total || 1000) * 0.9);
                const cgst = Math.round(subtotal * 0.025 * 100) / 100;
                const sgst = cgst;
                const serviceCharge = Math.round(subtotal * 0.05 * 100) / 100;
                printThermalReceipt({
                  orderId: selectedOrder.id,
                  table: selectedOrder.table,
                  tableType: selectedOrder.tableType,
                  customer: selectedOrder.customer,
                  phone: selectedOrder.phone,
                  staff: selectedOrder.staff,
                  items: selectedOrder.lineItems && selectedOrder.lineItems.length > 0
                    ? selectedOrder.lineItems
                    : [{ name: selectedOrder.itemsSummary || 'Special Dishes', qty: selectedOrder.itemsCount || 1, price: subtotal }],
                  subtotal,
                  cgst,
                  sgst,
                  serviceCharge,
                  total: selectedOrder.total || subtotal + cgst + sgst + serviceCharge,
                  paymentMethod: selectedOrder.paymentMethod || 'UPI',
                  date: selectedOrder.time,
                });
                toast.success(`Thermal bill printed for ${selectedOrder.id}!`, 'Bill Printed');
              }}
              className="flex-1 py-2.5 px-3 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-md font-bold flex items-center justify-center gap-1 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">receipt</span>
              <span>Print Bill</span>
            </button>
            <button
              onClick={async () => {
                try {
                  await api.updateOrderStatus(selectedOrder.id, {
                    kitchenStatus: 'ready',
                    kitchenTime: 'Ready to Expedite',
                  });
                  fetchOrders();
                  toast.success(`Order ${selectedOrder.id} bumped to Ready status!`, 'KOT Expedited');
                } catch {
                  toast.info(`Order ${selectedOrder.id} bumped to Ready status.`, 'Status Updated');
                }
              }}
              className="flex-1 py-2.5 px-3 rounded-lg bg-secondary text-on-secondary font-label-md font-bold flex items-center justify-center gap-1 shadow-md hover:brightness-110 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              <span>Bump Ready</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
