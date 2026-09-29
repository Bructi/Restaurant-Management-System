import { Router, Request, Response } from 'express';
import { db } from '../db';
import { wsHub } from '../ws';
import { n8nService } from '../services/n8n';

export const inventoryRouter = Router();

// GET all inventory items
inventoryRouter.get('/', (_req: Request, res: Response) => {
  const inventory = db.getInventory();
  res.json({ success: true, count: inventory.length, data: inventory });
});

// GET all generated purchase orders from n8n & system
inventoryRouter.get('/purchase-orders', (_req: Request, res: Response) => {
  const pos = db.getPurchaseOrders();
  res.json({ success: true, count: pos.length, data: pos });
});

// POST receive and ingest a purchase order into inventory
inventoryRouter.post('/purchase-orders/:poNumber/receive', (req: Request, res: Response) => {
  const { notes } = req.body;
  const result = db.receivePurchaseOrder(req.params.poNumber, notes);
  if (!result) {
    return res.status(404).json({ success: false, error: 'Purchase order not found' });
  }

  wsHub.broadcast('PURCHASE_ORDER_RECEIVED', result);
  wsHub.broadcast('STOCK_UPDATED', db.getInventory());
  res.json({
    success: true,
    message: `Purchase Order ${req.params.poNumber} marked as RECEIVED and ${result.ingestedItems.length} ingredient items added to stock!`,
    data: result,
  });
});

// POST cancel a purchase order
inventoryRouter.post('/purchase-orders/:poNumber/cancel', (req: Request, res: Response) => {
  const { reason } = req.body;
  const result = db.cancelPurchaseOrder(req.params.poNumber, reason);
  if (!result) {
    return res.status(404).json({ success: false, error: 'Purchase order not found' });
  }

  wsHub.broadcast('PURCHASE_ORDER_CANCELLED', result);
  res.json({
    success: true,
    message: `Purchase Order ${req.params.poNumber} cancelled`,
    data: result,
  });
});

// POST trigger autonomous n8n supply replenishment
inventoryRouter.post('/auto-supply', async (req: Request, res: Response) => {
  try {
    const { mode } = req.body;
    const output = await n8nService.triggerWorkflow('auto-supply', { mode: mode || 'auto_replenish' });
    const updatedInventory = db.getInventory();
    const purchaseOrders = db.getPurchaseOrders();

    res.json({
      success: true,
      message: 'Autonomous n8n Supply Pipeline executed successfully',
      data: output.data,
      inventory: updatedInventory,
      purchaseOrders,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH stock update
inventoryRouter.patch('/:id/stock', (req: Request, res: Response) => {
  const { currentStock } = req.body;
  const updated = db.updateStock(req.params.id, currentStock);
  if (!updated) {
    return res.status(404).json({ success: false, error: 'Inventory item not found' });
  }
  wsHub.broadcast('STOCK_UPDATED', updated);
  res.json({ success: true, data: updated });
});

// POST receive / stock-in goods
inventoryRouter.post('/receive', (req: Request, res: Response) => {
  const { id, qty } = req.body;
  const updated = db.receiveStock(id, Number(qty) || 0);
  if (!updated) {
    return res.status(404).json({ success: false, error: 'Inventory item not found' });
  }
  wsHub.broadcast('STOCK_UPDATED', updated);
  res.json({ success: true, message: `Received ${qty} of ${updated.name}`, data: updated });
});

// POST record kitchen wastage
inventoryRouter.post('/wastage', (req: Request, res: Response) => {
  const { item, qty, reason, cost } = req.body;
  const waste = db.logWastage(item, qty, reason, Number(cost) || 0);
  wsHub.broadcast('WASTE_LOGGED', waste);
  res.status(201).json({ success: true, message: 'Wastage logged', data: waste });
});

// GET all wastage logs
inventoryRouter.get('/waste-logs', (req: Request, res: Response) => {
  const category = req.query.category as string;
  const logs = db.getWasteLogs(category);
  res.json({ success: true, count: logs.length, data: logs });
});

// GET waste cost summary & scrap analytics
inventoryRouter.get('/waste-summary', (_req: Request, res: Response) => {
  const summary = db.getWasteSummary();
  res.json({ success: true, data: summary });
});

