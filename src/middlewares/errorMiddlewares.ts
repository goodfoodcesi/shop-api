import type { Request, Response, NextFunction } from 'express';

export function errorLogger(err: Error, req: Request, res: Response, _: NextFunction) {
  req.log.error({
    msg: 'Unhandled error',
    error: err.message,
    stack: err.stack,
    requestID: req.id,
  });

  res.status(500).json({
    error: 'Internal Server Error',
    requestID: req.id,
  });
}