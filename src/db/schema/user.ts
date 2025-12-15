import { pgTable, uuid, varchar, timestamp, pgEnum, jsonb } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Enum pour les rôles utilisateur
export const userRoleEnum = pgEnum('user_role', ['buyer', 'seller', 'admin']);

// Table users
export const users = pgTable('users', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  
  email: varchar('email', { length: 255 })
    .notNull()
    .unique(),
  
  password: varchar('password', { length: 255 })
    .notNull(),
  
  username: varchar('username', { length: 100 })
    .unique(),
  
  role: userRoleEnum('role')
    .notNull()
    .default('buyer'),
  
  // Profile info (flexible JSON)
  profile: jsonb('profile')
    .$type<{
      firstName?: string;
      lastName?: string;
      avatar?: string;
      bio?: string;
      phone?: string;
      interests?: string[]; // Catégories d'intérêt
    }>()
    .default(sql`'{}'::jsonb`),
  
  // Email verification
  emailVerified: timestamp('email_verified', { withTimezone: true }),
  
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
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// Type pour le profil utilisateur
export type UserProfile = NonNullable<User['profile']>;

// Type pour les rôles
export type UserRole = 'buyer' | 'seller' | 'admin';