import { z } from 'zod';

// Schema pour créer un item
export const createItemSchema = z.object({
  title: z.string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be less than 200 characters'),
  
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(5000, 'Description must be less than 5000 characters'),
  
  price: z.number()
    .int('Price must be an integer')
    .positive('Price must be positive')
    .max(100000000, 'Price is too high'), // 1 million euros max
  
  category: z.string()
    .min(2, 'Category is required')
    .max(100, 'Category must be less than 100 characters'),
  
  images: z.array(z.string().url('Invalid image URL'))
    .max(10, 'Maximum 10 images allowed')
    .optional()
    .default([]),
  
  status: z.enum(['draft', 'published'])
    .optional()
    .default('published'),
  
  metadata: z.object({
    condition: z.enum(['new', 'like_new', 'good', 'fair', 'poor']).optional(),
    brand: z.string().max(100).optional(),
    size: z.string().max(50).optional(),
    color: z.string().max(50).optional(),
  }).optional(),
});

// Schema pour mettre à jour un item
export const updateItemSchema = createItemSchema.partial();

// Schema pour les query params de recherche/filtrage
export const itemsQuerySchema = z.object({
  page: z.string().optional().default('1').transform(Number),
  limit: z.string().optional().default('20').transform(Number),
  category: z.string().optional(),
  minPrice: z.string().optional().transform(val => val ? Number(val) : undefined),
  maxPrice: z.string().optional().transform(val => val ? Number(val) : undefined),
  search: z.string().optional(),
  status: z.enum(['draft', 'published', 'sold', 'archived']).optional(),
  sellerId: z.string().uuid().optional(),
});

// Types inférés
export type CreateItemInput = z.infer<typeof createItemSchema>;
export type UpdateItemInput = z.infer<typeof updateItemSchema>;
export type ItemsQueryInput = z.infer<typeof itemsQuerySchema>;