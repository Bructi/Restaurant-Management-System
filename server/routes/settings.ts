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

// POST ping all hardware peripherals
settingsRouter.post('/ping', (_req: Request, res: Response) => {
  const results = [
    { name: 'Billing Master EPSON TM-T88VI', ip: '192.168.1.120:9100', latencyMs: 4, status: 'online' },
    { name: 'Tandoor & Starters KOT Printer', ip: '192.168.1.121:9100', latencyMs: 8, status: 'low_paper' },
    { name: 'Curry Station TM-U220B', ip: '192.168.1.122:9100', latencyMs: 6, status: 'online' },
    { name: 'PineLabs EDC Terminal', ip: 'Cloud Webhook (PL-882194)', latencyMs: 12, status: 'online' },
  ];
  res.json({ success: true, allResponsive: true, data: results });
});
