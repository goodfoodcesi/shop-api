import { Router } from 'express'
import multer from 'multer'
import * as shopController from './controller'
import { authMiddleware } from '@/middlewares/auth.middleware'
import { validateCreateShop, validateUpdateShop } from './validators'

const router = Router()
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
  }
})

// Toutes les routes nécessitent l'authentification
router.use(authMiddleware)

// CRUD
router.post('/', validateCreateShop, shopController.createShopHandler)
router.get('/', shopController.getAllShopsHandler)
router.get('/my-shops', shopController.getMyShopsHandler)
router.get('/:id', shopController.getShopHandler)
router.get('/:id/details', shopController.getShopWithDetailsHandler)
router.patch('/:id', validateUpdateShop, shopController.updateShopHandler)
router.delete('/:id', shopController.deleteShopHandler)

// Uploads
router.post('/:shopId/logo', upload.single('logo'), shopController.uploadLogoHandler)
router.post('/:shopId/cover', upload.single('cover'), shopController.uploadCoverImageHandler)
router.post('/:shopId/documents/:type', upload.single('document'), shopController.uploadDocumentHandler)

// Actions
router.post('/:shopId/submit', shopController.submitForValidationHandler)

export default router