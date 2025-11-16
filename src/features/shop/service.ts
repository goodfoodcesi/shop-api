// features/shop/service.ts

import type { CreateShopDTO, UpdateShopDTO, Shop, ShopWithDetailsDTO, UploadFileDTO } from './model'
import * as shopRepo from './repository'
import { uploadFile, deleteFile, MINIO_BUCKETS } from '@/providers'
import { SHOP_STATUS, DOCUMENT_TYPE, type DocumentType } from '@/types/shop.types'

// ==========================================
// ERRORS
// ==========================================

export class ShopNotFoundError extends Error {
  constructor(id: string) {
    super(`Shop with id ${id} not found`)
    this.name = 'ShopNotFoundError'
  }
}

export class ShopAlreadyExistsError extends Error {
  constructor(siret: string) {
    super(`Shop with SIRET ${siret} already exists`)
    this.name = 'ShopAlreadyExistsError'
  }
}

export class AccessDeniedError extends Error {
  constructor() {
    super('Access denied to this shop')
    this.name = 'AccessDeniedError'
  }
}

export class ShopNotCompleteError extends Error {
  constructor(missingItems: string[]) {
    super(`Shop is incomplete. Missing: ${missingItems.join(', ')}`)
    this.name = 'ShopNotCompleteError'
  }
}

// ==========================================
// HELPERS
// ==========================================

async function checkAccess(shopId: string, userId: string, organizationIds: string[] = []): Promise<void> {
  const hasAccess = await shopRepo.hasShopAccess(shopId, userId, organizationIds)
  if (!hasAccess) {
    throw new AccessDeniedError()
  }
}

// ==========================================
// CRUD
// ==========================================

export async function createShopService(userId: string, data: CreateShopDTO): Promise<Shop> {
// ❌ SUPPRIMÉ : const validated = createShopValidator.parse(data)
// ✅ Les données sont déjà validées par le middleware !
  
  // Vérifier si un shop avec ce SIRET existe déjà
  const existing = await shopRepo.findShopBySiret(data.siret)
  if (existing) {
    throw new ShopAlreadyExistsError(data.siret)
  }
  
  // Création du shop
  const shop = await shopRepo.createShop(data)

  // Donner l'accès owner au créateur
  await shopRepo.grantShopAccess({
    shopId: shop.id,
    userId,
    role: 'owner',
    grantedBy: userId
  })

  return shop
}

export async function getShopByIdService(id: string): Promise<Shop> {
  const shop = await shopRepo.findShopById(id)
  
  if (!shop) {
    throw new ShopNotFoundError(id)
  }
  
  return shop
}

export async function getShopWithDetailsService(
  shopId: string,
  userId: string,
  organizationIds: string[] = []
): Promise<ShopWithDetailsDTO> {
  // Vérifier l'accès
  await checkAccess(shopId, userId, organizationIds)

  // Récupérer le shop avec détails
  const shopData = await shopRepo.findShopByIdWithDetails(shopId)

  if (!shopData) {
    throw new ShopNotFoundError(shopId)
  }

  const documents = shopData.documents || []
  const accesses = shopData.accesses || []

  // Vérifier les documents manquants
  const requiredDocs: DocumentType[] = [
    DOCUMENT_TYPE.KBIS,
    DOCUMENT_TYPE.ID_CARD,
    DOCUMENT_TYPE.RIB,
  ]

  const existingDocTypes = documents.map(d => d.type)
  const missingDocuments = requiredDocs.filter(type => !existingDocTypes.includes(type))

  // Vérifier si on peut soumettre
  const canSubmit =
    missingDocuments.length === 0 &&
    !!shopData.logo &&
    !!shopData.coverImage &&
    !!shopData.name &&
    !!shopData.phone

  return {
    shop: shopData,
    documents,
    accesses,
    missingDocuments,
    canSubmit
  }
}

export async function getAllShopsService(): Promise<Shop[]> {
  const shops = await shopRepo.findAllShops()
  return shops
}

export async function getMyShopsService(userId: string, organizationIds: string[] = []): Promise<Shop[]> {
  return await shopRepo.findShopsByUserId(userId, organizationIds)
}

export async function updateShopService(
  id: string,
  userId: string,
  data: UpdateShopDTO,
  organizationIds: string[] = []
): Promise<Shop> {
  // Vérifier l'accès
  await checkAccess(id, userId, organizationIds)

// ❌ SUPPRIMÉ : const validated = updateShopValidator.parse(data)
// ✅ Les données sont déjà validées par le middleware !
  
  // Vérifier que le shop existe
  const existingShop = await shopRepo.findShopById(id)
  if (!existingShop) {
    throw new ShopNotFoundError(id)
  }
  
  // Si on change le SIRET, vérifier qu'il n'est pas déjà utilisé
  if (data.siret && data.siret !== existingShop.siret) {
    const shopWithSameSiret = await shopRepo.findShopBySiret(data.siret)
    if (shopWithSameSiret) {
      throw new ShopAlreadyExistsError(data.siret)
    }
  }
  
  // Mise à jour
  const updatedShop = await shopRepo.updateShop(id, data)
  
  if (!updatedShop) {
    throw new ShopNotFoundError(id)
  }
  
  return updatedShop
}

export async function deleteShopService(
  id: string,
  userId: string,
  organizationIds: string[] = []
): Promise<void> {
  // Vérifier l'accès
  await checkAccess(id, userId, organizationIds)

  const deleted = await shopRepo.deleteShop(id)
  
  if (!deleted) {
    throw new ShopNotFoundError(id)
  }
}

// ==========================================
// UPLOADS
// ==========================================

export async function uploadLogoService(
  shopId: string,
  userId: string,
  fileData: UploadFileDTO,
  organizationIds: string[] = []
): Promise<string> {
  // Vérifier l'accès
  await checkAccess(shopId, userId, organizationIds)

  // Supprimer l'ancien logo si existe
  const existingShop = await shopRepo.findShopById(shopId)
  if (existingShop?.logo) {
    try {
      const oldKey = existingShop.logo.split('/').slice(-2).join('/')
      await deleteFile(MINIO_BUCKETS.SHOPS, oldKey)
    } catch (error) {
      console.error('Failed to delete old logo:', error)
    }
  }

  // Upload nouveau logo
  const extension = fileData.filename.split('.').pop() || 'jpg'
  const key = `${shopId}/logo.${extension}`
  const url = await uploadFile(
    MINIO_BUCKETS.SHOPS,
    key,
    fileData.file,
    { 'Content-Type': fileData.mimeType }
  )

  // Sauvegarder l'URL
  await shopRepo.updateShop(shopId, { logo: url })

  return url
}

export async function uploadCoverImageService(
  shopId: string,
  userId: string,
  fileData: UploadFileDTO,
  organizationIds: string[] = []
): Promise<string> {
  // Vérifier l'accès
  await checkAccess(shopId, userId, organizationIds)

  const existingShop = await shopRepo.findShopById(shopId)
  if (existingShop?.coverImage) {
    try {
      const oldKey = existingShop.coverImage.split('/').slice(-2).join('/')
      await deleteFile(MINIO_BUCKETS.SHOPS, oldKey)
    } catch (error) {
      console.error('Failed to delete old cover:', error)
    }
  }

  const extension = fileData.filename.split('.').pop() || 'jpg'
  const key = `${shopId}/cover.${extension}`
  const url = await uploadFile(
    MINIO_BUCKETS.SHOPS,
    key,
    fileData.file,
    { 'Content-Type': fileData.mimeType }
  )

  await shopRepo.updateShop(shopId, { coverImage: url })

  return url
}

export async function uploadDocumentService(
  shopId: string,
  userId: string,
  type: DocumentType,
  fileData: UploadFileDTO,
  organizationIds: string[] = []
): Promise<void> {
  // Vérifier l'accès
  await checkAccess(shopId, userId, organizationIds)

  // Supprimer l'ancien document du même type si existe
  const existing = await shopRepo.findShopDocumentByType(shopId, type)
  if (existing) {
    try {
      const oldKey = existing.url.split('/').slice(-2).join('/')
      await deleteFile(MINIO_BUCKETS.SHOP_DOCUMENTS, oldKey)
      await shopRepo.deleteShopDocument(existing.id)
    } catch (error) {
      console.error('Failed to delete old document:', error)
    }
  }

  // Upload nouveau document
  const extension = fileData.filename.split('.').pop() || 'pdf'
  const key = `${shopId}/${type}.${extension}`
  const url = await uploadFile(
    MINIO_BUCKETS.SHOP_DOCUMENTS,
    key,
    fileData.file,
    { 'Content-Type': fileData.mimeType }
  )

  // Sauvegarder en DB
  await shopRepo.createShopDocument({
    shopId,
    type,
    url,
    filename: fileData.filename,
    mimeType: fileData.mimeType,
    size: fileData.size,
    uploadedBy: userId
  })
}

// ==========================================
// ACTIONS
// ==========================================

export async function submitForValidationService(
  shopId: string,
  userId: string,
  organizationIds: string[] = []
): Promise<void> {
  // Vérifier l'accès
  await checkAccess(shopId, userId, organizationIds)

  // Vérifier que le formulaire est complet
  const shopData = await getShopWithDetailsService(shopId, userId, organizationIds)

  if (!shopData.canSubmit) {
    throw new ShopNotCompleteError(shopData.missingDocuments)
  }

  // Mettre à jour le statut
  await shopRepo.updateShopStatus(
    shopId,
    SHOP_STATUS.PENDING_VALIDATION,
    userId,
    'Soumis par le manager'
  )
}
