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
  const waste = db.logWastage(item, qty, reason, cost);
  res.status(201).json({ success: true, message: 'Wastage logged', data: waste });
});
