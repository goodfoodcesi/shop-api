import type { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

export function loggingMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const start = Date.now();

  res.on('finish', () => {
    const userAgent = String(req.headers['user-agent'] || '');

    // Ignore probes & health
    if (userAgent.includes('kube-probe') || req.path === '/health') {
      return;
    }

    const durationMs = Date.now() - start;
    const { method } = req;
    const path = req.originalUrl || req.path;
    const { statusCode } = res;

    const requestId = req.header('X-Request-ID');
    const userId = (req as any).user?.userId;

    const level =
      statusCode >= 500
        ? 'error'
        : statusCode >= 400
          ? 'warn'
          : 'info';

    logger.log(level, 'http', {
      requestId,
      method,
      path,
      statusCode,
      durationMs,
      userId
    });
  });

  next();
}
