import { pgTable, text, timestamp, integer, jsonb, index, boolean } from "drizzle-orm/pg-core";
import type { WeekSchedule } from "@/types/shop.types"; 

export const shop = pgTable("shop", {
  id: text("id").primaryKey(),

  // Informations de base
  name: text("name").notNull(),
  description: text("description"),

  // Contact
  email: text("email"),
  phone: text("phone").notNull(),

  // Adresse
  address: text("address").notNull(),
  addressLine2: text("address_line_2"),
  city: text("city").notNull(),
  zipCode: text("zip_code").notNull(),
  country: text("country").notNull(),
  latitude: text("latitude"),
  longitude: text("longitude"),

  // Légal
  siret: text("siret").notNull(),

  // Médias (MinIO URLs)
  logo: text("logo"),
  coverImage: text("cover_image"),

  // Opérations
  prepTime: integer("prep_time"),

  // Horaires
  schedule: jsonb("schedule").$type<WeekSchedule>(), // 🔴 Utilise le type importé

  // Statuts
  status: text("status", {
    enum: [
      "draft",
      "pending_validation",
      "action_required",
      "validated",
      "visible",
      "hidden",
      "rejected"
    ]
  }).default("draft").notNull(),

  // Validation
  submittedAt: timestamp("submitted_at"),
  validatedAt: timestamp("validated_at"),
  validatedBy: text("validated_by"),
  rejectedAt: timestamp("rejected_at"),
  rejectedBy: text("rejected_by"),
  rejectedReason: text("rejected_reason"),
  actionRequiredAt: timestamp("action_required_at"),
  actionRequiredBy: text("action_required_by"),
  actionRequiredReason: text("action_required_reason"),

  // Visibilité
  visibleSince: timestamp("visible_since"),
  hiddenAt: timestamp("hidden_at"),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const shopDocument = pgTable("shop_document", {
  id: text("id").primaryKey(),
  shopId: text("shop_id")
    .references(() => shop.id, { onDelete: "cascade" })
    .notNull(),

  type: text("type", {
    enum: ["kbis", "id_card", "rib"]
  }).notNull(),

  url: text("url").notNull(),
  filename: text("filename").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size"),

  isVerified: boolean("is_verified").default(false),
  verifiedAt: timestamp("verified_at"),
  verifiedBy: text("verified_by"),
  rejectionReason: text("rejection_reason"),

  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
  uploadedBy: text("uploaded_by").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const shopAccess = pgTable("shop_access", {
  id: text("id").primaryKey(),
  shopId: text("shop_id")
    .references(() => shop.id, { onDelete: "cascade" })
    .notNull(),

  userId: text("user_id"),
  organizationId: text("organization_id"),

  role: text("role", {
    enum: ["owner", "manager", "editor", "viewer"]
  }).notNull(),

  grantedBy: text("granted_by").notNull(),
  grantedAt: timestamp("granted_at").defaultNow().notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
}, (table) => ({ // 🔴 Syntaxe corrigée pour les index
  shopIdIdx: index("shop_access_shop_id_idx").on(table.shopId),
  userIdIdx: index("shop_access_user_id_idx").on(table.userId),
  orgIdIdx: index("shop_access_org_id_idx").on(table.organizationId),
}));

export const shopStatusHistory = pgTable("shop_status_history", {
  id: text("id").primaryKey(),
  shopId: text("shop_id")
    .references(() => shop.id, { onDelete: "cascade" })
    .notNull(),

  fromStatus: text("from_status"),
  toStatus: text("to_status").notNull(),

  changedBy: text("changed_by").notNull(),
  changedAt: timestamp("changed_at").defaultNow().notNull(),

  reason: text("reason"),
  metadata: jsonb("metadata"),
}, (table) => ({ // 🔴 Ajout des index
  shopIdIdx: index("shop_status_history_shop_id_idx").on(table.shopId),
  changedAtIdx: index("shop_status_history_changed_at_idx").on(table.changedAt),
}));
