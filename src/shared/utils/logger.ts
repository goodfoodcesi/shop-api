import winston from 'winston';
import { env } from '../config/env.js';


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
  })
);


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
