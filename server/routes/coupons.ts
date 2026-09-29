import { Router, Request, Response } from 'express';
import { db } from '../db';
import { wsHub } from '../ws';

export const couponsRouter = Router();

// GET all coupons
couponsRouter.get('/', (_req: Request, res: Response) => {
  const coupons = db.getCoupons();
  res.json({ success: true, count: coupons.length, data: coupons });
});

// POST validate coupon code against order subtotal
couponsRouter.post('/validate', (req: Request, res: Response) => {
  const { code, subtotal } = req.body;
  if (!code) {
    return res.status(400).json({ success: false, error: 'Coupon code is required' });
  }

  const result = db.validateCoupon(code, Number(subtotal) || 0);
  if (!result.valid) {
    return res.status(400).json({ success: false, error: result.message });
  }

  res.json({
    success: true,
    message: `Coupon '${result.code}' applied successfully!`,
    data: result,
  });
});

// POST create a new promo coupon
couponsRouter.post('/', (req: Request, res: Response) => {
  try {
    const coupon = db.addCoupon(req.body);
    wsHub.broadcast('COUPON_ADDED', coupon);
    res.status(201).json({ success: true, message: 'Coupon created', data: coupon });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH toggle active state
couponsRouter.patch('/:code/toggle', (req: Request, res: Response) => {
  const coupon = db.toggleCouponActive(req.params.code);
  if (!coupon) {
    return res.status(404).json({ success: false, error: 'Coupon not found' });
  }
  wsHub.broadcast('COUPON_UPDATED', coupon);
  res.json({ success: true, message: `Coupon is now ${coupon.active ? 'Active' : 'Inactive'}`, data: coupon });
});
