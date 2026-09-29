import { Router, Request, Response } from 'express';
import { db } from '../db';
import { wsHub } from '../ws';

export const menuRouter = Router();

// GET all menu catalog items
menuRouter.get('/', (_req: Request, res: Response) => {
  const menu = db.getMenu();
  res.json({ success: true, count: menu.length, data: menu });
});

// GET recipe BOM & dynamic COGS cost for dish
menuRouter.get('/:id/recipe', (req: Request, res: Response) => {
  const recipeInfo = db.getRecipeForDish(req.params.id);
  if (!recipeInfo) {
    return res.status(404).json({ success: false, error: 'Dish not found or has no recipe configuration' });
  }
  res.json({ success: true, data: recipeInfo });
});

// PUT update dish recipe BOM & recalculate margins
menuRouter.put('/:id/recipe', (req: Request, res: Response) => {
  const { recipeIngredients } = req.body;
  if (!Array.isArray(recipeIngredients)) {
    return res.status(400).json({ success: false, error: 'recipeIngredients must be an array' });
  }

  const updatedDish = db.updateDishRecipe(req.params.id, recipeIngredients);
  if (!updatedDish) {
    return res.status(404).json({ success: false, error: 'Dish not found' });
  }

  wsHub.broadcast('MENU_RECIPE_UPDATED', updatedDish);
  res.json({
    success: true,
    message: `Recipe for ${updatedDish.name} updated! New cost: ₹${updatedDish.cost} (${updatedDish.marginPct}% margin)`,
    data: updatedDish,
  });
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

