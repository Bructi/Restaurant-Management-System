import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { subscribeRealtime } from '../../hooks/useRealtimeSync';
import { useToast } from '../../contexts/ToastContext';
import { downloadCsv, printQrMenuSheet } from '../../utils/exportUtils';

interface MenuItemDetail {
  id: string;
  sku?: string;
  name: string;
  category: string;
  price: number;
  cost: number;
  foodCostPct: number;
  marginPct: number;
  matrixTier: 'Star' | 'Plowhorse' | 'Puzzle' | 'Dog';
  isVeg: boolean;
  inStock: boolean;
  dineInActive: boolean;
  onlineActive: boolean;
  imageUrl: string;
  description: string;
}

const MOCK_CATALOG: MenuItemDetail[] = [
  {
    id: 'SKU-101',
    name: 'Butter Chicken (Handi)',
    category: 'Mains',
    price: 380,
    cost: 108,
    foodCostPct: 28.4,
    marginPct: 71.6,
    matrixTier: 'Star',
    isVeg: false,
    inStock: true,
    dineInActive: true,
    onlineActive: true,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDH8LH1fdiIdDAAuM87hOyrSr5o0N_k21tQrJ62lukG9qcewaJ3scqOfcOI8BTTj0kp5I7WxsdMEhkIDsgIddnzgGIkknVVFk4OPoTBnXY1zeyz7kFzDVa_s5BQFHdWy-zQchP8Jki9oFwlcj1REaKmgoXsiKRs4tHCJXUV93jNIH3eTbsjuyD33aqAqPsKcoEtlT-4EGRlxKbXUVTXIGci17x0zWNBxPLSV2-W6Lc90T-fxaV7E-Vq',
    description: 'Tandoori boneless chicken in rich makhani gravy with cashew paste and cream.',
  },
  {
    id: 'SKU-102',
    name: 'Paneer Tikka (Tandoor)',
    category: 'Starters',
    price: 290,
    cost: 72,
    foodCostPct: 24.8,
    marginPct: 75.2,
    matrixTier: 'Star',
    isVeg: true,
    inStock: true,
    dineInActive: true,
    onlineActive: true,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCp_6CFR3E-8f37S3fRDufLwRpCRWr4UmocpRyuHFSetsbzBmXbMkNSBtpShT6_Pft40jHQkyG2WrmcTizjo3WsSl_8Ng48_1mI1U_AplNCGFH1TfIccLd_xFA97TESR97G_CGhbuVeIaM22wXEw1Fi5pYJPRYZFYbz7CY_LeJrT7N06th1UTYmwhkuSXHlwcNED8ZQP3N7yy-MnLV_7Lnk-adRqs0-Q_E21-yTwQONnIY1dwVblzw6',
    description: 'Charcoal grilled cottage cheese marinated with ajwain, turmeric, and hung curd.',
  },
  {
    id: 'SKU-103',
    name: 'Garlic Naan',
    category: 'Breads',
    price: 80,
    cost: 14,
    foodCostPct: 17.5,
    marginPct: 82.5,
    matrixTier: 'Plowhorse',
    isVeg: true,
    inStock: true,
    dineInActive: true,
    onlineActive: true,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA9PrUCnLDZ8dc0ytNrGsbbI2GnDy44k38_XZUDxdNWj6hYxTUAbxylXQkaJ6q8c_ubW-v_m23TgSScf5uw19nZSsapsF1CuJCjvsePNavpa4tGCnXJJOnSQa-2JTpOd_jCbEAQxshoB4XKQQlMAjMYFGTdWtf7P6NXlc3abJIFwpAVFFjuTHtnV5K38xqHwsZrl8YtbE7nwBpISqsdl48c3bPD-VWW2Zwi0Fl2RZ0AtTaajBFh6EsK',
    description: 'Refined flour leavened flatbread brushed with butter and minced roasted garlic.',
  },
  {
    id: 'SKU-104',
    name: 'Chicken Dum Biryani',
    category: 'Rice',
    price: 340,
    cost: 112,
    foodCostPct: 32.9,
    marginPct: 67.1,
    matrixTier: 'Star',
    isVeg: false,
    inStock: true,
    dineInActive: true,
    onlineActive: true,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBENWDfx1-d0UWSah0Kgdyaer1PRWXCJeC4hQf9ZyVg2qPQoOixLFLTRdidHssPfL_tRyv6Qs5RAoV8JwV2UtPrDImdSZ-5WiTJKd1y1nuVM-saxxWYA1asa5zFqkALDG0ptHc9g-pwJXl5SkFc6A_Qszb8Tr6Y0qrg7odVsGF6f1LejRHiyTGqdtICtMH8lWeHky0LwakwaMT4-xJhiLDBh2LgTEtNOZbMwemeeAYzjJdEpJSBa6RK',
    description: 'Layered aromatic basmati rice cooked on dum with saffron, mint, and whole spices.',
  },
];

export const MenuManagementView: React.FC = () => {
  const toast = useToast();
  const [catalog, setCatalog] = useState<MenuItemDetail[]>(MOCK_CATALOG);
  const [dietFilter, setDietFilter] = useState<'all' | 'veg' | 'non-veg' | 'jain'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDishOpen, setIsAddDishOpen] = useState(false);
  const [newDishName, setNewDishName] = useState('');
  const [newDishCategory, setNewDishCategory] = useState('starters');
  const [newDishPrice, setNewDishPrice] = useState(250);
  const [newDishCost, setNewDishCost] = useState(65);
  const [newDishIsVeg, setNewDishIsVeg] = useState(true);
  const [newDishDesc, setNewDishDesc] = useState('');

  const fetchMenu = () => {
    api.getMenu().then((res) => {
      if (res.success && res.data && res.data.length > 0) {
        setCatalog(res.data);
      }
    }).catch(() => {});
  };

  useEffect(() => {
    fetchMenu();

    const unsub = subscribeRealtime((event) => {
      if (event.type === 'MENU_STOCK_TOGGLED' || event.type === 'MENU_ITEM_ADDED') {
        fetchMenu();
      }
    });

    return () => unsub();
  }, []);

  const toggleStock = async (id: string) => {
    setCatalog((prev) =>
      prev.map((item) => (item.id === id || item.sku === id ? { ...item, inStock: !item.inStock } : item))
    );
    try {
      await api.toggleMenuStock(id);
    } catch {}
  };

  const filteredCatalog = catalog.filter((item) => {
    if (dietFilter === 'veg' && !item.isVeg) return false;
    if (dietFilter === 'non-veg' && item.isVeg) return false;
    if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="flex flex-col w-full pb-16 space-y-space-md">
      {/* Top Command & Title Header */}
      <div className="flex flex-col gap-space-md pt-2">
        <div className="flex flex-col 2xl:flex-row 2xl:items-center justify-between gap-space-md">
          <div>
            <div className="flex items-center gap-space-sm mb-1">
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm uppercase tracking-wider font-semibold">
                Catalog &amp; Margin Matrix
              </span>
              <span className="text-on-surface-variant font-label-sm text-label-sm">
                • SpiceRoute Kitchen #01
              </span>
            </div>
            <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight font-bold">
              Menu Engineering &amp; Catalog Management
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-4xl mt-0.5">
              Manage live menu items, recipes, food cost margins, tax slabs, and real-time 86/out-of-stock toggles across dine-in and online delivery channels.
            </p>
          </div>

          {/* Action Cluster */}
          <div className="flex flex-wrap items-center gap-space-sm shrink-0">
            <button
              onClick={() => {
                const headers = [
                  'Dish ID',
                  'SKU',
                  'Dish Name',
                  'Category',
                  'Price (INR)',
                  'Food Cost (INR)',
                  'Food Cost %',
                  'Gross Margin %',
                  'BCG Matrix Tier',
                  'Dietary (Veg)',
                  'In Stock',
                  'Dine-In Enabled',
                  'Online Enabled',
                  'Description',
                ];
                const rows = catalog.map((d) => [
                  d.id,
                  d.sku || d.id,
                  d.name,
                  d.category,
                  d.price,
                  d.cost,
                  `${d.foodCostPct}%`,
                  `${d.marginPct}%`,
                  d.matrixTier,
                  d.isVeg ? 'Vegetarian' : 'Non-Veg',
                  d.inStock ? 'In Stock' : '86 (Out of Stock)',
                  d.dineInActive ? 'Yes' : 'No',
                  d.onlineActive ? 'Yes' : 'No',
                  d.description || '',
                ]);
                downloadCsv('restoflow-menu-price-list.csv', headers, rows);
                toast.success(`Downloaded ${catalog.length} menu items as CSV!`, 'Price List Exported');
              }}
              className="flex items-center gap-1.5 px-space-md py-2 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-md text-label-md transition-colors shadow-sm border border-surface-container-high/40 font-semibold"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              <span>Export Price List</span>
            </button>
            <button
              onClick={() => {
                printQrMenuSheet('SpiceRoute Kitchen #01');
                toast.info('Opened Table QR Menu Codes print window', 'Print QR Codes');
              }}
              className="flex items-center gap-1.5 px-space-md py-2 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-md text-label-md transition-colors shadow-sm border border-surface-container-high/40 font-semibold"
            >
              <span className="material-symbols-outlined text-[18px]">qr_code_2</span>
              <span>Print QR Menu</span>
            </button>
            <button
              onClick={() => toast.warning('86 Manager: Toggle in-stock switches below to instantly mark items out of stock across POS & aggregators.', '86 Stock Mode')}
              className="flex items-center gap-1.5 px-space-md py-2 rounded-lg bg-error-container/20 text-error hover:bg-error-container/40 font-label-md text-label-md transition-colors shadow-sm font-semibold"
            >
              <span className="material-symbols-outlined text-[18px]">block</span>
              <span>Bulk 86 Manager</span>
            </button>
            <button
              onClick={() => setIsAddDishOpen(true)}
              className="flex items-center gap-1.5 px-space-md py-2 rounded-lg bg-primary-container text-on-primary-container hover:brightness-110 font-label-lg font-bold transition-all shadow-md"
            >
              <span className="material-symbols-outlined text-[20px]">add_circle</span>
              <span>+ Add New Item</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Ribbon */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-space-md pt-space-xs">
          <div className="flex items-center gap-space-sm flex-1 max-w-2xl">
            <div className="relative w-full">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
                search
              </span>
              <input
                className="w-full bg-surface-container-low pl-10 pr-10 py-2.5 rounded-lg text-on-surface placeholder:text-on-surface-variant font-body-sm text-body-sm outline-none shadow-sm focus:bg-surface-container transition-all border border-surface-container-high/40"
                placeholder="Search by dish name, SKU, recipe item, or allergen..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm shadow-inner">
                /
              </kbd>
            </div>
          </div>

          <div className="flex items-center gap-space-sm flex-wrap shrink-0">
            <div className="flex items-center p-1 rounded-lg bg-surface-container-low border border-surface-container-high/40">
              <button
                onClick={() => setDietFilter('all')}
                className={`px-space-md py-1.5 rounded-md font-label-sm text-label-sm shadow-sm flex items-center gap-1.5 ${
                  dietFilter === 'all'
                    ? 'bg-surface-container text-on-surface font-bold'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-surface-bright" /> All Diets
              </button>
              <button
                onClick={() => setDietFilter('veg')}
                className={`px-space-md py-1.5 rounded-md font-label-sm text-label-sm flex items-center gap-1.5 transition-colors ${
                  dietFilter === 'veg'
                    ? 'bg-surface-container text-on-surface font-bold'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-secondary" /> Veg (48)
              </button>
              <button
                onClick={() => setDietFilter('non-veg')}
                className={`px-space-md py-1.5 rounded-md font-label-sm text-label-sm flex items-center gap-1.5 transition-colors ${
                  dietFilter === 'non-veg'
                    ? 'bg-surface-container text-on-surface font-bold'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-primary-container" /> Non-Veg (36)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* BCG Matrix Engineering Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        <div className="p-space-md bg-surface-container-low rounded-xl flex items-center justify-between border border-surface-container-high/30">
          <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase text-secondary">★ Stars (High Vol / High Margin)</span>
            <span className="font-headline-xl text-on-surface font-bold mt-1">18 Dishes</span>
            <span className="text-xs text-on-surface-variant">Butter Chicken, Paneer Tikka</span>
          </div>
          <span className="material-symbols-outlined text-secondary text-[28px]">stars</span>
        </div>

        <div className="p-space-md bg-surface-container-low rounded-xl flex items-center justify-between border border-surface-container-high/30">
          <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase text-primary">🐎 Plowhorses (High Vol / Low Margin)</span>
            <span className="font-headline-xl text-on-surface font-bold mt-1">24 Dishes</span>
            <span className="text-xs text-on-surface-variant">Garlic Naan, Roti Breads</span>
          </div>
          <span className="material-symbols-outlined text-primary text-[28px]">trending_up</span>
        </div>

        <div className="p-space-md bg-surface-container-low rounded-xl flex items-center justify-between border border-surface-container-high/30">
          <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase text-tertiary">🧩 Puzzles (Low Vol / High Margin)</span>
            <span className="font-headline-xl text-on-surface font-bold mt-1">12 Dishes</span>
            <span className="text-xs text-on-surface-variant">Lobster Curry, Saffron Kheer</span>
          </div>
          <span className="material-symbols-outlined text-tertiary text-[28px]">psychology</span>
        </div>

        <div className="p-space-md bg-surface-container-low rounded-xl flex items-center justify-between border border-surface-container-high/30">
          <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase text-error">🐕 Dogs (Low Vol / Low Margin)</span>
            <span className="font-headline-xl text-on-surface font-bold mt-1">8 Dishes</span>
            <span className="text-xs text-error font-medium">Re-evaluate or 86 item</span>
          </div>
          <span className="material-symbols-outlined text-error text-[28px]">warning</span>
        </div>
      </div>

      {/* Catalog Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-space-md">
        {filteredCatalog.map((dish) => (
          <div
            key={dish.id}
            className="bg-surface-container-low rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between border border-surface-container-high/30 transition-all hover:border-surface-container-high"
          >
            <div className="relative h-44 w-full bg-surface-container-highest overflow-hidden">
              <img
                src={dish.imageUrl}
                alt={dish.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-surface-container-lowest/90 backdrop-blur-sm flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${dish.isVeg ? 'bg-secondary' : 'bg-error'}`} />
                <span className="font-label-sm text-label-sm text-on-surface font-bold">
                  {dish.isVeg ? 'VEG' : 'NON-VEG'}
                </span>
              </div>

              <button
                onClick={() => toggleStock(dish.id)}
                className={`absolute top-2 right-2 px-2.5 py-1 rounded-full font-label-sm text-label-sm font-bold shadow-md transition-all ${
                  dish.inStock
                    ? 'bg-secondary/90 text-on-secondary'
                    : 'bg-error text-on-error'
                }`}
              >
                {dish.inStock ? 'In Stock (Live)' : '86’d (Blocked)'}
              </button>
            </div>

            <div className="p-space-md flex flex-col flex-1 justify-between gap-3">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-headline-md text-headline-md font-bold text-on-surface leading-tight">
                    {dish.name}
                  </h3>
                  <span className="font-mono-metric text-primary font-bold text-lg">
                    ₹{dish.price}
                  </span>
                </div>
                <p className="text-body-sm text-on-surface-variant line-clamp-2 mt-1">
                  {dish.description}
                </p>
              </div>

              {/* Costing & Margins */}
              <div className="p-3 bg-surface-container-lowest rounded-xl flex flex-col gap-1.5 font-body-sm border border-surface-container-high/30">
                <div className="flex justify-between text-xs">
                  <span className="text-on-surface-variant">Recipe Cost: ₹{dish.cost}</span>
                  <span className="text-secondary font-bold font-mono-metric">
                    Margin: {dish.marginPct}%
                  </span>
                </div>
                <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-secondary h-full rounded-full"
                    style={{ width: `${dish.marginPct}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-surface-container-high/30">
                <span className="text-xs text-on-surface-variant font-mono-metric">
                  {dish.id} · GST 5%
                </span>
                <button
                  onClick={() => toast.info(`Editing recipe & cost margins for ${dish.name}`, 'Recipe Editor')}
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                >
                  <span>Edit Recipe</span>
                  <span className="material-symbols-outlined text-[14px]">edit</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add New Dish Modal */}
      {isAddDishOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-surface-container rounded-2xl p-space-lg shadow-2xl border border-surface-container-high flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-surface-container-high/40 pb-3">
              <h3 className="font-headline-md font-bold text-on-surface">Add Menu Dish</h3>
              <button
                onClick={() => setIsAddDishOpen(false)}
                className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-3 font-body-sm">
              <div>
                <label className="text-xs font-bold uppercase text-on-surface-variant block mb-1">
                  Dish Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mutton Rogan Josh"
                  value={newDishName}
                  onChange={(e) => setNewDishName(e.target.value)}
                  className="w-full bg-surface-container-lowest p-2.5 rounded-lg text-on-surface border border-surface-container-high/40 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase text-on-surface-variant block mb-1">
                    Category
                  </label>
                  <select
                    value={newDishCategory}
                    onChange={(e) => setNewDishCategory(e.target.value)}
                    className="w-full bg-surface-container-lowest p-2.5 rounded-lg text-on-surface border border-surface-container-high/40 outline-none"
                  >
                    <option value="starters">Starters</option>
                    <option value="main-course">Main Course</option>
                    <option value="rice">Biryani &amp; Rice</option>
                    <option value="breads">Tandoor &amp; Breads</option>
                    <option value="desserts">Desserts</option>
                    <option value="beverages">Beverages</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-on-surface-variant block mb-1">
                    Dietary Type
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => setNewDishIsVeg(true)}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold ${
                        newDishIsVeg ? 'bg-secondary text-on-secondary' : 'bg-surface-container-lowest'
                      }`}
                    >
                      Veg
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewDishIsVeg(false)}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold ${
                        !newDishIsVeg ? 'bg-error text-on-error' : 'bg-surface-container-lowest'
                      }`}
                    >
                      Non-Veg
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase text-on-surface-variant block mb-1">
                    Menu Price (₹)
                  </label>
                  <input
                    type="number"
                    value={newDishPrice}
                    onChange={(e) => setNewDishPrice(Number(e.target.value))}
                    className="w-full bg-surface-container-lowest p-2.5 rounded-lg text-on-surface border border-surface-container-high/40 outline-none font-mono-metric"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-on-surface-variant block mb-1">
                    Recipe Cost (₹)
                  </label>
                  <input
                    type="number"
                    value={newDishCost}
                    onChange={(e) => setNewDishCost(Number(e.target.value))}
                    className="w-full bg-surface-container-lowest p-2.5 rounded-lg text-on-surface border border-surface-container-high/40 outline-none font-mono-metric"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-on-surface-variant block mb-1">
                  Short Description
                </label>
                <textarea
                  rows={2}
                  value={newDishDesc}
                  onChange={(e) => setNewDishDesc(e.target.value)}
                  placeholder="e.g. Slow simmered Kashmiri spiced meat curry..."
                  className="w-full bg-surface-container-lowest p-2.5 rounded-lg text-on-surface border border-surface-container-high/40 outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-surface-container-high/40">
              <button
                onClick={() => setIsAddDishOpen(false)}
                className="px-4 py-2 rounded-lg bg-surface-container text-on-surface text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!newDishName) {
                    toast.warning('Please enter a dish name', 'Missing Name');
                    return;
                  }
                  try {
                    const margin = Number((((newDishPrice - newDishCost) / newDishPrice) * 100).toFixed(1));
                    await api.addMenuItem({
                      name: newDishName,
                      category: newDishCategory,
                      price: newDishPrice,
                      cost: newDishCost,
                      foodCostPct: Number(((newDishCost / newDishPrice) * 100).toFixed(1)),
                      marginPct: margin,
                      isVeg: newDishIsVeg,
                      description: newDishDesc,
                      matrixTier: margin > 70 ? 'Star' : 'Plowhorse',
                      imageUrl:
                        'https://lh3.googleusercontent.com/aida-public/AB6AXuDH8LH1fdiIdDAAuM87hOyrSr5o0N_k21tQrJ62lukG9qcewaJ3scqOfcOI8BTTj0kp5I7WxsdMEhkIDsgIddnzgGIkknVVFk4OPoTBnXY1zeyz7kFzDVa_s5BQFHdWy-zQchP8Jki9oFwlcj1REaKmgoXsiKRs4tHCJXUV93jNIH3eTbsjuyD33aqAqPsKcoEtlT-4EGRlxKbXUVTXIGci17x0zWNBxPLSV2-W6Lc90T-fxaV7E-Vq',
                      altText: newDishName,
                    });
                    setIsAddDishOpen(false);
                    setNewDishName('');
                    setNewDishDesc('');
                    toast.success(`Added ${newDishName} (₹${newDishPrice}) to menu catalog!`, 'Menu Updated');
                    fetchMenu();
                  } catch (err: any) {
                    toast.error(err.message || 'Error adding dish', 'Failed');
                  }
                }}
                className="px-4 py-2 rounded-lg bg-primary-container text-on-primary-container text-sm font-bold shadow-md hover:brightness-110"
              >
                Add to Menu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
