// Load local environment files if present
try {
  if (process.loadEnvFile) {
    process.loadEnvFile('.env.local');
  }
} catch {
  try {
    if (process.loadEnvFile) {
      process.loadEnvFile('.env');
    }
  } catch {}
}

import express from 'express';
import cors from 'cors';
import http from 'http';
import { wsHub } from './ws';
import { ordersRouter } from './routes/orders';
import { kdsRouter } from './routes/kds';
import { tablesRouter } from './routes/tables';
import { menuRouter } from './routes/menu';
import { reservationsRouter } from './routes/reservations';
import { inventoryRouter } from './routes/inventory';
import { customersRouter } from './routes/customers';
import { staffRouter } from './routes/staff';
import { analyticsRouter } from './routes/analytics';
import { settingsRouter } from './routes/settings';
import { checkoutRouter } from './routes/checkout';
import { insforgeRouter } from './routes/insforge';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Route Registration
app.use('/api/orders', ordersRouter);
app.use('/api/kds', kdsRouter);
app.use('/api/tables', tablesRouter);
app.use('/api/menu', menuRouter);
app.use('/api/reservations', reservationsRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/customers', customersRouter);
app.use('/api/staff', staffRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/checkout', checkoutRouter);
app.use('/api/insforge', insforgeRouter);

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'online',
    version: '1.0.0',
    service: 'RestoFlow Enterprise POS & Kitchen Operational Hub',
    timestamp: new Date().toISOString(),
  });
});

const server = http.createServer(app);

// Initialize WebSocket real-time broadcast engine
wsHub.init(server);

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`⚡ RestoFlow Operating System Backend Server is Live!`);
  console.log(`🌐 HTTP API:       http://localhost:${PORT}/api`);
  console.log(`🔌 WebSocket Sync: ws://localhost:${PORT}/ws`);
  console.log(`======================================================\n`);
});
