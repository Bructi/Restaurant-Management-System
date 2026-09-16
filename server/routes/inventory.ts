import { Router, Request, Response } from 'express';
import { db } from '../db';
import { wsHub } from '../ws';

export const inventoryRouter = Router();

// GET all inventory items
inventoryRouter.get('/', (_req: Request, res: Response) => {
  const inventory = db.getInventory();
  res.json({ success: true, count: inventory.length, data: inventory });
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
