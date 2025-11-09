import { z } from 'zod'

export const createShopValidator = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').max(255),
  adress: z.string().min(5, 'L\'adresse doit contenir au moins 5 caractères'),
  country: z.string().min(2, 'Le pays doit contenir au moins 2 caractères'),
  city: z.string().min(2, 'La ville doit contenir au moins 2 caractères'),
  siret: z.string().length(14, 'Le SIRET doit contenir exactement 14 chiffres').regex(/^\d{14}$/, 'Le SIRET doit contenir uniquement des chiffres')
})

export const updateShopValidator = z.object({
  name: z.string().min(2).max(255).optional(),
  adress: z.string().min(5).optional(),
  country: z.string().min(2).optional(),
  city: z.string().min(2).optional(),
  siret: z.string().length(14).regex(/^\d{14}$/).optional()
})

export type CreateShopInput = z.infer<typeof createShopValidator>
export type UpdateShopInput = z.infer<typeof updateShopValidator>