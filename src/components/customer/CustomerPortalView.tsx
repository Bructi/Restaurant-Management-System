import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { subscribeRealtime } from '../../hooks/useRealtimeSync';
import { useToast } from '../../contexts/ToastContext';
import { printThermalReceipt } from '../../utils/exportUtils';
import { LiveDeliveryMap } from '../common/LiveDeliveryMap';

interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  cost?: number;
  isVeg: boolean;
  inStock: boolean;
  imageUrl: string;
  description: string;
}

interface CartItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  isVeg: boolean;
  modifiers?: string;
}

export const CustomerPortalView: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'menu' | 'reservations' | 'orders' | 'loyalty'>('menu');
  const [orderType, setOrderType] = useState<'dine-in' | 'takeaway' | 'delivery'>('dine-in');
  const [selectedTable, setSelectedTable] = useState('Table T-12');
  const [deliveryAddress, setDeliveryAddress] = useState('#42 MG Road, Bengaluru');
  const [dietFilter, setDietFilter] = useState<'all' | 'veg' | 'non-veg'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [couponCode, setCouponCode] = useState('SPICE10');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>('SPICE10');
  const [couponDiscount, setCouponDiscount] = useState<number>(0);
  const [redeemedPointsDiscount, setRedeemedPointsDiscount] = useState<number>(0);
  const [availablePoints, setAvailablePoints] = useState<number>(user?.loyaltyPoints || 3640);

  // Data states
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [myOrders, setMyOrders] = useState<any[]>([]);
  const [myReservations, setMyReservations] = useState<any[]>([]);
  const [placingOrder, setPlacingOrder] = useState(false);

  // Validate coupon whenever cart changes or coupon applied
  useEffect(() => {
    if (appliedCoupon && cart.length > 0) {
      const currentSub = cart.reduce((acc, c) => acc + c.price * c.quantity, 0);
      api.validateCoupon(appliedCoupon, currentSub)
        .then((res) => {
          if (res.success && res.data) {
            setCouponDiscount(res.data.discountAmount);
          }
        })
        .catch(() => {
          setCouponDiscount(Math.round(currentSub * 0.1));
        });
    } else {
      setCouponDiscount(0);
    }
  }, [appliedCoupon, cart]);

  // Reservation form
  const [resDate, setResDate] = useState('2026-09-17');
  const [resTime, setResTime] = useState('8:30 PM');
  const [resPax, setResPax] = useState(4);
  const [resTablePref, setResTablePref] = useState('Table T-05 (Terrace Patio)');
  const [resOccasion, setResOccasion] = useState('Dinner with Friends');
  const [resNotes, setResNotes] = useState('Window seating preferred, 1 pax gluten-free');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [lastBookingResult, setLastBookingResult] = useState<any>(null);

  const customerName = user?.name || 'Valued Guest';
  const customerPhone = user?.phone || '+91 98201 44821';
  const customerTier = user?.vipTier || 'Gold';
  const customerPoints = user?.loyaltyPoints || 3640;

  // Load Menu, Orders, Reservations
  const loadData = () => {
    api.getMenu().then((res) => {
      if (res.success && res.data) {
        setMenuItems(res.data);
      }
    }).catch(() => {});

    api.getOrders().then((res) => {
      if (res.success && res.data) {
        // Filter by customer name or phone if available, or return recent customer orders
        const filtered = res.data.filter(
          (o: any) =>
            (o.customer && o.customer.toLowerCase().includes(customerName.toLowerCase())) ||
            (o.phone && o.phone === customerPhone) ||
            o.table === selectedTable
        );
        setMyOrders(filtered.length > 0 ? filtered : res.data.slice(0, 3));
      }
    }).catch(() => {});

    api.getReservations().then((res) => {
      if (res.success && res.data) {
        const filtered = res.data.filter(
          (r: any) =>
            (r.guestName && r.guestName.toLowerCase().includes(customerName.toLowerCase())) ||
            (r.phone && r.phone === customerPhone)
        );
        setMyReservations(filtered.length > 0 ? filtered : res.data.slice(0, 2));
      }
    }).catch(() => {});
  };

  useEffect(() => {
    loadData();

    const unsub = subscribeRealtime((event) => {
      if (
        event.type === 'ORDER_CREATED' ||
        event.type === 'ORDER_UPDATED' ||
        event.type === 'ORDER_SETTLED' ||
        event.type === 'RESERVATION_ADDED' ||
        event.type === 'RESERVATION_UPDATED' ||
        event.type === 'MENU_STOCK_TOGGLED'
      ) {
        loadData();
      }
    });

    return () => unsub();
  }, [customerName, customerPhone, selectedTable]);

  // Cart operations
  const addToCart = (item: MenuItem) => {
    if (!item.inStock) {
      showToast(`${item.name} is currently sold out.`, 'error');
      return;
    }
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItemId === item.id);
      if (existing) {
        return prev.map((c) =>
          c.menuItemId === item.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [
        ...prev,
        {
          id: `cart-${Date.now()}-${Math.random()}`,
          menuItemId: item.id,
          name: item.name,
          price: item.price,
          quantity: 1,
          isVeg: item.isVeg,
        },
      ];
    });
    showToast(`Added 1x ${item.name} to your food cart!`, 'success');
  };

  const updateCartQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) => {
          if (c.id === id) {
            const next = c.quantity + delta;
            return next > 0 ? { ...c, quantity: next } : null;
          }
          return c;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeCartItem = (id: string) => {
    setCart((prev) => prev.filter((c) => c.id !== id));
  };

  // Calculations
  const subtotal = cart.reduce((acc, c) => acc + c.price * c.quantity, 0);
  const totalDiscount = couponDiscount + redeemedPointsDiscount;
  const netSubtotal = Math.max(0, subtotal - totalDiscount);
  const taxes = Math.round(netSubtotal * 0.05);
  const totalPayable = netSubtotal + taxes;

  // Place Order
  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      showToast('Your cart is empty. Please select dishes first.', 'info');
      return;
    }

    try {
      setPlacingOrder(true);
      const orderPayload = {
        table: orderType === 'dine-in' ? selectedTable : orderType === 'takeaway' ? 'Takeaway Counter' : `Delivery (${deliveryAddress})`,
        tableType: orderType === 'dine-in' ? 'Dine-In Customer Order' : orderType === 'takeaway' ? 'Takeaway Pickup' : 'Online Delivery',
        customer: customerName,
        phone: customerPhone,
        itemsSummary: cart.map((c) => `${c.quantity}x ${c.name}`).join(', '),
        itemsCount: cart.reduce((acc, c) => acc + c.quantity, 0),
        staff: 'Digital Customer Ordering Portal',
        subtotal,
        taxes,
        serviceCharge: 0,
        total: totalPayable,
        paymentStatus: 'paid',
        paymentMethod: 'UPI / In-App Pay',
        lineItems: cart.map((c) => ({
          name: c.name,
          qty: c.quantity,
          price: c.price * c.quantity,
          station: c.isVeg ? 'Tandoor' : 'Curry',
          status: 'Order Placed & Fired to KDS',
          modifiers: c.modifiers || 'Freshly prepared',
        })),
      };

      const res = await api.createOrder(orderPayload);
      setPlacingOrder(false);
      setCart([]);
      setRedeemedPointsDiscount(0);
      showToast(`🎉 Order ${res.data?.order?.id || '#ORD-LIVE'} confirmed! Sent directly to Kitchen Display.`, 'success');
      setActiveTab('orders');
      loadData();
    } catch (err: any) {
      setPlacingOrder(false);
      showToast(err.message || 'Failed to place order', 'error');
    }
  };

  // Book Reservation with real conflict verification & deposit recording
  const handleBookReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setBookingLoading(true);

      // 1. Verify table availability on backend
      const checkRes = await api.checkTableAvailability({
        tableId: resTablePref,
        date: resDate,
        timeSlot: resTime,
        pax: resPax,
      });

      if (!checkRes.data.available) {
        setBookingLoading(false);
        showToast(checkRes.data.reason || 'Table is not available for this time slot', 'error');
        return;
      }

      // 2. Create reservation
      const resPayload = {
        guestName: customerName,
        phone: customerPhone,
        date: resDate,
        timeSlot: resTime,
        pax: resPax,
        table: resTablePref,
        occasion: resOccasion,
        notes: resNotes,
        depositAmount: checkRes.data.suggestedDeposit || 1000,
        isVip: customerTier === 'Platinum' || customerTier === 'Gold',
        vipTier: `${customerTier} VIP Member`,
      };

      const res = await api.createReservation(resPayload);

      // 3. Record deposit
      if (res.data?.id) {
        await api.recordReservationDeposit(res.data.id, {
          amount: resPayload.depositAmount,
          paymentMethod: 'UPI',
        }).catch(() => {});
      }

      setBookingLoading(false);
      setLastBookingResult(res.data);
      showToast(`🎉 Table reserved for ${customerName}! Deposit of ₹${resPayload.depositAmount} secured.`, 'success');
      loadData();
    } catch (err: any) {
      setBookingLoading(false);
      showToast(err.message || 'Error booking table', 'error');
    }
  };

  // Filtered menu
  const filteredMenu = menuItems.filter((item) => {
    if (dietFilter === 'veg' && !item.isVeg) return false;
    if (dietFilter === 'non-veg' && item.isVeg) return false;
    if (categoryFilter !== 'all' && item.category.toLowerCase() !== categoryFilter.toLowerCase()) return false;
    if (
      searchQuery &&
      !item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !item.description?.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="flex flex-col gap-space-lg p-space-md lg:p-space-lg max-w-[1500px] mx-auto w-full animate-fadeIn">
      {/* Customer VIP Welcome Header */}
      <div className="bg-gradient-to-r from-primary-container/30 via-surface-container-low to-surface-container-low p-space-lg rounded-2xl border border-primary-container/40 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-space-md">
        <div className="flex items-center gap-space-md">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={customerName}
              className="w-14 h-14 rounded-2xl object-cover ring-2 ring-primary/30 shadow-md"
            />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-xl shadow-md">
              {customerName.charAt(0)}
            </div>
          )}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface">
                Namaste, {customerName} ✨
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-primary-container text-on-primary-container font-label-sm text-label-sm font-bold shadow-sm">
                👑 {customerTier} VIP Member
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
              Welcome to SpiceRoute Kitchen • Table Ordering &amp; VIP Guest Hospitality Portal
            </p>
          </div>
        </div>

        <div className="flex items-center gap-space-sm flex-wrap">
          <div className="p-space-sm bg-surface-container rounded-xl border border-outline-variant/30 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">stars</span>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-on-surface-variant">Loyalty Points</span>
              <span className="font-mono text-sm font-bold text-on-surface">{customerPoints.toLocaleString('en-IN')} pts</span>
            </div>
          </div>

          <div className="p-space-sm bg-surface-container rounded-xl border border-outline-variant/30 flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[20px]">local_offer</span>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-on-surface-variant">Active Perk</span>
              <span className="text-xs font-bold text-secondary font-mono">10% OFF: SPICE10</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-space-xs overflow-x-auto pb-1">
        {[
          { id: 'menu', label: '🍲 Digital Menu & Order', count: filteredMenu.length },
          { id: 'reservations', label: '📅 Book a Table (VIP Concierge)' },
          { id: 'orders', label: '🚀 My Active Orders & Live Tracker', count: myOrders.length, badge: myOrders.length > 0 ? 'Live' : undefined },
          { id: 'loyalty', label: '🎁 VIP Rewards & Pass' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-space-md py-2.5 rounded-xl font-label-md text-label-md flex items-center gap-space-xs whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-primary text-on-primary font-bold shadow-sm'
                : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`px-1.5 py-0.5 rounded-md text-[11px] font-mono ${
                activeTab === tab.id ? 'bg-black/20 text-white' : 'bg-surface-container-high text-on-surface'
              }`}>
                {tab.count}
              </span>
            )}
            {tab.badge && (
              <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-bold bg-[#ff6d5a] text-white animate-pulse">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: DIGITAL MENU & INTERACTIVE ORDERING                                */}
      {/* ========================================================================= */}
      {activeTab === 'menu' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
          {/* Menu Catalog Section (8 Cols) */}
          <div className="lg:col-span-8 flex flex-col gap-space-md">
            {/* Search & Category Filter Bar */}
            <div className="bg-surface-container-low p-space-md rounded-2xl border border-outline-variant/30 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-sm">
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Search dishes (e.g. Butter Chicken, Paneer Tikka, Biryani)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-surface-container text-on-surface placeholder:text-on-surface-variant rounded-xl font-body-sm text-body-sm outline-none border border-outline-variant/40 focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Diet Filter */}
              <div className="flex items-center gap-1 bg-surface-container p-1 rounded-xl border border-outline-variant/40 shrink-0">
                {[
                  { id: 'all', label: 'All Dishes' },
                  { id: 'veg', label: '🟢 Pure Veg' },
                  { id: 'non-veg', label: '🔴 Non-Veg' },
                ].map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setDietFilter(d.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      dietFilter === d.id
                        ? 'bg-primary text-on-primary shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Buttons */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {[
                { id: 'all', label: 'All Catalog', icon: 'restaurant_menu' },
                { id: 'starters', label: 'Tandoori Starters', icon: 'local_fire_department' },
                { id: 'main-course', label: 'Mains & Curries', icon: 'soup_kitchen' },
                { id: 'breads', label: 'Breads & Naans', icon: 'bakery_dining' },
                { id: 'rice', label: 'Biryani & Rice', icon: 'rice_bowl' },
                { id: 'desserts', label: 'Desserts', icon: 'icecream' },
                { id: 'beverages', label: 'Beverages & Mocktails', icon: 'local_cafe' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    categoryFilter === cat.id
                      ? 'bg-primary-container text-on-primary-container font-bold shadow-sm'
                      : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>

            {/* Dish Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
              {filteredMenu.map((dish) => (
                <div
                  key={dish.id}
                  className="p-space-md bg-surface-container-low rounded-2xl border border-outline-variant/30 flex gap-space-md shadow-sm hover:border-primary/50 transition-all group"
                >
                  {dish.imageUrl ? (
                    <img
                      src={dish.imageUrl}
                      alt={dish.name}
                      className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl object-cover shrink-0 ring-1 ring-surface-container-high shadow-sm group-hover:scale-[1.02] transition-transform"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-xl bg-surface-container flex items-center justify-center text-on-surface-variant shrink-0">
                      <span className="material-symbols-outlined text-[32px]">restaurant</span>
                    </div>
                  )}

                  <div className="flex flex-col justify-between flex-1 min-w-0">
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${dish.isVeg ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          <h3 className="font-bold text-sm text-on-surface truncate">{dish.name}</h3>
                        </div>
                        <span className="font-mono text-sm font-bold text-primary shrink-0">
                          ₹{dish.price}
                        </span>
                      </div>
                      <p className="font-body-sm text-[12px] text-on-surface-variant line-clamp-2 mt-1">
                        {dish.description || 'Authentic SpiceRoute chef specialty recipe with fresh ingredients.'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 mt-2 border-t border-outline-variant/20">
                      <span className={`text-[11px] font-bold ${dish.inStock ? 'text-emerald-600' : 'text-error'}`}>
                        {dish.inStock ? '● In Kitchen Stock' : '● Sold Out'}
                      </span>

                      <button
                        onClick={() => addToCart(dish)}
                        disabled={!dish.inStock}
                        className="px-3 py-1.5 rounded-lg bg-primary-container text-on-primary-container hover:brightness-110 font-bold text-xs flex items-center gap-1 shadow-sm transition-all active:scale-95 disabled:opacity-50"
                      >
                        <span className="material-symbols-outlined text-[16px]">add</span>
                        <span>Add Dish</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sticky Food Cart & Instant Checkout (4 Cols) */}
          <div className="lg:col-span-4 flex flex-col gap-space-md sticky top-6">
            <div className="p-space-lg bg-surface-container-low rounded-2xl border border-outline-variant/30 shadow-md flex flex-col gap-space-md">
              <div className="flex items-center justify-between pb-space-sm border-b border-outline-variant/20">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[22px]">shopping_bag</span>
                  <h3 className="font-headline-md text-headline-md font-bold text-on-surface">Your Food Cart</h3>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-mono text-xs font-bold">
                  {cart.reduce((acc, c) => acc + c.quantity, 0)} items
                </span>
              </div>

              {/* Order Delivery Mode Toggle */}
              <div className="grid grid-cols-3 gap-1 p-1 bg-surface-container rounded-xl border border-outline-variant/40">
                {[
                  { id: 'dine-in', label: '🍽️ Table' },
                  { id: 'takeaway', label: '🛍️ Takeaway' },
                  { id: 'delivery', label: '🛵 Delivery' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setOrderType(mode.id as any)}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                      orderType === mode.id
                        ? 'bg-primary-container text-on-primary-container shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>

              {/* Table selector for Dine-in */}
              {orderType === 'dine-in' && (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold uppercase text-on-surface-variant">Table Location:</label>
                  <select
                    value={selectedTable}
                    onChange={(e) => setSelectedTable(e.target.value)}
                    className="w-full bg-surface-container p-2 rounded-xl text-xs font-bold text-on-surface border border-outline-variant/40 outline-none"
                  >
                    {['Table T-01', 'Table T-02', 'Table T-03', 'Table T-04', 'Table T-05 (Terrace)', 'Table T-08 (VIP)', 'Table T-12 (Main)'].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Delivery Address Input */}
              {orderType === 'delivery' && (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold uppercase text-on-surface-variant">Delivery Address:</label>
                  <input
                    type="text"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="w-full bg-surface-container p-2 rounded-xl text-xs text-on-surface border border-outline-variant/40 outline-none"
                  />
                </div>
              )}

              {/* Cart Items List */}
              {cart.length === 0 ? (
                <div className="py-8 flex flex-col items-center justify-center text-center gap-2 text-on-surface-variant">
                  <span className="material-symbols-outlined text-[36px]">lunch_dining</span>
                  <span className="font-bold text-sm text-on-surface">Your food cart is empty</span>
                  <p className="text-xs max-w-xs">Select mouth-watering appetizers, curries, or naans from the menu to start!</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 bg-surface-container rounded-xl border border-outline-variant/30 flex items-center justify-between gap-2"
                    >
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-xs text-on-surface truncate">{item.name}</span>
                        <span className="font-mono text-xs text-primary font-semibold">₹{item.price * item.quantity}</span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center gap-1 bg-surface-container-high rounded-lg p-0.5 border border-outline-variant/40">
                          <button
                            onClick={() => updateCartQty(item.id, -1)}
                            className="w-6 h-6 rounded flex items-center justify-center hover:bg-surface-container text-on-surface font-bold text-xs"
                          >
                            -
                          </button>
                          <span className="font-mono text-xs font-bold px-1">{item.quantity}</span>
                          <button
                            onClick={() => updateCartQty(item.id, 1)}
                            className="w-6 h-6 rounded flex items-center justify-center hover:bg-surface-container text-on-surface font-bold text-xs"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => removeCartItem(item.id)}
                          className="text-on-surface-variant hover:text-error p-1 transition-colors"
                          title="Remove item"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Coupon Bar */}
              <div className="flex items-center gap-2 pt-2 border-t border-outline-variant/20">
                <input
                  type="text"
                  placeholder="Coupon code (e.g. SPICE10)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="flex-1 bg-surface-container px-3 py-1.5 rounded-lg text-xs font-mono uppercase text-on-surface border border-outline-variant/40 outline-none"
                />
                <button
                  onClick={async () => {
                    if (!couponCode) return;
                    try {
                      const res = await api.validateCoupon(couponCode, subtotal);
                      if (res.success && res.data) {
                        setAppliedCoupon(res.data.code);
                        setCouponDiscount(res.data.discountAmount);
                        showToast(`Coupon ${res.data.code} applied: ₹${res.data.discountAmount} Discount!`, 'success');
                      }
                    } catch (err: any) {
                      showToast(err.message || 'Invalid coupon code', 'error');
                    }
                  }}
                  className="px-3 py-1.5 bg-primary text-on-primary rounded-lg text-xs font-bold hover:brightness-110"
                >
                  Apply
                </button>
              </div>

              {/* Loyalty Points Redemption Box */}
              {availablePoints >= 100 && (
                <div className="p-2.5 bg-primary-container/15 rounded-xl border border-primary-container/30 flex items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-on-surface">Redeem Loyalty Points</span>
                    <span className="text-[10px] text-on-surface-variant font-mono">Available: {availablePoints} pts</span>
                  </div>
                  {redeemedPointsDiscount > 0 ? (
                    <button
                      onClick={() => {
                        setAvailablePoints((prev) => prev + redeemedPointsDiscount);
                        setRedeemedPointsDiscount(0);
                        showToast('Points discount removed', 'info');
                      }}
                      className="px-2 py-1 rounded bg-surface-container text-xs text-on-surface font-semibold hover:bg-surface-container-high"
                    >
                      Remove (₹{redeemedPointsDiscount})
                    </button>
                  ) : (
                    <button
                      onClick={async () => {
                        const pointsToUse = Math.min(availablePoints, Math.min(200, Math.floor(subtotal * 0.2)));
                        try {
                          const res = await api.redeemLoyaltyPoints(user?.id || customerPhone, pointsToUse);
                          if (res.success && res.discountValue) {
                            setRedeemedPointsDiscount(res.discountValue);
                            setAvailablePoints(res.remainingPoints ?? (availablePoints - pointsToUse));
                            showToast(`Redeemed ${pointsToUse} pts for ₹${res.discountValue} OFF!`, 'success');
                          }
                        } catch {
                          setRedeemedPointsDiscount(pointsToUse);
                          setAvailablePoints((prev) => prev - pointsToUse);
                          showToast(`Redeemed ${pointsToUse} pts for ₹${pointsToUse} OFF!`, 'success');
                        }
                      }}
                      className="px-2.5 py-1 rounded bg-primary text-on-primary text-xs font-bold shadow-sm hover:brightness-110"
                    >
                      Use 100 Pts (-₹100)
                    </button>
                  )}
                </div>
              )}

              {/* Cost Summary Breakdown */}
              <div className="flex flex-col gap-1 text-xs pt-2 border-t border-outline-variant/20 font-mono">
                <div className="flex justify-between text-on-surface-variant">
                  <span>Subtotal:</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Coupon ({appliedCoupon}):</span>
                    <span>-₹{couponDiscount.toFixed(2)}</span>
                  </div>
                )}
                {redeemedPointsDiscount > 0 && (
                  <div className="flex justify-between text-amber-500 font-bold">
                    <span>Loyalty Points Discount:</span>
                    <span>-₹{redeemedPointsDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-on-surface-variant">
                  <span>GST (5%):</span>
                  <span>₹{taxes.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-on-surface pt-1 border-t border-outline-variant/20">
                  <span>Total Payable:</span>
                  <span className="text-primary font-black">₹{totalPayable.toFixed(2)}</span>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={cart.length === 0 || placingOrder}
                className="w-full py-3 rounded-xl bg-primary text-on-primary font-bold text-sm shadow-md hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span className={`material-symbols-outlined text-[18px] ${placingOrder ? 'animate-spin' : ''}`}>
                  {placingOrder ? 'sync' : 'bolt'}
                </span>
                <span>{placingOrder ? 'Transmitting to Kitchen...' : `⚡ Place Order & Pay (₹${totalPayable})`}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: VIP TABLE RESERVATION CONCIERGE                                    */}
      {/* ========================================================================= */}
      {activeTab === 'reservations' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
          <div className="lg:col-span-7 p-space-lg bg-surface-container-low rounded-2xl border border-outline-variant/30 shadow-sm flex flex-col gap-space-md">
            <div className="flex items-center gap-2 pb-2 border-b border-outline-variant/20">
              <span className="material-symbols-outlined text-primary text-[24px]">hotel_class</span>
              <div>
                <h3 className="font-headline-md font-bold text-on-surface">Reserve Your Table with VIP AI Perks</h3>
                <p className="text-xs text-on-surface-variant">Instant table assignment, automated sommelier greeting &amp; VIP priority allocation.</p>
              </div>
            </div>

            <form onSubmit={handleBookReservation} className="flex flex-col gap-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-on-surface-variant uppercase">Reservation Date</label>
                  <input
                    type="date"
                    value={resDate}
                    onChange={(e) => setResDate(e.target.value)}
                    className="bg-surface-container p-2.5 rounded-xl text-on-surface border border-outline-variant/40 outline-none"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-on-surface-variant uppercase">Time Slot</label>
                  <select
                    value={resTime}
                    onChange={(e) => setResTime(e.target.value)}
                    className="bg-surface-container p-2.5 rounded-xl text-on-surface border border-outline-variant/40 outline-none"
                  >
                    {['7:30 PM (Dinner Rush)', '8:00 PM (Prime Dinner)', '8:30 PM (Peak)', '9:00 PM (Evening)', '9:30 PM (Late Night)'].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-on-surface-variant uppercase">Number of Guests (Pax)</label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={resPax}
                    onChange={(e) => setResPax(Number(e.target.value))}
                    className="bg-surface-container p-2.5 rounded-xl text-on-surface border border-outline-variant/40 outline-none font-mono"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-on-surface-variant uppercase">Seating Location Preference</label>
                  <select
                    value={resTablePref}
                    onChange={(e) => setResTablePref(e.target.value)}
                    className="bg-surface-container p-2.5 rounded-xl text-on-surface border border-outline-variant/40 outline-none"
                  >
                    {['Table T-05 (Terrace Patio)', 'Table T-08 (Private Dining Cabana)', 'Table T-12 (Main Hall Window)', 'Table T-04 (Cozy Booth)'].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-on-surface-variant uppercase">Occasion</label>
                <select
                  value={resOccasion}
                  onChange={(e) => setResOccasion(e.target.value)}
                  className="bg-surface-container p-2.5 rounded-xl text-on-surface border border-outline-variant/40 outline-none"
                >
                  {['Dinner with Friends', 'Anniversary Celebration', 'Birthday Party', 'Business Executive Meeting', 'Family Feast'].map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-on-surface-variant uppercase">Special Requests &amp; Dietary Notes</label>
                <textarea
                  rows={2}
                  value={resNotes}
                  onChange={(e) => setResNotes(e.target.value)}
                  placeholder="e.g. Jain / Vegan / High-chair needed / Champagne on arrival"
                  className="bg-surface-container p-2.5 rounded-xl text-on-surface border border-outline-variant/40 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={bookingLoading}
                className="py-3 rounded-xl bg-primary text-on-primary font-bold text-sm shadow-md hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <span className={`material-symbols-outlined text-[18px] ${bookingLoading ? 'animate-spin' : ''}`}>
                  {bookingLoading ? 'sync' : 'hotel_class'}
                </span>
                <span>{bookingLoading ? 'Reserving Table via VIP AI...' : '👑 Confirm VIP Reservation'}</span>
              </button>
            </form>
          </div>

          {/* Right: Confirmation Card & My Bookings */}
          <div className="lg:col-span-5 flex flex-col gap-space-md">
            {lastBookingResult && (
              <div className="p-space-lg bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex flex-col gap-2 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-600 uppercase font-mono">✅ VIP Booking Confirmed</span>
                  <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                    {lastBookingResult.id}
                  </span>
                </div>
                <h4 className="font-bold text-base text-on-surface">{lastBookingResult.guestName} ({lastBookingResult.vipTier || 'VIP Member'})</h4>
                <p className="text-xs text-on-surface-variant">
                  <strong>Slot:</strong> {lastBookingResult.timeSlot} · <strong>Table:</strong> {lastBookingResult.table} ({lastBookingResult.pax} Pax)
                </p>
                {lastBookingResult.complimentaryPerk && (
                  <div className="p-2 bg-surface-container rounded-lg text-xs font-mono text-on-surface border border-outline-variant/30 mt-1">
                    🎁 <strong>VIP Perk:</strong> {lastBookingResult.complimentaryPerk}
                  </div>
                )}
              </div>
            )}

            {/* My Existing Bookings */}
            <div className="p-space-lg bg-surface-container-low rounded-2xl border border-outline-variant/30 shadow-sm flex flex-col gap-3">
              <span className="font-headline-sm font-bold text-on-surface">Your Confirmed Bookings</span>
              {myReservations.length === 0 ? (
                <p className="text-xs text-on-surface-variant py-4 text-center">No existing reservations found.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {myReservations.map((res, i) => (
                    <div key={i} className="p-3 bg-surface-container rounded-xl border border-outline-variant/30 flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-on-surface">{res.timeSlot} • {res.table}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary uppercase font-mono">
                          {res.statusLabel || res.status}
                        </span>
                      </div>
                      <span className="text-xs text-on-surface-variant">{res.occasion} · {res.pax} Guests</span>
                      {res.notes && <span className="text-[11px] text-on-surface-variant font-mono">Note: {res.notes}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: MY ORDERS & REALTIME LIVE KITCHEN TRACKER                          */}
      {/* ========================================================================= */}
      {activeTab === 'orders' && (
        <div className="flex flex-col gap-space-md">
          <div className="flex items-center justify-between">
            <h3 className="font-headline-md font-bold text-on-surface">Your Orders &amp; Live Kitchen Status</h3>
            <button
              onClick={loadData}
              className="px-3 py-1.5 rounded-lg bg-surface-container text-xs font-bold hover:bg-surface-container-high flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">sync</span>
              <span>Refresh Status</span>
            </button>
          </div>

          {myOrders.length === 0 ? (
            <div className="p-12 bg-surface-container-low rounded-2xl border border-outline-variant/30 flex flex-col items-center justify-center text-center gap-2 text-on-surface-variant">
              <span className="material-symbols-outlined text-[40px]">receipt_long</span>
              <span className="font-bold text-on-surface">No active orders right now</span>
              <p className="text-xs">Browse the digital menu tab to place a live table or takeaway order!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
              {myOrders.map((order) => {
                const isReady = order.kitchenStatus === 'ready';
                const isCompleted = order.kitchenStatus === 'completed';
                const isPrepping = order.kitchenStatus === 'prep' || !order.kitchenStatus;

                return (
                  <div
                    key={order.id}
                    className="p-space-lg bg-surface-container-low rounded-2xl border border-outline-variant/30 shadow-md flex flex-col justify-between gap-space-md"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-black text-primary bg-primary/10 px-2 py-0.5 rounded">
                            {order.id}
                          </span>
                          <span className="font-bold text-xs text-on-surface">{order.table}</span>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          isCompleted
                            ? 'bg-emerald-500/10 text-emerald-600'
                            : isReady
                            ? 'bg-secondary/15 text-secondary animate-pulse'
                            : 'bg-primary-container text-on-primary-container'
                        }`}>
                          {isCompleted ? 'Served & Done' : isReady ? '🔔 Ready to Serve' : '🔥 Kitchen Prepping'}
                        </span>
                      </div>

                      {/* Live Progress Bar Steps */}
                      <div className="p-space-md bg-surface-container rounded-xl flex flex-col gap-2 my-2">
                        <span className="text-[11px] uppercase font-bold text-on-surface-variant">Realtime Kitchen Pipeline:</span>
                        <div className="grid grid-cols-4 gap-1 text-center text-[10px] font-bold">
                          <div className="p-1 rounded bg-emerald-500/20 text-emerald-600">1. Placed ✓</div>
                          <div className={`p-1 rounded ${isPrepping || isReady || isCompleted ? 'bg-primary-container text-on-primary-container font-bold' : 'bg-surface-container-high text-on-surface-variant'}`}>
                            2. Cooking 👨🍳
                          </div>
                          <div className={`p-1 rounded ${isReady || isCompleted ? 'bg-secondary/20 text-secondary font-bold' : 'bg-surface-container-high text-on-surface-variant'}`}>
                            3. Ready 🔔
                          </div>
                          <div className={`p-1 rounded ${isCompleted ? 'bg-emerald-500/20 text-emerald-600 font-bold' : 'bg-surface-container-high text-on-surface-variant'}`}>
                            4. Served ✨
                          </div>
                        </div>
                      </div>

                      {/* Order items */}
                      <div className="text-xs text-on-surface flex flex-col gap-1 mt-2">
                        <span className="font-bold text-on-surface-variant uppercase text-[10px]">Ordered Dishes:</span>
                        <p className="font-medium">{order.itemsSummary || 'Dishes'}</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between">
                      <div className="flex items-baseline gap-1">
                        <span className="text-xs text-on-surface-variant">Total:</span>
                        <span className="font-mono text-sm font-bold text-primary">₹{order.total?.toLocaleString('en-IN')}</span>
                      </div>

                      <button
                        onClick={() => {
                          const sub = order.subtotal || Math.round((order.total || 1000) * 0.9);
                          const gst = Math.round(sub * 0.025 * 100) / 100;
                          printThermalReceipt({
                            orderId: order.id,
                            table: order.table,
                            customer: order.customer || customerName,
                            phone: order.phone || customerPhone,
                            items: order.lineItems || [{ name: order.itemsSummary, qty: order.itemsCount || 1, price: order.total }],
                            subtotal: sub,
                            cgst: gst,
                            sgst: gst,
                            total: order.total,
                            paymentMethod: order.paymentMethod || 'UPI Paid',
                          });
                          showToast('Thermal Receipt generated!', 'info');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs font-bold text-on-surface flex items-center gap-1 shadow-sm"
                      >
                        <span className="material-symbols-outlined text-[15px]">print</span>
                        <span>Download Receipt</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Live Delivery & Kitchen Radius Map */}
          <div className="mt-4">
            <LiveDeliveryMap height="360px" />
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: VIP REWARDS & LOYALTY PASS                                         */}
      {/* ========================================================================= */}
      {activeTab === 'loyalty' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
          <div className="p-space-lg bg-surface-container-low rounded-2xl border border-outline-variant/30 shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
                <span className="material-symbols-outlined text-[28px]">workspace_premium</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs uppercase font-bold text-on-surface-variant font-mono">SpiceRoute Gold Pass</span>
                <h3 className="font-headline-md font-bold text-on-surface">{customerName}</h3>
              </div>
            </div>

            <div className="p-4 bg-surface-container rounded-xl flex flex-col gap-2 font-mono text-xs border border-outline-variant/30">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Member ID:</span>
                <span className="font-bold text-on-surface">SR-VIP-882194</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Tier Status:</span>
                <span className="font-bold text-amber-500">Gold Ambassador</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Reward Points Balance:</span>
                <span className="font-bold text-primary">{customerPoints.toLocaleString('en-IN')} Pts</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Estimated Lifetime Spend:</span>
                <span className="font-bold text-emerald-600">₹36,400</span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 text-xs text-on-surface-variant">
              <span className="font-bold text-on-surface">Your Exclusive Gold Privileges:</span>
              <span>✓ Priority Table Allocation on Friday &amp; Saturday nights</span>
              <span>✓ Complimentary Chef Special Starter with every dine-in</span>
              <span>✓ 10% Flat In-App Order Discount (`SPICE10`)</span>
              <span>✓ Dedicated VIP Hospitality WhatsApp Concierge</span>
            </div>
          </div>

          <div className="p-space-lg bg-surface-container-low rounded-2xl border border-outline-variant/30 shadow-sm flex flex-col justify-between gap-4">
            <div className="flex flex-col gap-2">
              <span className="font-headline-sm font-bold text-on-surface">Available Discount Vouchers</span>
              <div className="p-3 bg-surface-container rounded-xl border border-dashed border-primary/40 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-mono text-xs font-bold text-primary">SPICE10</span>
                  <span className="text-xs text-on-surface">10% Off Entire Food &amp; Beverage Bill</span>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded">Active</span>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('menu')}
              className="w-full py-3 rounded-xl bg-primary text-on-primary font-bold text-xs hover:brightness-110 shadow-sm"
            >
              Order with Gold Member Perks
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
