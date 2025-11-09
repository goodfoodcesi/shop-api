import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { shop } from '@/db/schemas/shop.schema'
import type { CreateShopDto, UpdateShopDto, Shop } from './model'

export async function createShop(data: CreateShopDto): Promise<Shop> {
  const [newShop] = await db.insert(shop).values({
    id: crypto.randomUUID(), // Génération de l'ID
    ...data
  }).returning()

  if (!newShop) {
    throw new Error('Failed to create shop');
  }

  return newShop
}

export async function findShopById(id: string): Promise<Shop | null> {
  const [foundShop] = await db
    .select()
    .from(shop)
    .where(eq(shop.id, id))
    .limit(1)

  return foundShop || null
}

export async function findAllShops(): Promise<Shop[]> {
  const shops = await db.select().from(shop)
  return shops
}

export async function updateShop(id: string, data: UpdateShopDto): Promise<Shop | null> {
  const [updatedShop] = await db
    .update(shop)
    .set({
      ...data,
      updatedAt: new Date()
    })
    .where(eq(shop.id, id))
    .returning()

  return updatedShop || null
}

export async function deleteShop(id: string): Promise<boolean> {
  const result = await db
    .delete(shop)
    .where(eq(shop.id, id))
    .returning()

  return result.length > 0
}

export async function findShopBySiret(siret: string): Promise<Shop | null> {
  const [foundShop] = await db
    .select()
    .from(shop)
    .where(eq(shop.siret, siret))
    .limit(1)

  return foundShop || null
}