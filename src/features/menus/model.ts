import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { menu } from '@/db/schemas/menu.js';

export type Menu = InferSelectModel<typeof menu>;
export type InsertMenu = InferInsertModel<typeof menu>;

// ==========================================
// TYPES POUR LES OPTIONS
// ==========================================

export type MenuOptionChoice = {
  id: string;
  name: string;
  price: number;
};

export type MenuOption = {
  id: string;
  name: string;
  required: boolean;
  type: 'single' | 'multiple';
  minChoices: number;
  maxChoices: number;
  choices: MenuOptionChoice[];
};

// ==========================================
// DTOs
// ==========================================

export interface CreateMenuDTO {
  shopId: string;
  name: string;
  description?: string;
  price: string; // Décimal en string
  stock?: number;
  category?: string;
  options?: MenuOption[];
  displayOrder?: number;
  imageUrl?: string;
}

export interface UpdateMenuDTO {
  name?: string;
  description?: string;
  price?: string;
  stock?: number;
  category?: string;
  options?: MenuOption[];
  displayOrder?: number;
  imageUrl?: string;
}

export interface UploadMenuImageDTO {
  file: Buffer;
  filename: string;
  mimeType: string;
  size: number;
}

export interface MenuWithShop extends Menu {
  shop?: {
    id: string;
    name: string;
    status: string;
  };
}
