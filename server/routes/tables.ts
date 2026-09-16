import { Router, Request, Response } from 'express';
import { db } from '../db';
import { wsHub } from '../ws';

export const tablesRouter = Router();

// GET all floor tables
tablesRouter.get('/', (_req: Request, res: Response) => {
  const tables = db.getTables();
  res.json({ success: true, count: tables.length, data: tables });
});

// PATCH table status (seat, clean, release, reserve)
tablesRouter.patch('/:id', (req: Request, res: Response) => {
  const table = db.updateTable(req.params.id, req.body);
  if (!table) {
    return res.status(404).json({ success: false, error: 'Table not found' });
  }
  wsHub.broadcast('TABLE_UPDATED', table);
  res.json({ success: true, data: table });
});

// POST seat guests
tablesRouter.post('/:id/seat', (req: Request, res: Response) => {
  const { guestsCount, customerName, server } = req.body;
  const table = db.updateTable(req.params.id, {
    status: 'occupied',
    guestsCount: guestsCount || 2,
    customerName: customerName || 'Walk-in Guests',
    server: server || 'Sunil R.',
    timeSeated: 'Just Seated',
  });
  wsHub.broadcast('TABLE_UPDATED', table);
  res.json({ success: true, message: `Table ${req.params.id} seated`, data: table });
});

// POST add new table
tablesRouter.post('/', (req: Request, res: Response) => {
  try {
    const table = db.addTable(req.body);
    wsHub.broadcast('TABLE_UPDATED', table);
    res.status(201).json({ success: true, data: table });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST transfer table
tablesRouter.post('/transfer', (req: Request, res: Response) => {
  const { sourceId, targetId } = req.body;
  const result = db.transferTable(sourceId, targetId);
  if (!result) {
    return res.status(400).json({ success: false, error: 'Could not transfer table' });
  }
  wsHub.broadcast('TABLE_UPDATED', result.target);
  wsHub.broadcast('TABLE_UPDATED', result.source);
  res.json({ success: true, message: `Transferred ${sourceId} to ${targetId}`, data: result });
});

// POST merge tables
tablesRouter.post('/merge', (req: Request, res: Response) => {
  const { tableIds } = req.body;
  const merged = db.mergeTables(tableIds);
  if (!merged) {
    return res.status(400).json({ success: false, error: 'Could not merge tables' });
  }
  tableIds.forEach((id: string) => {
    const t = db.getTableById(id);
    if (t) wsHub.broadcast('TABLE_UPDATED', t);
  });
  res.json({ success: true, message: `Merged tables ${tableIds.join(', ')}`, data: merged });
});

// POST mark cleaned and available
tablesRouter.post('/:id/release', (req: Request, res: Response) => {
  const table = db.updateTable(req.params.id, {
    status: 'available',
    guestsCount: undefined,
    customerName: undefined,
    server: undefined,
    amount: undefined,
    timeSeated: undefined,
    orderInfo: 'Available',
  });
  wsHub.broadcast('TABLE_UPDATED', table);
  res.json({ success: true, message: `Table ${req.params.id} marked clean and available`, data: table });
});
