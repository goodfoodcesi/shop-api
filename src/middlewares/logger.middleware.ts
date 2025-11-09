import pinoHttp from 'pino-http';
import type { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';

const IGNORED_PATHS = [
  '/docs',
  '/openapi.json',
];

// Configuration du logger HTTP
export const httpLogger = pinoHttp({
  logger,
  autoLogging: {
    ignore: (req) => {
      return IGNORED_PATHS.some(path => req.url?.startsWith(path));
    }
  },
  customLogLevel: (_, res, err) => {
    if (res.statusCode >= 400 && res.statusCode < 500) return 'warn';
    if (res.statusCode >= 500 || err) return 'error';
    return 'info';
  },
  customSuccessMessage: (req, __) => {
    return `HTTP ${req.method} ${req.url}`;
  },
  customErrorMessage: (req, __, err) => {
    return `HTTP ${req.method} ${req.url} - ${err.message}`;
  },
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      path: req.path,
      requestID: req.id,
      body: req.raw.body,
    }),
    res: (res) => ({
      statusCode: res.statusCode,
      requestID: res.raw.req.id,
    }),
  },
});

// Log le body de la response
export function responseLogger(req: Request, res: Response, next: NextFunction) {
  const originalSend = res.send;

  if (IGNORED_PATHS.some(path => req.path.startsWith(path))) {
    return next();
  }

  res.send = function (data) {
    res.locals.body = data;
    return originalSend.call(this, data);
  };

  res.on('finish', () => {
    if (!res.locals.body) return;

    const contentType = res.getHeader('content-type');
    if (!contentType || !contentType.toString().includes('application/json')) {
      return;
    }

    try {
      const body = typeof res.locals.body === 'string'
        ? JSON.parse(res.locals.body)
        : res.locals.body;

      req.log.info({
        msg: 'HTTP Response',
        method: req.method,
        path: req.url,
        requestID: req.id,
        status: res.statusCode,
        body,
      });
    } catch (error) {}
  });

  next();
}