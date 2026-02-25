import { env } from '@/shared/config/env.js';
import express, { type Response, type Request } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { errorHandler, notFoundHandler } from '@/shared/middlewares/error-handler.middleware.js';
import menusRoutes from '@/features/menus/routes.js';
import shopRoutes from '@/features/shop/routes.js';
import adminRoutes from '@/features/admin/routes.js';
import orderRoutes from '@/features/orders/routes.js';
import { loggingMiddleware } from '@/shared/middlewares/logging.js';
// import { metricsHandler } from './providers/prometheus.js';


export function createApp() {
  const app = express();



  // Security
  app.use(helmet());

  const allowedOrigins = env.ALLOWED_ORIGINS?.split(',') || [];
  app.use(cors({
    origin: [...allowedOrigins],
    credentials: true,
  }));

  // body parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(compression());

  app.use(loggingMiddleware);

  // health check
  app.get('/health', (_: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'test',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: env.NODE_ENV,
    });
  });


  app.use('/shop', shopRoutes);
  app.use('/menus', menusRoutes);
  app.use('/orders', orderRoutes);
  app.use("/admin", adminRoutes);



  app.get('/api', (_: Request, res: Response) => {
    res.json({
      message: 'Shop Api v1',
      version: '1.0.0',
      endpoints: {
        health: '/health',
        // auth: {
        //   register: 'POST /api/auth/sign-up',
        //   login: 'POST /api/auth/sign-in',
        //   me: 'GET /api/auth/me (protected)',
        // },
        // items: {
        //   create: 'POST /api/items (protected)',
        //   list: 'GET /api/items',
        //   get: 'GET /api/items/:id',
        //   update: 'PUT /api/items/:id (protected)',
        //   delete: 'DELETE /api/items/:id (protected)',
        //   myItems: 'GET /api/items/my/items (protected)',
        // },
      },
    });
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
