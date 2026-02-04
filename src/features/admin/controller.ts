import type { Request, Response } from "express";
import * as adminService from "./service.js";
import { ShopStatus } from "@/shared/types/shop.types.js";

export async function listShops(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const status = req.query.status as ShopStatus;
    const shops = await adminService.listShopsByStatus(status);

    return res.json({ data: shops });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to list shops" });
  }
}

export async function approveShop(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const { id } = req.params;
    const adminId = req.user!.id;

    const shop = await adminService.approveShop(id, adminId);

    return res.json({ data: shop, message: "Shop approved" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to approve shop" });
  }
}

export async function rejectShop(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminId = req.user!.id;

    if (!reason) {
      return res.status(400).json({ message: "Rejection reason required" });
    }

    const shop = await adminService.rejectShop(id, adminId, reason);

    return res.json({ data: shop, message: "Shop rejected" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to reject shop" });
  }
}

export async function actionRequired(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminId = req.user!.id;

    if (!id || !reason) {
      return res.status(400).json({ message: "Reason and shopId required" });
    }

    const shop = await adminService.markActionRequired(id, adminId, reason);

    return res.json({
      data: shop,
      message: "Action required sent to shop",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to request action" });
  }
}
