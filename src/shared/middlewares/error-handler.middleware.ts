import { type Request, type Response, type NextFunction } from 'express';
import { logger } from '@/shared/utils/logger.js';
import { env } from '../config/env.js';


/**
 * Middleware global de gestion des erreurs
 * À placer en dernier dans app.ts
 */
export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _: NextFunction
): void {

  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
    body: req.body,
    ip: req.ip,
  });


  const statusCode = err.statusCode || err.status || 500;


  const message = env.NODE_ENV === 'production' 
    ? 'Internal Server Error' 
    : err.message || 'Something went wrong';


  res.status(statusCode).json({
    error: statusCode >= 500 ? 'Internal Server Error' : err.name || 'Error',
    message,
    ...(env.NODE_ENV === 'development' && {
      stack: err.stack,
      details: err.details,
    }),
  });
}

/**
 * Middleware pour gérer les routes non trouvées (404)
 */
export function notFoundHandler(req: Request, res: Response): void {
  logger.warn('Route not found', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
  });

  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
  });
}
