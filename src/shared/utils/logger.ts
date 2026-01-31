import winston from 'winston';
import { env } from '../config/env.js';

const SERVICE_NAME = 'shop-api';
const IS_PRODUCTION = env.NODE_ENV === 'production';

const devFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
    const metaStr =
      Object.keys(meta).length > 0
        ? JSON.stringify(meta, null, 2)
        : '';
    return `${timestamp} [${service}] ${level}: ${message}${metaStr ? '\n' + metaStr : ''
      }`;
  })
);


const prodFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json()
);

export const logger = winston.createLogger({
  level: env.LOG_LEVEL || 'info',
  defaultMeta: {
    service: SERVICE_NAME,
    environment: env.NODE_ENV || 'development'
  },
  format: IS_PRODUCTION ? prodFormat : devFormat,
  transports: [new winston.transports.Console()]
});

/**
 * Log d’erreur standardisé
 * - stack seulement hors prod
 */
export function logError(
  message: string,
  error: unknown,
  context?: Record<string, any>
) {
  const err = error instanceof Error ? error : new Error(String(error));

  logger.error(message, {
    error: err.message,
    ...(IS_PRODUCTION ? {} : { stack: err.stack }),
    ...context
  });
}
