import { pgTable, text, timestamp, integer, jsonb, boolean, decimal, index } from "drizzle-orm/pg-core";
import { shop } from "./shop"

export const menu = pgTable(
  'menu',
  {
    id: text('id').primaryKey(),
    shopId: text('shop_id')
      .notNull()
      .references(() => shop.id, { onDelete: 'cascade' }),

    // Informations de base
    name: text('name').notNull(),
    description: text('description'),
    price: decimal('price', { precision: 10, scale: 2 }).notNull(),
    stock: integer('stock').notNull().default(0),
    category: text('category'),

    // Options du menu (JSONB)
    options: jsonb('options'), // Type: MenuOption[]

    // Gestion affichage
    displayOrder: integer('display_order').default(0),
    imageUrl: text('image_url'),
    isPublished: boolean('is_published').notNull().default(false),

    // Soft delete
    isDeleted: boolean('is_deleted').notNull().default(false),
    deletedAt: timestamp('deleted_at'),
    deletedBy: text('deleted_by'),

    // Timestamps
    createdBy: text('created_by').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('menu_shop_id_idx').on(table.shopId),
    index('menu_is_published_idx').on(table.isPublished),
    index('menu_category_idx').on(table.category),
  ]
);

export type Menu = typeof menu.$inferSelect;
export type NewMenu = typeof menu.$inferInsert;