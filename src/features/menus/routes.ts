import { Router } from "express";
import multer from "multer";
import * as menuController from "./controller.js";
import { authenticate } from "@/shared/middlewares/authenticate.js";
import { validateCreateMenu, validateUpdateMenu, validateUpdateStock, validateBulkUpdateDisplayOrder } from "./validators.js";

const menuRoutes = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
});

menuRoutes.get("/by-shop/:shopId", menuController.getPublishedMenusByShop);


menuRoutes.get("/manager/by-shop/:shopId", authenticate, menuController.getAllMenusByShopForManager);


menuRoutes.get("/by-shop/:shopId/category/:category", menuController.getMenusByCategoryHandler);
menuRoutes.get("/:id/with-shop", menuController.getMenuWithShopHandler);
menuRoutes.get("/:id", menuController.getMenuHandler);

menuRoutes.use(authenticate);

menuRoutes.get("/", menuController.getMenusQueryHandler);
menuRoutes.get("/my-menus", menuController.getMyMenusHandler);

menuRoutes.post("/", validateCreateMenu, menuController.createMenuHandler);
menuRoutes.patch("/:id", validateUpdateMenu, menuController.updateMenuHandler);
menuRoutes.delete("/:id", menuController.deleteMenuHandler);

menuRoutes.post("/:id/publish", menuController.publishMenuHandler);
menuRoutes.post("/:id/unpublish", menuController.unpublishMenuHandler);

menuRoutes.patch("/:id/stock", validateUpdateStock, menuController.updateStockHandler);

menuRoutes.post("/:id/image", upload.single("image"), menuController.uploadMenuImageHandler);

menuRoutes.post("/by-shop/:shopId/bulk-update-order", validateBulkUpdateDisplayOrder, menuController.bulkUpdateDisplayOrderHandler);

export default menuRoutes;
