import { Router } from 'express';
import { getMenus } from '@/src/controllers/menus.controller.js';

const menuRouter = Router();

menuRouter.get("/", getMenus);
menuRouter.post("/", getMenus);

export default menuRouter;
