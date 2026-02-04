import type { Request, Response, NextFunction } from "express";
import * as shopService from "./service.js";

export async function createShopHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const shop = await shopService.createShopService(userId, req.body);

    return res.status(201).json({
      data: shop,
      message: "Shop created successfully",
    });
  } catch (error) {
    return next(error);
  }
}

export async function getShopHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Bad Request", message: "Shop ID is required" });
    }

    const shop = await shopService.getShopByIdService(id);
    return res.json({ data: shop });
  } catch (error) {
    return next(error);
  }
}

export async function getShopWithDetailsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    const organizationIds = req.user?.organizationIds || [];
    const { id } = req.params;

    if (!userId || !id) {
      return res.status(400).json({ error: "Bad Request" });
    }

    const shopData = await shopService.getShopWithDetailsService(id, userId, organizationIds);
    return res.json({ data: shopData });
  } catch (error) {
    return next(error);
  }
}

export async function getAllShopsHandler(_: Request, res: Response, next: NextFunction) {
  try {
    const shops = await shopService.getAllShopsService();
    return res.json({ data: shops, count: shops.length });
  } catch (error) {
    return next(error);
  }
}

export async function getMyShopsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    const organizationIds = req.user?.organizationIds || [];

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const shops = await shopService.getMyShopsService(userId, organizationIds);
    return res.json({ data: shops, count: shops.length });
  } catch (error) {
    return next(error);
  }
}

export async function updateShopHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    const organizationIds = req.user?.organizationIds || [];
    const { id } = req.params;

    if (!userId || !id) {
      return res.status(400).json({ error: "Bad Request" });
    }

    const shop = await shopService.updateShopService(id, userId, req.body, organizationIds);

    return res.json({
      data: shop,
      message: "Shop updated successfully",
    });
  } catch (error) {
    return next(error);
  }
}

export async function deleteShopHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    const organizationIds = req.user?.organizationIds || [];
    const { id } = req.params;

    if (!userId || !id) {
      return res.status(400).json({ error: "Bad Request" });
    }

    await shopService.deleteShopService(id, userId, organizationIds);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
}

// ==========================================
// UPLOADS
// ==========================================

export async function uploadLogoHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    const organizationIds = req.user?.organizationIds || [];
    const { shopId } = req.params;
    const file = req.file;

    if (!userId || !shopId || !file) {
      return res.status(400).json({ error: "Bad Request" });
    }

    const url = await shopService.uploadLogoService(
      shopId,
      userId,
      {
        file: file.buffer,
        filename: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
      },
      organizationIds
    );

    return res.json({ data: { url }, message: "Logo uploaded successfully" });
  } catch (error) {
    return next(error);
  }
}

export async function uploadCoverImageHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    const organizationIds = req.user?.organizationIds || [];
    const { shopId } = req.params;
    const file = req.file;

    if (!userId || !shopId || !file) {
      return res.status(400).json({ error: "Bad Request" });
    }

    const url = await shopService.uploadCoverImageService(
      shopId,
      userId,
      {
        file: file.buffer,
        filename: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
      },
      organizationIds
    );

    return res.json({ data: { url }, message: "Cover image uploaded successfully" });
  } catch (error) {
    return next(error);
  }
}

export async function uploadDocumentHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    const organizationIds = req.user?.organizationIds || [];
    const { shopId, type } = req.params;
    const file = req.file;

    if (!userId || !shopId || !type || !file) {
      return res.status(400).json({ error: "Bad Request" });
    }

    if (!["kbis", "id_card", "rib"].includes(type)) {
      return res.status(400).json({ error: "Invalid document type" });
    }

    await shopService.uploadDocumentService(
      shopId,
      userId,
      type as any,
      {
        file: file.buffer,
        filename: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
      },
      organizationIds
    );

    return res.json({ message: "Document uploaded successfully" });
  } catch (error) {
    return next(error);
  }
}

export async function submitForValidationHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    const organizationIds = req.user?.organizationIds || [];
    const { shopId } = req.params;

    if (!userId || !shopId) {
      return res.status(400).json({ error: "Bad Request" });
    }

    await shopService.submitForValidationService(shopId, userId, organizationIds);

    return res.json({ message: "Shop submitted for validation" });
  } catch (error) {
    return next(error);
  }
}
