import { z } from "zod";
import type { Request, Response, NextFunction } from "express";

// ==========================================
// SCHEMAS
// ==========================================

export const createShopSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().min(5),
  address: z.string().min(3),
  addressLine2: z.string().optional(),
  city: z.string().min(2),
  zipCode: z.string().min(3),
  country: z.string().min(2),
  siret: z.string().min(5),
  prepTime: z.number().int().min(0).optional(),
});

export const updateShopSchema = createShopSchema.partial();

// ==========================================
// MIDDLEWARES
// ==========================================

export function validateCreateShop(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    req.body = createShopSchema.parse(req.body);
    return next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Validation error",
        details: error.errors.map(e => ({
          field: e.path.join("."),
          message: e.message,
        })),
      });
    }

    return next(error);
  }
}

export function validateUpdateShop(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    req.body = updateShopSchema.parse(req.body);
    return next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Validation error",
        details: error.errors.map(e => ({
          field: e.path.join("."),
          message: e.message,
        })),
      });
    }

    return next(error);
  }
}
