import { Router } from 'express';
import multer from 'multer';
import * as shopController from './controller.js';
import { authenticate } from '@/shared/middlewares/authenticate.js';
import { requireUserType } from '@/shared/middlewares/authorize.js';
import { validateCreateShop, validateUpdateShop } from './validators.js';

const shopRoutes = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
  }
});


shopRoutes.get('/', shopController.getAllShopsHandler);

shopRoutes.get(
  '/my-shops',
  authenticate,
  requireUserType('shop', 'admin'),
  shopController.getMyShopsHandler
);

shopRoutes.get(
  '/:id/details',
  authenticate,
  requireUserType('shop', 'admin'),
  shopController.getShopWithDetailsHandler
);

shopRoutes.post(
  '/:shopId/submit',
  authenticate,
  requireUserType('shop'),
  shopController.submitForValidationHandler
);

shopRoutes.get('/:id', shopController.getShopHandler);

shopRoutes.post(
  '/',
  authenticate,
  requireUserType('shop'),
  validateCreateShop,
  shopController.createShopHandler
);

shopRoutes.patch(
  '/:id',
  authenticate,
  requireUserType('shop'),
  validateUpdateShop,
  shopController.updateShopHandler
);

shopRoutes.delete(
  '/:id',
  authenticate,
  requireUserType('shop', 'admin'),
  shopController.deleteShopHandler
);

// uploads / actions
shopRoutes.post(
  '/:shopId/logo',
  authenticate,
  requireUserType('shop'),
  upload.single('logo'),
  shopController.uploadLogoHandler
);

shopRoutes.post(
  '/:shopId/cover',
  authenticate,
  requireUserType('shop'),
  upload.single('cover'),
  shopController.uploadCoverImageHandler
);

shopRoutes.post(
  '/:shopId/documents/:type',
  authenticate,
  requireUserType('shop'),
  upload.single('document'),
  shopController.uploadDocumentHandler
);




export default shopRoutes;