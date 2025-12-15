import jwt from 'jsonwebtoken';
import { env } from '@/shared/config/env.js';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

/**
 * Génère un JWT token pour un utilisateur
 */
export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
}

/**
 * Vérifie et décode un JWT token
 */
export function verifyToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}
