import winston from 'winston';

const isDevelopment = process.env.NODE_ENV === 'development';

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    
    if (Object.keys(meta).length > 0) {
      log += `\n${JSON.stringify(meta, null, 2)}`;
    }
    
    return log;
  })
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'HH:mm:ss'
  }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `${timestamp} ${level}: ${message}`;
    
    if (Object.keys(meta).length > 0) {
      log += `\n${JSON.stringify(meta, null, 2)}`;
    }
    
    return log;
  })
);

// Create logger instance
export const logger = winston.createLogger({
  level: isDevelopment ? 'debug' : 'info',
  format: logFormat,
  defaultMeta: { service: 'drawsql-backend' },
  transports: [
    // Console transport for development
    new winston.transports.Console({
      format: isDevelopment ? consoleFormat : logFormat,
      level: isDevelopment ? 'debug' : 'info'
    })
  ]
});

// Utility functions for structured logging
export const loggers = {
  auth: (message: string, meta?: any) => logger.info(`[AUTH] ${message}`, meta),
  db: (message: string, meta?: any) => logger.info(`[DATABASE] ${message}`, meta),
  ws: (message: string, meta?: any) => logger.info(`[WEBSOCKET] ${message}`, meta),
  api: (message: string, meta?: any) => logger.info(`[API] ${message}`, meta),
  security: (message: string, meta?: any) => logger.warn(`[SECURITY] ${message}`, meta),
  performance: (message: string, meta?: any) => logger.info(`[PERFORMANCE] ${message}`, meta)
}; 