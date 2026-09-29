import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { subscribeRealtime } from '../../hooks/useRealtimeSync';
import { useToast } from '../../contexts/ToastContext';
import { printThermalReceipt } from '../../utils/exportUtils';

export const CheckoutTerminalView: React.FC = () => {
  const toast = useToast();
  const [splitMode, setSplitMode] = useState<'full' | 'pax' | 'item' | 'custom'>('full');
  const [paxCount, setPaxCount] = useState(4);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'cash'>('upi');
  const [cashTendered, setCashTendered] = useState<number>(2000);
  const [ordersList, setOrdersList] = useState<any[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string>('#ORD-10482');
  const [settledReceipt, setSettledReceipt] = useState<any>(null);

  const fetchOrders = () => {
    api.getOrders().then((res) => {
      if (res.success && res.data && res.data.length > 0) {
        setOrdersList(res.data);
      }
    }).catch(() => {});
  };

  useEffect(() => {
    fetchOrders();

    const unsub = subscribeRealtime((event) => {
      if (event.type === 'ORDER_CREATED' || event.type === 'ORDER_UPDATED' || event.type === 'ORDER_SETTLED') {
        fetchOrders();
      }
    });

    return () => unsub();
  }, []);

  const currentOrder = ordersList.find((o) => o.id === selectedOrderId) || ordersList[0] || {
    id: '#ORD-10482',
    table: 'Table T-12',
    customer: 'Ananya Verma',
    itemsCount: 5,
    total: 1840,
    subtotal: 1540,
    taxes: 120,
    serviceCharge: 180,
    lineItems: [
      { name: 'Paneer Tikka (Tandoor)', qty: 2, price: 580 },
      { name: 'Butter Chicken (Boneless)', qty: 1, price: 380 },
      { name: 'Garlic Naan', qty: 2, price: 160 },
      { name: 'Coke Zero Sugar', qty: 2, price: 120 },
    ],
  };

  const totalPayable = currentOrder.total || 1840;
  const changeDue = Math.max(0, cashTendered - totalPayable);

  return (
    <div className="flex flex-col w-full pb-16 space-y-space-md">
      {/* Top Status & Hardware Peripheral Telemetry Ribbon */}
      <header className="w-full bg-surface-container-low px-space-md lg:px-space-lg py-2.5 rounded-xl flex flex-wrap items-center justify-between gap-space-md shadow-sm border border-surface-container-high/30">
        <div className="flex items-center gap-space-lg">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-primary-container/15 text-primary">
              <span className="material-symbols-outlined text-[18px]">point_of_sale</span>
            </span>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-headline-md text-headline-md text-on-surface font-bold leading-tight">
                  Billing &amp; Split Settlement Terminal
                </span>
                <span className="px-2 py-0.5 rounded-full bg-secondary/15 text-secondary font-label-sm text-label-sm uppercase tracking-wider font-bold">
                  Shift 02 Live
                </span>
              </div>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Station #01 • Cashier: Maya Kulkarni • Supervisor: General Manager (L4)
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-space-sm py-1 rounded-lg bg-surface-container text-on-surface font-label-sm text-label-sm border border-surface-container-high/40">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            <span className="material-symbols-outlined text-[15px] text-on-surface-variant">print</span>
            <span>EPSON TM-T88VI</span>
          </div>
          <div className="flex items-center gap-1.5 px-space-sm py-1 rounded-lg bg-surface-container text-on-surface font-label-sm text-label-sm border border-surface-container-high/40">
            <span className="w-2 h-2 rounded-full bg-secondary" />
            <span className="material-symbols-outlined text-[15px] text-on-surface-variant">lock_open</span>
            <span>Till Drawer Ready</span>
          </div>
          <div className="flex items-center gap-1.5 px-space-sm py-1 rounded-lg bg-surface-container-high text-on-surface font-label-sm text-label-sm border border-surface-container-high/40 font-bold">
            <span className="material-symbols-outlined text-[16px] text-primary">account_balance_wallet</span>
            <span>Till: ₹28,450.00</span>
          </div>
        </div>
      </header>

      {/* Main Checkout 3-Panel Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md items-start">
        {/* Left: Active Check Bill Breakdown (4 Cols) */}
        <div className="lg:col-span-4 bg-surface-container-low rounded-2xl p-space-md shadow-sm flex flex-col gap-4 border border-surface-container-high/30">
          <div className="p-3 bg-surface-container rounded-xl flex items-center justify-between border border-surface-container-high/40">
            <div className="flex-1">
              <select
                value={selectedOrderId}
                onChange={(e) => setSelectedOrderId(e.target.value)}
                className="w-full bg-surface-container-lowest text-on-surface font-headline-md font-bold rounded-lg p-2 border border-surface-container-high outline-none cursor-pointer"
              >
                {ordersList.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.table} ({o.id}) - ₹{o.total}
                  </option>
                ))}
              </select>
              <span className="text-xs text-on-surface-variant block mt-1">
                {currentOrder.customer || 'Walk-in Guest'} · {currentOrder.phone || 'Standard'}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs uppercase font-bold text-on-surface-variant">Bill Line Items</span>
            <div className="divide-y divide-surface-container-high/30 bg-surface-container-lowest rounded-xl p-3 border border-surface-container-high/30 text-body-sm max-h-48 overflow-y-auto">
              {(
                currentOrder.lineItems || [
                  { name: 'Paneer Tikka (Tandoor)', qty: 2, price: 580 },
                  { name: 'Butter Chicken (Boneless)', qty: 1, price: 380 },
                  { name: 'Garlic Naan', qty: 2, price: 160 },
                  { name: 'Coke Zero Sugar', qty: 2, price: 120 },
                ]
              ).map((li: any, idx: number) => (
                <div key={idx} className="py-2 flex justify-between items-center">
                  <span>
                    {li.qty}x {li.name}
                  </span>
                  <span className="font-mono-metric font-bold">₹{(li.price || 200).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 bg-surface-container-lowest rounded-xl flex flex-col gap-1.5 font-mono-metric text-xs border border-surface-container-high/30">
            <div className="flex justify-between text-on-surface-variant">
              <span>Subtotal</span>
              <span className="text-on-surface font-bold">
                ₹{(currentOrder.subtotal || totalPayable * 0.85).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-on-surface-variant">
              <span>CGST @ 2.5%</span>
              <span className="text-on-surface">
                ₹{((currentOrder.subtotal || totalPayable * 0.85) * 0.025).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-on-surface-variant">
              <span>SGST @ 2.5%</span>
              <span className="text-on-surface">
                ₹{((currentOrder.subtotal || totalPayable * 0.85) * 0.025).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-on-surface-variant">
              <span>Service Charge (5%)</span>
              <span className="text-on-surface">
                ₹{((currentOrder.subtotal || totalPayable * 0.85) * 0.05).toFixed(2)}
              </span>
            </div>
            <div className="pt-2 border-t border-surface-container-high flex justify-between text-on-surface font-bold text-base">
              <span>Total Payable</span>
              <span className="text-primary font-bold text-xl">₹{totalPayable.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Center: Split Payment Calculator Engine (5 Cols) */}
        <div className="lg:col-span-5 bg-surface-container-low rounded-2xl p-space-md shadow-sm flex flex-col gap-4 border border-surface-container-high/30">
          <div className="flex items-center justify-between">
            <h2 className="font-headline-md font-bold text-on-surface">
              Split Settlement Matrix
            </h2>
            <span className="text-xs text-secondary font-bold">Balance: ₹{totalPayable}</span>
          </div>

          {/* Mode Selector */}
          <div className="grid grid-cols-4 gap-1 p-1 bg-surface-container-lowest rounded-xl border border-surface-container-high/40">
            {[
              { id: 'full', label: 'Full Pay' },
              { id: 'pax', label: 'By Pax' },
              { id: 'item', label: 'By Item' },
              { id: 'custom', label: 'Custom' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setSplitMode(m.id as any)}
                className={`py-2 text-center rounded-lg text-xs font-bold transition-all ${
                  splitMode === m.id
                    ? 'bg-primary-container text-on-primary-container shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {splitMode === 'pax' && (
            <div className="flex flex-col gap-3 p-3 bg-surface-container rounded-xl border border-surface-container-high/30">
              <div className="flex items-center justify-between">
                <span className="text-body-sm font-semibold text-on-surface">Split between Guests:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPaxCount(Math.max(2, paxCount - 1))}
                    className="w-8 h-8 rounded bg-surface-container-lowest text-on-surface font-bold flex items-center justify-center border border-surface-container-high"
                  >
                    -
                  </button>
                  <span className="font-mono-metric font-bold text-primary">{paxCount} Pax</span>
                  <button
                    onClick={() => setPaxCount(paxCount + 1)}
                    className="w-8 h-8 rounded bg-surface-container-lowest text-on-surface font-bold flex items-center justify-center border border-surface-container-high"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 font-mono-metric">
                {Array.from({ length: paxCount }).map((_, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-lg bg-surface-container-lowest flex justify-between items-center border border-surface-container-high/30"
                  >
                    <span className="text-xs text-on-surface-variant">Guest {i + 1}</span>
                    <span className="font-bold text-on-surface">
                      ₹{(totalPayable / paxCount).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payment Method Selector */}
          <div className="flex flex-col gap-2">
            <span className="text-xs uppercase font-bold text-on-surface-variant">Tender Method</span>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setPaymentMethod('upi')}
                className={`py-3 rounded-xl font-label-md font-bold flex flex-col items-center gap-1 transition-all ${
                  paymentMethod === 'upi'
                    ? 'bg-primary-container text-on-primary-container shadow-md'
                    : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                }`}
              >
                <span className="material-symbols-outlined text-[24px]">qr_code_2</span>
                <span>BharatQR / UPI</span>
              </button>
              <button
                onClick={() => setPaymentMethod('card')}
                className={`py-3 rounded-xl font-label-md font-bold flex flex-col items-center gap-1 transition-all ${
                  paymentMethod === 'card'
                    ? 'bg-primary-container text-on-primary-container shadow-md'
                    : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                }`}
              >
                <span className="material-symbols-outlined text-[24px]">credit_card</span>
                <span>PineLabs EDC</span>
              </button>
              <button
                onClick={() => setPaymentMethod('cash')}
                className={`py-3 rounded-xl font-label-md font-bold flex flex-col items-center gap-1 transition-all ${
                  paymentMethod === 'cash'
                    ? 'bg-primary-container text-on-primary-container shadow-md'
                    : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                }`}
              >
                <span className="material-symbols-outlined text-[24px]">payments</span>
                <span>Cash Drawer</span>
              </button>
            </div>
          </div>

          {paymentMethod === 'cash' && (
            <div className="p-3 bg-surface-container rounded-xl flex flex-col gap-2 border border-surface-container-high/30">
              <div className="flex justify-between items-center text-body-sm">
                <span className="text-on-surface-variant font-medium">Cash Tendered:</span>
                <input
                  type="number"
                  value={cashTendered}
                  onChange={(e) => setCashTendered(Number(e.target.value))}
                  className="w-28 bg-surface-container-lowest px-2 py-1 rounded text-right font-mono-metric font-bold text-on-surface border border-surface-container-high"
                />
              </div>
              <div className="flex gap-1.5">
                {[2000, 2500, 3000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setCashTendered(amt)}
                    className="flex-1 py-1 rounded bg-surface-container-lowest hover:bg-surface-container-high text-xs font-mono-metric font-bold text-primary border border-surface-container-high/30"
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>
              <div className="pt-2 border-t border-surface-container-high/40 flex justify-between items-center text-base">
                <span className="font-bold text-on-surface">Change Due:</span>
                <span className="font-mono-metric text-secondary font-black text-lg">
                  ₹{changeDue.toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right: Dynamic QR / Settlement Trigger (3 Cols) */}
        <div className="lg:col-span-3 bg-surface-container-low rounded-2xl p-space-md shadow-sm flex flex-col justify-between gap-4 border border-surface-container-high/30">
          <div className="flex flex-col items-center text-center gap-3">
            {settledReceipt ? (
              <div className="w-full p-4 bg-secondary/15 rounded-xl border border-secondary/40 text-left flex flex-col gap-2">
                <span className="font-bold text-secondary text-sm flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  Settlement Confirmed
                </span>
                <span className="font-mono-metric font-bold text-on-surface text-base">
                  Receipt: {settledReceipt.receiptNumber || 'RCP-LIVE'}
                </span>
                <p className="text-xs text-on-surface-variant">
                  {settledReceipt.message || 'Table released & thermal receipt printed.'}
                </p>
              </div>
            ) : null}

            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Live BharatQR Dynamic Soundbox
            </span>

            {/* Simulated Dynamic QR Box */}
            <div className="w-48 h-48 bg-white p-3 rounded-2xl shadow-xl flex flex-col items-center justify-center border-4 border-primary-container">
              <div className="w-full h-full bg-gray-900 rounded-xl flex flex-col items-center justify-center text-white p-2 text-center">
                <span className="material-symbols-outlined text-[48px] text-primary">qr_code_2</span>
                <span className="text-[10px] font-mono-metric mt-1 text-gray-300">
                  Scan with GPay / Paytm / PhonePe
                </span>
                <span className="text-xs font-bold text-yellow-400 font-mono-metric mt-1">
                  ₹{totalPayable.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/15 text-secondary text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span>Listening for Soundbox Ping...</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={async () => {
                try {
                  if (splitMode === 'pax') {
                    // Real backend multi-tender split settlement
                    const splitAmt = Number((totalPayable / paxCount).toFixed(2));
                    const splitPayload = {
                      orderId: currentOrder.id,
                      tableId: currentOrder.table,
                      splits: Array.from({ length: paxCount }).map((_, i) => ({
                        guestIndex: i + 1,
                        guestName: `Guest ${i + 1}`,
                        amount: i === paxCount - 1 ? totalPayable - (splitAmt * (paxCount - 1)) : splitAmt,
                        method: paymentMethod.toUpperCase(),
                      })),
                      tipAmount: 0,
                    };
                    const res = await api.settleSplitCheckout(splitPayload);
                    setSettledReceipt(res);
                    toast.success(`Split bill of ₹${totalPayable} settled across ${paxCount} guests! Receipt ${res.receiptNumber} generated.`, 'Split Bill Settled');
                    fetchOrders();
                  } else {
                    // Single tender settlement
                    const res = await api.settleCheckout({
                      orderId: currentOrder.id,
                      tableId: currentOrder.table,
                      paymentMethod: paymentMethod.toUpperCase(),
                      amountPaid: totalPayable,
                      customerName: currentOrder.customer,
                      customerPhone: currentOrder.phone,
                    });
                    setSettledReceipt(res);
                    toast.success(`Payment of ₹${totalPayable} settled successfully! Receipt ${res.receiptNumber || 'RCP-LIVE'} generated.`, 'Bill Settled');
                    fetchOrders();
                  }
                } catch (err: any) {
                  toast.error(err.message || 'Settlement failed', 'Error');
                }
              }}
              className="w-full py-3.5 rounded-xl bg-secondary text-on-secondary font-headline-md font-black shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[22px]">done_all</span>
              <span>{splitMode === 'pax' ? `Confirm & Settle ${paxCount}-Way Split` : 'Confirm & Close Bill'}</span>
            </button>
            <button
              onClick={() => {
                const subtotal = Math.round(totalPayable * 0.9);
                const cgst = Math.round(subtotal * 0.025 * 100) / 100;
                const sgst = cgst;
                const serviceCharge = Math.round(subtotal * 0.05 * 100) / 100;
                printThermalReceipt({
                  orderId: currentOrder.id,
                  table: currentOrder.table,
                  customer: currentOrder.customer,
                  phone: currentOrder.phone,
                  staff: currentOrder.staff || 'Cashier Station 01',
                  items: currentOrder.items && currentOrder.items.length > 0
                    ? currentOrder.items
                    : [{ name: currentOrder.itemsSummary || 'Dine-In Dishes', qty: currentOrder.itemsCount || 1, price: subtotal }],
                  subtotal,
                  cgst,
                  sgst,
                  serviceCharge,
                  total: totalPayable,
                  paymentMethod: splitMode === 'pax' ? `${paxCount}-Way Split (${paymentMethod.toUpperCase()})` : paymentMethod.toUpperCase(),
                });
                toast.info(`Opened 80mm receipt preview for ${currentOrder.table}`, 'Thermal Preview');
              }}
              className="w-full py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold border border-surface-container-high/40 flex items-center justify-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">print</span>
              <span>Print Preview</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
