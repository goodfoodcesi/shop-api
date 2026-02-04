import { type Request, type Response, type NextFunction } from 'express';
import { logger } from '@/shared/utils/logger.js';

/**
 * Middleware qui log toutes les requêtes HTTP
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();


  res.on('finish', () => {
    const duration = Date.now() - start;
    const { method, originalUrl, ip } = req;
    const { statusCode } = res;

  
    const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'http';

    logger.log(level, `${method} ${originalUrl}`, {
      method,
      url: originalUrl,
      statusCode,
      duration: `${duration}ms`,
      ip,
      userAgent: req.get('user-agent'),
    });
  });

  next();
}
