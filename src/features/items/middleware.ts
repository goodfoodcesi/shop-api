import { type Request, type Response, type NextFunction } from 'express';
import { db } from '../../db/index.js';
import { items } from '../../db/schema/items.js';
import { eq } from 'drizzle-orm';
import { logger } from '../../shared/utils/logger.js';

/**
 * Middleware qui vérifie que l'utilisateur connecté est le propriétaire de l'item
 * À utiliser APRÈS requireAuth
 */
export async function requireItemOwner(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const itemId = req.params.id;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
      return;
    }

    // Récupérer l'item
    const [item] = await db.select().from(items).where(eq(items.id, itemId));

    if (!item) {
      res.status(404).json({
        error: 'Not Found',
        message: 'Item not found',
      });
      return;
    }

    // Vérifier que l'utilisateur est le propriétaire
    if (item.sellerId !== userId) {
      logger.warn('Unauthorized item access attempt', {
        userId,
        itemId,
        ownerId: item.sellerId,
      });

      res.status(403).json({
        error: 'Forbidden',
        message: 'You are not the owner of this item',
      });
      return;
    }

    // Attacher l'item à la requête pour éviter de le refetch
    (req as any).item = item;

    next();
  } catch (error) {
    logger.error('Error in requireItemOwner middleware', { error });
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to verify item ownership',
    });
  }
}