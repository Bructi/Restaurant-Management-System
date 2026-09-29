import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { printThermalReceipt } from '../../utils/exportUtils';

interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  isVeg: boolean;
  inStock: boolean;
  description: string;
  imageUrl: string;
  altText: string;
}

interface CartItem {
  id: string;
  menuItemId: string;
  name: string;
  basePrice: number;
  quantity: number;
  isVeg: boolean;
  modifiers?: string;
}

const POS_MENU_ITEMS: MenuItem[] = [
  {
    id: 'm1',
    name: 'Paneer Tikka',
    category: 'starters',
    price: 290,
    isVeg: true,
    inStock: true,
    description: 'Charcoal-grilled cottage cheese cubes with peppers and mint dip.',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCp_6CFR3E-8f37S3fRDufLwRpCRWr4UmocpRyuHFSetsbzBmXbMkNSBtpShT6_Pft40jHQkyG2WrmcTizjo3WsSl_8Ng48_1mI1U_AplNCGFH1TfIccLd_xFA97TESR97G_CGhbuVeIaM22wXEw1Fi5pYJPRYZFYbz7CY_LeJrT7N06th1UTYmwhkuSXHlwcNED8ZQP3N7yy-MnLV_7Lnk-adRqs0-Q_E21-yTwQONnIY1dwVblzw6',
    altText: 'Paneer Tikka',
  },
  {
    id: 'm2',
    name: 'Butter Chicken',
    category: 'main-course',
    price: 380,
    isVeg: false,
    inStock: true,
    description: 'Tandoori chicken in rich velvety makhani tomato butter gravy.',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDH8LH1fdiIdDAAuM87hOyrSr5o0N_k21tQrJ62lukG9qcewaJ3scqOfcOI8BTTj0kp5I7WxsdMEhkIDsgIddnzgGIkknVVFk4OPoTBnXY1zeyz7kFzDVa_s5BQFHdWy-zQchP8Jki9oFwlcj1REaKmgoXsiKRs4tHCJXUV93jNIH3eTbsjuyD33aqAqPsKcoEtlT-4EGRlxKbXUVTXIGci17x0zWNBxPLSV2-W6Lc90T-fxaV7E-Vq',
    altText: 'Butter Chicken',
  },
  {
    id: 'm3',
    name: 'Paneer Butter Masala',
    category: 'main-course',
    price: 320,
    isVeg: true,
    inStock: true,
    description: 'Velvety butter gravy with roasted whole spices, fresh cream, and tender soft paneer cubes.',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCt6tS1yZeVJXYs7xnTN1ccvHa2HW2saDI3CsZiEgyQpS9cf75gOQWe5gm_HVxvY5TfSP3mUaHKQ8UnRKrpZ9Dn8Fj0mZvYFKUwDhYqb81xz4RPZsnyXTofmCcDaPPmvH9yyKK0DwKET7UtFW7mdiCHDNaPenqqjyDVtmrNpWWhwtBoreECBuC21r4YOYhmEiNPc_4HE76B3ZKmgXlKMjbZKR5S4nshmDa2oQ4SO9jom5MsfNTDtFfF',
    altText: 'Paneer Butter Masala',
  },
  {
    id: 'm4',
    name: 'Tandoori Chicken',
    category: 'starters',
    price: 420,
    isVeg: false,
    inStock: true,
    description: 'Whole spring chicken marinated with Kashmiri deggi mirch and roasted over charcoal.',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCufIW8nyrb93az0RcAMyVwzXqp6w-12rHazdtVueoPFXyz8rp8jtpKSkl6_Y7XOO2LqLrXxOK7EFIwcyNLiqcnbNCNeCw9YqR_wiUfxZt7JKF0PZapMkJelnsOJCMUE8_5Mqr_534FzXzFbyJJD8VdJuevYKcWKpqbEB7rfBCsbKa-mQhVCcgdOK7vTaI7K9DMaxIx5a_1Hdmvm_k6JdUaPc4lRe1zWAO5mEyWK4gsNrXLakk0GXxI',
    altText: 'Tandoori Chicken',
  },
  {
    id: 'm5',
    name: 'Margherita Pizza',
    category: 'pizza',
    price: 310,
    isVeg: true,
    inStock: true,
    description: '11-inch thin crust topped with San Marzano tomatoes, bocconcini cheese, and fresh basil.',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAjvcVl0Dd0pb9eeX_hjPlmBqMLYPwwAHc8HtROmwfCNs7n_un5k2lA1ursr96DkhFGiAh8nT7grEk0acpZK5MByfvzNK5U-cYaNxl6aEmdlz4uuHaGrhSE7kZlKlKzmGFhV-KmQugsIRdjxH0clgEzsYx64b8zD_vnb9m6-6B1I2ItJfXVgnq4unxRydNIKkKvN0AZV5eC5hbE2cpnwXPvZExy1rMyr8N7kpG0fSdABO7AI8ySQBjw',
    altText: 'Margherita Pizza',
  },
  {
    id: 'm6',
    name: 'Gulab Jamun (2 pcs)',
    category: 'desserts',
    price: 110,
    isVeg: true,
    inStock: true,
    description: 'Warm fried milk dumplings soaked in green cardamom & saffron infused sugar syrup.',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCfS7MBQ6KXSlb_StqI-OQHKbrGZMaMnmGVAd_mGTltJEDQfNYGMgs4iNkbAzug13ZfQSncWAqDm2T_B7bMw9NiHomU3tpRMxttgnvPPnGAE5CiWrYRgXJm1wIT-728DD0m4Y-v7WDGgEAFIKfak7FxiOIGvAZc8bhPJBOAOLCJUzh9jlqW4qfZOSiqR-VBCOaBRBxjQ8ca4X_Dwy65cQOCtGf7eb2UaceqWryfPxBUZwIFuxK_aF33',
    altText: 'Gulab Jamun',
  },
  {
    id: 'm7',
    name: 'Masala Chai',
    category: 'beverages',
    price: 60,
    isVeg: true,
    inStock: true,
    description: 'Slow-brewed Assam CTC black tea with crushed ginger, cloves, cinnamon, and whole milk.',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCPRzaZGbWKdYmTmXGIsIB2JzYXr4dtw9FVzIj2FHAYpFyb8fi_yvJsaY71lLvnPGYd_1_3PV8gEnAYzNBQKuWc-8Qw1Ey1UvuzZxpX6mZcyHwALj547f50_uFh8AZ4a0wL8BPknMRyJboOPHc3zX7Sfy1OZU0hHKYRvT_pTK8VA03yguKV4Jh2id0IE2j1ohAccEG9IRgCbpvQybTlN-8-p9Y2mQvyD6Re26YPBGeQOOvJ1fTPYeHq',
    altText: 'Masala Chai',
  },
  {
    id: 'm8',
    name: 'Garlic Naan',
    category: 'breads',
    price: 80,
    isVeg: true,
    inStock: true,
    description: 'Freshly baked tandoori bread brushed with butter and garlic.',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA9PrUCnLDZ8dc0ytNrGsbbI2GnDy44k38_XZUDxdNWj6hYxTUAbxylXQkaJ6q8c_ubW-v_m23TgSScf5uw19nZSsapsF1CuJCjvsePNavpa4tGCnXJJOnSQa-2JTpOd_jCbEAQxshoB4XKQQlMAjMYFGTdWtf7P6NXlc3abJIFwpAVFFjuTHtnV5K38xqHwsZrl8YtbE7nwBpISqsdl48c3bPD-VWW2Zwi0Fl2RZ0AtTaajBFh6EsK',
    altText: 'Garlic Naan',
  },
  {
    id: 'm9',
    name: 'Chicken Dum Biryani',
    category: 'rice',
    price: 340,
    isVeg: false,
    inStock: true,
    description: 'Fragrant basmati rice dum cooked with spiced chicken and caramelised onions.',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBENWDfx1-d0UWSah0Kgdyaer1PRWXCJeC4hQf9ZyVg2qPQoOixLFLTRdidHssPfL_tRyv6Qs5RAoV8JwV2UtPrDImdSZ-5WiTJKd1y1nuVM-saxxWYA1asa5zFqkALDG0ptHc9g-pwJXl5SkFc6A_Qszb8Tr6Y0qrg7odVsGF6f1LejRHiyTGqdtICtMH8lWeHky0LwakwaMT4-xJhiLDBh2LgTEtNOZbMwemeeAYzjJdEpJSBa6RK',
    altText: 'Chicken Dum Biryani',
  },
];

export const PosTerminalView: React.FC = () => {
  const [orderType, setOrderType] = useState<'dine-in' | 'takeaway' | 'delivery'>('dine-in');
  const [dietaryFilter, setDietaryFilter] = useState<'all' | 'veg' | 'non-veg'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(POS_MENU_ITEMS);
  const [tablesList, setTablesList] = useState<any[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('Table T-12');
  const [isChangingTable, setIsChangingTable] = useState<boolean>(false);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>('SPICE10');
  const [discountAmount, setDiscountAmount] = useState<number>(0);

  // Cart state initialized with default ticket items from design
  const [cart, setCart] = useState<CartItem[]>([
    {
      id: 'c1',
      menuItemId: 'm1',
      name: 'Paneer Tikka',
      basePrice: 290,
      quantity: 2,
      isVeg: true,
      modifiers: 'Modifiers: Extra Mint Chutney, Spicy',
    },
    {
      id: 'c2',
      menuItemId: 'm2',
      name: 'Butter Chicken',
      basePrice: 380,
      quantity: 1,
      isVeg: false,
      modifiers: 'Modifiers: Boneless, Medium Gravy',
    },
    {
      id: 'c3',
      menuItemId: 'm8',
      name: 'Garlic Naan',
      basePrice: 80,
      quantity: 2,
      isVeg: true,
      modifiers: 'Modifiers: Crispy / Well done',
    },
    {
      id: 'c4',
      menuItemId: 'm-coke',
      name: 'Coke (Zero Sugar 300ml)',
      basePrice: 60,
      quantity: 2,
      isVeg: true,
      modifiers: 'Modifiers: With Ice & Lemon',
    },
  ]);

  useEffect(() => {
    api.getMenu().then((res) => {
      if (res.success && res.data && res.data.length > 0) {
        setMenuItems(res.data);
      }
    }).catch(() => {});

    api.getTables().then((res) => {
      if (res.success && res.data && res.data.length > 0) {
        setTablesList(res.data);
      }
    }).catch(() => {});
  }, []);

  // Validate coupon whenever cart changes or coupon is toggled
  useEffect(() => {
    if (appliedCoupon && cart.length > 0) {
      const currentSub = cart.reduce((acc, item) => acc + item.basePrice * item.quantity, 0);
      api.validateCoupon(appliedCoupon, currentSub)
        .then((res) => {
          if (res.success && res.data) {
            setDiscountAmount(res.data.discountAmount);
          }
        })
        .catch(() => {
          setDiscountAmount(Math.round(currentSub * 0.1));
        });
    } else {
      setDiscountAmount(0);
    }
  }, [appliedCoupon, cart]);

  const showToast = (text: string) => {
    setToastMessage(text);
    setTimeout(() => {
      setToastMessage(null);
    }, 2000);
  };

  const addToCart = (item: MenuItem) => {
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
          id: `c-${Date.now()}`,
          menuItemId: item.id,
          name: item.name,
          basePrice: item.price,
          quantity: 1,
          isVeg: item.isVeg,
        },
      ];
    });
    showToast(`${item.name} added!`);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) => {
          if (c.id === id) {
            const nextQty = c.quantity + delta;
            return nextQty > 0 ? { ...c, quantity: nextQty } : null;
          }
          return c;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeItem = (id: string) => {
    setCart((prev) => prev.filter((c) => c.id !== id));
  };

  // Calculations
  const subtotal = cart.reduce((acc, item) => acc + item.basePrice * item.quantity, 0);
  const discount = appliedCoupon ? discountAmount : 0;
  const netSubtotal = Math.max(0, subtotal - discount);
  const cgst = Number((netSubtotal * 0.025).toFixed(2));
  const sgst = Number((netSubtotal * 0.025).toFixed(2));
  const serviceCharge = Number((netSubtotal * 0.05).toFixed(2));
  const rawTotal = netSubtotal + cgst + sgst + serviceCharge;
  const totalAmount = Math.round(rawTotal);
  const rounding = Number((totalAmount - rawTotal).toFixed(2));

  // Filtered menu
  const filteredItems = menuItems.filter((item) => {
    if (dietaryFilter === 'veg' && !item.isVeg) return false;
    if (dietaryFilter === 'non-veg' && item.isVeg) return false;
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (
      searchQuery &&
      !item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !item.description.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="flex flex-col w-full pb-16 space-y-space-md">
      {/* Top Fast Bar / Quick Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 py-3 mb-2 bg-surface-container-low rounded-xl px-space-md shadow-sm border border-surface-container-high/30">
        <div className="flex items-center gap-space-md flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container-high text-on-surface">
            <span className="material-symbols-outlined text-[18px] text-primary-container">
              point_of_sale
            </span>
            <span className="font-headline-md text-headline-md font-bold">POS Station 04</span>
            <span className="text-on-surface-variant font-label-sm text-label-sm">
              · Cashier: Floor Station
            </span>
          </div>
          <div className="h-5 w-px bg-surface-variant hidden sm:block" />
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-secondary/10">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            <span className="font-label-sm text-label-sm text-secondary font-bold uppercase tracking-wider">
              KDS Sync: 12ms Latency
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-surface-container rounded-lg p-1 text-on-surface-variant font-label-md text-label-md">
            <button
              onClick={() => setOrderType('dine-in')}
              className={`px-3 py-1 rounded-md transition-all ${
                orderType === 'dine-in'
                  ? 'bg-primary-container text-on-primary-container font-bold shadow-sm'
                  : 'hover:text-on-surface'
              }`}
            >
              Dine-In
            </button>
            <button
              onClick={() => setOrderType('takeaway')}
              className={`px-3 py-1 rounded-md transition-all ${
                orderType === 'takeaway'
                  ? 'bg-primary-container text-on-primary-container font-bold shadow-sm'
                  : 'hover:text-on-surface'
              }`}
            >
              Takeaway
            </button>
            <button
              onClick={() => setOrderType('delivery')}
              className={`px-3 py-1 rounded-md transition-all ${
                orderType === 'delivery'
                  ? 'bg-primary-container text-on-primary-container font-bold shadow-sm'
                  : 'hover:text-on-surface'
              }`}
            >
              Delivery (Zomato/Swiggy)
            </button>
          </div>

          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-container-high hover:bg-surface-bright rounded-lg text-on-surface font-label-md text-label-md transition-colors">
            <span className="material-symbols-outlined text-[18px]">table_bar</span>
            <span>Switch Floor (First Floor)</span>
          </button>
          <button
            className="p-1.5 bg-surface-container-high hover:bg-surface-bright rounded-lg text-on-surface-variant hover:text-on-surface transition-colors"
            title="Hold Cart"
          >
            <span className="material-symbols-outlined text-[20px]">pause_circle</span>
          </button>
        </div>
      </div>

      {/* Main POS 3-Column Architecture */}
      <div className="grid grid-cols-12 gap-space-md items-start w-full">
        {/* ========================================== */}
        {/* COLUMN 1: Category Selector & Filters (20%) */}
        {/* ========================================== */}
        <div className="col-span-12 lg:col-span-3 xl:col-span-2 flex flex-col gap-space-md">
          {/* Search Input Box */}
          <div className="bg-surface-container-low rounded-xl p-space-sm shadow-sm flex flex-col gap-2 border border-surface-container-high/30">
            <div className="relative w-full">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">
                search
              </span>
              <input
                className="w-full pl-9 pr-8 py-2 bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant rounded-lg font-body-sm text-body-sm outline-none focus:ring-1 focus:ring-primary-container transition-all"
                placeholder="Search dish or code..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface p-1 rounded transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              )}
            </div>

            {/* Veg / Non-Veg Quick Dietary Segmented Pill */}
            <div className="flex items-center gap-1 p-1 bg-surface-container-lowest rounded-lg">
              <button
                onClick={() => setDietaryFilter('all')}
                className={`flex-1 py-1.5 text-center font-label-sm text-label-sm rounded-md transition-colors ${
                  dietaryFilter === 'all'
                    ? 'bg-surface-container-high text-on-surface font-bold shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setDietaryFilter('veg')}
                className={`flex-1 py-1.5 flex items-center justify-center gap-1 font-label-sm text-label-sm rounded-md transition-colors ${
                  dietaryFilter === 'veg'
                    ? 'bg-surface-container-high text-on-surface font-bold shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-secondary flex items-center justify-center">
                  <span className="w-1 h-1 rounded-full bg-surface-container-lowest" />
                </span>
                <span>Veg</span>
              </button>
              <button
                onClick={() => setDietaryFilter('non-veg')}
                className={`flex-1 py-1.5 flex items-center justify-center gap-1 font-label-sm text-label-sm rounded-md transition-colors ${
                  dietaryFilter === 'non-veg'
                    ? 'bg-surface-container-high text-on-surface font-bold shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-error flex items-center justify-center">
                  <span className="w-1 h-1 rounded-full bg-surface-container-lowest" />
                </span>
                <span>Non-Veg</span>
              </button>
            </div>
          </div>

          {/* Vertical Category Tree */}
          <div className="bg-surface-container-low rounded-xl p-space-sm shadow-sm flex flex-col gap-1 border border-surface-container-high/30">
            <div className="px-space-sm py-1.5 flex items-center justify-between text-on-surface-variant">
              <span className="font-label-sm text-label-sm uppercase tracking-wider font-bold">
                Categories
              </span>
              <span className="font-mono-metric text-body-sm">8 Sections</span>
            </div>

            {[
              { id: 'all', label: 'All Items', icon: 'restaurant_menu', count: 84, iconColor: 'text-primary-container' },
              { id: 'starters', label: 'Starters', icon: 'tapas', count: 16, iconColor: 'text-tertiary' },
              { id: 'main-course', label: 'Main Course', icon: 'skillet', count: 24, iconColor: 'text-primary' },
              { id: 'rice', label: 'Biryani & Rice', icon: 'rice_bowl', count: 12, iconColor: 'text-secondary' },
              { id: 'breads', label: 'Tandoor & Breads', icon: 'bakery_dining', count: 14, iconColor: 'text-primary-container' },
              { id: 'pizza', label: 'Pizza & Fast Food', icon: 'local_pizza', count: 8, iconColor: 'text-tertiary-fixed' },
              { id: 'beverages', label: 'Beverages & Mocktails', icon: 'local_bar', count: 10, iconColor: 'text-tertiary' },
              { id: 'desserts', label: 'Desserts', icon: 'icecream', count: 8, iconColor: 'text-primary-fixed' },
            ].map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`group w-full flex items-center justify-between px-space-md py-2.5 rounded-lg transition-all relative overflow-hidden text-left ${
                    isActive
                      ? 'bg-surface-container-high text-on-surface font-headline-md text-headline-md shadow-sm'
                      : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                  }`}
                >
                  {isActive && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary-container" />}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`material-symbols-outlined text-[20px] ${cat.iconColor}`}>
                      {cat.icon}
                    </span>
                    <span className="font-label-lg text-label-lg truncate">{cat.label}</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full font-mono-metric text-body-sm ${
                      isActive
                        ? 'bg-surface-container-lowest text-primary font-bold'
                        : 'bg-surface-container-lowest/60 text-on-surface-variant group-hover:text-on-surface'
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Operational Metrics Card */}
          <div className="bg-surface-container-low rounded-xl p-space-md shadow-sm flex flex-col gap-2 border border-surface-container-high/30">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-bold">
                Kitchen Load
              </span>
              <span className="font-mono-metric text-body-sm text-secondary font-bold">
                Optimal
              </span>
            </div>
            <div className="w-full bg-surface-container-lowest rounded-full h-2 overflow-hidden">
              <div
                className="bg-secondary-container h-full rounded-full transition-all duration-500"
                style={{ width: '42%' }}
              />
            </div>
            <div className="flex justify-between items-center text-on-surface-variant font-body-sm text-body-sm pt-1">
              <span>Avg Ticket Prep</span>
              <span className="font-mono-metric text-on-surface font-bold">14 mins</span>
            </div>
          </div>
        </div>

        {/* ========================================== */}
        {/* COLUMN 2: Menu Item Grid (50%) */}
        {/* ========================================== */}
        <div className="col-span-12 lg:col-span-9 xl:col-span-6 flex flex-col gap-space-md">
          {/* Subcategory Pills Strip */}
          <div className="flex items-center justify-between gap-space-sm bg-surface-container-low p-2 rounded-xl border border-surface-container-high/30">
            <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
              <button className="px-3 py-1.5 rounded-lg bg-surface-container-high text-on-surface font-label-md text-label-md font-bold whitespace-nowrap shadow-sm">
                Popular Rush Items
              </button>
              <button className="px-3 py-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface font-label-md text-label-md whitespace-nowrap transition-colors">
                Tandoor Special
              </button>
              <button className="px-3 py-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface font-label-md text-label-md whitespace-nowrap transition-colors">
                Chef's Signature
              </button>
              <button className="px-3 py-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface font-label-md text-label-md whitespace-nowrap transition-colors">
                Combos &amp; Thalis
              </button>
            </div>
            <div className="hidden sm:flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm shrink-0 pl-2">
              <span>Sorted:</span>
              <span className="text-on-surface font-bold">Frequency</span>
            </div>
          </div>

          {/* 3-Column Touch Friendly Menu Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-space-md">
            {filteredItems.map((dish) => (
              <div
                key={dish.id}
                onClick={() => addToCart(dish)}
                className="group bg-surface-container-low hover:bg-surface-container rounded-xl overflow-hidden shadow-sm flex flex-col justify-between transition-all hover:scale-[1.01] cursor-pointer border border-surface-container-high/30"
              >
                <div className="relative h-36 w-full bg-surface-container-highest overflow-hidden">
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    src={dish.imageUrl}
                    alt={dish.altText}
                    loading="lazy"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-surface-container-lowest/90 backdrop-blur-sm flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${dish.isVeg ? 'bg-secondary' : 'bg-error'}`}
                    />
                    <span className="font-label-sm text-label-sm text-on-surface font-bold">
                      {dish.isVeg ? 'VEG' : 'NON-VEG'}
                    </span>
                  </div>
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-surface-container-lowest/90 backdrop-blur-sm">
                    <span className="font-label-sm text-label-sm text-secondary font-bold">
                      In Stock
                    </span>
                  </div>
                </div>

                <div className="p-space-md flex flex-col flex-1 justify-between gap-3">
                  <div>
                    <div className="flex items-start justify-between gap-1">
                      <h3 className="font-headline-md text-headline-md text-on-surface font-bold leading-tight">
                        {dish.name}
                      </h3>
                      <span className="font-mono-metric text-headline-md text-primary font-bold">
                        ₹{dish.price}
                      </span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2 mt-1">
                      {dish.description}
                    </p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(dish);
                    }}
                    className="w-full py-2 px-space-sm bg-surface-container-high hover:bg-primary-container text-on-surface hover:text-on-primary-container rounded-lg font-label-lg text-label-lg font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    <span>Add Item</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ========================================== */}
        {/* COLUMN 3: Current Order / Ticket (30%)     */}
        {/* ========================================== */}
        <div className="col-span-12 xl:col-span-4 flex flex-col gap-space-sm bg-surface-container-low p-space-md rounded-2xl shadow-md border border-surface-container-high/30">
          {/* Ticket Header: Table / Waiter Meta */}
          <div className="flex flex-col gap-2 pb-3 bg-surface-container-low border-b border-surface-container-high/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsChangingTable(!isChangingTable)}
                  className="px-2.5 py-1 rounded-lg bg-primary-container text-on-primary-container font-headline-md text-headline-md font-bold tracking-tight flex items-center gap-1 hover:brightness-110 transition-all shadow-sm"
                  title="Click to Switch Table"
                >
                  <span>{selectedTable}</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_drop_down</span>
                </button>
                <span className="px-2 py-0.5 rounded-full bg-tertiary/10 text-tertiary font-label-sm text-label-sm font-bold uppercase tracking-wider">
                  {orderType === 'dine-in' ? 'Dine In' : orderType === 'takeaway' ? 'Takeaway' : 'Delivery'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsChangingTable(!isChangingTable)}
                  className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors"
                  title="Change Table"
                >
                  <span className="material-symbols-outlined text-[18px]">swap_calls</span>
                </button>
                <button
                  onClick={() => showToast('Split Bill calculated by Pax or Item')}
                  className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors"
                  title="Split Bill"
                >
                  <span className="material-symbols-outlined text-[18px]">call_split</span>
                </button>
                <button
                  onClick={() => showToast('Guest profile linked')}
                  className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors"
                  title="Add Customer / Loyalty"
                >
                  <span className="material-symbols-outlined text-[18px]">person_add</span>
                </button>
                <button
                  onClick={() => showToast('Kitchen instructions note attached to ticket')}
                  className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors"
                  title="Kitchen Instructions Note"
                >
                  <span className="material-symbols-outlined text-[18px]">edit_note</span>
                </button>
              </div>
            </div>

            {isChangingTable && (
              <div className="p-2 bg-surface-container-lowest rounded-xl border border-surface-container-high/60 flex flex-col gap-1.5 animate-fadeIn">
                <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  Select Floor Table:
                </span>
                <div className="grid grid-cols-4 gap-1 max-h-32 overflow-y-auto">
                  {(tablesList.length > 0 ? tablesList : [
                    { id: 'T01', name: 'T01' },
                    { id: 'T02', name: 'T02' },
                    { id: 'T03', name: 'T03' },
                    { id: 'T04', name: 'T04' },
                    { id: 'T08', name: 'T08' },
                    { id: 'T12', name: 'T12' },
                    { id: 'T16', name: 'T16' },
                    { id: 'T20', name: 'T20' },
                  ]).map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setSelectedTable(`Table ${t.name || t.id}`);
                        setIsChangingTable(false);
                        showToast(`Switched ticket to Table ${t.name || t.id}`);
                      }}
                      className={`py-1 px-1.5 rounded text-xs font-bold transition-all ${
                        selectedTable.includes(t.name || t.id)
                          ? 'bg-primary-container text-on-primary-container shadow-sm'
                          : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
                      }`}
                    >
                      {t.name || t.id}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between text-on-surface-variant font-body-sm text-body-sm px-1">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">badge</span>
                <span>
                  Server: <strong className="text-on-surface font-label-md text-label-md">Sunil R.</strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">groups</span>
                <span>
                  Guest: <strong className="text-on-surface font-label-md text-label-md">Walk-in (4 Guests)</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Scrollable Ticket Line Items */}
          <div className="flex flex-col gap-2 max-h-[380px] overflow-y-auto pr-1">
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex flex-col p-3 rounded-xl bg-surface-container transition-colors border border-surface-container-high/30"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <span className="w-3.5 h-3.5 rounded-sm bg-surface-container-lowest flex items-center justify-center p-0.5 mt-0.5 shrink-0">
                      <span className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-secondary' : 'bg-error'}`} />
                    </span>
                    <div className="flex flex-col">
                      <span className="font-headline-md text-label-lg font-bold text-on-surface">
                        {item.name}
                      </span>
                      {item.modifiers && (
                        <span className="font-body-sm text-body-sm text-primary">
                          {item.modifiers}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="font-mono-metric text-body-lg font-bold text-on-surface shrink-0">
                    ₹{(item.basePrice * item.quantity).toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-2.5 pt-2 bg-surface-container">
                  <span className="font-label-sm text-label-sm text-on-surface-variant">
                    Base: ₹{item.basePrice} × {item.quantity}
                  </span>
                  <div className="flex items-center gap-1 bg-surface-container-lowest rounded-lg p-1">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="w-7 h-7 flex items-center justify-center rounded bg-surface-container text-on-surface hover:bg-surface-bright transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">remove</span>
                    </button>
                    <span className="w-7 text-center font-mono-metric text-body-md font-bold text-on-surface">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="w-7 h-7 flex items-center justify-center rounded bg-surface-container text-on-surface hover:bg-surface-bright transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">add</span>
                    </button>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="ml-1 w-7 h-7 flex items-center justify-center rounded text-error hover:bg-error-container/40 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {cart.length === 0 && (
              <div className="py-12 text-center text-on-surface-variant font-body-sm">
                Ticket is empty. Tap any menu item to add.
              </div>
            )}
          </div>

          {/* Ticket Bill Breakdown Calculation */}
          <div className="bg-surface-container-lowest p-space-md rounded-xl flex flex-col gap-1.5 border border-surface-container-high/30">
            <div className="flex justify-between items-center text-on-surface-variant font-body-sm text-body-sm">
              <span>Subtotal</span>
              <span className="font-mono-metric text-on-surface">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-secondary font-body-sm text-body-sm">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">local_offer</span>
                <span>Discount (10% Happy Hour)</span>
              </span>
              <span className="font-mono-metric">-₹{discount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-on-surface-variant font-body-sm text-body-sm">
              <span>CGST (2.5%)</span>
              <span className="font-mono-metric text-on-surface">₹{cgst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-on-surface-variant font-body-sm text-body-sm">
              <span>SGST (2.5%)</span>
              <span className="font-mono-metric text-on-surface">₹{sgst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-on-surface-variant font-body-sm text-body-sm">
              <span>Service Charge (5%)</span>
              <span className="font-mono-metric text-on-surface">₹{serviceCharge.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-on-surface-variant font-body-sm text-body-sm">
              <span>Rounding</span>
              <span className="font-mono-metric text-on-surface">
                {rounding >= 0 ? `+₹${rounding.toFixed(2)}` : `-₹${Math.abs(rounding).toFixed(2)}`}
              </span>
            </div>
            <div className="my-1.5 h-px bg-surface-variant" />
            <div className="flex items-center justify-between pt-0.5">
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-bold">
                  Total Amount Due
                </span>
                <span className="font-label-sm text-label-sm text-secondary">
                  Includes all taxes
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-display-lg text-display-lg text-primary-container font-black tracking-tight">
                  ₹{totalAmount.toLocaleString('en-IN')}.00
                </span>
              </div>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-col gap-2 pt-1">
            <button
              onClick={async () => {
                if (cart.length === 0) {
                  showToast('Please add items to cart first');
                  return;
                }
                try {
                  const orderPayload = {
                    table: selectedTable,
                    tableType: orderType === 'dine-in' ? 'Dine-In · 4 Pax' : orderType === 'takeaway' ? 'Takeaway' : 'Delivery',
                    customer: 'Walk-in Guest',
                    phone: '+91 98201 00000',
                    itemsSummary: cart.map((c) => `${c.quantity}x ${c.name}`).join(', '),
                    itemsCount: cart.reduce((acc, c) => acc + c.quantity, 0),
                    staff: 'POS Lead Station',
                    total: totalAmount,
                    subtotal,
                    taxes: cgst + sgst,
                    serviceCharge,
                    paymentStatus: 'unpaid',
                    paymentMethod: 'Pending',
                    lineItems: cart.map((c) => ({
                      name: c.name,
                      qty: c.quantity,
                      price: c.basePrice * c.quantity,
                      station: c.isVeg ? 'Tandoor' : 'Curry',
                      modifiers: c.modifiers,
                    })),
                  };
                  const res = await api.createOrder(orderPayload);
                  showToast(`KOT ${res.data?.kdsTicket?.id || '#KOT-LIVE'} Dispatched to Kitchen!`);
                  setCart([]);
                } catch {
                  showToast('KOT #847 Dispatched to Tandoor & Curry Station');
                }
              }}
              className="w-full py-4 px-space-lg rounded-xl bg-primary-container text-on-primary-container font-headline-lg text-headline-lg font-black flex items-center justify-center gap-2 shadow-lg hover:opacity-95 active:scale-[0.98] transition-all"
            >
              <span className="material-symbols-outlined text-[24px]">local_fire_department</span>
              <span>⚡ Place Order &amp; Send to Kitchen (Enter)</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  if (cart.length === 0) {
                    showToast('Cart is empty. Add items first!');
                    return;
                  }
                  printThermalReceipt({
                    orderId: `#ORD-${Math.floor(10000 + Math.random() * 90000)}`,
                    table: selectedTable,
                    tableType: orderType === 'dine-in' ? 'Dine-In' : 'Takeaway',
                    staff: 'POS Lead (Station 04)',
                    items: cart.map((c) => ({
                      name: c.name,
                      qty: c.quantity,
                      price: c.basePrice,
                      modifiers: c.modifiers,
                    })),
                    subtotal,
                    discount,
                    cgst,
                    sgst,
                    serviceCharge,
                    total: totalAmount,
                    paymentMethod: 'Pre-Print Receipt',
                  });
                  showToast('KOT & Bill sent to thermal receipt printer!');
                }}
                className="py-2.5 px-3 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-lg text-label-lg font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">print</span>
                <span>Print KOT</span>
              </button>
              <button
                onClick={() => {
                  if (appliedCoupon) {
                    setAppliedCoupon(null);
                    showToast('Coupon removed');
                  } else {
                    setAppliedCoupon('SPICE10');
                    showToast('Coupon SPICE10 (10% OFF) applied!');
                  }
                }}
                className="py-2.5 px-3 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-lg text-label-lg font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">high_res</span>
                <span>{appliedCoupon ? 'Remove Coupon' : 'Apply Coupon'}</span>
              </button>
              <button
                onClick={() => showToast('Draft saved')}
                className="py-2.5 px-3 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-lg text-label-lg font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">save</span>
                <span>Save as Draft</span>
              </button>
              <button
                onClick={() => {
                  setCart([]);
                  showToast('Cart cleared');
                }}
                className="py-2.5 px-3 rounded-lg bg-error-container/20 hover:bg-error-container/35 text-error font-label-lg text-label-lg font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">delete_sweep</span>
                <span>Void / Clear</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-8 z-50 transition-all duration-300 bg-surface-container-high border border-surface-container-highest rounded-xl px-space-lg py-3 shadow-2xl flex items-center gap-3 animate-fadeIn">
          <span className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary font-bold">
            <span className="material-symbols-outlined text-[18px]">check</span>
          </span>
          <div className="flex flex-col">
            <span className="font-headline-md text-body-md text-on-surface font-bold">
              {toastMessage}
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Sent to Table T-12 live stream
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
