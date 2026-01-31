import winston from 'winston';
import { env } from '../config/env.js';

<<<<<<< HEAD

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);


const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;
    

    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta)}`;
    }
    
    return log;
=======
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
>>>>>>> 940faf1 (aller)
  })
);


<<<<<<< HEAD
export const logger = winston.createLogger({
  level: env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'collector-api' },
  transports: [

    new winston.transports.Console({
      format: env.NODE_ENV === 'production' ? logFormat : consoleFormat,
    }),
    

    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    

    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// Helper functions pour logger facilement
export const log = {
  error: (message: string, meta?: any) => logger.error(message, meta),
  warn: (message: string, meta?: any) => logger.warn(message, meta),
  info: (message: string, meta?: any) => logger.info(message, meta),
  http: (message: string, meta?: any) => logger.http(message, meta),
  debug: (message: string, meta?: any) => logger.debug(message, meta),
};

export default logger;
=======
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
>>>>>>> 940faf1 (aller)
