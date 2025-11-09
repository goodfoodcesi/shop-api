import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const shop = pgTable("shop", {
  id: text("id").primaryKey(),
  name: text("name"),
  adress: text("adress"),
  country: text("country"),
  city: text("city"),
  siret: text("siret"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});