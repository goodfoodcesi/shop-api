import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthUser {
  id: string
  email: string
  role: string
  organizationIds?: string[]
}

export class UnauthorizedError extends Error {
  constructor(message: string = 'Unauthorized') {
    super(message)
    this.name = 'UnauthorizedError'
  }
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Récupérer le token depuis le header Authorization
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided')
    }
    
    const token = authHeader.substring(7) // Enlever "Bearer "
    
    // Vérifier et décoder le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AuthUser
    
    // TODO: Optionnel - Appeler le microservice Auth pour récupérer les organisations
    // const userOrganizations = await authServiceClient.getUserOrganizations(decoded.id)
    // decoded.organizationIds = userOrganizations
    
    // Attacher l'utilisateur à la requête
    req.user = decoded
    
    next()
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: 'Invalid token' })
    }
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: 'Token expired' })
    }
    next(error)
  }
}

// Middleware optionnel pour vérifier les rôles
export function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden - Insufficient permissions' })
    }
    
    next()
  }
}