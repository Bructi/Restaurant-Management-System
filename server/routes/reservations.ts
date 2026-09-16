import { Router, Request, Response } from 'express';
import { db } from '../db';
import { wsHub } from '../ws';

export const reservationsRouter = Router();

// GET all reservations
reservationsRouter.get('/', (_req: Request, res: Response) => {
  const reservations = db.getReservations();
  res.json({ success: true, count: reservations.length, data: reservations });
});

// POST new reservation
reservationsRouter.post('/', (req: Request, res: Response) => {
  try {
    const newRes = db.addReservation(req.body);
    wsHub.broadcast('RESERVATION_ADDED', newRes);
    res.status(201).json({ success: true, data: newRes });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH reservation status (e.g. seated, confirmed, cancelled)
reservationsRouter.patch('/:id/status', (req: Request, res: Response) => {
  const { status, statusLabel } = req.body;
  const updated = db.updateReservationStatus(req.params.id, status, statusLabel);
  if (!updated) {
    return res.status(404).json({ success: false, error: 'Reservation not found' });
  }
  wsHub.broadcast('RESERVATION_UPDATED', updated);
  res.json({ success: true, data: updated });
});
