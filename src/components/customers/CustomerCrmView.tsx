import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { subscribeRealtime } from '../../hooks/useRealtimeSync';
import { useToast } from '../../contexts/ToastContext';
import { downloadCsv } from '../../utils/exportUtils';

interface CustomerProfile {
  id: string;
  name: string;
  phone: string;
  tier: 'Platinum' | 'Gold' | 'Silver' | 'Standard';
  visits: number;
  totalSpend: number;
  points: number;
  preferredTable: string;
  dietaryTags: string[];
  lastVisit: string;
}

const MOCK_CUSTOMERS: CustomerProfile[] = [
  {
    id: 'CUST-801',
    name: 'Dr. Alok Verma',
    phone: '+91 98201 44821',
    tier: 'Platinum',
    visits: 28,
    totalSpend: 54200,
    points: 5420,
    preferredTable: 'Table T-05 (Terrace)',
    dietaryTags: ['Gluten-Free', 'High Spiced'],
    lastVisit: 'Today (Dinner)',
  },
  {
    id: 'CUST-802',
    name: 'Ananya Verma',
    phone: '+91 98201 44821',
    tier: 'Gold',
    visits: 19,
    totalSpend: 36400,
    points: 3640,
    preferredTable: 'Table T-12 (Main)',
    dietaryTags: ['Less Oil', 'Butter Chicken Fan'],
    lastVisit: 'Today (Dinner)',
  },
  {
    id: 'CUST-803',
    name: 'Vikram Malhotra',
    phone: '+91 98334 11204',
    tier: 'Gold',
    visits: 14,
    totalSpend: 28900,
    points: 2890,
    preferredTable: 'Table T-04',
    dietaryTags: ['Non-Veg', 'Craft Beer'],
    lastVisit: 'Today (Dinner)',
  },
  {
    id: 'CUST-804',
    name: 'Priya Singh',
    phone: '+91 97110 39201',
    tier: 'Silver',
    visits: 8,
    totalSpend: 14800,
    points: 1480,
    preferredTable: 'Takeaway Counter',
    dietaryTags: ['Vegetarian', 'Biryani Lover'],
    lastVisit: 'Today (Pickup)',
  },
  {
    id: 'CUST-805',
    name: 'Rahul Kapoor',
    phone: '+91 98450 77123',
    tier: 'Platinum',
    visits: 34,
    totalSpend: 68400,
    points: 6840,
    preferredTable: 'Table T-08',
    dietaryTags: ['Family Dining', 'Celebration Host'],
    lastVisit: 'Today (Dinner)',
  },
];

export const CustomerCrmView: React.FC = () => {
  const toast = useToast();
  const [customers, setCustomers] = useState<CustomerProfile[]>(MOCK_CUSTOMERS);
  const [tierFilter, setTierFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddGuestOpen, setIsAddGuestOpen] = useState(false);
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestPhone, setNewGuestPhone] = useState('');
  const [newGuestTier, setNewGuestTier] = useState<'Standard' | 'Silver' | 'Gold' | 'Platinum'>('Standard');
  const [newGuestTags, setNewGuestTags] = useState('Vegetarian, Family');

  const fetchCustomers = () => {
    api.getCustomers().then((res) => {
      if (res.success && res.data && res.data.length > 0) {
        setCustomers(res.data);
      }
    }).catch(() => {});
  };

  useEffect(() => {
    fetchCustomers();

    const unsub = subscribeRealtime((event) => {
      if (event.type === 'CUSTOMER_ADDED') {
        fetchCustomers();
      }
    });

    return () => unsub();
  }, []);

  const filteredCustomers = customers.filter((c) => {
    if (tierFilter !== 'all' && c.tier.toLowerCase() !== tierFilter) return false;
    if (searchQuery && !c.name.toLowerCase().includes(searchQuery.toLowerCase()) && !c.phone.includes(searchQuery)) {
      return false;
    }
    return true;
  });

  return (
    <div className="flex flex-col w-full pb-16 space-y-space-md">
      {/* Top Page Header & Context */}
      <div className="flex flex-col gap-space-sm pt-2">
        <div className="flex flex-wrap items-center justify-between gap-space-md">
          <div className="flex flex-col">
            <div className="flex items-center gap-space-xs text-primary font-label-sm uppercase tracking-wider mb-1 font-semibold">
              <span className="material-symbols-outlined text-[15px]">badge</span>
              <span>Guest Directory &amp; CRM • SpiceRoute Kitchen #01</span>
            </div>
            <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight font-bold">
              Customer Intelligence &amp; Loyalty CRM
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1 max-w-4xl">
              Track guest visit history, lifetime dining spend, dietary preferences, loyalty reward tiers, and send targeted WhatsApp/SMS re-engagement campaigns.
            </p>
          </div>

          <div className="flex items-center gap-space-sm shrink-0 flex-wrap">
            <button
              onClick={() => {
                const headers = [
                  'Customer ID',
                  'Customer Name',
                  'Phone Number',
                  'Tier Status',
                  'Total Visits',
                  'Lifetime Spend (INR)',
                  'Loyalty Points',
                  'Preferred Table',
                  'Dietary Tags',
                  'Last Visit Date',
                ];
                const rows = customers.map((c) => [
                  c.id,
                  c.name,
                  c.phone,
                  c.tier,
                  c.visits,
                  c.totalSpend,
                  c.points,
                  c.preferredTable,
                  c.dietaryTags.join('; '),
                  c.lastVisit,
                ]);
                downloadCsv('restoflow-customer-crm.csv', headers, rows);
                toast.success(`Exported ${customers.length} customer records to CSV!`, 'CRM Exported');
              }}
              className="flex items-center gap-space-xs px-space-md py-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md transition-colors shadow-sm border border-surface-container-high/40 font-semibold"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              <span>Export Guest List</span>
            </button>
            <button
              onClick={() => toast.info('Opening WhatsApp Broadcast Campaign Builder...', 'Campaign Hub')}
              className="flex items-center gap-space-xs px-space-md py-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md transition-colors shadow-sm border border-surface-container-high/40 font-semibold"
            >
              <span className="material-symbols-outlined text-[18px] text-secondary">campaign</span>
              <span>Broadcast Campaign</span>
            </button>
            <button
              onClick={() => setIsAddGuestOpen(true)}
              className="flex items-center gap-space-xs px-space-md py-2.5 rounded-lg bg-primary-container text-on-primary-container hover:brightness-110 font-label-lg font-bold transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-[20px]">person_add</span>
              <span>+ Add New Guest</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Summary Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md">
        <div className="bg-surface-container-low rounded-xl p-space-lg flex flex-col justify-between shadow-sm border border-surface-container-high/30">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="font-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
                Total Directory Guests
              </span>
              <span className="font-display-lg text-display-lg text-on-surface font-black mt-1 tracking-tight">
                2,840
              </span>
            </div>
            <div className="w-11 h-11 rounded-lg bg-surface-container-highest flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[24px]">group</span>
            </div>
          </div>
          <div className="flex items-center gap-space-xs mt-space-md">
            <span className="flex items-center text-secondary font-label-md font-bold">
              <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
              +64 this month
            </span>
            <span className="text-on-surface-variant font-body-sm text-xs">• Active floor roster</span>
          </div>
        </div>

        <div className="bg-surface-container-low rounded-xl p-space-lg flex flex-col justify-between shadow-sm border border-surface-container-high/30">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="font-label-sm uppercase tracking-wider text-primary font-semibold">
                VIP Members Cohort
              </span>
              <span className="font-display-lg text-display-lg text-primary font-black mt-1 tracking-tight">
                342
              </span>
            </div>
            <div className="w-11 h-11 rounded-lg bg-primary-container/20 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[24px]">stars</span>
            </div>
          </div>
          <div className="flex items-center gap-space-xs mt-space-md text-xs text-on-surface-variant font-medium">
            <span>Platinum &amp; Gold VIP Diners</span>
          </div>
        </div>

        <div className="bg-surface-container-low rounded-xl p-space-lg flex flex-col justify-between shadow-sm border border-surface-container-high/30">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="font-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
                Total Points Balance
              </span>
              <span className="font-display-lg text-display-lg text-secondary font-black mt-1 tracking-tight">
                184.5k
              </span>
            </div>
            <div className="w-11 h-11 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[24px]">loyalty</span>
            </div>
          </div>
          <div className="flex items-center gap-space-xs mt-space-md text-xs text-secondary font-medium">
            <span>₹18,450 redeemable value</span>
          </div>
        </div>

        <div className="bg-surface-container-low rounded-xl p-space-lg flex flex-col justify-between shadow-sm border border-surface-container-high/30">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="font-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
                Avg Lifetime Spend
              </span>
              <span className="font-display-lg text-display-lg text-on-surface font-black mt-1 tracking-tight">
                ₹14,200
              </span>
            </div>
            <div className="w-11 h-11 rounded-lg bg-surface-container-highest flex items-center justify-center text-tertiary">
              <span className="material-symbols-outlined text-[24px]">payments</span>
            </div>
          </div>
          <div className="flex items-center gap-space-xs mt-space-md text-xs text-on-surface-variant font-medium">
            <span>6.4 visits per guest average</span>
          </div>
        </div>
      </div>

      {/* Directory Table Card */}
      <div className="bg-surface-container-low rounded-2xl p-space-md shadow-sm flex flex-col gap-4 border border-surface-container-high/30">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">
              search
            </span>
            <input
              type="text"
              placeholder="Search by guest name or phone number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant rounded-lg font-body-sm text-body-sm outline-none focus:ring-1 focus:ring-primary-container border border-surface-container-high/40"
            />
          </div>

          <div className="flex items-center gap-1 p-1 bg-surface-container-lowest rounded-lg border border-surface-container-high/40">
            {['all', 'platinum', 'gold', 'silver'].map((t) => (
              <button
                key={t}
                onClick={() => setTierFilter(t)}
                className={`px-3 py-1 rounded-md text-xs font-bold uppercase transition-all ${
                  tierFilter === t
                    ? 'bg-primary-container text-on-primary-container'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-body-sm">
            <thead className="bg-surface-container-lowest text-on-surface-variant uppercase text-xs tracking-wider border-b border-surface-container-high/40 font-semibold">
              <tr>
                <th className="py-3 px-4">Guest Name</th>
                <th className="py-3 px-3">Phone</th>
                <th className="py-3 px-3">Tier</th>
                <th className="py-3 px-3">Total Visits</th>
                <th className="py-3 px-3">Lifetime Spend</th>
                <th className="py-3 px-3">Loyalty Points</th>
                <th className="py-3 px-3">Preferences</th>
                <th className="py-3 px-3">Last Visited</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high/20">
              {filteredCustomers.map((cust) => (
                <tr key={cust.id} className="hover:bg-surface-container transition-colors">
                  <td className="py-3.5 px-4 font-bold text-on-surface">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary-container/20 text-primary flex items-center justify-center font-bold text-sm">
                        {cust.name.charAt(0)}
                      </div>
                      <span>{cust.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-3 font-mono-metric text-on-surface-variant">
                    {cust.phone}
                  </td>
                  <td className="py-3.5 px-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        cust.tier === 'Platinum'
                          ? 'bg-primary-container text-on-primary-container'
                          : cust.tier === 'Gold'
                          ? 'bg-primary-container/20 text-primary'
                          : 'bg-surface-container-high text-on-surface'
                      }`}
                    >
                      ★ {cust.tier}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 font-mono-metric font-bold">{cust.visits} visits</td>
                  <td className="py-3.5 px-3 font-mono-metric font-bold text-primary">
                    ₹{cust.totalSpend.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-3 font-mono-metric text-secondary font-bold">
                    {cust.points} pts
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="flex flex-wrap gap-1">
                      {cust.dietaryTags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-surface-container-lowest text-[11px] text-on-surface-variant font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3.5 px-3 text-xs text-on-surface-variant font-medium">
                    {cust.lastVisit}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => toast.info(`Sending WhatsApp loyalty perk to ${cust.name}...`, 'WhatsApp Perk')}
                        className="p-1.5 rounded bg-surface-container hover:bg-surface-container-high text-secondary"
                        title="Send WhatsApp Promo"
                      >
                        <span className="material-symbols-outlined text-[16px]">chat</span>
                      </button>
                      <button
                        onClick={() => toast.info(`Viewing full order history for ${cust.name}`, 'Guest Profile')}
                        className="px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold"
                      >
                        Profile
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Guest Modal */}
      {isAddGuestOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-surface-container rounded-2xl p-space-lg shadow-2xl border border-surface-container-high flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-surface-container-high/40 pb-3">
              <h3 className="font-headline-md font-bold text-on-surface">Add Guest to Directory</h3>
              <button
                onClick={() => setIsAddGuestOpen(false)}
                className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="flex flex-col gap-3 font-body-sm">
              <div>
                <label className="text-xs font-bold uppercase text-on-surface-variant block mb-1">
                  Guest Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sanya Kapoor"
                  value={newGuestName}
                  onChange={(e) => setNewGuestName(e.target.value)}
                  className="w-full bg-surface-container-lowest p-2.5 rounded-lg text-on-surface border border-surface-container-high/40 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase text-on-surface-variant block mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="+91 98..."
                    value={newGuestPhone}
                    onChange={(e) => setNewGuestPhone(e.target.value)}
                    className="w-full bg-surface-container-lowest p-2.5 rounded-lg text-on-surface border border-surface-container-high/40 outline-none font-mono-metric"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-on-surface-variant block mb-1">
                    Loyalty Tier
                  </label>
                  <select
                    value={newGuestTier}
                    onChange={(e) => setNewGuestTier(e.target.value as any)}
                    className="w-full bg-surface-container-lowest p-2.5 rounded-lg text-on-surface border border-surface-container-high/40 outline-none"
                  >
                    <option value="Standard">Standard</option>
                    <option value="Silver">Silver</option>
                    <option value="Gold">Gold</option>
                    <option value="Platinum">Platinum</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-on-surface-variant block mb-1">
                  Dietary Preferences / Tags (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Vegetarian, High Spiced, Biryani Fan"
                  value={newGuestTags}
                  onChange={(e) => setNewGuestTags(e.target.value)}
                  className="w-full bg-surface-container-lowest p-2.5 rounded-lg text-on-surface border border-surface-container-high/40 outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-surface-container-high/40">
              <button
                onClick={() => setIsAddGuestOpen(false)}
                className="px-4 py-2 rounded-lg bg-surface-container text-on-surface text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!newGuestName || !newGuestPhone) {
                    toast.warning('Please enter guest name and phone number', 'Missing Information');
                    return;
                  }
                  try {
                    await api.createCustomer({
                      name: newGuestName,
                      phone: newGuestPhone,
                      tier: newGuestTier,
                      dietaryTags: newGuestTags.split(',').map((s) => s.trim()).filter(Boolean),
                      lastVisit: 'Just Added',
                    });
                    setIsAddGuestOpen(false);
                    setNewGuestName('');
                    setNewGuestPhone('');
                    toast.success(`Guest ${newGuestName} (${newGuestTier}) added to CRM!`, 'Customer Added');
                    fetchCustomers();
                  } catch (err: any) {
                    toast.error(err.message || 'Error adding guest', 'Failed');
                  }
                }}
                className="px-4 py-2 rounded-lg bg-primary-container text-on-primary-container text-sm font-bold shadow-md hover:brightness-110"
              >
                Save Guest
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
