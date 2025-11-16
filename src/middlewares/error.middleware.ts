import type { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import { 
  ShopNotFoundError, 
  ShopAlreadyExistsError, 
  AccessDeniedError,
  ShopNotCompleteError 
} from '@/features/shop/service'
import { UnauthorizedError } from './auth.middleware'

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  _: NextFunction
) {
  console.error('Error:', error)
  
  // Validation errors (Zod)
  if (error instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation error',
      details: error.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message
      }))
    })
  }
  
  // Not Found
  if (error instanceof ShopNotFoundError) {
    return res.status(404).json({
      error: error.message
    })
  }
  
  // Already Exists
  if (error instanceof ShopAlreadyExistsError) {
    return res.status(409).json({
      error: error.message
    })
  }
  
  // Unauthorized
  if (error instanceof UnauthorizedError) {
    return res.status(401).json({
      error: error.message
    })
  }
  
  // Access Denied
  if (error instanceof AccessDeniedError) {
    return res.status(403).json({
      error: error.message
    })
  }
  
  // Shop Not Complete
  if (error instanceof ShopNotCompleteError) {
    return res.status(400).json({
      error: error.message
    })
  }
  
    req.log.error({
    msg: 'Unhandled error',
    error: error.message,
    stack: error.stack,
    requestID: req.id,
  });
  // Default error
  return res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : undefined
  })
}