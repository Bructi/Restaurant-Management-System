import { Router, Request, Response } from 'express';
import { db } from '../db';
import { wsHub } from '../ws';

export const staffRouter = Router();

// GET all staff members
staffRouter.get('/', (_req: Request, res: Response) => {
  const staff = db.getStaff();
  res.json({ success: true, count: staff.length, data: staff });
});

// POST add staff member
staffRouter.post('/', (req: Request, res: Response) => {
  try {
    const staff = db.addStaff(req.body);
    wsHub.broadcast('STAFF_ADDED', staff);
    res.status(201).json({ success: true, data: staff });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH reset / update staff PIN
staffRouter.patch('/:id/pin', (req: Request, res: Response) => {
  const { pin } = req.body;
  const staff = db.updateStaffPin(req.params.id, pin);
  if (!staff) {
    return res.status(404).json({ success: false, error: 'Staff member not found' });
  }
  res.json({ success: true, message: `PIN updated for ${staff.name}`, data: staff });
});

// POST clock-in
staffRouter.post('/:id/clock-in', (req: Request, res: Response) => {
  const staff = db.clockInStaff(req.params.id);
  if (!staff) {
    return res.status(404).json({ success: false, error: 'Staff member not found' });
  }
  wsHub.broadcast('STAFF_CLOCK_IN', staff);
  res.json({ success: true, message: `Clocked in successfully at ${staff.clockInTime}`, data: staff });
});
