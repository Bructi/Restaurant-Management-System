import React from 'react';
import { LiveOrder } from '../../types';
import { useToast } from '../../contexts/ToastContext';
import { printThermalReceipt } from '../../utils/exportUtils';

interface OrderTicketModalProps {
  order: LiveOrder | null;
  onClose: () => void;
}

export const OrderTicketModal: React.FC<OrderTicketModalProps> = ({ order, onClose }) => {
  const toast = useToast();
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-md bg-surface-container rounded-2xl shadow-2xl border border-surface-container-high overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-space-lg py-space-md bg-surface-container-low flex items-center justify-between border-b border-surface-container-high">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-surface-container text-primary">
              <span className="material-symbols-outlined text-[20px]">receipt_long</span>
            </span>
            <div>
              <h3 className="font-headline-md text-headline-md text-on-surface font-bold">
                {order.id}
              </h3>
              <p className="text-body-sm text-on-surface-variant">
                {order.tableOrType} • {order.customer}
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

        {/* Body */}
        <div className="p-space-lg flex flex-col gap-4 font-body-sm">
          <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-lowest border border-surface-container-high/30">
            <div className="flex flex-col">
              <span className="text-xs text-on-surface-variant">Order Status</span>
              <span className="font-semibold text-on-surface">{order.statusLabel}</span>
            </div>
            <div className="flex flex-col text-right">
              <span className="text-xs text-on-surface-variant">Placed Time</span>
              <span className="font-mono-metric text-on-surface">{order.time}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
              Ordered Items Breakdown
            </span>
            <div className="divide-y divide-surface-container-high/40 bg-surface-container-lowest rounded-lg p-2 border border-surface-container-high/30">
              <div className="py-2 flex justify-between">
                <span>1x Butter Chicken (Boneless)</span>
                <span className="font-mono-metric font-semibold">₹340</span>
              </div>
              <div className="py-2 flex justify-between">
                <span>2x Garlic Naan (Butter brushed)</span>
                <span className="font-mono-metric font-semibold">₹160</span>
              </div>
              <div className="py-2 flex justify-between">
                <span>1x Paneer Tikka Platter</span>
                <span className="font-mono-metric font-semibold">₹290</span>
              </div>
              <div className="py-2 flex justify-between">
                <span>1x Masala Chaas (Spiced)</span>
                <span className="font-mono-metric font-semibold">₹90</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-surface-container-high text-base">
            <span className="font-semibold text-on-surface">Total Payable</span>
            <span className="font-mono-metric text-primary font-bold text-lg">
              ₹{order.amount.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-space-lg py-space-md bg-surface-container-low flex items-center justify-end gap-2 border-t border-surface-container-high">
          <button
            onClick={onClose}
            className="px-space-md py-2 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high font-label-md"
          >
            Close
          </button>
          <button
            onClick={() => {
              const subtotal = Math.round(order.amount * 0.9);
              const cgst = Math.round(subtotal * 0.025 * 100) / 100;
              const sgst = cgst;
              const serviceCharge = Math.round(subtotal * 0.05 * 100) / 100;
              printThermalReceipt({
                orderId: order.id,
                table: order.tableOrType,
                customer: order.customer,
                items: [
                  { name: 'Butter Chicken (Boneless)', qty: 1, price: 340 },
                  { name: 'Garlic Naan (Butter brushed)', qty: 2, price: 160 },
                  { name: 'Paneer Tikka Platter', qty: 1, price: 290 },
                  { name: 'Masala Chaas (Spiced)', qty: 1, price: 90 },
                ],
                subtotal,
                cgst,
                sgst,
                serviceCharge,
                total: order.amount,
                paymentMethod: order.statusLabel.includes('Paid') ? 'Paid' : 'Unpaid Ticket',
                date: order.time,
              });
              toast.success(`Reprinted thermal ticket for ${order.id}!`, 'Ticket Printed');
              onClose();
            }}
            className="px-space-lg py-2 rounded-lg bg-primary-container text-on-primary-container hover:brightness-110 font-label-lg font-bold flex items-center gap-1.5 shadow-md"
          >
            <span className="material-symbols-outlined text-[18px]">print</span>
            <span>Reprint Receipt</span>
          </button>
        </div>
      </div>
    </div>
  );
};
