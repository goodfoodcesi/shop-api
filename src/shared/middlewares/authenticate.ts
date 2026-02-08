

import type { NextFunction, Request, Response } from "express";
import { redis } from "../../providers/redis.provider";
import { logger } from "../utils/logger";

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {

  // 1. Get token from Cookie: better-auth.session_token (not session_data!)
  const cookieHeader = req.headers.cookie;

  logger.info('🔍 Auth check', { path: req.path, hasCookie: !!cookieHeader });

  if (!cookieHeader) {
    logger.warn('❌ No cookie header');
    res.status(401).json({ error: "No cookies provided" });
    return;
  }

  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [name, value] = cookie.trim().split('=');
    acc[name] = value;
    return acc;
  }, {} as Record<string, string>);

  const rawToken = cookies['better-auth.session_token'];

  logger.info('🍪 Cookies', { names: Object.keys(cookies), hasSessionToken: !!rawToken });

  if (!rawToken) {
    logger.warn('❌ Session cookie missing', { available: Object.keys(cookies) });
    res.status(401).json({ error: "Session token not found" });
    return;
  }

  // Le cookie est URL-encodé, on le decode
  let token: string;
  try {
    token = decodeURIComponent(rawToken);
  } catch {
    res.status(400).json({ error: "Invalid session token format" });
    return;
  }

  try {
    // Use the token directly as Redis key (it's a simple string, not a JWT)
    // This matches order-api logic
    const session = await redis.get(token);

    if (!session) {
      logger.warn('Token not found in Redis', { token });
      res.status(401).json({ error: "Invalid or expired session" });
      return;
    }

    logger.info('✅ Session found in Redis');
    console.log("session: ", session)
    req.user = JSON.parse(session).user;
    next();
  } catch (error) {
    logger.error('Auth Middleware Error', error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

