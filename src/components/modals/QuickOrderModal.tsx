import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

interface QuickOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderCreated?: (order: any) => void;
}

export const QuickOrderModal: React.FC<QuickOrderModalProps> = ({ isOpen, onClose, onOrderCreated }) => {
  const toast = useToast();
  const [selectedTable, setSelectedTable] = useState('Table T-03');
  const [guestCount, setGuestCount] = useState(2);
  const [orderType, setOrderType] = useState<'dine-in' | 'takeaway' | 'delivery'>('dine-in');
  const [tables, setTables] = useState<any[]>([]);
  const [selectedDishes, setSelectedDishes] = useState<{ [key: string]: number }>({
    'Butter Chicken': 1,
    'Garlic Naan': 2,
  });

  useEffect(() => {
    if (isOpen) {
      api.getTables().then((res) => {
        if (res.success && res.data) {
          setTables(res.data);
        }
      }).catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const quickDishOptions = [
    { name: 'Butter Chicken', price: 380, station: 'Curry' },
    { name: 'Paneer Tikka', price: 290, station: 'Tandoor' },
    { name: 'Garlic Naan', price: 80, station: 'Tandoor' },
    { name: 'Chicken Dum Biryani', price: 340, station: 'Pantry' },
  ];

  const toggleDish = (name: string) => {
    setSelectedDishes((prev) => {
      const next = { ...prev };
      if (next[name]) {
        delete next[name];
      } else {
        next[name] = 1;
      }
      return next;
    });
  };

  const handlePlaceQuickOrder = async () => {
    const items = Object.entries(selectedDishes).map(([name, qty]) => {
      const opt = quickDishOptions.find((d) => d.name === name) || { price: 200, station: 'Curry' };
      return {
        name,
        qty,
        price: opt.price * qty,
        station: opt.station,
      };
    });

    if (items.length === 0) {
      toast.warning('Please select at least one item', 'Empty Order');
      return;
    }

    const subtotal = items.reduce((acc, it) => acc + it.price, 0);
    const taxes = Math.round(subtotal * 0.05);
    const total = subtotal + taxes;

    const orderPayload = {
      table: orderType === 'dine-in' ? selectedTable : 'Counter Takeaway',
      tableType: orderType === 'dine-in' ? `Dine-In · ${guestCount} Pax` : 'Takeaway',
      customer: 'Quick Walk-in',
      phone: '+91 98200 00000',
      itemsSummary: items.map((i) => `${i.qty}x ${i.name}`).join(', '),
      itemsCount: items.reduce((acc, i) => acc + i.qty, 0),
      staff: 'Express Dispatch Station',
      total,
      subtotal,
      taxes,
      paymentStatus: 'unpaid',
      paymentMethod: 'Pending',
      lineItems: items,
    };

    try {
      const res = await api.createOrder(orderPayload);
      toast.success(`Quick Order ${res.data?.order?.id || '#ORD-LIVE'} dispatched to Kitchen (${res.data?.kdsTicket?.id || '#KOT-LIVE'})!`, 'KOT Dispatched');
      onOrderCreated?.(res.data?.order);
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Error creating quick order', 'Failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-lg bg-surface-container rounded-2xl shadow-2xl border border-surface-container-high overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-space-lg py-space-md bg-surface-container-low flex items-center justify-between border-b border-surface-container-high">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-primary-container/20 text-primary">
              <span className="material-symbols-outlined text-[20px]">bolt</span>
            </span>
            <div>
              <h3 className="font-headline-md text-headline-md text-on-surface font-bold">
                Quick Order Dispatch (F1)
              </h3>
              <p className="text-body-sm text-on-surface-variant">
                Fast POS order launch &amp; table assignment
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-space-lg flex flex-col gap-space-md">
          {/* Order Type Selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">
              Order Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setOrderType('dine-in')}
                className={`py-2 px-3 rounded-lg font-label-md text-label-md flex items-center justify-center gap-1.5 transition-all ${
                  orderType === 'dine-in'
                    ? 'bg-primary-container text-on-primary-container font-bold shadow-md'
                    : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container-high'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">table_restaurant</span>
                <span>Dine-In</span>
              </button>
              <button
                type="button"
                onClick={() => setOrderType('takeaway')}
                className={`py-2 px-3 rounded-lg font-label-md text-label-md flex items-center justify-center gap-1.5 transition-all ${
                  orderType === 'takeaway'
                    ? 'bg-primary-container text-on-primary-container font-bold shadow-md'
                    : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container-high'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
                <span>Takeaway</span>
              </button>
              <button
                type="button"
                onClick={() => setOrderType('delivery')}
                className={`py-2 px-3 rounded-lg font-label-md text-label-md flex items-center justify-center gap-1.5 transition-all ${
                  orderType === 'delivery'
                    ? 'bg-primary-container text-on-primary-container font-bold shadow-md'
                    : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container-high'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">moped</span>
                <span>Delivery</span>
              </button>
            </div>
          </div>

          {/* Table & Pax Selection */}
          {orderType === 'dine-in' && (
            <div className="grid grid-cols-2 gap-space-md">
              <div className="flex flex-col gap-1.5">
                <label className="text-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">
                  Select Table
                </label>
                <select
                  value={selectedTable}
                  onChange={(e) => setSelectedTable(e.target.value)}
                  className="bg-surface-container-lowest text-on-surface px-3 py-2 rounded-lg border border-surface-container-high outline-none focus:border-primary-container font-body-sm"
                >
                  {(tables.length > 0 ? tables : [
                    { id: 'T01', name: 'T01', status: 'available', capacity: 4 },
                    { id: 'T03', name: 'T03', status: 'available', capacity: 2 },
                    { id: 'T04', name: 'T04', status: 'occupied', capacity: 4 },
                    { id: 'T07', name: 'T07', status: 'available', capacity: 4 },
                    { id: 'T12', name: 'T12', status: 'occupied', capacity: 4 },
                  ]).map((t) => (
                    <option key={t.id} value={`Table ${t.name || t.id}`}>
                      {t.name || t.id} ({t.status} - {t.capacity}p)
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">
                  Guests (Pax)
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                    className="w-9 h-9 rounded-lg bg-surface-container-lowest hover:bg-surface-container-high text-on-surface font-bold flex items-center justify-center border border-surface-container-high"
                  >
                    -
                  </button>
                  <span className="flex-1 text-center font-mono-metric font-bold text-on-surface">
                    {guestCount}
                  </span>
                  <button
                    type="button"
                    onClick={() => setGuestCount(guestCount + 1)}
                    className="w-9 h-9 rounded-lg bg-surface-container-lowest hover:bg-surface-container-high text-on-surface font-bold flex items-center justify-center border border-surface-container-high"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Quick Dishes Shortcut */}
          <div className="flex flex-col gap-1.5">
            <label className="text-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">
              Select Quick Dishes
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto">
              {quickDishOptions.map((d) => {
                const isSelected = !!selectedDishes[d.name];
                return (
                  <button
                    key={d.name}
                    type="button"
                    onClick={() => toggleDish(d.name)}
                    className={`p-2.5 rounded-lg text-left flex items-center justify-between border transition-all ${
                      isSelected
                        ? 'bg-primary-container text-on-primary-container border-primary font-bold shadow-sm'
                        : 'bg-surface-container-lowest hover:bg-surface-container-high text-on-surface border-surface-container-high/30'
                    }`}
                  >
                    <span className="font-body-sm truncate">{d.name}</span>
                    <span className="font-mono-metric font-bold text-xs">₹{d.price}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-space-lg py-space-md bg-surface-container-low flex items-center justify-end gap-2 border-t border-surface-container-high">
          <button
            type="button"
            onClick={onClose}
            className="px-space-md py-2 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high font-label-md transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handlePlaceQuickOrder}
            className="px-space-lg py-2 rounded-lg bg-primary-container text-on-primary-container hover:brightness-110 font-label-lg font-bold shadow-lg shadow-primary-container/20 transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">local_fire_department</span>
            <span>⚡ Place Quick Order</span>
          </button>
        </div>
      </div>
    </div>
  );
};
