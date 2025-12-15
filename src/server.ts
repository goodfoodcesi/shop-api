import { createApp } from './app.js';
import { env } from './shared/config/env.js';
import { closeDatabase } from './db/index.js';
import { logger } from "@/shared/utils/logger.js"

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info('🚀 Collector API started', {
    environment: env.NODE_ENV,
    port: env.PORT,
    url: `http://localhost:${env.PORT}`,
    endpoints: {
      health: `http://localhost:${env.PORT}/health`,
      api: `http://localhost:${env.PORT}/api`,
    },
  });
});

const gracefulShutdown = async (signal: any) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);
  server.close(async () => {
    logger.info('HTTP server closed');
    try {
      await closeDatabase();
      logger.info('Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      logger.error('Error during shutdown', { error });
      process.exit(1);
    }
  });

  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason, __) => {
  logger.error('Unhandled Rejection', {
    reason: reason?.message || reason,
    stack: reason?.stack,
  });
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', {
    error: error.message,
    stack: error.stack,
  });
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

export { app, server };
