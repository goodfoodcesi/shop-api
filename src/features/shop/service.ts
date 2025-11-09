import type { CreateShopDto, UpdateShopDto, Shop } from './model'
import { createShopValidator, updateShopValidator } from './validators'
import * as shopRepo from './repository'

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

export async function createShopService(data: CreateShopDto): Promise<Shop> {
  // Validation
  const validated = createShopValidator.parse(data)
  
  // Vérifier si un shop avec ce SIRET existe déjà
  const existing = await shopRepo.findShopBySiret(validated.siret)
  if (existing) {
    throw new ShopAlreadyExistsError(validated.siret)
  }
  
  // Création
  const shop = await shopRepo.createShop(validated)
  return shop
}

export async function getShopByIdService(id: string): Promise<Shop> {
  const shop = await shopRepo.findShopById(id)
  
  if (!shop) {
    throw new ShopNotFoundError(id)
  }
  
  return shop
}

export async function getAllShopsService(): Promise<Shop[]> {
  const shops = await shopRepo.findAllShops()
  return shops
}

export async function updateShopService(id: string, data: UpdateShopDto): Promise<Shop> {
  // Validation
  const validated = updateShopValidator.parse(data)
  
  // Vérifier que le shop existe
  const existingShop = await shopRepo.findShopById(id)
  if (!existingShop) {
    throw new ShopNotFoundError(id)
  }
  
  // Si on change le SIRET, vérifier qu'il n'est pas déjà utilisé
  if (validated.siret && validated.siret !== existingShop.siret) {
    const shopWithSameSiret = await shopRepo.findShopBySiret(validated.siret)
    if (shopWithSameSiret) {
      throw new ShopAlreadyExistsError(validated.siret)
    }
  }
  
  // Mise à jour
  const updatedShop = await shopRepo.updateShop(id, validated)
  
  if (!updatedShop) {
    throw new ShopNotFoundError(id)
  }
  
  return updatedShop
}

export async function deleteShopService(id: string): Promise<void> {
  const deleted = await shopRepo.deleteShop(id)
  
  if (!deleted) {
    throw new ShopNotFoundError(id)
  }
}