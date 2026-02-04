import * as shopRepo from "@/features/shop/repository.js";
import { db } from "@/db/index.js";
import { shopStatusHistory } from "@/db/schemas/shop.js";
import { ShopStatus } from "@/shared/types/shop.types";

export class ShopNotFoundError extends Error {}
export class InvalidStatusError extends Error {}

async function getShopOrThrow(shopId: string) {
  const shop = await shopRepo.findShopById(shopId);
  if (!shop) throw new ShopNotFoundError("Shop not found");
  return shop;
}

async function logStatusChange(
  shopId: string,
  fromStatus: string | null,
  toStatus: string,
  adminId: string,
  reason?: string
) {
  await db.insert(shopStatusHistory).values({
    id: crypto.randomUUID(),
    shopId,
    fromStatus,
    toStatus,
    changedBy: adminId,
    reason,
  });
}

export async function listShopsByStatus(status?: ShopStatus) {
  if (!status) return await shopRepo.findAllShops();
  return await shopRepo.findShopsByStatus(status);
}

export async function approveShop(shopId: string, adminId: string) {
  const shop = await getShopOrThrow(shopId);

  const updated = await shopRepo.updateShop(shopId, {
    status: "validated",
    validatedAt: new Date(),
    validatedBy: adminId,
  });

  await logStatusChange(shopId, shop.status, "validated", adminId);
  return updated;
}

export async function rejectShop(
  shopId: string,
  adminId: string,
  reason: string
) {
  const shop = await getShopOrThrow(shopId);

  const updated = await shopRepo.updateShop(shopId, {
    status: "rejected",
    rejectedAt: new Date(),
    rejectedBy: adminId,
    rejectedReason: reason,
  });

  await logStatusChange(shopId, shop.status, "rejected", adminId, reason);
  return updated;
}

export async function markActionRequired(
  shopId: string,
  adminId: string,
  reason: string
) {
  const shop = await getShopOrThrow(shopId);

  const updated = await shopRepo.updateShop(shopId, {
    status: "action_required",
    actionRequiredAt: new Date(),
    actionRequiredBy: adminId,
    actionRequiredReason: reason,
  });

  await logStatusChange(shopId, shop.status, "action_required", adminId, reason);
  return updated;
}
