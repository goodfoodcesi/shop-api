import { Router } from "express";
import * as controller from "./controller.js";
import { authenticate } from "@/shared/middlewares/authenticate.js";
import { requireUserType } from "@/shared/middlewares/authorize.js";

const router = Router();

router.use(authenticate);
router.use(requireUserType("admin"));

router.get("/shops", controller.listShops);
router.post("/shops/:id/approve", controller.approveShop);
router.post("/shops/:id/reject", controller.rejectShop);
router.post("/shops/:id/action-required", controller.actionRequired);

export default router;
