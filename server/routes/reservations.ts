import { Router, Request, Response } from 'express';
import { db } from '../db';
import { wsHub } from '../ws';
import { n8nService } from '../services/n8n';

export const reservationsRouter = Router();

// GET all reservations
reservationsRouter.get('/', (_req: Request, res: Response) => {
  const reservations = db.getReservations();
  res.json({ success: true, count: reservations.length, data: reservations });
});

// POST new reservation
reservationsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const newRes = db.addReservation(req.body);
    wsHub.broadcast('RESERVATION_ADDED', newRes);

    // Autonomous n8n VIP Hospitality Analysis
    n8nService.triggerWorkflow('vip-booking', {
      guestName: newRes.guestName,
      phone: newRes.phone,
      partySize: newRes.pax,
      date: newRes.date,
      time: newRes.timeSlot,
      specialRequests: newRes.notes || 'None',
      lifetimeSpend: newRes.depositAmount ? newRes.depositAmount * 20 : 18500,
    }).then((vipRes) => {
      if (vipRes?.data?.guest) {
        newRes.vipTier = vipRes.data.guest.tier;
        newRes.isVip = vipRes.data.guest.tier.includes('VIP') || vipRes.data.guest.tier.includes('Platinum');
        newRes.complimentaryPerk = vipRes.data.guest.complimentaryPerk;
        newRes.confirmationCode = vipRes.data.guest.confirmationCode;
        newRes.notificationMessage = vipRes.data.dispatchNotification?.renderedMessage;
        db.saveData();
        wsHub.broadcast('RESERVATION_UPDATED', newRes);
      }
    }).catch((err) => console.warn('[n8n] vip-booking trigger error:', err.message));

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
