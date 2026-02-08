

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

  // 1. Get token from Cookie: better-auth.session_data
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

  const rawToken = cookies['better-auth.session_data'];

  logger.info('🍪 Cookies', { names: Object.keys(cookies), hasSessionData: !!rawToken });

  if (!rawToken) {
    logger.warn('❌ Session cookie missing', { available: Object.keys(cookies) });
    res.status(401).json({ error: "Session token not found" });
    return;
  }

  // Le cookie est URL-encodé (ex: "....5c%2BKyFa...."), on le decode avant d'aller dans Redis
  let token: string;
  try {
    token = decodeURIComponent(rawToken);
  } catch {
    // Si jamais le token est mal formé, on refuse proprement
    res.status(400).json({ error: "Invalid session token format" });
    return;
  }

  try {
    // Parse the JWT token to get the session ID
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      res.status(400).json({ error: "Invalid token format" });
      return;
    }

    // Decode the payload (second part of JWT)
    const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
    const sessionToken = payload.session?.session?.token;

    if (!sessionToken) {
      logger.warn('No session token in JWT payload');
      res.status(401).json({ error: "Invalid session token" });
      return;
    }

    // Try different Redis key formats
    let session = await redis.get(`better-auth:session:${sessionToken}`);

    if (!session) {
      // Fallback: try without prefix
      session = await redis.get(sessionToken);
    }

    if (!session) {
      logger.warn('Token not found in Redis', { sessionToken });
      res.status(401).json({ error: "Invalid or expired session" });
      return;
    }

    console.log("session: ", session)
    req.user = JSON.parse(session).user; // Assuming session data is JSON
    next();
  } catch (error) {
    logger.error('Auth Middleware Error', error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

