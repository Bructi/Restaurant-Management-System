import { Router, Request, Response } from 'express';
import { insforgeService, insforgeAdmin, insforgeClient } from '../services/insforge';
import { db } from '../db';

export const insforgeRouter = Router();

// GET /api/insforge/status
insforgeRouter.get('/status', async (_req: Request, res: Response) => {
  try {
    const projectInfo = insforgeService.getProjectInfo();
    const health = await insforgeService.checkHealth();
    const tables = await insforgeService.getTablesSummary();

    res.json({
      success: true,
      connected: health.connected,
      project: projectInfo,
      health,
      tables,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      connected: false,
      error: error.message || 'Error checking InsForge status',
    });
  }
});

// GET /api/insforge/tables
insforgeRouter.get('/tables', async (_req: Request, res: Response) => {
  try {
    const tables = await insforgeService.getTablesSummary();
    res.json({
      success: true,
      data: tables,
      total: tables.length,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Error fetching tables summary',
    });
  }
});

// POST /api/insforge/sync - Sync local database with InsForge
insforgeRouter.post('/sync', async (_req: Request, res: Response) => {
  try {
    await insforgeService.seedIfEmpty(db.getDb());
    const tables = await insforgeService.getTablesSummary();
    res.json({
      success: true,
      message: 'InsForge PostgreSQL database synchronized successfully',
      tables,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Error synchronizing InsForge database',
    });
  }
});

// GET /api/insforge/storage/buckets
insforgeRouter.get('/storage/buckets', async (_req: Request, res: Response) => {
  try {
    const buckets = await insforgeService.listBuckets();
    res.json({
      success: true,
      data: buckets,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// GET /api/insforge/storage/files
insforgeRouter.get('/storage/files', async (req: Request, res: Response) => {
  try {
    const bucket = (req.query.bucket as string) || 'restoflow';
    const result = await insforgeService.listFiles(bucket);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// POST /api/insforge/storage/upload - Upload file or data url to storage bucket
insforgeRouter.post('/storage/upload', async (req: Request, res: Response) => {
  try {
    const { bucket = 'uploads', fileName, content, contentType } = req.body;
    if (!fileName || !content) {
      res.status(400).json({ success: false, error: 'fileName and content are required' });
      return;
    }

    // Process base64 content
    const base64Data = content.replace(/^data:[^;]+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    const result = await insforgeService.uploadFile(bucket, fileName, buffer, contentType);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// POST /api/insforge/auth/signin
insforgeRouter.post('/auth/signin', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ success: false, error: 'Email and password required' });
      return;
    }

    const { data, error } = await insforgeClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      res.status(400).json({ success: false, error: error.message });
      return;
    }

    res.json({
      success: true,
      user: data?.user,
      accessToken: data?.accessToken,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/insforge/auth/signup
insforgeRouter.post('/auth/signup', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) {
      res.status(400).json({ success: false, error: 'Email and password required' });
      return;
    }

    const { data, error } = await insforgeClient.auth.signUp({
      email,
      password,
      name: name || email.split('@')[0],
    });

    if (error) {
      res.status(400).json({ success: false, error: error.message });
      return;
    }

    res.json({
      success: true,
      user: data?.user,
      requireEmailVerification: data?.requireEmailVerification,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
