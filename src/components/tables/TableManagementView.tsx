import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { subscribeRealtime } from '../../hooks/useRealtimeSync';
import { useToast } from '../../contexts/ToastContext';

interface FloorTableItem {
  id: string;
  name: string;
  capacity: number;
  section: 'main' | 'patio' | 'vip' | 'bar';
  status: 'available' | 'occupied' | 'reserved' | 'cleaning';
  guestsCount?: number;
  server?: string;
  customerName?: string;
  amount?: number;
  timeActive?: string;
  readyTime?: string;
  items?: { name: string; qty: number; price: number }[];
}

const INITIAL_FLOOR_TABLES: FloorTableItem[] = [
  {
    id: 'T-01',
    name: 'T-01',
    capacity: 4,
    section: 'main',
    status: 'available',
    readyTime: '12m ago',
  },
  {
    id: 'T-02',
    name: 'T-02',
    capacity: 2,
    section: 'main',
    status: 'available',
    readyTime: '5m ago',
  },
  {
    id: 'T-03',
    name: 'T-03',
    capacity: 6,
    section: 'main',
    status: 'occupied',
    guestsCount: 5,
    server: 'Sunil R.',
    customerName: 'Mehta Family',
    amount: 3450,
    timeActive: '32m',
    items: [
      { name: 'Paneer Butter Masala', qty: 2, price: 640 },
      { name: 'Dal Makhani SpiceRoute', qty: 1, price: 280 },
      { name: 'Garlic Naan', qty: 6, price: 480 },
      { name: 'Jeera Rice', qty: 2, price: 360 },
    ],
  },
  {
    id: 'T-04',
    name: 'T-04',
    capacity: 4,
    section: 'main',
    status: 'occupied',
    guestsCount: 2,
    server: 'Floor Captain',
    customerName: 'Vikram Malhotra',
    amount: 1260,
    timeActive: '18m',
    items: [
      { name: 'Tandoori Chicken Full', qty: 1, price: 420 },
      { name: 'Dal Makhani', qty: 1, price: 280 },
      { name: 'Tandoori Roti', qty: 4, price: 160 },
    ],
  },
  {
    id: 'T-05',
    name: 'T-05',
    capacity: 6,
    section: 'main',
    status: 'reserved',
    customerName: 'Dr. Alok Verma (20:45)',
    readyTime: 'Reserved for 8:45 PM',
  },
  {
    id: 'T-06',
    name: 'T-06',
    capacity: 4,
    section: 'main',
    status: 'occupied',
    guestsCount: 4,
    server: 'Rajesh P.',
    customerName: 'Corporate Dinner',
    amount: 2890,
    timeActive: '50m',
  },
  {
    id: 'T-07',
    name: 'T-07',
    capacity: 4,
    section: 'main',
    status: 'available',
    readyTime: '20m ago',
  },
  {
    id: 'T-08',
    name: 'T-08',
    capacity: 6,
    section: 'main',
    status: 'occupied',
    guestsCount: 5,
    server: 'Sunil R.',
    customerName: 'Rahul Kapoor',
    amount: 2450,
    timeActive: '44m',
  },
  {
    id: 'T-09',
    name: 'T-09',
    capacity: 2,
    section: 'main',
    status: 'cleaning',
    readyTime: 'Turnover in progress',
  },
  {
    id: 'T-10',
    name: 'T-10',
    capacity: 4,
    section: 'main',
    status: 'occupied',
    guestsCount: 3,
    server: 'Meera K.',
    customerName: 'Sharma Group',
    amount: 1980,
    timeActive: '26m',
  },
  {
    id: 'T-11',
    name: 'T-11',
    capacity: 2,
    section: 'main',
    status: 'occupied',
    guestsCount: 2,
    server: 'Floor Staff',
    customerName: 'Walk-in Couple',
    amount: 920,
    timeActive: '15m',
  },
  {
    id: 'T-12',
    name: 'T-12',
    capacity: 4,
    section: 'main',
    status: 'occupied',
    guestsCount: 4,
    server: 'Sunil R.',
    customerName: 'Ananya Verma',
    amount: 1840,
    timeActive: '42m',
    items: [
      { name: 'Paneer Tikka (Tandoor)', qty: 2, price: 580 },
      { name: 'Butter Chicken (Boneless)', qty: 1, price: 380 },
      { name: 'Garlic Naan (Crispy)', qty: 2, price: 160 },
      { name: 'Coke Zero Sugar', qty: 2, price: 120 },
    ],
  },
];

export const TableManagementView: React.FC = () => {
  const toast = useToast();
  const [selectedSection, setSelectedSection] = useState<'main' | 'patio' | 'vip' | 'bar'>('main');
  const [selectedTableId, setSelectedTableId] = useState<string>('T-12');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'columns'>('grid');
  const [floorTables, setFloorTables] = useState<FloorTableItem[]>(INITIAL_FLOOR_TABLES);
  const [isAddTableOpen, setIsAddTableOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [targetTransferTable, setTargetTransferTable] = useState('');
  const [newTableName, setNewTableName] = useState('');
  const [newTableCapacity, setNewTableCapacity] = useState(4);
  const [newTableSection, setNewTableSection] = useState<'main' | 'patio' | 'vip' | 'bar'>('main');

  const fetchTables = () => {
    api.getTables().then((res) => {
      if (res.success && res.data && res.data.length > 0) {
        setFloorTables(res.data);
      }
    }).catch(() => {});
  };

  useEffect(() => {
    fetchTables();

    const unsub = subscribeRealtime((event) => {
      if (
        event.type === 'TABLE_UPDATED' ||
        event.type === 'ORDER_CREATED' ||
        event.type === 'ORDER_SETTLED'
      ) {
        fetchTables();
      }
    });

    return () => unsub();
  }, []);

  const selectedTable = floorTables.find((t) => t.id === selectedTableId) || floorTables[0] || INITIAL_FLOOR_TABLES[11];

  const getStatusBadge = (status: FloorTableItem['status']) => {
    switch (status) {
      case 'available':
        return <span className="px-2 py-0.5 rounded-full bg-secondary/15 text-secondary font-label-sm text-label-sm uppercase font-semibold">Available</span>;
      case 'occupied':
        return <span className="px-2 py-0.5 rounded-full bg-primary-container/15 text-primary font-label-sm text-label-sm uppercase font-semibold">Occupied</span>;
      case 'reserved':
        return <span className="px-2 py-0.5 rounded-full bg-tertiary/15 text-tertiary font-label-sm text-label-sm uppercase font-semibold">Reserved</span>;
      case 'cleaning':
        return <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm uppercase font-semibold">Cleaning</span>;
    }
  };

  return (
    <div className="flex flex-col w-full pb-16 space-y-space-md">
      {/* Top Command & Floor Stat Metric Strip */}
      <div className="flex flex-col gap-space-md pt-2 mb-space-sm">
        {/* Subheader & Quick Trigger Actions */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
          <div className="flex flex-col">
            <div className="flex items-center gap-space-sm flex-wrap">
              <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse" />
              <span className="font-headline-xl text-headline-xl text-on-surface tracking-tight font-bold">
                Floor Plan &amp; Table Dispatch
              </span>
              <span className="px-space-xs py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-mono-metric text-body-sm">
                Zone A-1
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
              Real-time table turnover, turn-time heatmaps, and POS billing bridge
            </p>
          </div>

          {/* Action Buttons Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsAddTableOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-all border border-surface-container-high/40 font-semibold"
            >
              <span className="material-symbols-outlined text-[18px]">add_box</span>
              <span>Add Table</span>
            </button>
            <button
              onClick={() => {
                fetchTables();
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-all border border-surface-container-high/40 font-semibold"
            >
              <span className="material-symbols-outlined text-[18px]">sync</span>
              <span>Refresh</span>
            </button>
            <button
              onClick={async () => {
                const target = floorTables.find((t) => t.id !== selectedTable.id && t.status === 'available');
                if (!target) {
                  toast.warning('No available adjacent table found to merge with.', 'Table Merge');
                  return;
                }
                try {
                  await api.mergeTables([selectedTable.id, target.id]);
                  toast.success(`Merged Table ${selectedTable.name} and ${target.name}!`, 'Tables Combined');
                  fetchTables();
                } catch (err: any) {
                  toast.error(err.message || 'Error merging tables', 'Merge Failed');
                }
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-all border border-surface-container-high/40 font-semibold"
            >
              <span className="material-symbols-outlined text-[18px]">call_merge</span>
              <span>Merge Tables</span>
            </button>
            <button
              onClick={() => setIsTransferOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-all border border-surface-container-high/40 font-semibold"
            >
              <span className="material-symbols-outlined text-[18px]">move_up</span>
              <span>Transfer</span>
            </button>
            <button
              onClick={() => toast.info('Opening Reservation Ledger...', 'Reservations')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-tertiary-container/20 text-tertiary font-label-md text-label-md hover:bg-tertiary-container/30 transition-all font-semibold"
            >
              <span className="material-symbols-outlined text-[18px]">event</span>
              <span>Reserve Table</span>
            </button>

            {/* View Toggle Near Refresh Button */}
            <div className="flex items-center p-1 bg-surface-container-low rounded-xl ml-1 border border-surface-container-high/40 shadow-sm">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'grid'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
                title="Visual Floor Layout"
              >
                <span className="material-symbols-outlined text-[16px]">grid_view</span>
                <span className="hidden sm:inline">Grid</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'list'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
                title="Column-wise Table Ledger"
              >
                <span className="material-symbols-outlined text-[16px]">table_rows</span>
                <span className="hidden sm:inline">Column Ledger</span>
              </button>
              <button
                onClick={() => setViewMode('columns')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'columns'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
                title="Section Lanes View"
              >
                <span className="material-symbols-outlined text-[16px]">view_column</span>
                <span className="hidden sm:inline">Sections</span>
              </button>
            </div>
          </div>
        </div>

        {/* Floor Summary Counters & KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-low shadow-sm border border-surface-container-high/30">
            <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-on-surface text-[22px]">
                table_restaurant
              </span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-medium">
                Total Tables
              </span>
              <span className="font-headline-md text-headline-md text-on-surface leading-tight font-bold">
                24 <span className="font-body-sm text-body-sm text-on-surface-variant font-normal">/ 96 seats</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-low shadow-sm border border-surface-container-high/30">
            <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
              <span className="w-3 h-3 rounded-full bg-secondary" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-label-sm text-label-sm text-secondary uppercase font-medium">
                Available
              </span>
              <span className="font-headline-md text-headline-md text-on-surface leading-tight font-bold">
                5 <span className="font-body-sm text-body-sm text-secondary font-normal">(21%)</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-low shadow-sm border border-surface-container-high/30">
            <div className="w-10 h-10 rounded-lg bg-primary-container/15 flex items-center justify-center shrink-0">
              <span className="w-3 h-3 rounded-full bg-primary-container animate-ping" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-label-sm text-label-sm text-primary uppercase font-medium">
                Occupied
              </span>
              <span className="font-headline-md text-headline-md text-on-surface leading-tight font-bold">
                14 <span className="font-body-sm text-body-sm text-primary font-normal">Active</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-low shadow-sm border border-surface-container-high/30">
            <div className="w-10 h-10 rounded-lg bg-tertiary/10 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-tertiary text-[20px]">bookmark</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-label-sm text-label-sm text-tertiary uppercase font-medium">
                Reserved
              </span>
              <span className="font-headline-md text-headline-md text-on-surface leading-tight font-bold">
                3 <span className="font-body-sm text-body-sm text-on-surface-variant font-normal">Upcoming</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-low shadow-sm border border-surface-container-high/30">
            <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-on-surface-variant text-[20px]">
                cleaning_services
              </span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-medium">
                Cleaning
              </span>
              <span className="font-headline-md text-headline-md text-on-surface leading-tight font-bold">
                2 <span className="font-body-sm text-body-sm text-on-surface-variant font-normal">Turnover</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-high shadow-sm border border-surface-container-high/40">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-primary text-[20px]">payments</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-label-sm text-label-sm text-primary uppercase font-medium">
                Active Floor Rev
              </span>
              <span className="font-headline-md text-headline-md text-on-surface leading-tight font-bold">
                ₹22,480
              </span>
            </div>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center justify-between overflow-x-auto pb-1 gap-2 pt-2 border-t border-surface-container-high/30">
          <div className="flex items-center gap-2">
            {[
              { id: 'main', label: 'Main Dining Hall', icon: 'restaurant', count: 14 },
              { id: 'patio', label: 'Outdoor Patio', icon: 'deck', count: 6 },
              { id: 'vip', label: 'VIP Lounge', icon: 'star', count: 4 },
              { id: 'bar', label: 'Bar Area', icon: 'wine_bar', count: 6 },
            ].map((sec) => (
              <button
                key={sec.id}
                onClick={() => setSelectedSection(sec.id as any)}
                className={`px-4 py-2 rounded-lg font-label-md text-label-md flex items-center gap-2 shrink-0 transition-all ${
                  selectedSection === sec.id
                    ? 'bg-primary-container text-on-primary-container font-bold shadow-sm'
                    : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">{sec.icon}</span>
                <span>{sec.label}</span>
                <span className="px-1.5 py-0.5 rounded-full bg-black/20 font-mono-metric text-label-sm">
                  {sec.count}
                </span>
              </button>
            ))}
          </div>

          <div className="hidden xl:flex items-center gap-3 shrink-0 text-on-surface-variant font-label-sm text-label-sm">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-secondary" /> Available
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-primary-container" /> Dining
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-tertiary" /> Reserved
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-surface-variant" /> Cleaning
            </span>
          </div>
        </div>
      </div>

      {/* Main Work Area: Visual Floor Map + Inspector Sidebar */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-start">
        {/* Floor View Switcher Container (8 Cols) */}
        <div className="xl:col-span-8 flex flex-col gap-4">
          {/* MODE 1: VISUAL GRID CANVAS */}
          {viewMode === 'grid' && (
            <div className="relative w-full rounded-2xl bg-surface-container-low p-6 shadow-md overflow-hidden min-h-[640px] flex flex-col justify-between border border-surface-container-high/30 animate-fadeIn">
              {/* Zone Markers */}
              <div className="flex items-center justify-between text-on-surface-variant/50 font-mono-metric text-body-sm pb-4 select-none">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">door_front</span>
                  <span className="font-label-sm text-label-sm uppercase tracking-wider">
                    Main Entryway / Reception Desk
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1 font-label-sm text-label-sm uppercase">
                    <span className="material-symbols-outlined text-[14px]">soup_kitchen</span> Kitchen Service Pass
                  </span>
                  <span className="font-label-sm text-label-sm uppercase">Scale: 1:50</span>
                </div>
              </div>

              {/* Visual Table Floor Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 relative z-10">
                {floorTables.map((table) => {
                  const isSelected = table.id === selectedTableId;
                  return (
                    <div
                      key={table.id}
                      onClick={() => setSelectedTableId(table.id)}
                      className={`group relative p-4 rounded-xl transition-all cursor-pointer shadow-sm border ${
                        isSelected
                          ? 'bg-surface-container-high ring-2 ring-primary border-primary-container shadow-lg scale-[1.02]'
                          : 'bg-surface-container hover:bg-surface-container-high border-surface-container-high/40'
                      }`}
                    >
                      {/* Top Seat Pegs */}
                      <div className="flex justify-center gap-2 mb-2">
                        {Array.from({ length: Math.min(3, Math.ceil(table.capacity / 2)) }).map((_, i) => (
                          <span
                            key={i}
                            className={`w-2.5 h-2.5 rounded-full ${
                              table.status === 'occupied'
                                ? 'bg-primary-container/80'
                                : table.status === 'reserved'
                                ? 'bg-tertiary/70'
                                : 'bg-surface-container-highest'
                            }`}
                          />
                        ))}
                      </div>

                      <div className="flex items-start justify-between">
                        <div className="flex flex-col">
                          <span className="font-headline-md text-headline-md text-on-surface font-bold">
                            {table.name}
                          </span>
                          <span className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">group</span>
                            {table.capacity} Seats {table.guestsCount ? `• ${table.guestsCount} guests` : ''}
                          </span>
                        </div>
                        {getStatusBadge(table.status)}
                      </div>

                      {/* Table Bottom Meta */}
                      <div className="mt-4 pt-2 flex items-center justify-between text-on-surface-variant font-body-sm text-body-sm border-t border-surface-container-high/30">
                        {table.status === 'occupied' ? (
                          <>
                            <span className="font-mono-metric text-primary font-bold">
                              ₹{(table.amount || 1840).toLocaleString('en-IN')}
                            </span>
                            <span className="font-mono-metric text-xs text-secondary">
                              {table.timeActive || '30m'}
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="text-secondary flex items-center gap-1 font-label-sm text-label-sm">
                              <span className="material-symbols-outlined text-[14px]">check_circle</span>
                              {table.status === 'reserved' ? 'Reserved' : 'Ready'}
                            </span>
                            <span className="font-mono-metric text-xs">
                              {table.readyTime || '10m ago'}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Bottom Seat Pegs */}
                      <div className="flex justify-center gap-2 mt-2">
                        {Array.from({ length: Math.min(3, Math.floor(table.capacity / 2)) }).map((_, i) => (
                          <span
                            key={i}
                            className={`w-2.5 h-2.5 rounded-full ${
                              table.status === 'occupied'
                                ? 'bg-primary-container/80'
                                : table.status === 'reserved'
                                ? 'bg-tertiary/70'
                                : 'bg-surface-container-highest'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Hall Perimeter */}
              <div className="pt-4 flex justify-between items-center text-xs text-on-surface-variant/40 font-mono-metric border-t border-surface-container-high/30 mt-4 select-none">
                <span>Emergency Exit West</span>
                <span>Bar Station Access East</span>
              </div>
            </div>
          )}

          {/* MODE 2: COLUMN-WISE TABLE LEDGER */}
          {viewMode === 'list' && (
            <div className="bg-surface-container-low rounded-2xl p-space-md shadow-md border border-surface-container-high/30 overflow-hidden animate-fadeIn flex flex-col gap-3">
              <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">table_rows</span>
                  <h3 className="font-headline-md font-bold text-on-surface">Floor Table Master Ledger</h3>
                </div>
                <span className="text-xs text-on-surface-variant font-mono">{floorTables.length} Active Tables</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-container-lowest text-on-surface-variant uppercase font-bold text-[10px] tracking-wider border-b border-surface-container-high/40">
                    <tr>
                      <th className="py-2.5 px-3">Table #</th>
                      <th className="py-2.5 px-2">Section</th>
                      <th className="py-2.5 px-2">Capacity</th>
                      <th className="py-2.5 px-2">Status</th>
                      <th className="py-2.5 px-3">Occupant / Guest</th>
                      <th className="py-2.5 px-2">Server</th>
                      <th className="py-2.5 px-2">Time</th>
                      <th className="py-2.5 px-2">Bill (INR)</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container-high/20">
                    {floorTables.map((t) => {
                      const isSelected = t.id === selectedTableId;
                      return (
                        <tr
                          key={t.id}
                          onClick={() => setSelectedTableId(t.id)}
                          className={`cursor-pointer transition-colors ${
                            isSelected ? 'bg-primary-container/15 font-bold' : 'hover:bg-surface-container'
                          }`}
                        >
                          <td className="py-2.5 px-3 font-mono font-bold text-primary">{t.name}</td>
                          <td className="py-2.5 px-2 text-on-surface-variant capitalize">{t.section || 'main'}</td>
                          <td className="py-2.5 px-2 font-mono">{t.capacity} Pax</td>
                          <td className="py-2.5 px-2">{getStatusBadge(t.status)}</td>
                          <td className="py-2.5 px-3 text-on-surface font-medium truncate max-w-[140px]">
                            {t.customerName || (t.status === 'available' ? '—' : 'Walk-in')}
                          </td>
                          <td className="py-2.5 px-2 text-on-surface-variant">{t.server || '—'}</td>
                          <td className="py-2.5 px-2 font-mono text-on-surface-variant">{t.timeActive || t.readyTime || '—'}</td>
                          <td className="py-2.5 px-2 font-mono font-bold text-on-surface">
                            {t.amount ? `₹${t.amount.toLocaleString('en-IN')}` : '—'}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            {t.status === 'occupied' ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedTableId(t.id);
                                  setIsTransferOpen(true);
                                }}
                                className="px-2 py-1 rounded bg-surface-container text-xs hover:bg-surface-container-high"
                              >
                                Transfer
                              </button>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedTableId(t.id);
                                  toast.success(`Table ${t.name} selected for seating`, 'Table Ready');
                                }}
                                className="px-2 py-1 rounded bg-primary-container text-on-primary-container text-xs font-bold"
                              >
                                Seat
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* MODE 3: SECTION LANES KANBAN */}
          {viewMode === 'columns' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 animate-fadeIn">
              {[
                { id: 'main', name: 'Main Hall', icon: 'restaurant', tables: floorTables.filter((t) => !t.section || t.section === 'main') },
                { id: 'patio', name: 'Outdoor Patio', icon: 'deck', tables: floorTables.filter((t) => t.section === 'patio') },
                { id: 'vip', name: 'VIP Cabana', icon: 'star', tables: floorTables.filter((t) => t.section === 'vip') },
                { id: 'bar', name: 'Bar Lounge', icon: 'wine_bar', tables: floorTables.filter((t) => t.section === 'bar') },
              ].map((lane) => (
                <div key={lane.id} className="p-3 bg-surface-container-low rounded-2xl border border-outline-variant/30 flex flex-col gap-2 shadow-sm">
                  <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-on-surface">
                      <span className="material-symbols-outlined text-[16px] text-primary">{lane.icon}</span>
                      <span>{lane.name}</span>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-container text-on-surface font-bold">
                      {lane.tables.length}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2 max-h-[560px] overflow-y-auto">
                    {lane.tables.map((t) => {
                      const isSelected = t.id === selectedTableId;
                      return (
                        <div
                          key={t.id}
                          onClick={() => setSelectedTableId(t.id)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                            isSelected ? 'bg-primary-container/20 border-primary ring-1 ring-primary/40' : 'bg-surface-container hover:bg-surface-container-high border-outline-variant/20'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-on-surface">{t.name} ({t.capacity}p)</span>
                            {getStatusBadge(t.status)}
                          </div>
                          {t.status === 'occupied' && (
                            <div className="flex justify-between text-[11px] font-mono">
                              <span className="text-on-surface-variant truncate max-w-[90px]">{t.customerName || 'Dine-in'}</span>
                              <span className="font-bold text-primary">₹{t.amount?.toLocaleString('en-IN')}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Inspector Sidebar (4 Cols) */}
        <div className="xl:col-span-4 bg-surface-container-low rounded-2xl p-space-md shadow-xl flex flex-col gap-space-md border border-surface-container-high/30">
          <div className="p-space-md bg-surface-container rounded-xl flex items-start justify-between border border-surface-container-high/40">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-headline-lg text-headline-lg font-bold text-on-surface">
                  {selectedTable.name}
                </span>
                {getStatusBadge(selectedTable.status)}
              </div>
              <span className="text-body-sm text-on-surface-variant mt-0.5">
                {selectedTable.capacity} Seat Standard Booth · Main Dining
              </span>
            </div>
            <button
              onClick={() => toast.info(`Options for Table ${selectedTable.name}`, 'Table Details')}
              className="p-1.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface-variant"
            >
              <span className="material-symbols-outlined text-[20px]">more_vert</span>
            </button>
          </div>

          {selectedTable.status === 'occupied' ? (
            <>
              {/* Seated Info */}
              <div className="p-3 bg-surface-container-lowest rounded-xl flex items-center justify-between border border-surface-container-high/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center text-primary font-bold">
                    {selectedTable.customerName ? selectedTable.customerName.charAt(0) : 'G'}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-md text-on-surface font-bold">
                      {selectedTable.customerName || 'Walk-in Guests'}
                    </span>
                    <span className="text-xs text-on-surface-variant font-mono-metric">
                      Server: {selectedTable.server || 'Sunil R.'} · {selectedTable.guestsCount || 4} Pax
                    </span>
                  </div>
                </div>
                <span className="font-mono-metric text-secondary font-bold text-sm">
                  ⏱ {selectedTable.timeActive || '42m'}
                </span>
              </div>

              {/* Running KOT Items */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                  Active Running Items
                </span>
                <div className="divide-y divide-surface-container-high/40 bg-surface-container-lowest rounded-xl p-3 border border-surface-container-high/30">
                  {(selectedTable.items || [
                    { name: 'Paneer Tikka (Tandoor)', qty: 2, price: 580 },
                    { name: 'Butter Chicken (Boneless)', qty: 1, price: 380 },
                    { name: 'Garlic Naan (Crispy)', qty: 2, price: 160 },
                    { name: 'Coke Zero Sugar', qty: 2, price: 120 },
                  ]).map((item, i) => (
                    <div key={i} className="py-2 flex justify-between items-center text-body-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-mono-metric text-primary font-bold">{item.qty}x</span>
                        <span className="text-on-surface font-medium">{item.name}</span>
                      </div>
                      <span className="font-mono-metric text-on-surface font-semibold">
                        ₹{item.price}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bill Total */}
              <div className="p-3 bg-surface-container-lowest rounded-xl flex justify-between items-center border border-surface-container-high/30">
                <span className="font-semibold text-on-surface">Running Total</span>
                <span className="font-mono-metric text-primary font-bold text-xl">
                  ₹{(selectedTable.amount || 1840).toLocaleString('en-IN')}.00
                </span>
              </div>

              {/* Action Triggers */}
              <div className="flex flex-col gap-2 pt-1">
                <button
                  onClick={async () => {
                    try {
                      await api.releaseTable(selectedTable.id);
                      toast.success(`Table ${selectedTable.name} settled and released to Available.`, 'Table Released');
                      fetchTables();
                    } catch {
                      toast.info(`Opening Checkout Terminal for ${selectedTable.name}`, 'Checkout');
                    }
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-primary-container text-on-primary-container font-headline-md font-bold flex items-center justify-center gap-2 shadow-md hover:brightness-110 transition-all"
                >
                  <span className="material-symbols-outlined text-[20px]">payments</span>
                  <span>Settle Bill &amp; Release Table</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => toast.info(`Adding items to Table ${selectedTable.name}`, 'POS Dispatch')}
                    className="py-2.5 px-3 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md font-bold flex items-center justify-center gap-1.5 transition-colors border border-surface-container-high/30"
                  >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    <span>Add Item</span>
                  </button>
                  <button
                    onClick={() => toast.info(`Split billing active for Table ${selectedTable.name}`, 'Split Bill')}
                    className="py-2.5 px-3 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md font-bold flex items-center justify-center gap-1.5 transition-colors border border-surface-container-high/30"
                  >
                    <span className="material-symbols-outlined text-[18px]">call_split</span>
                    <span>Split Bill</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
              <span className="p-4 rounded-full bg-surface-container text-on-surface-variant">
                <span className="material-symbols-outlined text-[32px]">table_bar</span>
              </span>
              <div className="flex flex-col">
                <span className="font-headline-md font-bold text-on-surface">
                  Table {selectedTable.name} is {selectedTable.status}
                </span>
                <span className="text-body-sm text-on-surface-variant max-w-xs mt-1">
                  Ready to seat walk-in party or assign reservation.
                </span>
              </div>
              <button
                onClick={async () => {
                  try {
                    await api.seatTable(selectedTable.id, {
                      guestsCount: selectedTable.capacity,
                      customerName: 'Walk-in Party',
                      server: 'Sunil R.',
                    });
                    toast.success(`Party seated at Table ${selectedTable.name}!`, 'Seated');
                    fetchTables();
                  } catch {
                    toast.info(`Assigned guests to Table ${selectedTable.name}`, 'Seated');
                  }
                }}
                className="mt-2 px-6 py-2.5 rounded-xl bg-primary-container text-on-primary-container font-label-lg font-bold shadow-md hover:brightness-110"
              >
                Seat Guests Here ➔
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add Table Modal */}
      {isAddTableOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-surface-container rounded-2xl p-space-lg shadow-2xl border border-surface-container-high flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-surface-container-high/40 pb-3">
              <h3 className="font-headline-md font-bold text-on-surface">Add Floor Table</h3>
              <button
                onClick={() => setIsAddTableOpen(false)}
                className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="flex flex-col gap-3 font-body-sm">
              <div>
                <label className="text-xs font-bold uppercase text-on-surface-variant block mb-1">
                  Table Identifier / Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. T25"
                  value={newTableName}
                  onChange={(e) => setNewTableName(e.target.value)}
                  className="w-full bg-surface-container-lowest p-2.5 rounded-lg text-on-surface border border-surface-container-high/40 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase text-on-surface-variant block mb-1">
                    Seating Capacity
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={newTableCapacity}
                    onChange={(e) => setNewTableCapacity(Number(e.target.value))}
                    className="w-full bg-surface-container-lowest p-2.5 rounded-lg text-on-surface border border-surface-container-high/40 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-on-surface-variant block mb-1">
                    Section Zone
                  </label>
                  <select
                    value={newTableSection}
                    onChange={(e) => setNewTableSection(e.target.value as any)}
                    className="w-full bg-surface-container-lowest p-2.5 rounded-lg text-on-surface border border-surface-container-high/40 outline-none"
                  >
                    <option value="main">Main Dining</option>
                    <option value="patio">Outdoor Patio</option>
                    <option value="vip">VIP Lounge</option>
                    <option value="bar">Bar Area</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-surface-container-high/40">
              <button
                onClick={() => setIsAddTableOpen(false)}
                className="px-4 py-2 rounded-lg bg-surface-container text-on-surface text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!newTableName) {
                    toast.warning('Please enter a table name', 'Invalid Input');
                    return;
                  }
                  try {
                    await api.addTable({
                      id: newTableName,
                      name: newTableName,
                      capacity: newTableCapacity,
                      section: newTableSection,
                    });
                    setIsAddTableOpen(false);
                    setNewTableName('');
                    toast.success(`Table ${newTableName} created successfully!`, 'Table Added');
                    fetchTables();
                  } catch (err: any) {
                    toast.error(err.message || 'Error adding table', 'Failed');
                  }
                }}
                className="px-4 py-2 rounded-lg bg-primary-container text-on-primary-container text-sm font-bold shadow-md hover:brightness-110"
              >
                Save Table
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Table Modal */}
      {isTransferOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-surface-container rounded-2xl p-space-lg shadow-2xl border border-surface-container-high flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-surface-container-high/40 pb-3">
              <h3 className="font-headline-md font-bold text-on-surface">
                Transfer {selectedTable.name} Party
              </h3>
              <button
                onClick={() => setIsTransferOpen(false)}
                className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="flex flex-col gap-3 font-body-sm">
              <span className="text-on-surface-variant text-xs">
                Select an available target table to transfer guest party and running order:
              </span>
              <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                {floorTables
                  .filter((t) => t.id !== selectedTable.id && t.status === 'available')
                  .map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTargetTransferTable(t.id)}
                      className={`p-2.5 rounded-lg text-center font-bold text-xs transition-all ${
                        targetTransferTable === t.id
                          ? 'bg-primary-container text-on-primary-container shadow-sm'
                          : 'bg-surface-container-lowest hover:bg-surface-container text-on-surface border border-surface-container-high/40'
                      }`}
                    >
                      {t.name} ({t.capacity}p)
                    </button>
                  ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-surface-container-high/40">
              <button
                onClick={() => setIsTransferOpen(false)}
                className="px-4 py-2 rounded-lg bg-surface-container text-on-surface text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!targetTransferTable) {
                    toast.warning('Please select a destination table', 'Transfer Party');
                    return;
                  }
                  try {
                    await api.transferTable(selectedTable.id, targetTransferTable);
                    toast.success(`Transferred ${selectedTable.name} party to Table ${targetTransferTable}!`, 'Transfer Complete');
                    setIsTransferOpen(false);
                    setSelectedTableId(targetTransferTable);
                    fetchTables();
                  } catch (err: any) {
                    toast.error(err.message || 'Error transferring table', 'Transfer Failed');
                  }
                }}
                className="px-4 py-2 rounded-lg bg-primary-container text-on-primary-container text-sm font-bold shadow-md hover:brightness-110"
              >
                Confirm Transfer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
