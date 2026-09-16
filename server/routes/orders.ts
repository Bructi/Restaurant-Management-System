import { Router, Request, Response } from 'express';
import { db } from '../db';
import { wsHub } from '../ws';

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

// POST new order (Fast POS dispatch)
ordersRouter.post('/', (req: Request, res: Response) => {
  try {
    const { order, kdsTicket } = db.addOrder(req.body);
    // Broadcast real-time event to all connected terminals
    wsHub.broadcast('ORDER_CREATED', { order, kdsTicket });
    wsHub.broadcast('TABLE_UPDATED', { tableId: order.table });
    wsHub.broadcast('ANALYTICS_UPDATED', db.getAnalytics());
    res.status(201).json({ success: true, data: { order, kdsTicket } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
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
