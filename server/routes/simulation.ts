import { Router, Request, Response } from 'express';
import { simulationEngine } from '../services/simulation';

export const simulationRouter = Router();

// GET simulation status
simulationRouter.get('/status', (_req: Request, res: Response) => {
  res.json({ success: true, data: simulationEngine.getStatus() });
});

// POST start simulation
simulationRouter.post('/start', (req: Request, res: Response) => {
  const interval = Number(req.body.intervalSeconds) || 45;
  simulationEngine.startSimulation(interval);
  res.json({ success: true, message: 'Simulation engine started', interval });
});

// POST stop simulation
simulationRouter.post('/stop', (_req: Request, res: Response) => {
  simulationEngine.stopSimulation();
  res.json({ success: true, message: 'Simulation engine stopped' });
});

// POST trigger immediate 1-step pulse
simulationRouter.post('/pulse', async (_req: Request, res: Response) => {
  await simulationEngine.runSimulationStep();
  res.json({ success: true, message: 'Simulation pulse executed' });
});
