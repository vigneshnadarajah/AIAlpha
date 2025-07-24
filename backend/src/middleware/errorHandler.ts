import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '@/utils/logger';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const createError = (message: string, statusCode: number): AppError => {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
};

export const errorHandler = (
  error: Error | AppError | ZodError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let details: unknown;

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    statusCode = 400;
    message = 'Validation Error';
    details = error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
    }));
  }
  // Handle custom app errors
  else if ('statusCode' in error && error.statusCode) {
    statusCode = error.statusCode;
    message = error.message;
  }
  // Handle known errors
  else if (error.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Unauthorized';
  }
  else if (error.name === 'ValidationError') {
    statusCode = 400;
    message = error.message;
  }

  // Log error
  logger.error('Error occurred:', {
    message: error.message,
    stack: error.stack,
    statusCode,
    url: req.url,
    method: req.method,
    ip: req.ip,
  });

  // Send error response
  const response: Record<string, unknown> = {
    success: false,
    message,
  };

  if (details) {
    response['details'] = details;
  }

  if (process.env['NODE_ENV'] === 'development') {
    response['stack'] = error.stack;
  }

  res.status(statusCode).json(response);
};