import { z } from 'zod';
import * as dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000').transform(Number),
  API_URL: z.string().url().default('http://localhost:3000'),
  DATABASE_URL: z.string().url().startsWith('postgresql://'),
  REDIS_URL: z.string().url().optional(),
  BETTER_AUTH_SECRET: z.string().min(20),
  BETTER_AUTH_URL: z.string().url(),
  JWT_SECRET: z.string().min(20),
  JWT_EXPIRES_IN: z.string().default('7d'),
  ALLOWED_ORIGINS: z.string().default('http://localhost:5173,http://localhost:3000'),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

const parseEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Invalid environment variables:');
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      process.exit(1);
    }
    throw error;
  }
};

export const env = parseEnv();
