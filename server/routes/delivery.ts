import { Router, Request, Response } from 'express';
import { db } from '../db';
import { wsHub } from '../ws';

export const deliveryRouter = Router();

// GET all delivery drivers with live telemetry
deliveryRouter.get('/drivers', (_req: Request, res: Response) => {
  const drivers = db.getDeliveryDrivers();
  res.json({ success: true, count: drivers.length, data: drivers });
});

// GET single driver
deliveryRouter.get('/drivers/:id', (req: Request, res: Response) => {
  const driver = db.getDeliveryDriverById(req.params.id);
  if (!driver) {
    return res.status(404).json({ success: false, error: 'Driver not found' });
  }
  res.json({ success: true, data: driver });
});

// PATCH driver GPS coordinates / status / ETA
deliveryRouter.patch('/drivers/:id/location', (req: Request, res: Response) => {
  const driver = db.updateDriverLocation(req.params.id, req.body);
  if (!driver) {
    return res.status(404).json({ success: false, error: 'Driver not found' });
  }
  wsHub.broadcast('DRIVER_LOCATION_UPDATED', driver);
  res.json({ success: true, message: 'Driver GPS location updated', data: driver });
});

// POST assign delivery driver to order
deliveryRouter.post('/assign', (req: Request, res: Response) => {
  const { driverId, orderId, destination, customerName } = req.body;
  if (!driverId || !orderId) {
    return res.status(400).json({ success: false, error: 'driverId and orderId are required' });
  }

  const driver = db.assignOrderToDriver(driverId, orderId, destination || 'Delivery Address', customerName || 'Valued Customer');
  if (!driver) {
    return res.status(404).json({ success: false, error: 'Driver not found' });
  }

  const order = db.getOrderById(orderId);
  wsHub.broadcast('DELIVERY_ASSIGNED', { driver, order });
  wsHub.broadcast('ORDER_UPDATED', order);

  res.json({
    success: true,
    message: `Order ${orderId} assigned to driver ${driver.name}`,
    data: { driver, order },
  });
});
