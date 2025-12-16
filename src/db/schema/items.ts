import { pgTable, uuid, varchar, text, integer, timestamp, pgEnum, jsonb } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from '@/db/schema/user';

// Enum pour le statut des annonces
export const itemStatusEnum = pgEnum('item_status', ['draft', 'published', 'sold', 'archived']);

// Table items (annonces)
export const items = pgTable('items', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  
  // Info de base
  title: varchar('title', { length: 200 })
    .notNull(),
  
  description: text('description')
    .notNull(),
  
  price: integer('price')
    .notNull(), // En centimes (ex: 1999 = 19.99€)
  
  category: varchar('category', { length: 100 })
    .notNull(),
  
  // Images (array d'URLs)
  images: jsonb('images')
    .$type<string[]>()
    .default(sql`'[]'::jsonb`)
    .notNull(),
  
  // Vendeur (foreign key vers users)
  sellerId: uuid('seller_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  
  // Statut
  status: itemStatusEnum('status')
    .notNull()
    .default('published'),
  
  // Metadata optionnelle (condition, taille, etc.)
  metadata: jsonb('metadata')
    .$type<{
      condition?: 'new' | 'like_new' | 'good' | 'fair' | 'poor';
      brand?: string;
      size?: string;
      color?: string;
      [key: string]: any;
    }>()
    .default(sql`'{}'::jsonb`),
  
  // Nombre de vues (pour analytics)
  viewCount: integer('view_count')
    .notNull()
    .default(0),
  
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// Types TypeScript inférés
export type Item = typeof items.$inferSelect;
export type NewItem = typeof items.$inferInsert;

// Type pour le statut
export type ItemStatus = 'draft' | 'published' | 'sold' | 'archived';

// Type pour la condition
export type ItemCondition = 'new' | 'like_new' | 'good' | 'fair' | 'poor';