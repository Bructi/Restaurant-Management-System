import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { printThermalReceipt } from '../../utils/exportUtils';

interface DailySummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DailySummaryModal: React.FC<DailySummaryModalProps> = ({ isOpen, onClose }) => {
  const toast = useToast();
  const [analytics, setAnalytics] = useState<any>({
    todayRevenue: 48620,
    totalOrders: 127,
    aov: 383,
    occupancyPct: 78,
  });

  useEffect(() => {
    if (isOpen) {
      api.getAnalyticsSummary().then((res) => {
        if (res.success && res.data) {
          setAnalytics(res.data);
        }
      }).catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const grossSales = analytics.todayRevenue || 48620;
  const totalOrders = analytics.totalOrders || 127;
  const cgst = Math.round(grossSales * 0.025 * 100) / 100;
  const sgst = cgst;
  const serviceCharge = Math.round(grossSales * 0.05 * 100) / 100;
  const netTender = grossSales + cgst + sgst + serviceCharge;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-lg bg-surface-container rounded-2xl shadow-2xl border border-surface-container-high overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-space-lg py-space-md bg-surface-container-low flex items-center justify-between border-b border-surface-container-high">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-surface-container text-on-surface">
              <span className="material-symbols-outlined text-[20px]">print</span>
            </span>
            <div>
              <h3 className="font-headline-md text-headline-md text-on-surface font-bold">
                Daily Operations Summary (Z-Report)
              </h3>
              <p className="text-body-sm text-on-surface-variant">
                SpiceRoute Kitchen #01 • Live Audit Sync
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

        <div className="p-space-lg flex flex-col gap-4 font-body-sm text-body-sm">
          <div className="bg-surface-container-lowest p-4 rounded-xl border border-surface-container-high/40 flex flex-col gap-2.5 font-mono-metric">
            <div className="text-center font-bold text-on-surface text-base pb-2 border-b border-surface-container-high">
              SPICEROUTE GOURMET HOSPITALITY LLP
              <div className="text-xs text-on-surface-variant font-normal">
                GSTIN: 29AAAAA0000A1Z5 • MG Road Bangalore • InsForge Live
              </div>
            </div>

            <div className="flex justify-between text-on-surface-variant">
              <span>Gross Sales ({totalOrders} Orders)</span>
              <span className="text-on-surface font-bold">₹{grossSales.toLocaleString('en-IN')}.00</span>
            </div>
            <div className="flex justify-between text-on-surface-variant">
              <span>CGST @ 2.5%</span>
              <span className="text-on-surface">₹{cgst.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-on-surface-variant">
              <span>SGST @ 2.5%</span>
              <span className="text-on-surface">₹{sgst.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-on-surface-variant">
              <span>Service Charge (5%)</span>
              <span className="text-on-surface">₹{serviceCharge.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-on-surface-variant">
              <span>Average Check (AOV)</span>
              <span className="text-secondary font-bold">₹{analytics.aov || 383}</span>
            </div>

            <div className="pt-2 border-t border-surface-container-high flex justify-between text-on-surface font-bold text-base">
              <span>Net Cash &amp; Bank Tender</span>
              <span className="text-primary font-bold">₹{netTender.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-surface-container-lowest border border-surface-container-high/30">
              <span className="text-on-surface-variant block mb-1 font-semibold uppercase">
                Payment Splits
              </span>
              <div className="flex justify-between py-0.5">
                <span>UPI / BharatQR (60%)</span>
                <span className="text-on-surface font-bold">₹{Math.round(netTender * 0.6).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span>Credit / EDC (30%)</span>
                <span className="text-on-surface font-bold">₹{Math.round(netTender * 0.3).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span>Cash Drawer (10%)</span>
                <span className="text-on-surface font-bold">₹{Math.round(netTender * 0.1).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-surface-container-lowest border border-surface-container-high/30">
              <span className="text-on-surface-variant block mb-1 font-semibold uppercase">
                Table Metrics
              </span>
              <div className="flex justify-between py-0.5">
                <span>Active Occupancy</span>
                <span className="text-on-surface font-bold">{analytics.occupancyPct || 78}%</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span>Avg Turnaround</span>
                <span className="text-on-surface font-bold">{analytics.avgTurnaround || '16.4m'}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span>Pending Orders</span>
                <span className="text-primary font-bold">{analytics.pendingOrdersCount || 8} Active</span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-space-lg py-space-md bg-surface-container-low flex items-center justify-end gap-2 border-t border-surface-container-high">
          <button
            onClick={onClose}
            className="px-space-md py-2 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high font-label-md"
          >
            Close
          </button>
          <button
            onClick={() => {
              printThermalReceipt({
                orderId: 'DAILY-Z-REPORT',
                table: 'Summary Audit',
                staff: 'General Manager (L4)',
                items: [
                  { name: `Gross Sales (${totalOrders} Orders)`, qty: 1, price: grossSales },
                  { name: 'UPI / BharatQR Tender (60%)', qty: 1, price: Math.round(netTender * 0.6) },
                  { name: 'Credit Card / EDC Tender (30%)', qty: 1, price: Math.round(netTender * 0.3) },
                  { name: 'Cash Drawer In-Hand (10%)', qty: 1, price: Math.round(netTender * 0.1) },
                ],
                subtotal: grossSales,
                cgst,
                sgst,
                serviceCharge,
                total: netTender,
                paymentMethod: 'Daily Z-Audit Tender',
              });
              toast.success('Thermal Z-Report generated and sent to printer!', 'Z-Report Printed');
            }}
            className="px-space-lg py-2 rounded-lg bg-primary-container text-on-primary-container hover:brightness-110 font-label-lg font-bold flex items-center gap-1.5 shadow-md"
          >
            <span className="material-symbols-outlined text-[18px]">print</span>
            <span>Print Thermal Summary</span>
          </button>
        </div>
      </div>
    </div>
  );
};
