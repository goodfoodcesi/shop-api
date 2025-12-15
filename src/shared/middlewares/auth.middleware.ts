import { type Request, type Response, type NextFunction } from 'express';
import { verifyToken } from '@/features/auth/service.js';

// Étendre le type Request d'Express pour inclure user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: string;
      };
    }
  }
}

/**
 * Middleware qui vérifie qu'un utilisateur est authentifié
 * Attend un token JWT dans le header Authorization: Bearer TOKEN
 */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {

    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required. Please provide a valid token.',
      });
      return;
    }

    const token = authHeader.substring(7);
 
    const decoded = verifyToken(token);

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({
      error: 'Unauthorized',
      message: error instanceof Error ? error.message : 'Invalid or expired token',
    });
  }
}

/**
 * Middleware qui vérifie qu'un utilisateur a un rôle spécifique
 * À utiliser APRÈS requireAuth
 */
export function requireRole(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
      return;
    }

    const userRole = req.user.role;
    
    if (!roles.includes(userRole)) {
      res.status(403).json({
        error: 'Forbidden',
        message: `Access denied. Required role: ${roles.join(' or ')}. Your role: ${userRole}`,
      });
      return;
    }

    next();
  };
}

/**
 * Middleware optionnel : attache l'utilisateur s'il est connecté, sinon continue
 * Utile pour les routes publiques qui peuvent personnaliser le contenu si l'utilisateur est connecté
 */
export async function optionalAuth(
  req: Request,
  _: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      };
    }

    next();
  } catch (error) {
    next();
  }
}
