import Redis from 'ioredis';

// Simplified Redis client, matching order-api approach
export const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6380');
