import { and, desc, eq, inArray, or } from "drizzle-orm";
import { db } from "@/db/index.js";
import { menu } from "@/db/schemas/menu.js";
import { shop } from "@/db/schemas/shop.js";
import { shopAccess } from "@/db/schemas/shop.js";
import type { InsertMenu, Menu } from "./model.js";

export async function createMenu(data: InsertMenu): Promise<Menu> {
  const [newMenu] = await db.insert(menu).values(data).returning();
  return newMenu ?? null;
}

export async function findMenuById(id: string): Promise<Menu | null> {
  const [found] = await db
    .select()
    .from(menu)
    .where(and(eq(menu.id, id), eq(menu.isDeleted, false)))
    .limit(1);

  return found || null;
}

export async function findMenuByIdWithShop(id: string) {
  const result = await db
    .select({
      id: menu.id,
      shopId: menu.shopId,
      name: menu.name,
      description: menu.description,
      price: menu.price,
      stock: menu.stock,
      isPublished: menu.isPublished,
      options: menu.options,
      imageUrl: menu.imageUrl,
      category: menu.category,
      displayOrder: menu.displayOrder,
      isDeleted: menu.isDeleted,
      createdAt: menu.createdAt,
      updatedAt: menu.updatedAt,
      createdBy: menu.createdBy,
      shop: {
        id: shop.id,
        name: shop.name,
        status: shop.status,
      },
    })
    .from(menu)
    .leftJoin(shop, eq(menu.shopId, shop.id))
    .where(and(eq(menu.id, id), eq(menu.isDeleted, false)))
    .limit(1);

  return result[0] || null;
}

export async function findMenusByShopId(
  shopId: string,
  includeUnpublished = false
) {
  if (includeUnpublished) {
    return db
      .select()
      .from(menu)
      .where(
        and(
          eq(menu.shopId, shopId),
          eq(menu.isDeleted, false)
        )
      );
  }

  return db
    .select()
    .from(menu)
    .where(
      and(
        eq(menu.shopId, shopId),
        eq(menu.isDeleted, false),
        eq(menu.isPublished, true)
      )
    );
}


export async function findMenusByUserAccess(userId: string, organizationIds: string[] = []): Promise<Menu[]> {
  const accessCond =
    organizationIds.length > 0
      ? or(eq(shopAccess.userId, userId), inArray(shopAccess.organizationId, organizationIds))
      : eq(shopAccess.userId, userId);

  return await db
    .select({
      id: menu.id,
      shopId: menu.shopId,
      name: menu.name,
      description: menu.description,
      price: menu.price,
      stock: menu.stock,
      category: menu.category,
      options: menu.options,
      imageUrl: menu.imageUrl,
      displayOrder: menu.displayOrder,
      isPublished: menu.isPublished,
      isDeleted: menu.isDeleted,
      createdAt: menu.createdAt,
      updatedAt: menu.updatedAt,
      createdBy: menu.createdBy,
      deletedAt: menu.deletedAt,
      deletedBy: menu.deletedBy,
    })
    .from(menu)
    .innerJoin(shopAccess, eq(menu.shopId, shopAccess.shopId))
    .where(and(eq(menu.isDeleted, false), accessCond))
    .orderBy(menu.shopId, menu.displayOrder, desc(menu.createdAt));
}

export async function updateMenu(id: string, data: Partial<InsertMenu>): Promise<Menu | null> {
  const [updated] = await db
    .update(menu)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(menu.id, id), eq(menu.isDeleted, false)))
    .returning();

  return updated || null;
}

export async function softDeleteMenu(id: string, userId: string): Promise<boolean> {
  const result = await db
    .update(menu)
    .set({
      isDeleted: true,
      deletedAt: new Date(),
      deletedBy: userId,
      updatedAt: new Date(),
    })
    .where(and(eq(menu.id, id), eq(menu.isDeleted, false)))
    .returning();

  return result.length > 0;
}

export async function publishMenu(id: string): Promise<Menu | null> {
  const [published] = await db
    .update(menu)
    .set({ isPublished: true, updatedAt: new Date() })
    .where(and(eq(menu.id, id), eq(menu.isDeleted, false)))
    .returning();

  return published || null;
}

export async function unpublishMenu(id: string): Promise<Menu | null> {
  const [unpublished] = await db
    .update(menu)
    .set({ isPublished: false, updatedAt: new Date() })
    .where(and(eq(menu.id, id), eq(menu.isDeleted, false)))
    .returning();

  return unpublished || null;
}

export async function updateStock(id: string, stock: number): Promise<Menu | null> {
  const [updated] = await db
    .update(menu)
    .set({ stock, updatedAt: new Date() })
    .where(and(eq(menu.id, id), eq(menu.isDeleted, false)))
    .returning();

  return updated || null;
}

export async function findMenusByCategory(shopId: string, category: string): Promise<Menu[]> {
  return await db
    .select()
    .from(menu)
    .where(and(eq(menu.shopId, shopId), eq(menu.category, category), eq(menu.isDeleted, false), eq(menu.isPublished, true)))
    .orderBy(menu.displayOrder, desc(menu.createdAt));
}

export async function bulkUpdateDisplayOrder(updates: Array<{ id: string; displayOrder: number }>): Promise<void> {
  await db.transaction(async (tx) => {
    for (const u of updates) {
      await tx.update(menu).set({ displayOrder: u.displayOrder, updatedAt: new Date() }).where(eq(menu.id, u.id));
    }
  });
}
