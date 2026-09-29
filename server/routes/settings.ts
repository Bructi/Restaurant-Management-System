import { Router, Request, Response } from 'express';
import { db } from '../db';
import { wsHub } from '../ws';

export const settingsRouter = Router();

// GET settings and peripherals
settingsRouter.get('/', (_req: Request, res: Response) => {
  const data = db.getSettings();
  res.json({ success: true, data });
});

// POST update settings
settingsRouter.post('/', (req: Request, res: Response) => {
  const updated = db.updateSettings(req.body);
  wsHub.broadcast('SETTINGS_UPDATED', updated);
  res.json({ success: true, message: 'Settings saved', data: updated });
});

// GET all hardware peripherals
settingsRouter.get('/peripherals', (_req: Request, res: Response) => {
  const peripherals = db.getPeripherals();
  res.json({ success: true, count: peripherals.length, data: peripherals });
});

// POST add peripheral device
settingsRouter.post('/peripherals', (req: Request, res: Response) => {
  try {
    const dev = db.addPeripheral(req.body);
    wsHub.broadcast('PERIPHERAL_ADDED', dev);
    res.status(201).json({ success: true, message: 'Device added to fleet', data: dev });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH update peripheral status (e.g. online, low_paper, offline)
settingsRouter.patch('/peripherals/:id', (req: Request, res: Response) => {
  const dev = db.updatePeripheral(req.params.id, req.body);
  if (!dev) {
    return res.status(404).json({ success: false, error: 'Peripheral device not found' });
  }
  wsHub.broadcast('PERIPHERAL_UPDATED', dev);
  res.json({ success: true, message: 'Peripheral status updated', data: dev });
});

// POST test print job
settingsRouter.post('/peripherals/:id/test-print', (req: Request, res: Response) => {
  const { title = 'RestoFlow Alignment Test Page' } = req.body;
  const result = db.logTestPrint(req.params.id, title);
  wsHub.broadcast('PRINT_JOB_DISPATCHED', result);
  res.json(result);
});

// POST ping all hardware peripherals dynamically
settingsRouter.post('/ping', (_req: Request, res: Response) => {
  const results = db.pingAllPeripherals();
  wsHub.broadcast('PERIPHERALS_PINGED', results);
  res.json({ success: true, allResponsive: true, data: results });
});

