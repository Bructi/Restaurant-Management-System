import { Router, Request, Response } from 'express';
import { db } from '../db';
import { wsHub } from '../ws';

export const checkoutRouter = Router();

// POST settle payment & close table
checkoutRouter.post('/settle', (req: Request, res: Response) => {
  const { orderId, tableId, paymentMethod, amountPaid, tipAmount } = req.body;

  // Update order if exists
  if (orderId) {
    db.updateOrderStatus(orderId, {
      paymentStatus: 'paid',
      paymentMethod: paymentMethod || 'UPI',
    });
  }

  // Release / clear table
  if (tableId) {
    const cleanId = tableId.replace('Table ', '').trim();
    db.updateTable(cleanId, {
      status: 'available',
      amount: undefined,
      guestsCount: undefined,
      customerName: undefined,
      server: undefined,
      timeSeated: undefined,
      orderInfo: 'Available',
    });
  }

  wsHub.broadcast('ORDER_SETTLED', { orderId, tableId, amountPaid, tipAmount });
  wsHub.broadcast('TABLE_UPDATED', { tableId });
  wsHub.broadcast('ANALYTICS_UPDATED', db.getAnalytics());

  res.json({
    success: true,
    message: `Bill settled successfully via ${paymentMethod || 'UPI'}. Table ${tableId} is released.`,
    receiptNumber: `RCP-${Math.floor(100000 + Math.random() * 900000)}`,
    timestamp: new Date().toISOString(),
  });
});
