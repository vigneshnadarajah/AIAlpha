import { Request, Response, NextFunction } from 'express';
import { CustomError, isCustomError } from '../utils/errors';
import { ApiResponse } from '../types';

interface ZodError extends Error {
  name: 'ZodError';
  errors: Array<{
    path: (string | number)[];
    message: string;
  }>;
}

const isZodError = (error: any): error is ZodError => {
  return error.name === 'ZodError' && Array.isArray(error.errors);
};

export const errorHandler = (
  error: Error | CustomError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Handle Zod validation errors
  if (isZodError(error)) {
    const response: ApiResponse = {
      success: false,
      message: 'Validation failed',
      statusCode: 400,
      errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
    };
    
    res.status(400).json(response);
    return;
  }

  // Handle custom errors
  if (isCustomError(error)) {
    const response: ApiResponse = {
      success: false,
      message: error.message,
      statusCode: error.statusCode
    };
    
    res.status(error.statusCode).json(response);
    return;
  }

  // Handle generic errors
  const response: ApiResponse = {
    success: false,
    message: 'Internal server error',
    statusCode: 500
  };
  
  res.status(500).json(response);
};