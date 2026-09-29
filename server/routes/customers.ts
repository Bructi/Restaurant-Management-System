import { Router, Request, Response } from 'express';
import { db } from '../db';
import { wsHub } from '../ws';

export const customersRouter = Router();

// GET all marketing campaigns
customersRouter.get('/campaigns/list', (_req: Request, res: Response) => {
  const campaigns = db.getCampaigns();
  res.json({ success: true, count: campaigns.length, data: campaigns });
});

// POST broadcast marketing campaign
customersRouter.post('/campaigns/broadcast', (req: Request, res: Response) => {
  const result = db.createAndSendCampaign(req.body);
  wsHub.broadcast('CAMPAIGN_DISPATCHED', result);
  res.status(201).json({
    success: true,
    message: `Broadcast campaign '${result.campaign.title}' dispatched to ${result.campaign.targetAudienceCount} VIP guests via WhatsApp/SMS!`,
    data: result,
  });
});

// POST check allergen conflict for a customer
customersRouter.post('/check-allergens', (req: Request, res: Response) => {
  const { customerIdentifier, dishNames } = req.body;
  if (!customerIdentifier || !Array.isArray(dishNames)) {
    return res.status(400).json({ success: false, error: 'customerIdentifier and dishNames array required' });
  }

  const result = db.checkAllergenConflict(customerIdentifier, dishNames);
  res.json({ success: true, data: result });
});


// GET single customer by ID or phone
customersRouter.get('/:id', (req: Request, res: Response) => {
  const customers = db.getCustomers();
  const cust = customers.find((c) => c.id === req.params.id || c.phone === req.params.id || c.name.toLowerCase() === req.params.id.toLowerCase());
  if (!cust) {
    return res.status(404).json({ success: false, error: 'Customer not found' });
  }
  res.json({ success: true, data: cust });
});

// POST add customer
customersRouter.post('/', (req: Request, res: Response) => {
  try {
    const cust = db.addCustomer(req.body);
    wsHub.broadcast('CUSTOMER_ADDED', cust);
    res.status(201).json({ success: true, data: cust });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST credit loyalty points
customersRouter.post('/:id/points/credit', (req: Request, res: Response) => {
  const { points, reason, orderId } = req.body;
  if (!points || points <= 0) {
    return res.status(400).json({ success: false, error: 'Valid positive points value required' });
  }

  const updated = db.creditLoyaltyPoints(req.params.id, Number(points), reason || 'Dining visit reward', orderId);
  if (!updated) {
    return res.status(404).json({ success: false, error: 'Customer not found' });
  }

  wsHub.broadcast('LOYALTY_POINTS_CREDITED', { customerId: updated.id, points, newBalance: updated.points, tier: updated.tier });
  res.json({
    success: true,
    message: `Credited ${points} loyalty points to ${updated.name}`,
    data: updated,
  });
});

// POST redeem loyalty points for discount
customersRouter.post('/:id/points/redeem', (req: Request, res: Response) => {
  const { points } = req.body;
  if (!points || points <= 0) {
    return res.status(400).json({ success: false, error: 'Valid positive points value required' });
  }

  const result = db.redeemLoyaltyPoints(req.params.id, Number(points));
  if (!result.success) {
    return res.status(400).json(result);
  }

  wsHub.broadcast('LOYALTY_POINTS_REDEEMED', result);
  res.json({
    success: true,
    message: `Redeemed ${points} points for ₹${result.discountValue} discount!`,
    data: result,
  });
});

