import * as menuRepo from "./repository.js";
import * as shopRepo from "../shop/repository.js";
import type { CreateMenuDTO, UpdateMenuDTO, UploadMenuImageDTO, MenuOption } from "./model.js";
import { nanoid } from "nanoid";
import { Client as MinioClient } from "minio";
import { env } from "@/shared/config/env.js";

export class AccessDeniedError extends Error {
  constructor(message = "Access denied") {
    super(message);
    this.name = "AccessDeniedError";
  }
}

export class InvalidStockError extends Error {
  constructor(message = "Invalid stock value") {
    super(message);
    this.name = "InvalidStockError";
  }
}

export class InvalidOptionsError extends Error {
  constructor(message = "Invalid menu options") {
    super(message);
    this.name = "InvalidOptionsError";
  }
}

async function checkShopAccess(shopId: string, userId: string, organizationIds: string[]): Promise<void> {
  const hasAccess = await shopRepo.hasShopAccess(shopId, userId, organizationIds);
  if (!hasAccess) throw new AccessDeniedError(`You don't have access to shop ${shopId}`);
}

function validateMenuOptions(options?: any[]): void {
  if (!options || options.length === 0) return;

  for (const option of options) {
    if (!option.id || !option.name || typeof option.required !== "boolean" || !option.type) {
      throw new InvalidOptionsError("Option missing required fields");
    }

    if (!["single", "multiple"].includes(option.type)) {
      throw new InvalidOptionsError('Option type must be "single" or "multiple"');
    }

    if (typeof option.minChoices !== "number" || typeof option.maxChoices !== "number") {
      throw new InvalidOptionsError("minChoices and maxChoices must be numbers");
    }

    if (option.minChoices < 0 || option.maxChoices < 0) {
      throw new InvalidOptionsError("minChoices and maxChoices must be positive");
    }

    if (option.minChoices > option.maxChoices) {
      throw new InvalidOptionsError("minChoices cannot be greater than maxChoices");
    }

    if (option.type === "single" && option.maxChoices !== 1) {
      throw new InvalidOptionsError("Single choice option must have maxChoices = 1");
    }

    if (!Array.isArray(option.choices) || option.choices.length === 0) {
      throw new InvalidOptionsError("Option must have at least one choice");
    }

    for (const choice of option.choices) {
      if (!choice.id || !choice.name || typeof choice.price !== "number") {
        throw new InvalidOptionsError("Choice missing required fields");
      }
      if (choice.price < 0) {
        throw new InvalidOptionsError("Choice price cannot be negative");
      }
    }
  }
}

function parseOptionsPayload(value: unknown): MenuOption[] | undefined {
  if (value === undefined || value === null) return undefined;

  if (Array.isArray(value)) return value as MenuOption[];

  if (typeof value === "string") {
    const v = value.trim();
    if (!v) return [];
    try {
      const parsed = JSON.parse(v);
      return Array.isArray(parsed) ? (parsed as MenuOption[]) : [];
    } catch {
      throw new InvalidOptionsError("options/optionsJson is not valid JSON");
    }
  }

  throw new InvalidOptionsError("Invalid options payload");
}

export async function createMenuService(userId: string, data: CreateMenuDTO, organizationIds: string[]) {
  await checkShopAccess(data.shopId, userId, organizationIds);

  if (data.options) validateMenuOptions(data.options);

  const created = await menuRepo.createMenu({
    id: nanoid(),
    shopId: data.shopId,
    name: data.name,
    description: data.description ?? null,
    price: data.price,
    stock: data.stock ?? 0,
    category: data.category ?? null,
    options: data.options ? JSON.stringify(data.options) : null,
    displayOrder: data.displayOrder ?? 0,
    imageUrl: null,
    isPublished: false,
    isDeleted: false,
    createdBy: userId,
    deletedAt: null,
    deletedBy: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  if (!created) {
    console.error("[menus] createMenu failed");
    return null;
  }

  return created;
}

export async function getMenuByIdService(menuId: string) {
  const m = await menuRepo.findMenuById(menuId);
  if (!m) {
    console.warn(`[menus] menu not found: ${menuId}`);
    return null;
  }
  return m;
}

export async function getMenuWithShopService(menuId: string) {
  const m = await menuRepo.findMenuByIdWithShop(menuId);
  if (!m) {
    console.warn(`[menus] menu not found: ${menuId}`);
    return null;
  }
  return m;
}

export async function getMenusByShopService(
  shopId: string,
  userId?: string,
  organizationIds: string[] = []
) {
  if (!userId) {
    return await menuRepo.findMenusByShopId(shopId, false);
  }

  const hasAccess = await shopRepo.hasShopAccess(
    shopId,
    userId,
    organizationIds
  );

  if (!hasAccess) {
    return await menuRepo.findMenusByShopId(shopId, false);
  }

  return await menuRepo.findMenusByShopId(shopId, true);
}

export async function getPublishedMenusByShop(shopId: string) {
  return menuRepo.findMenusByShopId(shopId, false);
}

export async function getAllMenusByShopForManager(
  shopId: string,
  userId: string,
  organizationIds: string[]
) {
  const hasAccess = await shopRepo.hasShopAccess(shopId, userId, organizationIds);
  if (!hasAccess) return [];

  return menuRepo.findMenusByShopId(shopId, true);
}

export async function getMyMenusService(userId: string, organizationIds: string[]) {
  return await menuRepo.findMenusByUserAccess(userId, organizationIds);
}

export async function updateMenuService(menuId: string, userId: string, data: UpdateMenuDTO, organizationIds: string[]) {
  const existing = await menuRepo.findMenuById(menuId);
  if (!existing) {
    console.warn(`[menus] menu not found: ${menuId}`);
    return null;
  }

  await checkShopAccess(existing.shopId, userId, organizationIds);

  if (data.options) validateMenuOptions(data.options);

  const updated = await menuRepo.updateMenu(menuId, {
    name: data.name,
    description: data.description,
    price: data.price,
    stock: data.stock,
    category: data.category,
    options: data.options ? JSON.stringify(data.options) : undefined,
    displayOrder: data.displayOrder,
    imageUrl: data.imageUrl,
  });

  if (!updated) {
    console.error(`[menus] update failed for menu ${menuId}`);
    return null;
  }

  return updated;
}

export async function deleteMenuService(menuId: string, userId: string, organizationIds: string[]) {
  const existing = await menuRepo.findMenuById(menuId);
  if (!existing) {
    console.warn(`[menus] menu not found: ${menuId}`);
    return false;
  }

  await checkShopAccess(existing.shopId, userId, organizationIds);
  return await menuRepo.softDeleteMenu(menuId, userId);
}

export async function publishMenuService(menuId: string, userId: string, organizationIds: string[]) {
  const existing = await menuRepo.findMenuById(menuId);
  if (!existing) {
    console.warn(`[menus] menu not found: ${menuId}`);
    return null;
  }

  await checkShopAccess(existing.shopId, userId, organizationIds);

  const updated = await menuRepo.publishMenu(menuId);
  if (!updated) console.error(`[menus] publish failed for menu ${menuId}`);
  return updated ?? null;
}

export async function unpublishMenuService(menuId: string, userId: string, organizationIds: string[]) {
  const existing = await menuRepo.findMenuById(menuId);
  if (!existing) {
    console.warn(`[menus] menu not found: ${menuId}`);
    return null;
  }

  await checkShopAccess(existing.shopId, userId, organizationIds);

  const updated = await menuRepo.unpublishMenu(menuId);
  if (!updated) console.error(`[menus] unpublish failed for menu ${menuId}`);
  return updated ?? null;
}

export async function updateStockService(menuId: string, userId: string, stock: number, organizationIds: string[]) {
  if (stock < 0) throw new InvalidStockError("Stock cannot be negative");

  const existing = await menuRepo.findMenuById(menuId);
  if (!existing) {
    console.warn(`[menus] menu not found: ${menuId}`);
    return null;
  }

  await checkShopAccess(existing.shopId, userId, organizationIds);

  const updated = await menuRepo.updateStock(menuId, stock);
  if (!updated) console.error(`[menus] updateStock failed for menu ${menuId}`);
  return updated ?? null;
}

export async function uploadMenuImageService(menuId: string, userId: string, file: UploadMenuImageDTO, organizationIds: string[]) {
  const existing = await menuRepo.findMenuById(menuId);
  if (!existing) {
    console.warn(`[menus] menu not found: ${menuId}`);
    return null;
  }

  await checkShopAccess(existing.shopId, userId, organizationIds);

  const minioClient = new MinioClient({
    endPoint: env.MINIO_ENDPOINT || "localhost",
    port: parseInt(env.MINIO_PORT || "9000", 10),
    useSSL: env.MINIO_USE_SSL === "true",
    accessKey: env.MINIO_ACCESS_KEY || "minioadmin",
    secretKey: env.MINIO_SECRET_KEY || "minioadmin",
  });

  const bucketName = "menus";
  const safeName = (file.filename || "image").replace(/[^\w.\-]+/g, "_");
  const objectName = `${menuId}/${nanoid()}-${safeName}`;

  const bucketExists = await minioClient.bucketExists(bucketName);
  if (!bucketExists) await minioClient.makeBucket(bucketName);

  await minioClient.putObject(bucketName, objectName, file.file, file.size, { "Content-Type": file.mimeType });

  const url = `${env.MINIO_PUBLIC_URL || "http://localhost:9000"}/${bucketName}/${objectName}`;
  await menuRepo.updateMenu(menuId, { imageUrl: url });

  return url;
}

export async function updateDisplayOrderService(shopId: string, userId: string, updates: Array<{ id: string; displayOrder: number }>, organizationIds: string[]) {
  await checkShopAccess(shopId, userId, organizationIds);
  await menuRepo.bulkUpdateDisplayOrder(updates);
}

export async function getMenusByCategoryService(shopId: string, category: string) {
  return await menuRepo.findMenusByCategory(shopId, category);
}

export async function createMenuFromBodyService(userId: string, body: any, organizationIds: string[]) {
  const options = parseOptionsPayload(body.optionsJson ?? body.options);
  if (options) validateMenuOptions(options);

  const data: CreateMenuDTO = {
    shopId: body.shopId,
    name: body.name,
    description: body.description,
    price: body.price,
    stock: body.stock,
    category: body.category,
    options,
    displayOrder: body.displayOrder,
  };

  return createMenuService(userId, data, organizationIds);
}

export async function updateMenuFromBodyService(menuId: string, userId: string, body: any, organizationIds: string[]) {
  const options =
    body.optionsJson !== undefined || body.options !== undefined ? parseOptionsPayload(body.optionsJson ?? body.options) : undefined;

  if (options) validateMenuOptions(options);

  const data: UpdateMenuDTO = {
    name: body.name,
    description: body.description,
    price: body.price,
    stock: body.stock,
    category: body.category,
    options,
    displayOrder: body.displayOrder,
    imageUrl: body.imageUrl,
  };

  return updateMenuService(menuId, userId, data, organizationIds);
}
