import type { Request, Response, NextFunction } from "express";

export function requireUserType(...allowed: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    console.log("req user type: ", req.user.userType)
    const userType = req.user.userType;

    if (!allowed.includes(userType)) {
      res.status(403).json({
        error: "Forbidden",
        message: `Required userType: ${allowed.join(" or ")}`,
      });
      return;
    }

    next();
  };
}
