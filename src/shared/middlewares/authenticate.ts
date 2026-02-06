

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

  // 1. Get token from Cookie: better-auth.session_token
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) {
    res.status(401).json({ error: "No cookies provided" });
    return;
  }

  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [name, value] = cookie.trim().split('=');
    acc[name] = value;
    return acc;
  }, {} as Record<string, string>);

  const rawToken = cookies['better-auth.session_token'];

  if (!rawToken) {
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
    const session = await redis.get(token.split(".")[0]);

    if (!session) {
      // Fallback or fail
      // Let's try `better-auth:session:${token}`
      // For now I will fail if not found.
      logger.warn('Token not found in Redis', { token });
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

