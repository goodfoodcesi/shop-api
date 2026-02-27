import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { shop, shopAccess, shopDocument } from '@/db/schemas/shop.js';
import type { WeekSchedule } from '@/shared/types/shop.types.js';

export type Shop = InferSelectModel<typeof shop>;
export type ShopAccess = InferSelectModel<typeof shopAccess>;
export type ShopDocument = InferSelectModel<typeof shopDocument>;

export type InsertShop = InferInsertModel<typeof shop>;

export interface CreateShopDTO {
  name: string;
  description?: string;
  email?: string;
  phone: string;
  address: string;
  addressLine2?: string;
  city: string;
  zipCode: string;
  country: string;
  siret: string;
  prepTime?: number;
  schedule?: WeekSchedule;
  logo?: string;
  coverImage?: string;
}

export interface UpdateShopDTO {
  name?: string;
  description?: string;
  email?: string;
  phone?: string;
  address?: string;
  addressLine2?: string;
  city?: string;
  zipCode?: string;
  country?: string;
  prepTime?: number;
  schedule?: WeekSchedule;
  siret?: string;
  logo?: string;
  coverImage?: string;
}

export interface UploadFileDTO {
  file: Buffer;
  filename: string;
  mimeType: string;
  size: number;
}

export interface ShopWithDetailsDTO {
  shop: Shop;
  documents: ShopDocument[];
  accesses: ShopAccess[];
  missingDocuments: string[];
  canSubmit: boolean;
}