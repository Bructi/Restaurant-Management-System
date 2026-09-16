import { Router, Request, Response } from 'express';
import { db } from '../db';
import { wsHub } from '../ws';

export const menuRouter = Router();

// GET all menu catalog items
menuRouter.get('/', (_req: Request, res: Response) => {
  const menu = db.getMenu();
  res.json({ success: true, count: menu.length, data: menu });
});

// PATCH toggle 86 / stock status
menuRouter.patch('/:id/toggle-stock', (req: Request, res: Response) => {
  const item = db.toggleMenuItemStock(req.params.id);
  if (!item) {
    return res.status(404).json({ success: false, error: 'Dish not found' });
  }
  wsHub.broadcast('MENU_STOCK_TOGGLED', item);
  res.json({ success: true, data: item });
});

// POST new menu dish
menuRouter.post('/', (req: Request, res: Response) => {
  try {
    const dish = db.addMenuItem(req.body);
    wsHub.broadcast('MENU_ITEM_ADDED', dish);
    res.status(201).json({ success: true, data: dish });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
