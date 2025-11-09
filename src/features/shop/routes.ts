import { Router } from 'express'
import * as shopController from './controller'

export const shopRouter = Router()


shopRouter.post('/', shopController.createShopHandler)

shopRouter.get('/', shopController.getAllShopsHandler)

shopRouter.get('/:id', shopController.getShopHandler)

shopRouter.patch('/:id', shopController.updateShopHandler)

shopRouter.delete('/:id', shopController.deleteShopHandler)