import type { AuthUser } from '@/middlewares/auth.middleware'

declare global {
  namespace Express {
    interface Request {
      id: string;
      user?: AuthUser
    }
  }
}

export {};