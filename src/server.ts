import { createApp } from './app.js';
import { env } from './shared/config/env.js';
import { closeDatabase } from './db/index.js';
import { logger } from "@/shared/utils/logger.js"
import { rabbitMQProvider } from './providers/rabbitmq.provider.js';
// import { startUserEventsConsumer } from '@/consumers/user-events.js';


(async () => {
  try {

    await rabbitMQProvider.connect();
    // logger.info('✅ RabbitMQ connected');

    // const channel = await rabbitMQProvider.getChannel();
    // if (channel) {
    //   // await startUserEventsConsumer(channel);
    // }

    // Créer l'app Express
    const app = createApp();

    // Démarrer le serveur HTTP
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

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      logger.info(`${signal} received. Starting graceful shutdown...`);

      server.close(async () => {
        logger.info('HTTP server closed');

        try {
          // await closeRabbitMQ();
          logger.info('RabbitMQ closed');

          await closeDatabase();
          logger.info('Database closed');

          logger.info('Graceful shutdown completed');
          process.exit(0);
        } catch (error) {
          logger.error('Error during shutdown', { error });
          process.exit(1);
        }
      });

      // Timeout force shutdown après 10s
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    // Signal handlers
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    process.on('unhandledRejection', (reason: unknown) => {
      if (reason instanceof Error) {
        logger.error('Unhandled Rejection', {
          message: reason.message,
          stack: reason.stack,
        });
      } else {
        logger.error('Unhandled Rejection', { reason });
      }
    });

    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception', {
        error: error.message,
        stack: error.stack,
      });
      gracefulShutdown('UNCAUGHT_EXCEPTION');
    });

    // Export pour tests si besoin
    return { app, server };

  } catch (error) {
    logger.error('❌ Failed to start server', { error });
    process.exit(1);
  }
})();

