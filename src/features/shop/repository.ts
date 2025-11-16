// features/shop/shop.repository.ts

import { eq, and, or, inArray, desc } from 'drizzle-orm'
import { db } from '@/db'
import { shop, shopDocument, shopAccess, shopStatusHistory } from '@/db/schemas/shop.schema'
import type { Shop, InsertShop, ShopDocument, ShopAccess, CreateShopDTO } from './model'
import type { ShopStatus } from '@/types/shop.types'

// ==========================================
// SHOP
// ==========================================

export async function createShop(data: CreateShopDTO): Promise<Shop> {
  const [newShop] = await db.insert(shop).values({
    id: crypto.randomUUID(),
    ...data
  }).returning()

  if (!newShop) {
    throw new Error('Failed to create shop')
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

export async function findShopByIdWithDetails(id: string) {
  // Récupérer le shop
  const [foundShop] = await db
    .select()
    .from(shop)
    .where(eq(shop.id, id))
    .limit(1)

  if (!foundShop) {
    return null
  }

  // Récupérer les documents
  const documents = await db
    .select()
    .from(shopDocument)
    .where(eq(shopDocument.shopId, id))

  // Récupérer les accès
  const accesses = await db
    .select()
    .from(shopAccess)
    .where(eq(shopAccess.shopId, id))

  // Récupérer l'historique
  const statusHistory = await db
    .select()
    .from(shopStatusHistory)
    .where(eq(shopStatusHistory.shopId, id))
    .orderBy(desc(shopStatusHistory.changedAt))
    .limit(10)

  return {
    ...foundShop,
    documents,
    accesses,
    statusHistory
  }
}

export async function findAllShops(): Promise<Shop[]> {
  return await db.select().from(shop)
}

export async function updateShop(id: string, data: Partial<InsertShop>): Promise<Shop | null> {
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

// ==========================================
// STATUT
// ==========================================

export async function updateShopStatus(
  id: string,
  status: ShopStatus,
  userId: string,
  reason?: string
): Promise<void> {
  const currentShop = await findShopById(id)

  await db.transaction(async (tx) => {
    // Mettre à jour le statut
    await tx
      .update(shop)
      .set({ status, updatedAt: new Date() })
      .where(eq(shop.id, id))

    // Ajouter dans l'historique
    await tx.insert(shopStatusHistory).values({
      id: crypto.randomUUID(),
      shopId: id,
      fromStatus: currentShop?.status || null,
      toStatus: status,
      changedBy: userId,
      reason
    })
  })
}

// ==========================================
// ACCÈS
// ==========================================

export async function findShopsByUserId(
  userId: string,
  organizationIds: string[] = []
): Promise<Shop[]> {
  let conditions: any = eq(shopAccess.userId, userId)

  if (organizationIds.length > 0) {
    conditions = or(
      eq(shopAccess.userId, userId),
      inArray(shopAccess.organizationId, organizationIds)
    )
  }

  const results = await db
    .select({
      id: shop.id,
      name: shop.name,
      description: shop.description,
      email: shop.email,
      phone: shop.phone,
      address: shop.address,
      addressLine2: shop.addressLine2,
      city: shop.city,
      zipCode: shop.zipCode,
      country: shop.country,
      latitude: shop.latitude,
      longitude: shop.longitude,
      siret: shop.siret,
      logo: shop.logo,
      coverImage: shop.coverImage,
      prepTime: shop.prepTime,
      schedule: shop.schedule,
      status: shop.status,
      submittedAt: shop.submittedAt,
      validatedAt: shop.validatedAt,
      validatedBy: shop.validatedBy,
      rejectedAt: shop.rejectedAt,
      rejectedBy: shop.rejectedBy,
      rejectedReason: shop.rejectedReason,
      actionRequiredAt: shop.actionRequiredAt,
      actionRequiredBy: shop.actionRequiredBy,
      actionRequiredReason: shop.actionRequiredReason,
      visibleSince: shop.visibleSince,
      hiddenAt: shop.hiddenAt,
      createdAt: shop.createdAt,
      updatedAt: shop.updatedAt,
    })
    .from(shop)
    .innerJoin(shopAccess, eq(shop.id, shopAccess.shopId))
    .where(conditions)

  return results
}

export async function hasShopAccess(
  shopId: string,
  userId: string,
  organizationIds: string[] = []
): Promise<boolean> {
  let conditions: any = and(
    eq(shopAccess.shopId, shopId),
    eq(shopAccess.userId, userId)
  )

  if (organizationIds.length > 0) {
    conditions = and(
      eq(shopAccess.shopId, shopId),
      or(
        eq(shopAccess.userId, userId),
        inArray(shopAccess.organizationId, organizationIds)
      )
    )
  }

  const [result] = await db
    .select()
    .from(shopAccess)
    .where(conditions)
    .limit(1)

  return !!result
}

export async function grantShopAccess(data: {
  shopId: string
  userId?: string
  organizationId?: string
  role: 'owner' | 'manager' | 'editor' | 'viewer'
  grantedBy: string
}): Promise<ShopAccess> {
  const [access] = await db.insert(shopAccess).values({
    id: crypto.randomUUID(),
    ...data
  }).returning()

  if (!access) {
    throw new Error('Failed to grant shop access')
  }

  return access
}

export async function revokeShopAccess(accessId: string): Promise<boolean> {
  const result = await db
    .delete(shopAccess)
    .where(eq(shopAccess.id, accessId))
    .returning()

  return result.length > 0
}

// ==========================================
// DOCUMENTS
// ==========================================

export async function createShopDocument(data: {
  shopId: string
  type: 'kbis' | 'id_card' | 'rib'
  url: string
  filename: string
  mimeType: string
  size: number
  uploadedBy: string
}): Promise<ShopDocument> {
  const [doc] = await db.insert(shopDocument).values({
    id: crypto.randomUUID(),
    ...data
  }).returning()

  if (!doc) {
    throw new Error('Failed to create shop document')
  }

  return doc
}

export async function findShopDocuments(shopId: string): Promise<ShopDocument[]> {
  return await db
    .select()
    .from(shopDocument)
    .where(eq(shopDocument.shopId, shopId))
}

export async function findShopDocumentByType(
  shopId: string,
  type: 'kbis' | 'id_card' | 'rib'
): Promise<ShopDocument | null> {
  const [doc] = await db
    .select()
    .from(shopDocument)
    .where(
      and(
        eq(shopDocument.shopId, shopId),
        eq(shopDocument.type, type)
      )
    )
    .limit(1)

  return doc || null
}

export async function deleteShopDocument(id: string): Promise<boolean> {
  const result = await db
    .delete(shopDocument)
    .where(eq(shopDocument.id, id))
    .returning()

  return result.length > 0
}

export async function verifyShopDocument(
  id: string,
  verifiedBy: string
): Promise<void> {
  await db
    .update(shopDocument)
    .set({
      isVerified: true,
      verifiedAt: new Date(),
      verifiedBy
    })
    .where(eq(shopDocument.id, id))
}