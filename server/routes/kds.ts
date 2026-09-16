import { Router, Request, Response } from 'express';
import { db } from '../db';
import { wsHub } from '../ws';

export const kdsRouter = Router();

// GET all active kitchen tickets
kdsRouter.get('/tickets', (_req: Request, res: Response) => {
  const tickets = db.getKdsTickets();
  res.json({ success: true, count: tickets.length, data: tickets });
});

// PATCH item done status
kdsRouter.patch('/tickets/:id/items/:itemId', (req: Request, res: Response) => {
  const ticket = db.updateKdsItemDone(req.params.id, req.params.itemId);
  if (!ticket) {
    return res.status(404).json({ success: false, error: 'Ticket or item not found' });
  }
  wsHub.broadcast('KDS_ITEM_BUMPED', { ticketId: req.params.id, itemId: req.params.itemId, ticket });
  res.json({ success: true, data: ticket });
});

// POST bump entire ticket
kdsRouter.post('/tickets/:id/bump', (req: Request, res: Response) => {
  const bumped = db.bumpKdsTicket(req.params.id);
  if (!bumped) {
    return res.status(404).json({ success: false, error: 'Ticket not found' });
  }
  wsHub.broadcast('KDS_TICKET_BUMPED', { ticketId: req.params.id, ticket: bumped });
  res.json({ success: true, message: 'Ticket marked expedited and completed', data: bumped });
});
