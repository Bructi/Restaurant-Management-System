import { Router, Request, Response } from 'express';
import { db } from '../db';
import { wsHub } from '../ws';

export const kdsRouter = Router();

// GET all active kitchen tickets
kdsRouter.get('/tickets', (_req: Request, res: Response) => {
  const tickets = db.getKdsTickets();
  res.json({ success: true, count: tickets.length, data: tickets });
});

// GET KDS Expo aggregated items by station & demand
kdsRouter.get('/expo-summary', (_req: Request, res: Response) => {
  const summary = db.getKdsExpoSummary();
  res.json({ success: true, data: summary });
});

// GET KDS SLA breach logs & turnaround metrics
kdsRouter.get('/sla-metrics', (_req: Request, res: Response) => {
  const slaMetrics = db.getKdsSlaMetrics();
  res.json({ success: true, data: slaMetrics });
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

// POST reassign item to a different kitchen station
kdsRouter.post('/tickets/:id/items/:itemId/reassign', (req: Request, res: Response) => {
  const { newStation, priorityTag } = req.body;
  if (!newStation) {
    return res.status(400).json({ success: false, error: 'newStation is required (e.g. Tandoor, Curry, Bar, Pantry)' });
  }

  const result = db.reassignKdsItemStation(req.params.id, req.params.itemId, newStation, priorityTag);
  if (!result) {
    return res.status(404).json({ success: false, error: 'Ticket or item not found' });
  }

  wsHub.broadcast('KDS_ITEM_REASSIGNED', { ticketId: req.params.id, itemId: req.params.itemId, newStation, ticket: result.ticket });
  res.json({
    success: true,
    message: `Item reassigned to ${newStation} station`,
    data: result,
  });
});

// POST set ticket urgency and priority notes
kdsRouter.post('/tickets/:id/priority', (req: Request, res: Response) => {
  const { isUrgent, specialNote } = req.body;
  const ticket = db.setKdsTicketPriority(req.params.id, isUrgent ?? true, specialNote);
  if (!ticket) {
    return res.status(404).json({ success: false, error: 'Ticket not found' });
  }

  wsHub.broadcast('KDS_PRIORITY_UPDATED', ticket);
  res.json({
    success: true,
    message: `Priority updated for ticket ${ticket.id}`,
    data: ticket,
  });
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

