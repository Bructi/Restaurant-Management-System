import React from 'react';
import { LiveOrder } from '../../types';

interface RecentOrdersTableProps {
  orders: LiveOrder[];
  onSelectOrder?: (order: LiveOrder) => void;
  onViewAll?: () => void;
}

export const RecentOrdersTable: React.FC<RecentOrdersTableProps> = ({
  orders,
  onSelectOrder,
  onViewAll,
}) => {
  const getStatusBadge = (status: LiveOrder['status'], label: string) => {
    switch (status) {
      case 'paid-completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-label-sm text-label-sm bg-secondary/15 text-secondary font-semibold">
            {label}
          </span>
        );
      case 'preparing':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-label-sm text-label-sm bg-tertiary/15 text-tertiary font-semibold">
            {label}
          </span>
        );
      case 'ready':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-label-sm text-label-sm bg-secondary/15 text-secondary font-semibold">
            {label}
          </span>
        );
      case 'paid-dinein':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-label-sm text-label-sm bg-primary/15 text-primary font-semibold">
            {label}
          </span>
        );
      case 'seated-ordering':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-label-sm text-label-sm bg-surface-container-high text-on-surface-variant font-semibold">
            {label}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-label-sm text-label-sm bg-surface-container-high text-on-surface-variant font-semibold">
            {label}
          </span>
        );
    }
  };

  return (
    <div className="bg-surface-container-low rounded-xl p-space-lg shadow-md flex flex-col gap-space-md border border-surface-container-high/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">
            Recent Live Orders
          </h2>
          <span className="px-2 py-0.5 rounded-full bg-secondary/10 text-secondary font-label-sm text-label-sm font-semibold">
            Real-time
          </span>
        </div>
        <button
          onClick={onViewAll}
          className="font-label-md text-label-md text-primary hover:underline flex items-center gap-1 font-semibold"
        >
          <span>View All Tickets</span>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider pb-2 border-b border-surface-container-high/40">
              <th className="pb-3 font-semibold">Order ID</th>
              <th className="pb-3 font-semibold">Table / Type</th>
              <th className="pb-3 font-semibold">Customer</th>
              <th className="pb-3 font-semibold text-center">Items</th>
              <th className="pb-3 font-semibold text-right">Amount</th>
              <th className="pb-3 font-semibold text-center">Status</th>
              <th className="pb-3 font-semibold text-right">Time</th>
              <th className="pb-3 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container-high/20 font-body-sm text-body-sm">
            {orders.map((order) => (
              <tr
                key={order.id}
                onClick={() => onSelectOrder?.(order)}
                className="hover:bg-surface-container transition-colors group cursor-pointer"
              >
                <td className="py-3.5 font-mono-metric text-on-surface font-semibold">
                  {order.id}
                </td>
                <td className="py-3.5">
                  <span
                    className={`px-2 py-1 rounded font-label-sm text-label-sm font-medium ${
                      order.tableType === 'takeaway'
                        ? 'bg-primary-container/20 text-primary'
                        : 'bg-surface-container-high text-on-surface'
                    }`}
                  >
                    {order.tableOrType}
                  </span>
                </td>
                <td className="py-3.5 font-medium text-on-surface">{order.customer}</td>
                <td className="py-3.5 text-center text-on-surface-variant">
                  {order.itemsCount} items
                </td>
                <td className="py-3.5 text-right font-mono-metric font-semibold text-on-surface">
                  ₹{order.amount.toLocaleString('en-IN')}
                </td>
                <td className="py-3.5 text-center">
                  {getStatusBadge(order.status, order.statusLabel)}
                </td>
                <td className="py-3.5 text-right text-on-surface-variant font-mono-metric">
                  {order.time}
                </td>
                <td className="py-3.5 text-right">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectOrder?.(order);
                    }}
                    className="p-1 rounded text-on-surface-variant hover:text-primary hover:bg-surface-container-highest transition-colors"
                    title="View Action Details"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {order.actionIcon}
                    </span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
