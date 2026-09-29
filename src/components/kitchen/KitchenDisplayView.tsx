import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { subscribeRealtime } from '../../hooks/useRealtimeSync';

interface KdTicketItem {
  id: string;
  name: string;
  qty: number;
  station: string;
  isDone: boolean;
  modifiers?: string;
  specialNote?: string;
}

interface KdTicket {
  id: string;
  table: string;
  orderType: 'Dine-In' | 'Takeaway' | 'Delivery';
  pax: number;
  server: string;
  elapsedMinutes: number;
  isUrgent?: boolean;
  status: 'new' | 'cooking' | 'ready';
  items: KdTicketItem[];
}

const INITIAL_KDS_TICKETS: KdTicket[] = [
  {
    id: '#KOT-848',
    table: 'Table T-12',
    orderType: 'Dine-In',
    pax: 4,
    server: 'Sunil R.',
    elapsedMinutes: 14,
    status: 'cooking',
    items: [
      { id: 'k1', name: 'Paneer Tikka (Tandoor)', qty: 2, station: 'Tandoor', isDone: true, modifiers: 'Extra spicy, Mint dip' },
      { id: 'k2', name: 'Butter Chicken (Boneless)', qty: 1, station: 'Curry', isDone: false, modifiers: 'Medium rich gravy' },
      { id: 'k3', name: 'Garlic Naan (Crispy)', qty: 2, station: 'Tandoor', isDone: false, modifiers: 'Crispy butter brushed' },
      { id: 'k4', name: 'Coke (Zero Sugar 300ml)', qty: 2, station: 'Bar', isDone: true, modifiers: 'Chilled with ice' },
    ],
  },
  {
    id: '#KOT-847',
    table: 'Table T-04',
    orderType: 'Dine-In',
    pax: 2,
    server: 'Service Staff',
    elapsedMinutes: 19,
    isUrgent: true,
    status: 'cooking',
    items: [
      { id: 'k5', name: 'Tandoori Chicken (Full)', qty: 1, station: 'Tandoor', isDone: false, modifiers: 'Extra degi mirch', specialNote: 'ALLERGY: No peanuts' },
      { id: 'k6', name: 'Dal Makhani SpiceRoute', qty: 1, station: 'Curry', isDone: true, modifiers: 'White butter dollop' },
      { id: 'k7', name: 'Tandoori Roti (Butter)', qty: 4, station: 'Tandoor', isDone: false },
    ],
  },
  {
    id: '#KOT-846',
    table: 'Takeaway #22',
    orderType: 'Takeaway',
    pax: 1,
    server: 'Meera K.',
    elapsedMinutes: 6,
    status: 'ready',
    items: [
      { id: 'k8', name: 'Hyderabadi Veg Biryani', qty: 1, station: 'Pantry', isDone: true, modifiers: 'Pack with double salan' },
      { id: 'k9', name: 'Burani Garlic Raita', qty: 1, station: 'Pantry', isDone: true },
    ],
  },
  {
    id: '#KOT-845',
    table: 'Table T-16',
    orderType: 'Dine-In',
    pax: 2,
    server: 'Rajesh P.',
    elapsedMinutes: 3,
    status: 'new',
    items: [
      { id: 'k10', name: 'Chicken Dum Biryani (Handi)', qty: 1, station: 'Pantry', isDone: false, modifiers: 'Boneless piece' },
      { id: 'k11', name: 'Mirchi Ka Salan', qty: 1, station: 'Curry', isDone: false },
      { id: 'k12', name: 'Gulab Jamun (2 pcs Hot)', qty: 1, station: 'Pantry', isDone: false },
    ],
  },
];

export const KitchenDisplayView: React.FC = () => {
  const [selectedStation, setSelectedStation] = useState<string>('all');
  const [tickets, setTickets] = useState<KdTicket[]>(INITIAL_KDS_TICKETS);
  const [chimeOn, setChimeOn] = useState(true);
  const [isExpoOpen, setIsExpoOpen] = useState(false);
  const [expoData, setExpoData] = useState<any>(null);
  const [slaMetrics, setSlaMetrics] = useState<any>(null);

  const fetchTickets = () => {
    api.getKdsTickets().then((res) => {
      if (res.success && res.data && res.data.length > 0) {
        setTickets(res.data);
      }
    }).catch(() => {});

    api.getKdsSlaMetrics().then((res) => {
      if (res.success && res.data) setSlaMetrics(res.data);
    }).catch(() => {});
  };

  const openExpoModal = () => {
    api.getKdsExpoSummary().then((res) => {
      if (res.success && res.data) {
        setExpoData(res.data);
        setIsExpoOpen(true);
      }
    }).catch(() => setIsExpoOpen(true));
  };

  useEffect(() => {
    fetchTickets();

    // 1. Live elapsed timer tick
    const timerInterval = setInterval(() => {
      setTickets((prev) =>
        prev.map((t) => ({
          ...t,
          elapsedMinutes: t.elapsedMinutes + 1,
        }))
      );
    }, 30000);

    // 2. Realtime WebSocket listener
    const unsub = subscribeRealtime((event) => {
      if (
        event.type === 'ORDER_CREATED' ||
        event.type === 'KDS_TICKET_BUMPED' ||
        event.type === 'KDS_ITEM_BUMPED' ||
        event.type === 'KDS_ROUTING_PROCESSED'
      ) {
        fetchTickets();
      }
    });

    return () => {
      clearInterval(timerInterval);
      unsub();
    };
  }, []);

  const toggleItemDone = (ticketId: string, itemId: string) => {
    // Optimistic update
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          const updatedItems = t.items.map((it) =>
            it.id === itemId ? { ...it, isDone: !it.isDone } : it
          );
          const allDone = updatedItems.every((it) => it.isDone);
          return {
            ...t,
            items: updatedItems,
            status: allDone ? 'ready' : 'cooking',
          };
        }
        return t;
      })
    );

    api.toggleKdsItem(ticketId, itemId).catch(() => {});
  };

  const bumpTicket = (ticketId: string) => {
    setTickets((prev) => prev.filter((t) => t.id !== ticketId));
    api.bumpKdsTicket(ticketId).catch(() => {});
  };

  const filteredTickets = tickets
    .map((ticket) => {
      if (selectedStation === 'all') return ticket;
      const matchingItems = ticket.items.filter((it) =>
        it.station.toLowerCase().includes(selectedStation.toLowerCase())
      );
      return matchingItems.length > 0 ? { ...ticket, items: matchingItems } : null;
    })
    .filter(Boolean) as KdTicket[];

  return (
    <div className="flex flex-col w-full pb-16 space-y-space-md">
      {/* Top Operational Alert Strip */}
      <section className="pt-2">
        <div className="bg-surface-container-low rounded-xl p-space-md flex flex-wrap items-center justify-between gap-space-md shadow-md border border-surface-container-high/30">
          {/* Station Filters */}
          <div className="flex items-center gap-space-xs overflow-x-auto py-1 max-w-3xl">
            {[
              { id: 'all', label: 'All Stations', icon: 'splitscreen', count: 8 },
              { id: 'tandoor', label: 'Tandoor / Grill', icon: 'local_fire_department', count: 3 },
              { id: 'curry', label: 'Curry & Gravy', icon: 'soup_kitchen', count: 4 },
              { id: 'fryer', label: 'Fryer & Starters', icon: 'skillet', count: 2 },
              { id: 'breads', label: 'Breads & Rice', icon: 'bakery_dining', count: 3 },
              { id: 'beverage', label: 'Beverage & Pantry', icon: 'local_cafe' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setSelectedStation(st.id)}
                className={`flex items-center gap-space-xs px-space-md py-2 rounded-lg font-label-md text-label-md whitespace-nowrap transition-all ${
                  selectedStation === st.id
                    ? 'bg-primary-container text-on-primary-container font-bold shadow-sm'
                    : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{st.icon}</span>
                <span>{st.label}</span>
                {st.count !== undefined && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full bg-black/20 font-mono-metric text-label-sm">
                    {st.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* KDS Action Tools */}
          <div className="flex items-center gap-space-xs flex-wrap">
            <button
              onClick={() => setChimeOn(!chimeOn)}
              className="flex items-center gap-1.5 px-space-sm py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-secondary font-label-sm text-label-sm transition-colors border border-surface-container-high/40"
            >
              <span className="material-symbols-outlined text-[18px]">
                {chimeOn ? 'volume_up' : 'volume_off'}
              </span>
              <span className="hidden sm:inline">Chime: {chimeOn ? 'ON' : 'OFF'}</span>
            </button>
            <button
              onClick={() => setTickets(INITIAL_KDS_TICKETS)}
              className="flex items-center gap-1.5 px-space-sm py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-label-sm transition-colors border border-surface-container-high/40"
            >
              <span className="material-symbols-outlined text-[18px]">history</span>
              <span>Recall</span>
            </button>
            <button
              onClick={openExpoModal}
              className="flex items-center gap-1.5 px-space-sm py-2 rounded-lg bg-tertiary-container/20 text-tertiary hover:bg-tertiary-container/30 font-label-sm text-label-sm transition-colors font-semibold"
            >
              <span className="material-symbols-outlined text-[18px]">view_kanban</span>
              <span>Expo View</span>
            </button>
          </div>
        </div>
      </section>

      {/* Real-Time Kitchen KPIs & Telemetry Bar */}
      <section className="grid grid-cols-2 md:grid-cols-5 gap-space-sm">
        <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col justify-between shadow-sm border border-surface-container-high/30">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
              Active Tickets
            </span>
            <span className="material-symbols-outlined text-primary text-[20px]">assignment</span>
          </div>
          <div className="flex items-baseline gap-space-xs mt-2">
            <span className="font-display-lg text-display-lg text-on-surface font-black">8</span>
            <span className="font-label-sm text-label-sm text-on-surface-variant">Live KOTs</span>
          </div>
          <div className="w-full bg-surface-container-highest h-1 rounded-full mt-2 overflow-hidden">
            <div className="bg-primary h-full rounded-full" style={{ width: '80%' }} />
          </div>
        </div>

        <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col justify-between shadow-sm border border-surface-container-high/30">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
              In Prep / Line
            </span>
            <span className="material-symbols-outlined text-tertiary text-[20px]">skillet</span>
          </div>
          <div className="flex items-baseline gap-space-xs mt-2">
            <span className="font-display-lg text-display-lg text-tertiary font-black">5</span>
            <span className="font-label-sm text-label-sm text-on-surface-variant">Cooking</span>
          </div>
          <div className="w-full bg-surface-container-highest h-1 rounded-full mt-2 overflow-hidden">
            <div className="bg-tertiary h-full rounded-full" style={{ width: '60%' }} />
          </div>
        </div>

        <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col justify-between shadow-sm border border-surface-container-high/30">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
              Ready on Pass
            </span>
            <span className="material-symbols-outlined text-secondary text-[20px]">check_circle</span>
          </div>
          <div className="flex items-baseline gap-space-xs mt-2">
            <span className="font-display-lg text-display-lg text-secondary font-black">3</span>
            <span className="font-label-sm text-label-sm text-on-surface-variant">To Expedit</span>
          </div>
          <div className="w-full bg-surface-container-highest h-1 rounded-full mt-2 overflow-hidden">
            <div className="bg-secondary h-full rounded-full" style={{ width: '35%' }} />
          </div>
        </div>

        <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col justify-between shadow-sm border border-surface-container-high/30">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
              Avg Ticket Time
            </span>
            <span className="material-symbols-outlined text-primary text-[20px]">timer</span>
          </div>
          <div className="flex items-baseline gap-space-xs mt-2">
            <span className="font-headline-xl text-headline-xl text-on-surface font-mono-metric font-bold">
              11m 42s
            </span>
          </div>
          <span className="text-[11px] text-secondary font-medium">● Target under 15m</span>
        </div>

        <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col justify-between shadow-sm border border-surface-container-high/30">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-error uppercase tracking-wider font-semibold">
              Critical Delays
            </span>
            <span className="material-symbols-outlined text-error text-[20px]">warning</span>
          </div>
          <div className="flex items-baseline gap-space-xs mt-2">
            <span className="font-display-lg text-display-lg text-error font-black">1</span>
            <span className="font-label-sm text-label-sm text-error font-semibold">&gt;18m Overdue</span>
          </div>
          <span className="text-[11px] text-error font-medium animate-pulse">Ticket #847 priority</span>
        </div>
      </section>

      {/* Live KDS Multi-Lane Kanban Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-space-md">
        {filteredTickets.map((ticket) => {
          const isOverdue = ticket.elapsedMinutes >= 18;
          return (
            <div
              key={ticket.id}
              className={`rounded-2xl flex flex-col justify-between shadow-lg overflow-hidden border transition-all ${
                isOverdue
                  ? 'bg-surface-container-low border-error ring-1 ring-error/60'
                  : ticket.status === 'ready'
                  ? 'bg-surface-container-low border-secondary/60 ring-1 ring-secondary/30'
                  : 'bg-surface-container-low border-surface-container-high'
              }`}
            >
              {/* Ticket Header */}
              <div
                className={`p-space-md flex items-center justify-between border-b ${
                  isOverdue
                    ? 'bg-error-container/20 border-error/40 text-error'
                    : 'bg-surface-container border-surface-container-high text-on-surface'
                }`}
              >
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-headline-md text-headline-md font-black">
                      {ticket.table}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-surface-container-lowest text-xs font-mono-metric font-bold">
                      {ticket.id}
                    </span>
                  </div>
                  <span className="text-xs text-on-surface-variant font-medium mt-0.5">
                    {ticket.orderType} · Server {ticket.server}
                  </span>
                </div>

                <div className="flex flex-col items-end">
                  <span
                    className={`font-mono-metric font-black text-lg ${
                      isOverdue ? 'text-error animate-pulse' : 'text-primary'
                    }`}
                  >
                    ⏱ {ticket.elapsedMinutes}m
                  </span>
                  <span className="text-[10px] uppercase font-bold text-on-surface-variant">
                    {isOverdue ? 'RUSH OVERDUE' : 'PREPPING'}
                  </span>
                </div>
              </div>

              {/* Line Items List */}
              <div className="p-space-md flex flex-col gap-2 flex-1 max-h-[380px] overflow-y-auto">
                {ticket.items.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => toggleItemDone(ticket.id, item.id)}
                    className={`p-2.5 rounded-xl cursor-pointer transition-all border ${
                      item.isDone
                        ? 'bg-surface-container-lowest/40 opacity-50 line-through border-transparent'
                        : 'bg-surface-container hover:bg-surface-container-high border-surface-container-high/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2">
                        <span className="font-mono-metric font-black text-primary text-base">
                          {item.qty}x
                        </span>
                        <div className="flex flex-col">
                          <span
                            className={`font-label-lg text-label-lg font-bold ${
                              item.isDone ? 'text-on-surface-variant' : 'text-on-surface'
                            }`}
                          >
                            {item.name}
                          </span>
                          {item.modifiers && (
                            <span className="text-xs text-primary font-medium">
                              {item.modifiers}
                            </span>
                          )}
                          {item.specialNote && (
                            <span className="text-xs text-error font-bold mt-0.5 bg-error-container/30 px-1.5 py-0.5 rounded w-fit">
                              ⚠️ {item.specialNote}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            const STATIONS = ['Tandoor', 'Curry', 'Bar', 'Pantry', 'Dessert'];
                            const nextIndex = (STATIONS.indexOf(item.station) + 1) % STATIONS.length;
                            const newStation = STATIONS[nextIndex];
                            try {
                              await api.reassignKdsItemStation(ticket.id, item.id, { newStation });
                              fetchTickets();
                            } catch {}
                          }}
                          className="px-2 py-0.5 rounded bg-surface-container-lowest hover:bg-surface-container-high text-[10px] uppercase font-mono-metric text-on-surface-variant shrink-0"
                          title="Click to cycle station routing"
                        >
                          {item.station} ➔
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Bump Button */}
              <div className="p-space-md bg-surface-container border-t border-surface-container-high/40 flex items-center justify-between gap-2">
                <button
                  onClick={() => bumpTicket(ticket.id)}
                  className={`w-full py-3 rounded-xl font-headline-md font-bold flex items-center justify-center gap-2 shadow-md transition-all ${
                    ticket.status === 'ready'
                      ? 'bg-secondary text-on-secondary hover:brightness-110'
                      : 'bg-primary-container text-on-primary-container hover:brightness-110'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {ticket.status === 'ready' ? 'check_circle' : 'restaurant'}
                  </span>
                  <span>{ticket.status === 'ready' ? 'Bump Expedited (Done)' : 'Mark All Ready'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </section>
      {/* KDS Expo Aggregate Master Modal */}
      {isExpoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl bg-surface-container rounded-2xl p-space-lg shadow-2xl border border-surface-container-high flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-surface-container-high/40 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[24px]">view_kanban</span>
                <div>
                  <h3 className="font-headline-md font-bold text-on-surface">Kitchen Expo Master Screen</h3>
                  <p className="text-xs text-on-surface-variant">Live consolidated item prep requirements across all stations</p>
                </div>
              </div>
              <button
                onClick={() => setIsExpoOpen(false)}
                className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="p-2.5 bg-surface-container-lowest rounded-xl border border-surface-container-high/30 flex flex-col">
                <span className="text-[10px] uppercase font-bold text-on-surface-variant">Active KOTs</span>
                <span className="font-mono text-base font-bold text-on-surface">{expoData?.activeTicketsCount || tickets.length}</span>
              </div>
              <div className="p-2.5 bg-surface-container-lowest rounded-xl border border-surface-container-high/30 flex flex-col">
                <span className="text-[10px] uppercase font-bold text-error">Urgent Tickets</span>
                <span className="font-mono text-base font-bold text-error">{expoData?.urgentTicketsCount || 1}</span>
              </div>
              <div className="p-2.5 bg-surface-container-lowest rounded-xl border border-surface-container-high/30 flex flex-col">
                <span className="text-[10px] uppercase font-bold text-primary">Oldest Wait</span>
                <span className="font-mono text-base font-bold text-primary">{expoData?.oldestWaitMinutes || 19} mins</span>
              </div>
              <div className="p-2.5 bg-surface-container-lowest rounded-xl border border-surface-container-high/30 flex flex-col">
                <span className="text-[10px] uppercase font-bold text-secondary">SLA On-Time</span>
                <span className="font-mono text-base font-bold text-secondary">{slaMetrics?.onTimePercentage || 94.2}%</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1">
              <span className="text-xs font-bold uppercase text-on-surface-variant">Aggregated Prep Requirements:</span>
              {(expoData?.aggregatedDishes || [
                { name: 'Butter Chicken (Boneless)', station: 'Curry', totalQty: 3, ticketCount: 3 },
                { name: 'Paneer Tikka (Tandoor)', station: 'Tandoor', totalQty: 4, ticketCount: 2 },
                { name: 'Garlic Naan (Crispy)', station: 'Tandoor', totalQty: 6, ticketCount: 3 },
                { name: 'Chicken Dum Biryani', station: 'Pantry', totalQty: 2, ticketCount: 2 },
              ]).map((dish: any, idx: number) => (
                <div key={idx} className="p-3 bg-surface-container-lowest rounded-xl border border-surface-container-high/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-primary-container/20 text-primary font-mono font-bold flex items-center justify-center text-sm">
                      {dish.totalQty}x
                    </span>
                    <div className="flex flex-col">
                      <span className="font-bold text-xs text-on-surface">{dish.name}</span>
                      <span className="text-[10px] text-on-surface-variant font-mono">Needed for {dish.ticketCount} tickets</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-surface-container text-xs font-mono font-bold text-primary uppercase">
                    {dish.station}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-surface-container-high/40">
              <button
                onClick={() => setIsExpoOpen(false)}
                className="px-4 py-2 rounded-lg bg-primary-container text-on-primary-container text-xs font-bold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
