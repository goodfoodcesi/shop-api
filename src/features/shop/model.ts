import type { InferSelectModel, InferInsertModel } from 'drizzle-orm'
import { shop } from '@/db/schemas/shop.schema'

export type Shop = InferSelectModel<typeof shop>


export type InsertShop = InferInsertModel<typeof shop>

export interface CreateShopDto {
  name: string
  adress: string
  country: string
  city: string
  siret: string
}


export interface UpdateShopDto {
  name?: string
  adress?: string
  country?: string
  city?: string
  siret?: string
}


export interface ShopResponse {
  id: string
  name: string
  adress: string
  country: string
  city: string
  siret: string
  createdAt: Date
  updatedAt: Date
}