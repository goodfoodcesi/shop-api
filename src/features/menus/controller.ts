import type { Request, Response, NextFunction } from "express";
import * as menuService from "./service.js";
import { AccessDeniedError } from "./service.js";

function getAuth(req: Request) {
  return {
    userId: req.user?.id,
    organizationIds: req.user?.organizationIds || [],
  };
}

export async function createMenuHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> {
  try {
    const { userId, organizationIds } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const created = await menuService.createMenuFromBodyService(
      userId,
      req.body,
      organizationIds
    );

    if (!created) {
      return res.status(500).json({ error: "Internal Server Error" });
    }

    return res
      .status(201)
      .json({ data: created, message: "Menu created successfully" });
  } catch (e) {
    if (e instanceof AccessDeniedError) {
      return res.status(403).json({ error: "Forbidden" });
    }
    return next(e);
  }
}

export async function getMenuHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> {
  try {
    const { id } = req.params;
    if (!id) {
      return res
        .status(400)
        .json({ error: "Bad Request", message: "Menu ID is required" });
    }

    const menu = await menuService.getMenuByIdService(id);
    if (!menu) return res.status(404).json({ error: "Not Found" });

    return res.json({ data: menu });
  } catch (e) {
    return next(e);
  }
}

export async function getMenuWithShopHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> {
  try {
    const { id } = req.params;
    if (!id) {
      return res
        .status(400)
        .json({ error: "Bad Request", message: "Menu ID is required" });
    }

    const menu = await menuService.getMenuWithShopService(id);
    if (!menu) return res.status(404).json({ error: "Not Found" });

    return res.json({ data: menu });
  } catch (e) {
    return next(e);
  }
}

export async function getMenusByShopHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> {
  try {
    const { shopId } = req.params;
    if (!shopId) {
      return res
        .status(400)
        .json({ error: "Bad Request", message: "Shop ID is required" });
    }

    const userId = req.user?.id;
    const organizationIds = req.user?.organizationIds || [];

    const menus = await menuService.getMenusByShopService(
      shopId,
      userId,
      organizationIds
    );

    return res.json({ data: menus, count: menus.length });
  } catch (e) {
    return next(e);
  }
}

export async function getPublishedMenusByShop(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> {
  try {
    const { shopId } = req.params;
    if (!shopId) {
      return res
        .status(400)
        .json({ error: "Bad Request", message: "Shop ID is required" });
    }

    const data = await menuService.getPublishedMenusByShop(shopId);
    return res.json({ data, count: data.length });
  } catch (e) {
    return next(e);
  }
}

export async function getAllMenusByShopForManager(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> {
  try {
    const { shopId } = req.params;
    if (!shopId) {
      return res
        .status(400)
        .json({ error: "Bad Request", message: "Shop ID is required" });
    }

    const userId = req.user?.id;
    const organizationIds = req.user?.organizationIds || [];

    const data = await menuService.getAllMenusByShopForManager(
      shopId,
      userId,
      organizationIds
    );

    return res.json({ data });
  } catch (e) {
    return next(e);
  }
}

export async function getMenusQueryHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> {
  try {
    const shopId = String(req.query.shopId || "");
    if (!shopId) {
      return res
        .status(400)
        .json({ error: "Bad Request", message: "shopId query param is required" });
    }

    const { userId, organizationIds } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const menus = await menuService.getMenusByShopService(
      shopId,
      userId,
      organizationIds
    );

    return res.json({ data: menus, count: menus.length });
  } catch (e) {
    return next(e);
  }
}

export async function getMyMenusHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> {
  try {
    const { userId, organizationIds } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const menus = await menuService.getMyMenusService(
      userId,
      organizationIds
    );

    return res.json({ data: menus, count: menus.length });
  } catch (e) {
    return next(e);
  }
}

export async function updateMenuHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> {
  try {
    const { userId, organizationIds } = getAuth(req);
    const { id } = req.params;

    if (!userId || !id) {
      return res.status(400).json({ error: "Bad Request" });
    }

    const updated = await menuService.updateMenuFromBodyService(
      id,
      userId,
      req.body,
      organizationIds
    );

    if (!updated) return res.status(404).json({ error: "Not Found" });

    return res.json({
      data: updated,
      message: "Menu updated successfully",
    });
  } catch (e) {
    if (e instanceof AccessDeniedError) {
      return res.status(403).json({ error: "Forbidden" });
    }
    return next(e);
  }
}

export async function deleteMenuHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> {
  try {
    const { userId, organizationIds } = getAuth(req);
    const { id } = req.params;

    if (!userId || !id) {
      return res.status(400).json({ error: "Bad Request" });
    }

    const ok = await menuService.deleteMenuService(
      id,
      userId,
      organizationIds
    );

    if (!ok) return res.status(404).json({ error: "Not Found" });

    return res.status(204).send();
  } catch (e) {
    if (e instanceof AccessDeniedError) {
      return res.status(403).json({ error: "Forbidden" });
    }
    return next(e);
  }
}

export async function publishMenuHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> {
  try {
    const { userId, organizationIds } = getAuth(req);
    const { id } = req.params;

    if (!userId || !id) {
      return res.status(400).json({ error: "Bad Request" });
    }

    const updated = await menuService.publishMenuService(
      id,
      userId,
      organizationIds
    );

    if (!updated) return res.status(404).json({ error: "Not Found" });

    return res.json({
      data: updated,
      message: "Menu published successfully",
    });
  } catch (e) {
    if (e instanceof AccessDeniedError) {
      return res.status(403).json({ error: "Forbidden" });
    }
    return next(e);
  }
}

export async function unpublishMenuHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> {
  try {
    const { userId, organizationIds } = getAuth(req);
    const { id } = req.params;

    if (!userId || !id) {
      return res.status(400).json({ error: "Bad Request" });
    }

    const updated = await menuService.unpublishMenuService(
      id,
      userId,
      organizationIds
    );

    if (!updated) return res.status(404).json({ error: "Not Found" });

    return res.json({
      data: updated,
      message: "Menu unpublished successfully",
    });
  } catch (e) {
    if (e instanceof AccessDeniedError) {
      return res.status(403).json({ error: "Forbidden" });
    }
    return next(e);
  }
}

export async function updateStockHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> {
  try {
    const { userId, organizationIds } = getAuth(req);
    const { id } = req.params;

    if (!userId || !id) {
      return res.status(400).json({ error: "Bad Request" });
    }

    const updated = await menuService.updateStockService(
      id,
      userId,
      Number(req.body.stock),
      organizationIds
    );

    if (!updated) return res.status(404).json({ error: "Not Found" });

    return res.json({
      data: updated,
      message: "Stock updated successfully",
    });
  } catch (e) {
    if (e instanceof AccessDeniedError) {
      return res.status(403).json({ error: "Forbidden" });
    }
    return next(e);
  }
}

export async function uploadMenuImageHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> {
  try {
    const { userId, organizationIds } = getAuth(req);
    const { id } = req.params;
    const file = req.file;

    if (!userId || !id || !file) {
      return res.status(400).json({ error: "Bad Request" });
    }

    const url = await menuService.uploadMenuImageService(
      id,
      userId,
      {
        file: file.buffer,
        filename: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
      },
      organizationIds
    );

    if (!url) return res.status(404).json({ error: "Not Found" });

    return res.json({
      data: { url },
      message: "Menu image uploaded successfully",
    });
  } catch (e) {
    if (e instanceof AccessDeniedError) {
      return res.status(403).json({ error: "Forbidden" });
    }
    return next(e);
  }
}

export async function bulkUpdateDisplayOrderHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> {
  try {
    const { userId, organizationIds } = getAuth(req);
    const { shopId } = req.params;

    if (!userId || !shopId) {
      return res.status(400).json({ error: "Bad Request" });
    }

    await menuService.updateDisplayOrderService(
      shopId,
      userId,
      req.body.updates,
      organizationIds
    );

    return res.json({ message: "Display order updated successfully" });
  } catch (e) {
    if (e instanceof AccessDeniedError) {
      return res.status(403).json({ error: "Forbidden" });
    }
    return next(e);
  }
}

export async function getMenusByCategoryHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> {
  try {
    const { shopId, category } = req.params;
    if (!shopId || !category) {
      return res.status(400).json({ error: "Bad Request" });
    }

    const menus = await menuService.getMenusByCategoryService(
      shopId,
      category
    );

    return res.json({ data: menus, count: menus.length });
  } catch (e) {
    return next(e);
  }
}
