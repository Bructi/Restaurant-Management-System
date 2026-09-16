import { Router, Request, Response } from 'express';
import { db } from '../db';
import { wsHub } from '../ws';

export const customersRouter = Router();

// GET all customers
customersRouter.get('/', (_req: Request, res: Response) => {
  const customers = db.getCustomers();
  res.json({ success: true, count: customers.length, data: customers });
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
