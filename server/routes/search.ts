import { Router, Request, Response } from 'express';
import { db } from '../db';

export const searchRouter = Router();

// GET /api/search?q=... - Universal Full-Text Search
searchRouter.get('/', (req: Request, res: Response) => {
  const query = (req.query.q as string) || '';
  const results = db.universalSearch(query);
  res.json({
    success: true,
    query,
    count: results.length,
    data: results,
  });
});
