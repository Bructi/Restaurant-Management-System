import { Router, Request, Response } from 'express';
import { db } from '../db';

export const analyticsRouter = Router();

// GET live executive telemetry
analyticsRouter.get('/summary', (_req: Request, res: Response) => {
  const analytics = db.getAnalytics();
  res.json({ success: true, data: analytics });
});

// GET dynamic hourly volume feed
analyticsRouter.get('/hourly', (_req: Request, res: Response) => {
  const hourlyData = db.getHourlyAnalytics();
  res.json({ success: true, data: hourlyData });
});

// GET dynamic sales channel breakdown
analyticsRouter.get('/channels', (_req: Request, res: Response) => {
  const channelData = db.getChannelAnalytics();
  res.json({ success: true, data: channelData });
});

// GET dynamic popular dishes by volume
analyticsRouter.get('/dishes', (_req: Request, res: Response) => {
  const dishesData = db.getPopularDishes();
  res.json({ success: true, data: dishesData });
});

// GET dynamic live order pipeline segments
analyticsRouter.get('/pipeline', (_req: Request, res: Response) => {
  const pipelineData = db.getPipelineSegments();
  res.json({ success: true, data: pipelineData });
});

// GET weather-driven dining insights & chef prep suggestions
analyticsRouter.get('/weather-insights', (req: Request, res: Response) => {
  const temp = Number(req.query.temp) || 26;
  const code = Number(req.query.code) || 0;
  const forecast = db.getWeatherPrepForecast(temp, code);
  res.json({ success: true, data: forecast });
});

