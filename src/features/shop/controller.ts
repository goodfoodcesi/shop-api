import type { Request, Response, NextFunction } from 'express'
import * as shopService from './service'
import type { CreateShopDto, UpdateShopDto } from './model'

export async function createShopHandler(
  req: Request<{}, {}, CreateShopDto>,
  res: Response,
  next: NextFunction
) {
  try {
    const shop = await shopService.createShopService(req.body)
    return res.status(201).json({
      data: shop,
      message: 'Shop created successfully'
    })
  } catch (error) {
    next(error)
  }
}

export async function getShopHandler(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const shop = await shopService.getShopByIdService(req.params.id)
    return res.json({
      data: shop
    })
  } catch (error) {
    next(error)
  }
}

export async function getAllShopsHandler(
  _: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const shops = await shopService.getAllShopsService()
    return res.json({
      data: shops,
      count: shops.length
    })
  } catch (error) {
    next(error)
  }
}

export async function updateShopHandler(
  req: Request<{ id: string }, {}, UpdateShopDto>,
  res: Response,
  next: NextFunction
) {
  try {
    const shop = await shopService.updateShopService(req.params.id, req.body)
    return res.json({
      data: shop,
      message: 'Shop updated successfully'
    })
  } catch (error) {
    next(error)
  }
}

export async function deleteShopHandler(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    await shopService.deleteShopService(req.params.id)
    return res.status(204).send()
  } catch (error) {
    next(error)
  }
}