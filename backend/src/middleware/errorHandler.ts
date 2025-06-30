import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
  code?: string;
}

export class CustomError extends Error implements AppError {
  public statusCode: number;
  public isOperational: boolean;
  public code?: string;

  constructor(message: string, statusCode: number = 500, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.code = code;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Database error handler
const handleDatabaseError = (error: any): AppError => {
  switch (error.code) {
    case '23505': // Unique violation
      const field = error.detail?.match(/Key \((.+?)\)=/)?.[1] || 'field';
      return new CustomError(
        `${field} already exists`,
        409,
        'DUPLICATE_ENTRY'
      );

    case '23503': // Foreign key violation  
      return new CustomError(
        'Referenced record does not exist',
        400,
        'FOREIGN_KEY_VIOLATION'
      );

    case '23502': // Not null violation
      const column = error.column || 'field';
      return new CustomError(
        `${column} is required`,
        400,
        'MISSING_REQUIRED_FIELD'
      );

    case '22001': // String data too long
      return new CustomError(
        'Input data too long',
        400,
        'DATA_TOO_LONG'
      );

    case '08001': // Connection error
    case '08006': // Connection failure
      return new CustomError(
        'Database connection error',
        503,
        'DATABASE_CONNECTION_ERROR'
      );

    default:
      logger.error('Unhandled database error:', {
        code: error.code,
        message: error.message,
        detail: error.detail
      });
      return new CustomError(
        'Database operation failed',
        500,
        'DATABASE_ERROR'
      );
  }
};

// JWT error handler
const handleJWTError = (error: any): AppError => {
  if (error.name === 'TokenExpiredError') {
    return new CustomError('Token expired', 401, 'TOKEN_EXPIRED');
  }
  
  if (error.name === 'JsonWebTokenError') {
    return new CustomError('Invalid token', 401, 'INVALID_TOKEN');
  }

  return new CustomError('Authentication failed', 401, 'AUTH_ERROR');
};

// Validation error handler
const handleValidationError = (error: any): AppError => {
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map((err: any) => err.message);
    return new CustomError(
      `Validation failed: ${errors.join(', ')}`,
      400,
      'VALIDATION_ERROR'
    );
  }

  return new CustomError('Invalid input data', 400, 'VALIDATION_ERROR');
};

// Development error response
const sendErrorDev = (error: AppError, res: Response): void => {
  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message,
    code: error.code,
    stack: error.stack,
    details: error
  });
};

// Production error response
const sendErrorProd = (error: AppError, res: Response): void => {
  // Only send operational errors to client
  if (error.isOperational) {
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message,
      code: error.code
    });
  } else {
    // Log the error but don't expose details
    logger.error('Programming or system error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Something went wrong',
      code: 'INTERNAL_ERROR'
    });
  }
};

// Main error handling middleware
export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let err: AppError = { ...error };
  err.message = error.message;

  // Log error details
  logger.error('Error caught by error handler:', {
    url: req.url,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query,
    user: (req as any).user?.id,
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
  } else if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
    // JWT errors
    err = handleJWTError(error);
  } else if (error.name === 'ValidationError') {
    // Validation errors
    err = handleValidationError(error);
  } else if (error.type === 'entity.parse.failed') {
    // JSON parsing errors
    err = new CustomError('Invalid JSON format', 400, 'INVALID_JSON');
  } else if (error.code === 'LIMIT_FILE_SIZE') {
    // File upload size errors
    err = new CustomError('File too large', 413, 'FILE_TOO_LARGE');
  } else if (error.code === 'ECONNREFUSED') {
    // Connection refused errors
    err = new CustomError('Service unavailable', 503, 'SERVICE_UNAVAILABLE');
  } else if (!error.statusCode) {
    // Unknown errors
    err = new CustomError('Internal server error', 500, 'INTERNAL_ERROR');
    err.isOperational = false;
  }

  // Send error response
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    sendErrorProd(err, res);
  }
};

// Async error handler wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 404 handler
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error = new CustomError(
    `Route ${req.originalUrl} not found`,
    404,
    'ROUTE_NOT_FOUND'
  );
  next(error);
};

// Rate limit error handler
export const handleRateLimitError = (req: Request, res: Response): void => {
  logger.warn('Rate limit exceeded:', {
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