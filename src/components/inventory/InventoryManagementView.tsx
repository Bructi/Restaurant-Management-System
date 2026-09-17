import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { subscribeRealtime } from '../../hooks/useRealtimeSync';
import { useToast } from '../../contexts/ToastContext';
import { downloadCsv, downloadJson } from '../../utils/exportUtils';

interface StockItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  unit: string;
  parLevel: number;
  reorderPoint: number;
  unitCost: number;
  valuation: number;
  status: 'healthy' | 'low' | 'critical';
  supplier: string;
}

const MOCK_STOCK: StockItem[] = [
  {
    id: 'ING-014',
    name: 'Fresh Paneer (Malai Block)',
    category: 'Dairy',
    currentStock: 4.5,
    unit: 'kg',
    parLevel: 25,
    reorderPoint: 8,
    unitCost: 320,
    valuation: 1440,
    status: 'low',
    supplier: 'Amul Dairy Dist. Bangalore',
  },
  {
    id: 'ING-008',
    name: 'Spring Chicken (Skinless Cut)',
    category: 'Meat',
    currentStock: 18.2,
    unit: 'kg',
    parLevel: 40,
    reorderPoint: 15,
    unitCost: 220,
    valuation: 4004,
    status: 'healthy',
    supplier: 'Suguna Fresh Meats',
  },
  {
    id: 'ING-032',
    name: 'Basmati Rice (Daawat Royal)',
    category: 'Staples',
    currentStock: 95.0,
    unit: 'kg',
    parLevel: 150,
    reorderPoint: 40,
    unitCost: 110,
    valuation: 10450,
    status: 'healthy',
    supplier: 'Metro Cash & Carry',
  },
  {
    id: 'ING-055',
    name: 'Amul Salted Butter (500g)',
    category: 'Dairy',
    currentStock: 2.0,
    unit: 'blocks',
    parLevel: 20,
    reorderPoint: 5,
    unitCost: 275,
    valuation: 550,
    status: 'critical',
    supplier: 'Amul Direct Depot',
  },
  {
    id: 'ING-091',
    name: 'Kashmiri Deggi Mirch Powder',
    category: 'Spices',
    currentStock: 12.5,
    unit: 'kg',
    parLevel: 15,
    reorderPoint: 4,
    unitCost: 550,
    valuation: 6875,
    status: 'healthy',
    supplier: 'MDH Wholesale Hub',
  },
];

export const InventoryManagementView: React.FC = () => {
  const toast = useToast();
  const [stockList, setStockList] = useState<StockItem[]>(MOCK_STOCK);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isReceiveOpen, setIsReceiveOpen] = useState(false);
  const [isWasteOpen, setIsWasteOpen] = useState(false);
  const [selectedStockId, setSelectedStockId] = useState('ING-014');
  const [receivedQty, setReceivedQty] = useState(10);
  const [wasteItem, setWasteItem] = useState('Fresh Paneer');
  const [wasteQty, setWasteQty] = useState('1.5 kg');
  const [wasteReason, setWasteReason] = useState('Expiry / Shelf life exceeded');
  const [wasteCost, setWasteCost] = useState(480);
  const [runningN8nSupply, setRunningN8nSupply] = useState(false);
  const [inventoryTab, setInventoryTab] = useState<'stock' | 'pos' | 'suppliers'>('stock');
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);

  const handleRunN8nSupply = async () => {
    try {
      setRunningN8nSupply(true);
      const res = await api.triggerAutoSupply('force_full_replenish');
      if (res.success) {
        toast.success(
          `⚡ n8n Auto-Supply generated ${res.data?.summary?.totalPOsGenerated || 3} Purchase Orders & restocked inventory!`,
          'n8n Auto-Restock Success'
        );
        fetchInventory();
        fetchPurchaseOrders();
      }
    } catch (err: any) {
      toast.error(err.message || 'n8n supply workflow failed', 'Workflow Error');
    } finally {
      setRunningN8nSupply(false);
    }
  };

  const fetchInventory = () => {
    api.getInventory().then((res) => {
      if (res.success && res.data && res.data.length > 0) {
        setStockList(res.data);
      }
    }).catch(() => {});
  };

  const fetchPurchaseOrders = () => {
    api.getPurchaseOrders().then((res) => {
      if (res.success && res.data) {
        setPurchaseOrders(res.data);
      }
    }).catch(() => {});
  };

  useEffect(() => {
    fetchInventory();
    fetchPurchaseOrders();

    const unsub = subscribeRealtime((event) => {
      if (event.type === 'STOCK_UPDATED' || event.type === 'INVENTORY_AUTOSUPPLY_COMPLETED') {
        fetchInventory();
        fetchPurchaseOrders();
      }
    });

    return () => unsub();
  }, []);

  const filteredStock = stockList.filter((item) => {
    if (categoryFilter !== 'all' && item.category.toLowerCase() !== categoryFilter) return false;
    if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="flex flex-col w-full pb-16 space-y-space-md">
      {/* Top Banner & Context Header */}
      <div className="flex flex-col gap-space-md pt-2">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-space-md">
          <div>
            <div className="flex items-center gap-space-sm mb-1">
              <span className="px-space-sm py-0.5 rounded-full bg-primary-container/15 text-primary font-label-sm text-label-sm uppercase tracking-wider font-semibold">
                Live Kitchen Ledger
              </span>
              <span className="text-on-surface-variant font-mono-metric text-body-sm">
                Last Synced: 19:42:08
              </span>
            </div>
            <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight font-bold">
              Inventory, Recipes &amp; Stock Control
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-4xl">
              Live raw material stock levels, low-threshold alerts, automated purchase orders, batch tracking, and real-time kitchen waste logging.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-space-sm shrink-0">
            <button
              onClick={() => {
                const headers = [
                  'Ingredient ID',
                  'Item Name',
                  'Category',
                  'Current Stock',
                  'Unit',
                  'Par Level',
                  'Reorder Point',
                  'Unit Cost (INR)',
                  'Total Valuation (INR)',
                  'Stock Status',
                  'Supplier / Vendor',
                ];
                const rows = stockList.map((s) => [
                  s.id,
                  s.name,
                  s.category,
                  s.currentStock,
                  s.unit,
                  s.parLevel,
                  s.reorderPoint,
                  s.unitCost,
                  s.valuation,
                  s.status.toUpperCase(),
                  s.supplier,
                ]);
                downloadCsv('restoflow-inventory-audit.csv', headers, rows);
                toast.success(`Exported ${stockList.length} inventory items to CSV!`, 'Audit Exported');
              }}
              className="px-space-md py-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-lg text-label-lg flex items-center gap-space-xs transition-all shadow-sm border border-surface-container-high/40"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              <span>Export Audit</span>
            </button>
            <button
              onClick={() => setIsWasteOpen(true)}
              className="px-space-md py-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-error font-label-lg text-label-lg flex items-center gap-space-xs transition-all shadow-sm border border-surface-container-high/40 font-semibold"
            >
              <span className="material-symbols-outlined text-[18px]">delete_sweep</span>
              <span>Record Wastage</span>
            </button>
            <button
              onClick={() => {
                const lowItems = stockList.filter((s) => s.status !== 'healthy');
                const itemsToOrder = lowItems.length > 0 ? lowItems : stockList.slice(0, 3);
                const poNumber = `PO-${Math.floor(10000 + Math.random() * 90000)}`;
                const poPayload = {
                  poNumber,
                  generatedDate: new Date().toISOString(),
                  restaurant: 'SpiceRoute Kitchen #01 (MG Road)',
                  gstin: '29AAAAA0000A1Z5',
                  items: itemsToOrder.map((it) => ({
                    itemId: it.id,
                    name: it.name,
                    category: it.category,
                    currentStock: it.currentStock,
                    unit: it.unit,
                    parLevel: it.parLevel,
                    suggestedOrderQty: Math.max(5, Math.ceil(it.parLevel - it.currentStock)),
                    unitCost: it.unitCost,
                    estimatedCost: Math.max(5, Math.ceil(it.parLevel - it.currentStock)) * it.unitCost,
                    supplier: it.supplier,
                  })),
                  totalEstimatedValuation: itemsToOrder.reduce(
                    (acc, it) => acc + Math.max(5, Math.ceil(it.parLevel - it.currentStock)) * it.unitCost,
                    0
                  ),
                };

                downloadJson(`purchase-order-${poNumber}.json`, poPayload);
                toast.success(`Purchase Order ${poNumber} for ${itemsToOrder.length} items generated and saved as JSON!`, 'PO Generated');
              }}
              className="px-space-md py-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-tertiary font-label-lg text-label-lg flex items-center gap-space-xs transition-all shadow-sm border border-surface-container-high/40 font-semibold"
            >
              <span className="material-symbols-outlined text-[18px]">description</span>
              <span>Generate PO</span>
            </button>
            <button
              onClick={handleRunN8nSupply}
              disabled={runningN8nSupply}
              className="px-space-md py-2.5 rounded-lg bg-[#ff6d5a] hover:bg-[#ff6d5a]/90 text-white font-label-lg text-label-lg flex items-center gap-space-xs transition-all shadow-md font-bold disabled:opacity-50"
              title="Autonomous n8n Supply Chain Orchestrator"
            >
              <span className={`material-symbols-outlined text-[20px] ${runningN8nSupply ? 'animate-spin' : ''}`}>
                {runningN8nSupply ? 'sync' : 'bolt'}
              </span>
              <span>{runningN8nSupply ? 'n8n Replenishing...' : '⚡ n8n AI Auto-Restock'}</span>
            </button>
            <button
              onClick={() => setIsReceiveOpen(true)}
              className="px-space-md py-2.5 rounded-lg bg-primary-container text-on-primary-container font-label-lg text-label-lg flex items-center gap-space-xs shadow-md hover:brightness-110 font-bold"
            >
              <span className="material-symbols-outlined text-[20px]">add_box</span>
              <span>Receive Goods / Stock-In</span>
            </button>
          </div>
        </div>

        {/* Live Operational KPI Deck */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-space-sm pt-space-xs">
          <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col justify-between shadow-sm border border-surface-container-high/30">
            <div className="flex items-center justify-between text-on-surface-variant mb-space-xs">
              <span className="font-label-md text-label-md uppercase tracking-wider font-semibold">
                Total Inventory Value
              </span>
              <span className="material-symbols-outlined text-[18px] text-tertiary">
                account_balance_wallet
              </span>
            </div>
            <div className="flex items-baseline gap-space-xs">
              <span className="font-headline-xl text-on-surface font-black">₹2,48,750</span>
            </div>
            <div className="flex items-center gap-1.5 mt-space-xs text-on-surface-variant font-body-sm text-body-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
              <span>142 Active SKUs • 4 Zones</span>
            </div>
          </div>

          <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col justify-between shadow-sm border border-surface-container-high/30">
            <div className="flex items-center justify-between text-on-surface-variant mb-space-xs">
              <span className="font-label-md text-label-md uppercase tracking-wider text-error font-semibold">
                Low Stock Alerts
              </span>
              <span className="material-symbols-outlined text-[18px] text-error animate-pulse">
                warning
              </span>
            </div>
            <div className="flex items-baseline gap-space-xs">
              <span className="font-headline-xl text-error font-black">5 Items</span>
            </div>
            <span className="text-xs text-error font-medium">Below par limit • Tap to auto-PO</span>
          </div>

          <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col justify-between shadow-sm border border-surface-container-high/30">
            <div className="flex items-center justify-between text-on-surface-variant mb-space-xs">
              <span className="font-label-md text-label-md uppercase tracking-wider font-semibold">
                Daily Waste Loss
              </span>
              <span className="material-symbols-outlined text-[18px] text-error">delete</span>
            </div>
            <div className="flex items-baseline gap-space-xs">
              <span className="font-headline-xl text-on-surface font-black">₹1,840</span>
            </div>
            <span className="text-xs text-secondary font-medium">0.74% of revenue (Target &lt; 1.2%)</span>
          </div>

          <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col justify-between shadow-sm border border-surface-container-high/30">
            <div className="flex items-center justify-between text-on-surface-variant mb-space-xs">
              <span className="font-label-md text-label-md uppercase tracking-wider font-semibold">
                Pending POs
              </span>
              <span className="material-symbols-outlined text-[18px] text-primary">local_shipping</span>
            </div>
            <div className="flex items-baseline gap-space-xs">
              <span className="font-headline-xl text-primary font-black">3 Orders</span>
            </div>
            <span className="text-xs text-on-surface-variant">Expected delivery today</span>
          </div>

          <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col justify-between shadow-sm border border-surface-container-high/30">
            <div className="flex items-center justify-between text-on-surface-variant mb-space-xs">
              <span className="font-label-md text-label-md uppercase tracking-wider font-semibold">
                Stock Health
              </span>
              <span className="material-symbols-outlined text-[18px] text-secondary">verified</span>
            </div>
            <div className="flex items-baseline gap-space-xs">
              <span className="font-headline-xl text-secondary font-black">96.4%</span>
            </div>
            <span className="text-xs text-secondary font-medium">Healthy inventory parity</span>
          </div>
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div className="flex items-center gap-space-xs overflow-x-auto pb-1">
        {[
          { id: 'stock', label: 'Live Ingredients Ledger', icon: 'inventory_2', count: filteredStock.length },
          { id: 'pos', label: 'n8n Purchase Orders Ledger', icon: 'local_shipping', count: purchaseOrders.length, badge: 'Auto-Pilot' },
          { id: 'suppliers', label: 'Certified Supplier Network', icon: 'storefront', count: 6 },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setInventoryTab(tab.id as any)}
            className={`px-space-md py-2.5 rounded-xl font-label-md text-label-md flex items-center gap-space-xs shrink-0 transition-all ${
              inventoryTab === tab.id
                ? 'bg-primary text-on-primary font-bold shadow-sm'
                : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`px-1.5 py-0.5 rounded-md text-[11px] font-mono ${
                inventoryTab === tab.id ? 'bg-black/20 text-white' : 'bg-surface-container-high text-on-surface'
              }`}>
                {tab.count}
              </span>
            )}
            {tab.badge && (
              <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-bold bg-[#ff6d5a] text-white">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab 1: Live Ingredients Table */}
      {inventoryTab === 'stock' && (
      <div className="bg-surface-container-low rounded-2xl p-space-md shadow-sm flex flex-col gap-4 border border-surface-container-high/30 animate-fadeIn">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">
              search
            </span>
            <input
              type="text"
              placeholder="Search ingredient by name, SKU, or supplier..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant rounded-lg font-body-sm text-body-sm outline-none focus:ring-1 focus:ring-primary-container border border-surface-container-high/40"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto p-1 bg-surface-container-lowest rounded-lg border border-surface-container-high/40">
            {['all', 'dairy', 'meat', 'staples', 'spices'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1 rounded-md text-xs font-bold uppercase transition-all ${
                  categoryFilter === cat
                    ? 'bg-primary-container text-on-primary-container'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-body-sm">
            <thead className="bg-surface-container-lowest text-on-surface-variant uppercase text-xs tracking-wider border-b border-surface-container-high/40 font-semibold">
              <tr>
                <th className="py-3 px-4">SKU / Item</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Current Stock</th>
                <th className="py-3 px-3">Par Level</th>
                <th className="py-3 px-3">Unit Cost</th>
                <th className="py-3 px-3">Total Value</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Preferred Supplier</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high/20">
              {filteredStock.map((item) => (
                <tr key={item.id} className="hover:bg-surface-container transition-colors">
                  <td className="py-3.5 px-4 font-bold text-on-surface">
                    <div className="flex flex-col">
                      <span>{item.name}</span>
                      <span className="text-xs text-on-surface-variant font-mono-metric font-normal">
                        {item.id}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-3 text-on-surface-variant">{item.category}</td>
                  <td className="py-3.5 px-3 font-mono-metric font-bold text-on-surface text-base">
                    {item.currentStock} {item.unit}
                  </td>
                  <td className="py-3.5 px-3 font-mono-metric text-on-surface-variant">
                    {item.parLevel} {item.unit}
                  </td>
                  <td className="py-3.5 px-3 font-mono-metric">₹{item.unitCost}/{item.unit}</td>
                  <td className="py-3.5 px-3 font-mono-metric font-bold text-primary">
                    ₹{item.valuation.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        item.status === 'healthy'
                          ? 'bg-secondary/15 text-secondary'
                          : item.status === 'low'
                          ? 'bg-primary-container/20 text-primary'
                          : 'bg-error-container/30 text-error animate-pulse'
                      }`}
                    >
                      {item.status === 'healthy'
                        ? 'Optimal'
                        : item.status === 'low'
                        ? 'Low Stock'
                        : 'Critical'}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-xs text-on-surface-variant">{item.supplier}</td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={async () => {
                        try {
                          await api.receiveStock(item.id, 10);
                          toast.success(`Reorder PO generated & 10 units received for ${item.name}!`, 'Stock In');
                          fetchInventory();
                        } catch (err: any) {
                          toast.error(err.message || 'Error processing PO', 'Failed');
                        }
                      }}
                      className="px-3 py-1 rounded bg-primary-container text-on-primary-container text-xs font-bold hover:brightness-110 shadow-sm"
                    >
                      Reorder PO
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Tab 2: n8n Autonomous Purchase Orders Ledger */}
      {inventoryTab === 'pos' && (
        <div className="bg-surface-container-low rounded-2xl p-space-md shadow-sm flex flex-col gap-4 border border-surface-container-high/30 animate-fadeIn">
          <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#ff6d5a] text-[24px]">local_shipping</span>
              <div>
                <h3 className="font-headline-md font-bold text-on-surface">n8n Generated Purchase Orders Ledger</h3>
                <p className="text-xs text-on-surface-variant">Automated supplier purchase orders generated by the AI supply pipeline</p>
              </div>
            </div>
            <button
              onClick={handleRunN8nSupply}
              disabled={runningN8nSupply}
              className="px-3 py-1.5 rounded-lg bg-[#ff6d5a] hover:bg-[#ff6d5a]/90 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[16px]">bolt</span>
              <span>Trigger Auto-Replenish</span>
            </button>
          </div>

          {purchaseOrders.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center gap-2 text-on-surface-variant">
              <span className="material-symbols-outlined text-[36px]">receipt_long</span>
              <span className="font-bold text-on-surface">No Purchase Orders Created Yet</span>
              <p className="text-xs max-w-sm">Click "Trigger Auto-Replenish" to run the n8n supply workflow and generate automated purchase orders.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {purchaseOrders.map((po, idx) => (
                <div key={idx} className="p-4 bg-surface-container rounded-xl border border-outline-variant/30 flex flex-col justify-between gap-3 shadow-sm">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                        {po.poNumber}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                        {po.status || 'DISPATCHED'}
                      </span>
                    </div>
                    <h4 className="font-bold text-on-surface text-sm">{po.supplierName}</h4>
                    <div className="text-xs text-on-surface-variant flex items-center gap-2 mt-0.5">
                      <span>📞 {po.contact}</span>
                      <span>•</span>
                      <span>ETA: {po.leadTime}</span>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-surface-container-high/40 flex flex-col gap-1">
                      <span className="text-[11px] uppercase font-bold text-on-surface-variant">Line Items:</span>
                      {po.lineItems?.map((item: any, i: number) => (
                        <div key={i} className="flex justify-between text-xs font-mono">
                          <span className="text-on-surface truncate pr-2">{item.name} ({item.quantity})</span>
                          <span className="font-bold text-primary">{item.cost}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-surface-container-high/40 flex items-center justify-between">
                    <span className="text-xs text-on-surface-variant font-semibold">Total Order Cost:</span>
                    <span className="text-sm font-black font-mono text-primary">₹{po.totalCost?.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Certified Supplier Network Directory */}
      {inventoryTab === 'suppliers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 animate-fadeIn">
          {[
            { name: 'Heritage Dairy Farms Co.', category: 'Dairy & Cheeses', contact: '+91 98450 11299', lead: '4 Hours', rating: '99.4%', items: 'Paneer, Butter, Cream, Ghee' },
            { name: 'Apex Prime Poultry Ltd.', category: 'Poultry & Meats', contact: '+91 98220 88311', lead: '2 Hours', rating: '98.8%', items: 'Boneless Chicken, Tandoori Cuts' },
            { name: 'Royal Basmati Agro Millers', category: 'Grains & Staples', contact: '+91 98110 33400', lead: '6 Hours', rating: '99.1%', items: 'Daawat Royal Basmati, Flour' },
            { name: 'PureGhee Naturals Corp.', category: 'Oils & Dairy Fat', contact: '+91 98990 44522', lead: '5 Hours', rating: '97.9%', items: 'Desi Cow Ghee, Mustard Oil' },
            { name: 'Malabar Spice Traders', category: 'Spices & Condiments', contact: '+91 98480 77120', lead: '8 Hours', rating: '99.6%', items: 'Deggi Mirch, Garam Masala' },
            { name: 'EcoPack Smart Solutions', category: 'Packaging & Disposables', contact: '+91 98330 66500', lead: '12 Hours', rating: '98.2%', items: 'Meal Boxes, Foil Containers' },
          ].map((sup, idx) => (
            <div key={idx} className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/30 flex flex-col justify-between gap-3 shadow-sm">
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase text-primary font-bold">{sup.category}</span>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">{sup.rating} Reliability</span>
                </div>
                <h4 className="font-bold text-on-surface text-base">{sup.name}</h4>
                <p className="text-xs text-on-surface-variant font-mono">Contact: {sup.contact} • SLA: {sup.lead}</p>
                <div className="mt-2 text-xs text-on-surface-variant bg-surface-container p-2 rounded-lg font-mono">
                  Primary SKUs: {sup.items}
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-outline-variant/20">
                <span className="text-[11px] text-emerald-600 font-bold">● Live n8n Automated Dispatch Active</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Receive Stock Modal */}
      {isReceiveOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-surface-container rounded-2xl p-space-lg shadow-2xl border border-surface-container-high flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-surface-container-high/40 pb-3">
              <h3 className="font-headline-md font-bold text-on-surface">Goods Receiving Note (GRN)</h3>
              <button
                onClick={() => setIsReceiveOpen(false)}
                className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="flex flex-col gap-3 font-body-sm">
              <div>
                <label className="text-xs font-bold uppercase text-on-surface-variant block mb-1">
                  Select Item / SKU
                </label>
                <select
                  value={selectedStockId}
                  onChange={(e) => setSelectedStockId(e.target.value)}
                  className="w-full bg-surface-container-lowest p-2.5 rounded-lg text-on-surface border border-surface-container-high/40 outline-none"
                >
                  {stockList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (Current: {s.currentStock} {s.unit})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-on-surface-variant block mb-1">
                  Received Quantity
                </label>
                <input
                  type="number"
                  min={1}
                  value={receivedQty}
                  onChange={(e) => setReceivedQty(Number(e.target.value))}
                  className="w-full bg-surface-container-lowest p-2.5 rounded-lg text-on-surface border border-surface-container-high/40 outline-none font-mono-metric"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-surface-container-high/40">
              <button
                onClick={() => setIsReceiveOpen(false)}
                className="px-4 py-2 rounded-lg bg-surface-container text-on-surface text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    await api.receiveStock(selectedStockId, receivedQty);
                    setIsReceiveOpen(false);
                    fetchInventory();
                    toast.success(`Stock-in for ${receivedQty} units recorded successfully!`, 'GRN Received');
                  } catch (err: any) {
                    toast.error(err.message || 'Error receiving stock', 'Failed');
                  }
                }}
                className="px-4 py-2 rounded-lg bg-primary-container text-on-primary-container text-sm font-bold shadow-md hover:brightness-110"
              >
                Confirm Stock-In
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Record Wastage Modal */}
      {isWasteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-surface-container rounded-2xl p-space-lg shadow-2xl border border-surface-container-high flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-surface-container-high/40 pb-3">
              <h3 className="font-headline-md font-bold text-on-surface">Record Kitchen Wastage</h3>
              <button
                onClick={() => setIsWasteOpen(false)}
                className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="flex flex-col gap-3 font-body-sm">
              <div>
                <label className="text-xs font-bold uppercase text-on-surface-variant block mb-1">
                  Ingredient Item
                </label>
                <input
                  type="text"
                  value={wasteItem}
                  onChange={(e) => setWasteItem(e.target.value)}
                  className="w-full bg-surface-container-lowest p-2.5 rounded-lg text-on-surface border border-surface-container-high/40 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase text-on-surface-variant block mb-1">
                    Wasted Quantity
                  </label>
                  <input
                    type="text"
                    value={wasteQty}
                    onChange={(e) => setWasteQty(e.target.value)}
                    className="w-full bg-surface-container-lowest p-2.5 rounded-lg text-on-surface border border-surface-container-high/40 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-on-surface-variant block mb-1">
                    Loss Cost (₹)
                  </label>
                  <input
                    type="number"
                    value={wasteCost}
                    onChange={(e) => setWasteCost(Number(e.target.value))}
                    className="w-full bg-surface-container-lowest p-2.5 rounded-lg text-on-surface border border-surface-container-high/40 outline-none font-mono-metric"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-on-surface-variant block mb-1">
                  Reason for Waste
                </label>
                <input
                  type="text"
                  value={wasteReason}
                  onChange={(e) => setWasteReason(e.target.value)}
                  className="w-full bg-surface-container-lowest p-2.5 rounded-lg text-on-surface border border-surface-container-high/40 outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-surface-container-high/40">
              <button
                onClick={() => setIsWasteOpen(false)}
                className="px-4 py-2 rounded-lg bg-surface-container text-on-surface text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    await api.logWastage({
                      item: wasteItem,
                      qty: wasteQty,
                      reason: wasteReason,
                      cost: wasteCost,
                    });
                    setIsWasteOpen(false);
                    toast.warning(`Wastage of ${wasteQty} ${wasteItem} (₹${wasteCost}) logged to ledger.`, 'Waste Recorded');
                  } catch (err: any) {
                    toast.error(err.message || 'Error logging wastage', 'Failed');
                  }
                }}
                className="px-4 py-2 rounded-lg bg-error text-on-error text-sm font-bold shadow-md hover:brightness-110"
              >
                Log Wastage
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
