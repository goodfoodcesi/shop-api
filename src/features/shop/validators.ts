import { z } from 'zod'
import type { Request, Response, NextFunction } from 'express'

// ==========================================
// SCHEMAS ZOD
// ==========================================

export const createShopSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').max(255),
  description: z.string().optional(),

  email: z.string().email('Email invalide').optional(),
  phone: z.string().min(10, 'Le téléphone doit contenir au moins 10 caractères'),

  address: z.string().min(5, 'L\'adresse doit contenir au moins 5 caractères'),
  addressLine2: z.string().optional(),
  city: z.string().min(2, 'La ville doit contenir au moins 2 caractères'),
  zipCode: z.string().min(5, 'Le code postal doit contenir au moins 5 caractères'),
  country: z.string().min(2, 'Le pays doit contenir au moins 2 caractères').default('FR'),

  siret: z.string()
    .length(14, 'Le SIRET doit contenir exactement 14 chiffres')
    .regex(/^\d{14}$/, 'Le SIRET doit contenir uniquement des chiffres'),

  prepTime: z.number().int().positive().optional(),
  schedule: z.any().optional()
})

export const updateShopSchema = z.object({
  name: z.string().min(2).max(255).optional(),
  description: z.string().optional(),

  email: z.string().email().optional(),
  phone: z.string().min(10).optional(),

  address: z.string().min(5).optional(),
  addressLine2: z.string().optional(),
  city: z.string().min(2).optional(),
  zipCode: z.string().min(5).optional(),
  country: z.string().min(2).optional(),

  siret: z.string().length(14).regex(/^\d{14}$/).optional(),

  prepTime: z.number().int().positive().optional(),
  schedule: z.any().optional(),

  logo: z.string().url().optional(),
  coverImage: z.string().url().optional()
})

// ==========================================
// MIDDLEWARES DE VALIDATION
// ==========================================

export function validateCreateShop(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    req.body = createShopSchema.parse(req.body)
    next()
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message
        }))
      })
    }
    next(error)
  }
}

export function validateUpdateShop(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    req.body = updateShopSchema.parse(req.body)
    next()
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message
        }))
      })
    }
    next(error)
  }
}

// ==========================================
// TYPES
// ==========================================

export type CreateShopInput = z.infer<typeof createShopSchema>
export type UpdateShopInput = z.infer<typeof updateShopSchema>