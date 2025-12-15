import express, { type Response, type Request } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { env } from '@/shared/config/env.js';
import authRoutes from '@/features/auth/routes.js';
import { requestLogger } from '@/shared/middlewares/request-logger.middleware.js';
import { errorHandler, notFoundHandler } from '@/shared/middlewares/error-handler.middleware.js';
import { logger } from '@/shared/utils/logger.js';

export function createApp() {
  const app = express();

  app.use(requestLogger);

  // Security
  app.use(helmet());

  const allowedOrigins = env.ALLOWED_ORIGINS.split(',').map(o => o.trim());
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        logger.warn('CORS blocked origin', { origin });
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  }));

  // Body parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(compression());

  // Health check
  app.get('/health', (_: Request, res: Response) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: env.NODE_ENV,
    });
  });


  app.use('/api', authRoutes);

  // API root
  app.get('/api', (_: Request, res: Response) => {
    res.json({
      message: 'Collector API v1',
      version: '1.0.0',
      endpoints: {
        health: '/health',
        auth: {
          register: 'POST /api/auth/sign-up',
          login: 'POST /api/auth/sign-in',
          me: 'GET /api/me',
        },
      },
    });
  });

  // API root
  app.get('/api', (_: Request, res: Response) => {
    res.json({
      message: 'Collector API v1',
      version: '1.0.0',
      endpoints: {
        health: '/health',
        api: '/api',
      },
    });
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
