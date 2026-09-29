import { Router, Request, Response } from 'express';
import { db } from '../db';
import { wsHub } from '../ws';
import { n8nService } from '../services/n8n';

export const ordersRouter = Router();

// GET all orders
ordersRouter.get('/', (_req: Request, res: Response) => {
  const orders = db.getOrders();
  res.json({ success: true, count: orders.length, data: orders });
});

// GET single order
ordersRouter.get('/:id', (req: Request, res: Response) => {
  const order = db.getOrderById(req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, error: 'Order not found' });
  }
  res.json({ success: true, data: order });
});

// POST new order (Fast POS dispatch & n8n routing pipeline)
ordersRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { order, kdsTicket } = db.addOrder(req.body);

    // 1. Deduct ingredient stock in inventory
    const updatedStockItems = db.deductInventoryForOrder(order.lineItems || []);
    if (updatedStockItems.length > 0) {
      wsHub.broadcast('STOCK_UPDATED', updatedStockItems);
    }

    // 2. Broadcast real-time event to all connected terminals
    wsHub.broadcast('ORDER_CREATED', { order, kdsTicket });
    wsHub.broadcast('TABLE_UPDATED', { tableId: order.table });
    wsHub.broadcast('ANALYTICS_UPDATED', db.getAnalytics());

    // 3. Autonomous n8n Workflow Dispatch (asynchronous)
    n8nService.triggerWorkflow('order-dispatch', {
      orderId: order.id,
      table: order.table,
      items: order.lineItems,
      subtotal: order.subtotal,
      total: order.total,
    }).then((dispatchRes) => {
      wsHub.broadcast('KDS_ROUTING_PROCESSED', dispatchRes.data);
    }).catch((err) => console.warn('[n8n] order-dispatch async trigger:', err.message));

    // 4. Check if any stock items are now critical/low and trigger auto-supply
    const hasLowStock = (db.getInventory() || []).some((it) => it.status === 'critical' || it.status === 'low');
    if (hasLowStock) {
      n8nService.triggerWorkflow('auto-supply', { mode: 'auto_replenish' })
        .then(() => console.log('⚡ n8n Auto-Supply replenished low stock successfully'))
        .catch(() => {});
    }

    res.status(201).json({ success: true, data: { order, kdsTicket } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST void an item from active order with inventory refund
ordersRouter.post('/:id/void-item', (req: Request, res: Response) => {
  const { itemId, reason } = req.body;
  if (!itemId) {
    return res.status(400).json({ success: false, error: 'itemId is required' });
  }

  const result = db.voidOrderItem(req.params.id, itemId, reason);
  if (!result) {
    return res.status(404).json({ success: false, error: 'Order or item not found' });
  }

  wsHub.broadcast('ORDER_UPDATED', result.order);
  wsHub.broadcast('ANALYTICS_UPDATED', db.getAnalytics());
  res.json({
    success: true,
    message: `Item voided from ${req.params.id} and raw recipe ingredients refunded to inventory!`,
    data: result,
  });
});

// POST add new items to existing active order
ordersRouter.post('/:id/add-items', (req: Request, res: Response) => {
  const { items } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, error: 'items array is required' });
  }

  const updatedOrder = db.addItemsToOrder(req.params.id, items);
  if (!updatedOrder) {
    return res.status(404).json({ success: false, error: 'Order not found' });
  }

  wsHub.broadcast('ORDER_UPDATED', updatedOrder);
  wsHub.broadcast('ANALYTICS_UPDATED', db.getAnalytics());
  res.json({
    success: true,
    message: `Added ${items.length} items to order ${req.params.id}`,
    data: updatedOrder,
  });
});

// PATCH order status (e.g. Paid, Ready, Completed)
ordersRouter.patch('/:id', (req: Request, res: Response) => {
  const updated = db.updateOrderStatus(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ success: false, error: 'Order not found' });
  }
  wsHub.broadcast('ORDER_UPDATED', updated);
  res.json({ success: true, data: updated });
});
