import { Router, type Request, type Response } from 'express';
import { db } from '../../db/index.js';
import { items } from '../../db/schema/items.js';
import { eq, and, gte, lte, ilike, or, sql, desc } from 'drizzle-orm';
import { requireAuth } from '../../shared/middlewares/auth.middleware.js';
import { requireItemOwner } from './middleware.js';
import { createItemSchema, updateItemSchema, itemsQuerySchema } from './validation.js';
import { logger } from '../../shared/utils/logger.js';

const router = Router();

/**
 * POST /api/items
 * Créer une annonce (protégé - authentification requise)
 */
router.post('/items', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    // Valider les données
    const validatedData = createItemSchema.parse(req.body);
    const userId = req.user!.userId;

    // Créer l'item
    const [newItem] = await db.insert(items).values({
      ...validatedData,
      sellerId: userId,
    }).returning();

    logger.info('Item created', {
      itemId: newItem.id,
      userId,
      title: newItem.title,
    });

    res.status(201).json({
      message: 'Item created successfully',
      item: newItem,
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({
        error: 'Validation Error',
        details: error.errors,
      });
      return;
    }

    logger.error('Error creating item', { error, userId: req.user?.userId });
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/items
 * Lister les annonces (public avec filtres)
 */
router.get('/items', async (req: Request, res: Response): Promise<void> => {
  try {
    // Valider et parser les query params
    const query = itemsQuerySchema.parse(req.query);
    const { page, limit, category, minPrice, maxPrice, search, status, sellerId } = query;

    // Construire les conditions de filtrage
    const conditions = [];

    // Par défaut, ne montrer que les items publiés (sauf si statut spécifié)
    if (status) {
      conditions.push(eq(items.status, status));
    } else {
      conditions.push(eq(items.status, 'published'));
    }

    if (category) {
      conditions.push(eq(items.category, category));
    }

    if (minPrice !== undefined) {
      conditions.push(gte(items.price, minPrice));
    }

    if (maxPrice !== undefined) {
      conditions.push(lte(items.price, maxPrice));
    }

    if (search) {
      conditions.push(
        or(
          ilike(items.title, `%${search}%`),
          ilike(items.description, `%${search}%`)
        )
      );
    }

    if (sellerId) {
      conditions.push(eq(items.sellerId, sellerId));
    }

    // Calculer l'offset pour la pagination
    const offset = (page - 1) * limit;

    // Requête avec filtres et pagination
    const itemsList = await db
      .select()
      .from(items)
      .where(and(...conditions))
      .orderBy(desc(items.createdAt))
      .limit(limit)
      .offset(offset);

    // Compter le total pour la pagination
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(items)
      .where(and(...conditions));

    const totalPages = Math.ceil(count / limit);

    res.json({
      items: itemsList,
      pagination: {
        page,
        limit,
        total: count,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({
        error: 'Invalid query parameters',
        details: error.errors,
      });
      return;
    }

    logger.error('Error listing items', { error });
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/items/:id
 * Récupérer une annonce par ID (public)
 */
router.get('/items/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const [item] = await db.select().from(items).where(eq(items.id, id));

    if (!item) {
      res.status(404).json({
        error: 'Not Found',
        message: 'Item not found',
      });
      return;
    }

    // Incrémenter le compteur de vues
    await db
      .update(items)
      .set({ viewCount: sql`${items.viewCount} + 1` })
      .where(eq(items.id, id));

    res.json({
      item: {
        ...item,
        viewCount: item.viewCount + 1, // Refléter l'incrémentation
      },
    });
  } catch (error) {
    logger.error('Error fetching item', { error, itemId: req.params.id });
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * PUT /api/items/:id
 * Modifier une annonce (protégé - propriétaire uniquement)
 */
router.put('/items/:id', requireAuth, requireItemOwner, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Valider les données
    const validatedData = updateItemSchema.parse(req.body);

    // Vérifier qu'il y a au moins une donnée à mettre à jour
    if (Object.keys(validatedData).length === 0) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'No data provided for update',
      });
      return;
    }

    // Mettre à jour l'item
    const [updatedItem] = await db
      .update(items)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(eq(items.id, id))
      .returning();

    logger.info('Item updated', {
      itemId: id,
      userId: req.user!.userId,
    });

    res.json({
      message: 'Item updated successfully',
      item: updatedItem,
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({
        error: 'Validation Error',
        details: error.errors,
      });
      return;
    }

    logger.error('Error updating item', { error, itemId: req.params.id });
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * DELETE /api/items/:id
 * Supprimer une annonce (protégé - propriétaire uniquement)
 */
router.delete('/items/:id', requireAuth, requireItemOwner, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await db.delete(items).where(eq(items.id, id));

    logger.info('Item deleted', {
      itemId: id,
      userId: req.user!.userId,
    });

    res.json({
      message: 'Item deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting item', { error, itemId: req.params.id });
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/items/my/items
 * Lister mes annonces (protégé)
 */
router.get('/items/my/items', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const myItems = await db
      .select()
      .from(items)
      .where(eq(items.sellerId, userId))
      .orderBy(desc(items.createdAt));

    res.json({
      items: myItems,
      count: myItems.length,
    });
  } catch (error) {
    logger.error('Error fetching user items', { error, userId: req.user?.userId });
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;