import type { Request, Response, NextFunction } from "express";

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

function base64UrlDecode(input: string) {
  const b64 = input.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(b64, "base64").toString("utf8");
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ error: "No token provided" });
    return;
  }

  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) {
    res.status(401).json({ error: "Invalid token format" });
    return;
  }

  try {
    const parts = token.split(".");
    if (parts.length !== 3 || !parts[1]) {
      res.status(401).json({ error: "Invalid JWT format" });
      return;
    }

    const payload = JSON.parse(base64UrlDecode(parts[1]));
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token payload" });
  }
}

