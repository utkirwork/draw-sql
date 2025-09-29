"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loggers = exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const isDevelopment = process.env.NODE_ENV === 'development';
// Custom log format
const logFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
}), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json(), winston_1.default.format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    if (Object.keys(meta).length > 0) {
        log += `\n${JSON.stringify(meta, null, 2)}`;
    }
    return log;
}));
// Console format for development
const consoleFormat = winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.timestamp({
    format: 'HH:mm:ss'
}), winston_1.default.format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `${timestamp} ${level}: ${message}`;
    if (Object.keys(meta).length > 0) {
        log += `\n${JSON.stringify(meta, null, 2)}`;
    }
    return log;
}));
// Create logger instance
exports.logger = winston_1.default.createLogger({
    level: isDevelopment ? 'debug' : 'info',
    format: logFormat,
    defaultMeta: { service: 'drawsql-backend' },
    transports: [
        // Console transport for development
        new winston_1.default.transports.Console({
            format: isDevelopment ? consoleFormat : logFormat,
            level: isDevelopment ? 'debug' : 'info'
        })
    ]
});
// Utility functions for structured logging
exports.loggers = {
    auth: (message, meta) => exports.logger.info(`[AUTH] ${message}`, meta),
    db: (message, meta) => exports.logger.info(`[DATABASE] ${message}`, meta),
    ws: (message, meta) => exports.logger.info(`[WEBSOCKET] ${message}`, meta),
    api: (message, meta) => exports.logger.info(`[API] ${message}`, meta),
    security: (message, meta) => exports.logger.warn(`[SECURITY] ${message}`, meta),
    performance: (message, meta) => exports.logger.info(`[PERFORMANCE] ${message}`, meta)
};
//# sourceMappingURL=logger.js.map