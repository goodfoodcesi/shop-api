import { Router, type Request, type Response } from 'express';
import { db } from '@/db/index.js';
import { users } from '@/db/schema/user.js';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { generateToken } from '@/features/auth/service.js';
import { requireAuth } from '@/shared/middlewares/auth.middleware.js';
import { logger } from '@/shared/utils/logger.js';

const router = Router();

/**
 * POST /api/auth/sign-up
 * Inscription utilisateur
 */
router.post('/auth/sign-up', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body;

    // Validation
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password required' });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({ error: 'Password must be at least 8 characters' });
      return;
    }

    const existing = await db.select().from(users).where(eq(users.email, email));
    if (existing.length > 0) {
      logger.warn('Signup attempt with existing email', { email });
      res.status(400).json({ error: 'Email already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [newUser] = await db.insert(users).values({
      email,
      password: hashedPassword,
      username: name || email.split('@')[0],
      role: 'buyer',
    }).returning();

    // Générer un JWT token
    const token = generateToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

      logger.info('User registered successfully', { 
      userId: newUser.id, 
      email: newUser.email 
    });

    // Retourner l'utilisateur créé + token
    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        role: newUser.role,
        createdAt: newUser.createdAt,
      },
      token,
    });
  } catch (error) {
    logger.error('Signup error', { error });
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/auth/sign-in
 * Connexion utilisateur
 */
router.post('/auth/sign-in', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password required' });
      return;
    }

    // Trouver l'utilisateur par email
    const [user] = await db.select().from(users).where(eq(users.email, email));
    
    if (!user) {
      logger.warn('Login attempt with non-existent email', { email });
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // Vérifier le password avec bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
        logger.warn('Login attempt with invalid password', { 
        email,
        userId: user.id 
      });
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // Générer un JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    logger.info('User logged in successfully', { 
      userId: user.id, 
      email: user.email 
    });


    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        profile: user.profile,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error) {
    logger.error('Login error', { error });
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/auth/me
 * Route protégée - retourne l'utilisateur connecté
 */
router.get('/auth/me', requireAuth, (req: Request, res: Response) => {
  res.json({
    message: 'Authenticated successfully',
    user: req.user,
  });
});

/**
 * GET /api/auth/test
 * Route de test pour vérifier que les routes auth fonctionnent
 */
router.get('/auth/test', (_: Request, res: Response) => {
  res.json({
    message: 'Auth routes are working!',
    availableEndpoints: {
      signUp: 'POST /api/auth/sign-up',
      signIn: 'POST /api/auth/sign-in',
      me: 'GET /api/auth/me (protected)',
    },
  });
});

export default router;
