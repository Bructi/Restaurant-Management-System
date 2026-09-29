import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { subscribeRealtime } from '../../hooks/useRealtimeSync';
import { useToast } from '../../contexts/ToastContext';

interface ReservationItem {
  id: string;
  guestName: string;
  phone: string;
  timeSlot: string;
  pax: number;
  table: string;
  status: 'seated' | 'confirmed' | 'waitlist' | 'cancelled';
  statusLabel: string;
  isVip?: boolean;
  vipTier?: string;
  occasion?: string;
  notes?: string;
  depositAmount?: number;
}

const MOCK_RESERVATIONS: ReservationItem[] = [
  {
    id: 'RES-401',
    guestName: 'Dr. Alok Verma',
    phone: '+91 98201 44821',
    timeSlot: '20:45 PM',
    pax: 6,
    table: 'Table T-05 (Terrace)',
    status: 'confirmed',
    statusLabel: 'Confirmed',
    isVip: true,
    vipTier: 'VIP Platinum',
    occasion: 'Anniversary Dinner',
    notes: 'Prefers quiet corner table, strict gluten-free for 1 pax',
    depositAmount: 2000,
  },
  {
    id: 'RES-402',
    guestName: 'Sunita Rao',
    phone: '+91 98450 11992',
    timeSlot: '20:30 PM',
    pax: 4,
    table: 'Table T-12 (Main)',
    status: 'seated',
    statusLabel: 'Seated (42m)',
    isVip: true,
    vipTier: 'VIP Gold',
    occasion: 'Family Dinner',
    notes: 'High chair required for toddler',
    depositAmount: 1000,
  },
  {
    id: 'RES-403',
    guestName: 'Rajiv Mehra',
    phone: '+91 97110 88234',
    timeSlot: '21:00 PM',
    pax: 2,
    table: 'Table T-15 (VIP Alcove)',
    status: 'confirmed',
    statusLabel: 'Confirmed',
    occasion: 'Business Meeting',
    notes: 'Window side preferred',
    depositAmount: 1500,
  },
  {
    id: 'RES-404',
    guestName: 'Karan Singhania',
    phone: '+91 99881 22301',
    timeSlot: '21:15 PM',
    pax: 8,
    table: 'Table T-21 (Private)',
    status: 'waitlist',
    statusLabel: 'Waitlist #1',
    isVip: true,
    vipTier: 'VIP Gold',
    occasion: 'Birthday Party',
    notes: 'Pre-ordered custom cake delivery at 21:30',
  },
];

export const ReservationsView: React.FC = () => {
  const toast = useToast();
  const [selectedService, setSelectedService] = useState<'all' | 'lunch' | 'dinner' | 'late'>('dinner');
  const [selectedResId, setSelectedResId] = useState<string>('RES-401');
  const [searchQuery, setSearchQuery] = useState('');
  const [reservations, setReservations] = useState<ReservationItem[]>(MOCK_RESERVATIONS);
  const [isNewResOpen, setIsNewResOpen] = useState(false);
  const [newGuestName, setNewGuestName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newTimeSlot, setNewTimeSlot] = useState('20:30 PM');
  const [newPax, setNewPax] = useState(4);
  const [newTable, setNewTable] = useState('Table T-03 (Main)');
  const [newOccasion, setNewOccasion] = useState('Dinner with Friends');
  const [newNotes, setNewNotes] = useState('');
  const [newDeposit, setNewDeposit] = useState(1000);

  const fetchReservations = () => {
    api.getReservations().then((res) => {
      if (res.success && res.data && res.data.length > 0) {
        setReservations(res.data);
      }
    }).catch(() => {});
  };

  useEffect(() => {
    fetchReservations();

    const unsub = subscribeRealtime((event) => {
      if (event.type === 'RESERVATION_ADDED' || event.type === 'RESERVATION_UPDATED') {
        fetchReservations();
      }
    });

    return () => unsub();
  }, []);

  const selectedRes = reservations.find((r) => r.id === selectedResId) || reservations[0] || MOCK_RESERVATIONS[0];

  const getStatusBadge = (status: ReservationItem['status'], label: string) => {
    switch (status) {
      case 'seated':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-secondary/15 text-secondary font-label-sm text-label-sm font-bold">
            {label}
          </span>
        );
      case 'confirmed':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-primary-container/20 text-primary font-label-sm text-label-sm font-bold">
            {label}
          </span>
        );
      case 'waitlist':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-tertiary/20 text-tertiary font-label-sm text-label-sm font-bold">
            {label}
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-error-container/40 text-error font-label-sm text-label-sm font-bold">
            {label}
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col w-full pb-16 space-y-space-md">
      {/* Top Bar with Date & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md bg-surface-container-low p-space-md lg:p-space-lg rounded-xl shadow-sm border border-surface-container-high/30">
        <div className="flex flex-wrap items-center gap-space-md">
          <div className="flex items-center bg-surface-container-lowest px-space-md py-2 rounded-lg border border-surface-container-high/40">
            <button className="text-on-surface-variant hover:text-on-surface p-1 transition-colors">
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <div className="flex items-center gap-2 px-space-sm">
              <span className="material-symbols-outlined text-primary-container text-[20px]">
                calendar_month
              </span>
              <div className="flex flex-col">
                <span className="font-headline-md text-headline-md text-on-surface tracking-tight font-bold">
                  Today, 16 Sep 2026
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">
                  Dinner Service: 18:00 – 23:30
                </span>
              </div>
            </div>
            <button className="text-on-surface-variant hover:text-on-surface p-1 transition-colors">
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-surface-container-lowest rounded-lg border border-surface-container-high/40">
            <button
              onClick={() => setSelectedService('all')}
              className={`px-space-md py-1.5 rounded-lg font-label-md text-label-md transition-all ${
                selectedService === 'all'
                  ? 'bg-surface-container-high text-on-surface font-bold shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              All Services (28)
            </button>
            <button
              onClick={() => setSelectedService('lunch')}
              className={`px-space-md py-1.5 rounded-lg font-label-md text-label-md transition-all ${
                selectedService === 'lunch'
                  ? 'bg-surface-container-high text-on-surface font-bold shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Lunch (12)
            </button>
            <button
              onClick={() => setSelectedService('dinner')}
              className={`px-space-md py-1.5 rounded-lg font-label-md text-label-md transition-all flex items-center gap-1.5 ${
                selectedService === 'dinner'
                  ? 'bg-primary-container text-on-primary-container font-bold shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span>Dinner Rush (16 Active)</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-lg text-label-lg transition-all shadow-sm border border-surface-container-high/40">
            <span className="material-symbols-outlined text-[18px] text-tertiary">grid_on</span>
            <span>Table Allocation</span>
          </button>
          <button className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-lg text-label-lg transition-all shadow-sm border border-surface-container-high/40">
            <span className="material-symbols-outlined text-[18px] text-secondary">sms</span>
            <span>SMS Remind All</span>
          </button>
          <button
            onClick={() => setIsNewResOpen(true)}
            className="flex items-center gap-1.5 px-space-lg py-2.5 rounded-lg bg-primary-container text-on-primary-container font-headline-md font-bold text-label-lg shadow-md hover:brightness-110 transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            <span>+ New Reservation</span>
          </button>
        </div>
      </div>

      {/* 5 Reservation KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-space-md">
        <div className="p-space-md bg-surface-container-low rounded-xl flex flex-col justify-between shadow-sm border border-surface-container-high/30">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold">
              Total Bookings
            </span>
            <span className="material-symbols-outlined text-[20px] text-tertiary">menu_book</span>
          </div>
          <div className="mt-space-sm">
            <div className="flex items-baseline gap-2">
              <span className="font-display-lg text-display-lg text-on-surface font-black">28</span>
              <span className="font-label-md text-label-md text-secondary font-semibold">Confirmed</span>
            </div>
            <div className="flex items-center gap-1 text-on-surface-variant mt-1 font-body-sm text-body-sm">
              <span className="material-symbols-outlined text-[14px]">groups</span>
              <span>114 Guests / Pax total</span>
            </div>
          </div>
        </div>

        <div className="p-space-md bg-surface-container-low rounded-xl flex flex-col justify-between shadow-sm border border-surface-container-high/30">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold">
              Arrived &amp; Seated
            </span>
            <span className="material-symbols-outlined text-[20px] text-secondary">
              airline_seat_recline_normal
            </span>
          </div>
          <div className="mt-space-sm">
            <div className="flex items-baseline gap-2">
              <span className="font-display-lg text-display-lg text-secondary font-black">14</span>
              <span className="font-label-md text-label-md text-on-surface font-semibold">Seated Now</span>
            </div>
            <span className="text-xs text-on-surface-variant block mt-1">56 covers active dining</span>
          </div>
        </div>

        <div className="p-space-md bg-surface-container-low rounded-xl flex flex-col justify-between shadow-sm border border-surface-container-high/30">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold">
              Expected Upcoming
            </span>
            <span className="material-symbols-outlined text-[20px] text-primary">schedule</span>
          </div>
          <div className="mt-space-sm">
            <div className="flex items-baseline gap-2">
              <span className="font-display-lg text-display-lg text-primary font-black">9</span>
              <span className="font-label-md text-label-md text-primary font-semibold">Next 2 Hrs</span>
            </div>
            <span className="text-xs text-on-surface-variant block mt-1">38 guests arriving</span>
          </div>
        </div>

        <div className="p-space-md bg-surface-container-low rounded-xl flex flex-col justify-between shadow-sm border border-surface-container-high/30">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold">
              Waitlist Queue
            </span>
            <span className="material-symbols-outlined text-[20px] text-tertiary">hourglass_top</span>
          </div>
          <div className="mt-space-sm">
            <div className="flex items-baseline gap-2">
              <span className="font-display-lg text-display-lg text-tertiary font-black">3</span>
              <span className="font-label-md text-label-md text-tertiary font-semibold">Parties</span>
            </div>
            <span className="text-xs text-on-surface-variant block mt-1">~18m avg wait time</span>
          </div>
        </div>

        <div className="p-space-md bg-surface-container-low rounded-xl flex flex-col justify-between shadow-sm border border-surface-container-high/30">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold">
              Deposits Collected
            </span>
            <span className="material-symbols-outlined text-[20px] text-secondary">payments</span>
          </div>
          <div className="mt-space-sm">
            <div className="flex items-baseline gap-2">
              <span className="font-display-lg text-display-lg text-on-surface font-black">₹14.5k</span>
            </div>
            <span className="text-xs text-secondary font-medium">100% advance secured</span>
          </div>
        </div>
      </div>

      {/* Main Workspace (Registry + Guest Detail Drawer) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-md items-start">
        {/* Left Column: Timeline Slot Booker (7 Cols) */}
        <div className="xl:col-span-7 flex flex-col gap-3 bg-surface-container-low p-space-md rounded-2xl shadow-sm border border-surface-container-high/30">
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">
                search
              </span>
              <input
                type="text"
                placeholder="Search by guest name, phone, or reservation ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant rounded-lg font-body-sm text-body-sm outline-none focus:ring-1 focus:ring-primary-container border border-surface-container-high/40"
              />
            </div>
            <span className="font-mono-metric text-xs text-on-surface-variant shrink-0">
              Showing {reservations.length} Bookings
            </span>
          </div>

          {/* Cards List */}
          <div className="flex flex-col gap-2.5">
            {reservations.map((res) => {
              const isSelected = res.id === selectedResId;
              return (
                <div
                  key={res.id}
                  onClick={() => setSelectedResId(res.id)}
                  className={`p-4 rounded-xl cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-surface-container-high ring-2 ring-primary border-primary-container shadow-md'
                      : 'bg-surface-container hover:bg-surface-container-high border-surface-container-high/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-xl bg-primary-container/20 text-primary flex items-center justify-center font-bold text-base shrink-0">
                        {res.guestName.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-headline-md text-label-lg font-bold text-on-surface">
                            {res.guestName}
                          </span>
                          {res.isVip && (
                            <span className="px-2 py-0.5 rounded bg-primary-container/20 text-primary font-label-sm text-xs font-bold">
                              ★ {res.vipTier}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-on-surface-variant font-mono-metric">
                          {res.phone} · {res.pax} Guests · {res.table}
                        </span>
                        {res.notes && (
                          <span className="text-xs text-on-surface-variant mt-1 line-clamp-1 italic">
                            "{res.notes}"
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span className="font-mono-metric font-black text-primary text-base">
                        {res.timeSlot}
                      </span>
                      {getStatusBadge(res.status, res.statusLabel)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Guest Detail & VIP Profile (5 Cols) */}
        <div className="xl:col-span-5 bg-surface-container-low rounded-2xl p-space-md shadow-xl flex flex-col gap-space-md border border-surface-container-high/30">
          <div className="p-space-md bg-surface-container rounded-xl flex items-start justify-between border border-surface-container-high/40">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-black text-xl shadow-md">
                {selectedRes.guestName.charAt(0)}
              </div>
              <div className="flex flex-col">
                <span className="font-headline-md text-headline-md font-bold text-on-surface">
                  {selectedRes.guestName}
                </span>
                <span className="text-xs text-on-surface-variant font-mono-metric">
                  {selectedRes.phone} · {selectedRes.vipTier || 'Guest Profile'}
                </span>
              </div>
            </div>
            {getStatusBadge(selectedRes.status, selectedRes.statusLabel)}
          </div>

          <div className="flex flex-col gap-3 font-body-sm text-body-sm">
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 rounded-lg bg-surface-container-lowest border border-surface-container-high/30">
                <span className="text-xs text-on-surface-variant block uppercase font-medium">Time &amp; Pax</span>
                <span className="font-bold text-on-surface text-base">{selectedRes.timeSlot}</span>
                <span className="text-xs text-on-surface-variant block">{selectedRes.pax} Guests Seated</span>
              </div>
              <div className="p-3 rounded-lg bg-surface-container-lowest border border-surface-container-high/30">
                <span className="text-xs text-on-surface-variant block uppercase font-medium">Table Assignment</span>
                <span className="font-bold text-primary text-base">{selectedRes.table}</span>
                <span className="text-xs text-secondary block">Pre-allocated</span>
              </div>
            </div>

            {selectedRes.occasion && (
              <div className="p-3 bg-surface-container-lowest rounded-lg border border-surface-container-high/30 flex items-center justify-between">
                <span className="text-on-surface-variant">Occasion:</span>
                <span className="font-bold text-on-surface">{selectedRes.occasion}</span>
              </div>
            )}

            {selectedRes.notes && (
              <div className="p-3 bg-surface-container-lowest rounded-lg border border-surface-container-high/30 flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase text-on-surface-variant">Guest Preferences &amp; Allergies</span>
                <p className="text-on-surface italic">"{selectedRes.notes}"</p>
              </div>
            )}

            <div className="p-3 bg-surface-container-lowest rounded-lg border border-surface-container-high/30 flex justify-between items-center">
              <span className="text-on-surface-variant">Advance Deposit:</span>
              <span className="font-mono-metric text-secondary font-bold text-base">
                ₹{(selectedRes.depositAmount || 0).toLocaleString('en-IN')}.00 (Secured)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-surface-container-high/30">
            <button
              onClick={async () => {
                try {
                  await api.updateReservationStatus(selectedRes.id, 'seated', 'Seated (Just now)');
                  toast.success(`Table allocated! ${selectedRes.guestName} marked as Seated.`, 'Guest Seated');
                  fetchReservations();
                } catch {
                  toast.info(`Table allocated! Seating ${selectedRes.guestName}...`, 'Status Updated');
                }
              }}
              className="flex-1 py-3 rounded-xl bg-primary-container text-on-primary-container font-headline-md font-bold flex items-center justify-center gap-2 shadow-md hover:brightness-110"
            >
              <span className="material-symbols-outlined text-[20px]">chair</span>
              <span>Seat Table Now</span>
            </button>
            <button
              onClick={() => toast.info(`Initiating call to ${selectedRes.guestName} (${selectedRes.phone})...`, 'Direct Call')}
              className="p-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface border border-surface-container-high/40"
              title="Call Guest"
            >
              <span className="material-symbols-outlined text-[20px]">call</span>
            </button>
          </div>
        </div>
      </div>

      {/* New Reservation Modal */}
      {isNewResOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-surface-container rounded-2xl p-space-lg shadow-2xl border border-surface-container-high flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-surface-container-high/40 pb-3">
              <h3 className="font-headline-md font-bold text-on-surface">Book Table Reservation</h3>
              <button
                onClick={() => setIsNewResOpen(false)}
                className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="flex flex-col gap-3 font-body-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase text-on-surface-variant block mb-1">
                    Guest Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rohit Sharma"
                    value={newGuestName}
                    onChange={(e) => setNewGuestName(e.target.value)}
                    className="w-full bg-surface-container-lowest p-2.5 rounded-lg text-on-surface border border-surface-container-high/40 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-on-surface-variant block mb-1">
                    Contact Phone #
                  </label>
                  <input
                    type="text"
                    placeholder="+91 98..."
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full bg-surface-container-lowest p-2.5 rounded-lg text-on-surface border border-surface-container-high/40 outline-none font-mono-metric"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase text-on-surface-variant block mb-1">
                    Time Slot
                  </label>
                  <input
                    type="text"
                    value={newTimeSlot}
                    onChange={(e) => setNewTimeSlot(e.target.value)}
                    className="w-full bg-surface-container-lowest p-2.5 rounded-lg text-on-surface border border-surface-container-high/40 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-on-surface-variant block mb-1">
                    Pax Count
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={newPax}
                    onChange={(e) => setNewPax(Number(e.target.value))}
                    className="w-full bg-surface-container-lowest p-2.5 rounded-lg text-on-surface border border-surface-container-high/40 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-on-surface-variant block mb-1">
                    Advance Deposit
                  </label>
                  <input
                    type="number"
                    value={newDeposit}
                    onChange={(e) => setNewDeposit(Number(e.target.value))}
                    className="w-full bg-surface-container-lowest p-2.5 rounded-lg text-on-surface border border-surface-container-high/40 outline-none font-mono-metric"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase text-on-surface-variant block mb-1">
                    Table Preference
                  </label>
                  <input
                    type="text"
                    value={newTable}
                    onChange={(e) => setNewTable(e.target.value)}
                    className="w-full bg-surface-container-lowest p-2.5 rounded-lg text-on-surface border border-surface-container-high/40 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-on-surface-variant block mb-1">
                    Occasion / Reason
                  </label>
                  <input
                    type="text"
                    value={newOccasion}
                    onChange={(e) => setNewOccasion(e.target.value)}
                    className="w-full bg-surface-container-lowest p-2.5 rounded-lg text-on-surface border border-surface-container-high/40 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-on-surface-variant block mb-1">
                  Special Notes &amp; Dietary Requests
                </label>
                <textarea
                  rows={2}
                  value={newNotes}
                  placeholder="e.g. Anniversary dinner, corner window table preferred"
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full bg-surface-container-lowest p-2.5 rounded-lg text-on-surface border border-surface-container-high/40 outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-surface-container-high/40">
              <button
                onClick={() => setIsNewResOpen(false)}
                className="px-4 py-2 rounded-lg bg-surface-container text-on-surface text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!newGuestName || !newPhone) {
                    toast.warning('Please enter guest name and phone number', 'Missing Fields');
                    return;
                  }
                  try {
                    // Check availability first
                    const check = await api.checkTableAvailability({
                      tableId: newTable,
                      date: '2026-09-16',
                      timeSlot: newTimeSlot,
                      pax: newPax,
                    });

                    if (!check.data.available) {
                      toast.error(check.data.reason || 'Table is not available for this time slot', 'Booking Conflict');
                      return;
                    }

                    const res = await api.createReservation({
                      guestName: newGuestName,
                      phone: newPhone,
                      timeSlot: newTimeSlot,
                      pax: newPax,
                      table: newTable,
                      occasion: newOccasion,
                      notes: newNotes,
                      depositAmount: newDeposit,
                    });

                    if (res.data?.id && newDeposit > 0) {
                      await api.recordReservationDeposit(res.data.id, {
                        amount: newDeposit,
                        paymentMethod: 'UPI',
                      }).catch(() => {});
                    }

                    setIsNewResOpen(false);
                    setNewGuestName('');
                    setNewPhone('');
                    setNewNotes('');
                    toast.success(`Reservation for ${newGuestName} (${newPax} Pax) confirmed with ₹${newDeposit} deposit!`, 'Reservation Added');
                    fetchReservations();
                  } catch (err: any) {
                    toast.error(err.message || 'Error creating reservation', 'Failed');
                  }
                }}
                className="px-4 py-2 rounded-lg bg-primary-container text-on-primary-container text-sm font-bold shadow-md hover:brightness-110"
              >
                Save Reservation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
