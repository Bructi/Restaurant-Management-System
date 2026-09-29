import { Router, Request, Response } from 'express';
import { db } from '../db';
import { wsHub } from '../ws';

export const checkoutRouter = Router();

// GET current cash drawer till session status
checkoutRouter.get('/till-status', (_req: Request, res: Response) => {
  const status = db.getTillStatus();
  res.json({ success: true, data: status });
});

// POST open a new cash drawer till session
checkoutRouter.post('/till/open', (req: Request, res: Response) => {
  const { cashierName, openingFloat } = req.body;
  const session = db.openTillSession(cashierName, openingFloat);
  wsHub.broadcast('TILL_SESSION_OPENED', session);
  res.status(201).json({ success: true, message: 'Till session opened', data: session });
});

// POST close & reconcile cash drawer till session
checkoutRouter.post('/till/close', (req: Request, res: Response) => {
  const { actualCountedCash, notes } = req.body;
  const session = db.closeTillSession(actualCountedCash, notes);
  if (!session) {
    return res.status(404).json({ success: false, error: 'No active till session found to close' });
  }
  wsHub.broadcast('TILL_SESSION_CLOSED', session);
  res.json({
    success: true,
    message: `Till session closed with discrepancy of ₹${session.discrepancy}`,
    data: session,
  });
});


// POST settle payment & close table (single tender)
checkoutRouter.post('/settle', (req: Request, res: Response) => {
  const { orderId, tableId, paymentMethod, amountPaid, tipAmount, customerName, customerPhone } = req.body;

  // Update order if exists
  if (orderId) {
    db.updateOrderStatus(orderId, {
      paymentStatus: 'paid',
      paymentMethod: paymentMethod || 'UPI',
    });

    // Credit loyalty points to customer if customer exists
    const order = db.getOrderById(orderId);
    const custIdentifier = customerPhone || customerName || order?.phone || order?.customer;
    if (custIdentifier) {
      db.updateCustomerSpendAndVisits(custIdentifier, Number(amountPaid) || order?.total || 0);
    }
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

// POST split payment settlement (multi-guest / multi-tender)
checkoutRouter.post('/split', (req: Request, res: Response) => {
  const { orderId, tableId, splits, tipAmount } = req.body;

  if (!orderId || !Array.isArray(splits) || splits.length === 0) {
    return res.status(400).json({ success: false, error: 'orderId and an array of split tenders are required' });
  }

  const record = db.recordSplitPayment(orderId, tableId || 'Table T-01', splits, Number(tipAmount) || 0);

  // Credit points if order exists
  const order = db.getOrderById(orderId);
  if (order?.customer || order?.phone) {
    db.updateCustomerSpendAndVisits(order.phone || order.customer, record.totalAmount);
  }

  wsHub.broadcast('SPLIT_PAYMENT_SETTLED', record);
  wsHub.broadcast('ORDER_SETTLED', { orderId, tableId, amountPaid: record.totalAmount, tipAmount });
  wsHub.broadcast('TABLE_UPDATED', { tableId });
  wsHub.broadcast('ANALYTICS_UPDATED', db.getAnalytics());

  res.json({
    success: true,
    message: `Split payment of ₹${record.totalAmount} across ${splits.length} tenders processed successfully!`,
    data: record,
    receiptNumber: `RCP-SPLIT-${Math.floor(100000 + Math.random() * 900000)}`,
  });
});

