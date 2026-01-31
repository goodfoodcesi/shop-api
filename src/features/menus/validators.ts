import { z } from "zod";
import type { Request, Response, NextFunction } from "express";

// ==========================================
// SCHEMAS ZOD
// ==========================================

const menuOptionChoiceSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  price: z.number().min(0),
});

const menuOptionSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    required: z.boolean(),
    type: z.enum(["single", "multiple"]),
    minChoices: z.number().int().min(0),
    maxChoices: z.number().int().min(0),
    choices: z.array(menuOptionChoiceSchema).min(1),
  })
  .refine((d) => d.maxChoices >= d.minChoices, {
    message: "maxChoices must be >= minChoices",
  });

export const createMenuSchema = z.object({
  shopId: z.string().uuid(),
  name: z.string().min(2).max(255),
  description: z.string().optional(),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/),
  stock: z.number().int().min(0).optional().default(0),
  category: z.string().optional(),
  options: z.array(menuOptionSchema).optional(),
  displayOrder: z.number().int().min(0).optional().default(0),
});

export const updateMenuSchema = z.object({
  name: z.string().min(2).max(255).optional(),
  description: z.string().optional(),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
  stock: z.number().int().min(0).optional(),
  category: z.string().optional(),
  options: z.array(menuOptionSchema).optional(),
  displayOrder: z.number().int().min(0).optional(),
  imageUrl: z.string().url().optional(),
});

export const updateStockSchema = z.object({
  stock: z.number().int().min(0),
});

export const bulkUpdateDisplayOrderSchema = z.object({
  updates: z.array(
    z.object({
      id: z.string().uuid(),
      displayOrder: z.number().int().min(0),
    })
  ).min(1),
});

// ==========================================
// MIDDLEWARES
// ==========================================

export function validateCreateMenu(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    req.body = createMenuSchema.parse(req.body);
    return next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Validation error",
        details: error.errors,
      });
    }
    return next(error);
  }
}

export function validateUpdateMenu(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    req.body = updateMenuSchema.parse(req.body);
    return next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Validation error",
        details: error.errors,
      });
    }
    return next(error);
  }
}

export function validateUpdateStock(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    req.body = updateStockSchema.parse(req.body);
    return next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Validation error",
        details: error.errors,
      });
    }
    return next(error);
  }
}

export function validateBulkUpdateDisplayOrder(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    req.body = bulkUpdateDisplayOrderSchema.parse(req.body);
    return next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Validation error",
        details: error.errors,
      });
    }
    return next(error);
  }
}
