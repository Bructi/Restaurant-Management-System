import { Router, Request, Response } from 'express';
import { n8nService, RESTOFLOW_WORKFLOWS } from '../services/n8n';

export const n8nRouter = Router();

// GET status & overview of n8n integration
n8nRouter.get('/status', async (_req: Request, res: Response) => {
  try {
    const health = await n8nService.checkHealth();
    const liveWorkflows = health.connected ? await n8nService.listWorkflows() : [];
    const executions = health.connected ? await n8nService.getExecutions(5) : [];

    // Map definition with live workflow info
    const enrichedWorkflows = RESTOFLOW_WORKFLOWS.map((def) => {
      const match = liveWorkflows.find((w: any) => w.name === def.name);
      return {
        key: def.key,
        name: def.name,
        description: def.description,
        category: def.category,
        icon: def.icon,
        webhookPath: def.webhookPath,
        webhookUrl: `http://localhost:5678/webhook/${def.webhookPath}`,
        isProvisioned: !!match,
        workflowId: match?.id || null,
        isActive: match?.active || false,
        updatedAt: match?.updatedAt || null,
      };
    });

    res.json({
      success: true,
      connected: health.connected,
      n8nUrl: 'http://localhost:5678',
      version: health.version || '2.39.6',
      workflows: enrichedWorkflows,
      recentExecutions: executions,
      error: health.error,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      connected: false,
      error: err.message,
    });
  }
});

// POST provision all RestoFlow workflows in n8n
n8nRouter.post('/provision', async (_req: Request, res: Response) => {
  try {
    const result = await n8nService.provisionAllWorkflows();
    res.json({
      success: true,
      message: `Successfully provisioned ${result.provisionedCount} RestoFlow workflows in n8n`,
      workflows: result.workflows,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// POST trigger a specific workflow
n8nRouter.post('/trigger/:key', async (req: Request, res: Response) => {
  const { key } = req.params;
  const payload = req.body;

  try {
    const output = await n8nService.triggerWorkflow(key, payload);
    res.json({
      success: true,
      workflowKey: key,
      ...output,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      workflowKey: key,
      error: err.message || 'Workflow execution failed',
    });
  }
});

// GET recent executions
n8nRouter.get('/executions', async (req: Request, res: Response) => {
  const limit = Number(req.query.limit) || 10;
  try {
    const executions = await n8nService.getExecutions(limit);
    res.json({
      success: true,
      data: executions,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// POST toggle workflow active state
n8nRouter.post('/workflows/:id/toggle', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { active } = req.body;

  try {
    const result = await n8nService.toggleWorkflow(id, active);
    res.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});
