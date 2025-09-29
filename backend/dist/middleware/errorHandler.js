"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleRateLimitError = exports.notFoundHandler = exports.asyncHandler = exports.errorHandler = exports.CustomError = void 0;
const logger_1 = require("@/utils/logger");
class CustomError extends Error {
    statusCode;
    isOperational;
    code;
    constructor(message, statusCode = 500, code) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        this.code = code || 'UNKNOWN_ERROR';
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.CustomError = CustomError;
// Database error handler
const handleDatabaseError = (error) => {
    switch (error.code) {
        case '23505': // Unique violation
            const field = error.detail?.match(/Key \((.+?)\)=/)?.[1] || 'field';
            return new CustomError(`${field} already exists`, 409, 'DUPLICATE_ENTRY');
        case '23503': // Foreign key violation  
            return new CustomError('Referenced record does not exist', 400, 'FOREIGN_KEY_VIOLATION');
        case '23502': // Not null violation
            const column = error.column || 'field';
            return new CustomError(`${column} is required`, 400, 'MISSING_REQUIRED_FIELD');
        case '22001': // String data too long
            return new CustomError('Input data too long', 400, 'DATA_TOO_LONG');
        case '08001': // Connection error
        case '08006': // Connection failure
            return new CustomError('Database connection error', 503, 'DATABASE_CONNECTION_ERROR');
        default:
            logger_1.logger.error('Unhandled database error:', {
                code: error.code,
                message: error.message,
                detail: error.detail
            });
            return new CustomError('Database operation failed', 500, 'DATABASE_ERROR');
    }
};
// JWT error handler
const handleJWTError = (error) => {
    if (error.name === 'TokenExpiredError') {
        return new CustomError('Token expired', 401, 'TOKEN_EXPIRED');
    }
    if (error.name === 'JsonWebTokenError') {
        return new CustomError('Invalid token', 401, 'INVALID_TOKEN');
    }
    return new CustomError('Authentication failed', 401, 'AUTH_ERROR');
};
// Validation error handler
const handleValidationError = (error) => {
    if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map((err) => err.message);
        return new CustomError(`Validation failed: ${errors.join(', ')}`, 400, 'VALIDATION_ERROR');
    }
    return new CustomError('Invalid input data', 400, 'VALIDATION_ERROR');
};
// Development error response
const sendErrorDev = (error, res) => {
    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message,
        code: error.code,
        stack: error.stack,
        details: error
    });
};
// Production error response
const sendErrorProd = (error, res) => {
    // Only send operational errors to client
    if (error.isOperational) {
        res.status(error.statusCode || 500).json({
            success: false,
            error: error.message,
            code: error.code
        });
    }
    else {
        // Log the error but don't expose details
        logger_1.logger.error('Programming or system error:', error);
        res.status(500).json({
            success: false,
            error: 'Something went wrong',
            code: 'INTERNAL_ERROR'
        });
    }
};
// Main error handling middleware
const errorHandler = (error, req, res, next) => {
    let err = { ...error };
    err.message = error.message;
    // Log error details
    logger_1.logger.error('Error caught by error handler:', {
        url: req.url,
        method: req.method,
        body: req.body,
        params: req.params,
        query: req.query,
        user: req.user?.id,
        error: {
            name: error.name,
            message: error.message,
            code: error.code,
            stack: error.stack
        }
    });
    // Handle specific error types
    if (error.code && error.code.startsWith('23')) {
        // PostgreSQL constraint errors
        err = handleDatabaseError(error);
    }
    else if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
        // JWT errors
        err = handleJWTError(error);
    }
    else if (error.name === 'ValidationError') {
        // Validation errors
        err = handleValidationError(error);
    }
    else if (error.type === 'entity.parse.failed') {
        // JSON parsing errors
        err = new CustomError('Invalid JSON format', 400, 'INVALID_JSON');
    }
    else if (error.code === 'LIMIT_FILE_SIZE') {
        // File upload size errors
        err = new CustomError('File too large', 413, 'FILE_TOO_LARGE');
    }
    else if (error.code === 'ECONNREFUSED') {
        // Connection refused errors
        err = new CustomError('Service unavailable', 503, 'SERVICE_UNAVAILABLE');
    }
    else if (!error.statusCode) {
        // Unknown errors
        err = new CustomError('Internal server error', 500, 'INTERNAL_ERROR');
        err.isOperational = false;
    }
    // Send error response
    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    }
    else {
        sendErrorProd(err, res);
    }
};
exports.errorHandler = errorHandler;
// Async error handler wrapper
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
// 404 handler
const notFoundHandler = (req, res, next) => {
    const error = new CustomError(`Route ${req.originalUrl} not found`, 404, 'ROUTE_NOT_FOUND');
    next(error);
};
exports.notFoundHandler = notFoundHandler;
// Rate limit error handler
const handleRateLimitError = (req, res) => {
    logger_1.logger.warn('Rate limit exceeded:', {
        ip: req.ip,
        url: req.url,
        method: req.method,
        userAgent: req.get('User-Agent')
    });
    res.status(429).json({
        success: false,
        error: 'Too many requests, please try again later',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: '15 minutes'
    });
};
exports.handleRateLimitError = handleRateLimitError;
//# sourceMappingURL=errorHandler.js.map