import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

import { rateLimiter, securityHeaders, auditLogger, errorHandler } from './server/middleware/security';
import { authMiddleware } from './server/middleware/auth';

import authRoutes from './server/routes/authRoutes';
import chatRoutes from './server/routes/chatRoutes';
import imageRoutes from './server/routes/imageRoutes';
import videoRoutes from './server/routes/videoRoutes';
import presentationRoutes from './server/routes/presentationRoutes';
import fileRoutes from './server/routes/fileRoutes';
import creationRoutes from './server/routes/creationRoutes';
import jobRoutes from './server/routes/jobRoutes';
import modelRoutes from './server/routes/modelRoutes';
import adminRoutes from './server/routes/adminRoutes';
import subscriptionRoutes from './server/routes/subscriptionRoutes';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Security & parsing middlewares
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));
  app.use(securityHeaders);
  app.use(rateLimiter(200));
  app.use(authMiddleware);
  app.use(auditLogger);

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'NEXORA AI',
      timestamp: new Date().toISOString(),
      geminiConfigured: !!process.env.GEMINI_API_KEY,
    });
  });

  // Mount API endpoints
  app.use('/api', authRoutes);
  app.use('/api', chatRoutes);
  app.use('/api', imageRoutes);
  app.use('/api', videoRoutes);
  app.use('/api', presentationRoutes);
  app.use('/api', fileRoutes);
  app.use('/api', creationRoutes);
  app.use('/api', jobRoutes);
  app.use('/api', modelRoutes);
  app.use('/api', adminRoutes);
  app.use('/api', subscriptionRoutes);

  // Error handling middleware for API routes
  app.use(errorHandler);

  // Vite middleware for development vs static for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`>>> NEXORA AI server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
