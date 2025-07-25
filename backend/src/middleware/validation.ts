import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import { ApiResponse } from '../types';
import { formatValidationErrors } from '../utils/validation';

interface RequestSchemas {
  body?: z.ZodType<any>;
  query?: z.ZodType<any>;
  params?: z.ZodType<any>;
}

export const validateRequest = (schemas: RequestSchemas) => {
  return (req: Request, res: Response, next: NextFunction): void | Response<any> => {
    try {
      const validationResults: any = {};

      if (schemas.body) {
        const result = schemas.body.safeParse(req.body);
        if (!result.success) {
          const errors = formatValidationErrors(result.error as ZodError);
          const response: ApiResponse<any> = {
            success: false,
            message: 'Validation failed',
            statusCode: 400,
            errors: errors
          };
          return res.status(400).json(response);
        } else {
          validationResults.body = result.data;
        }
      }

      if (schemas.query) {
        const result = schemas.query.safeParse(req.query);
        if (!result.success) {
          const errors = formatValidationErrors(result.error as ZodError);
          const response: ApiResponse<any> = {
            success: false,
            message: 'Validation failed',
            statusCode: 400,
            errors: errors
          };
          return res.status(400).json(response);
        } else {
          validationResults.query = result.data;
        }
      }

      if (schemas.params) {
        const result = schemas.params.safeParse(req.params);
        if (!result.success) {
          const errors = formatValidationErrors(result.error as ZodError);
          const response: ApiResponse<any> = {
            success: false,
            message: 'Validation failed',
            statusCode: 400,
            errors: errors
          };
          return res.status(400).json(response);
        } else {
          validationResults.params = result.data;
        }
      }

      req.body = validationResults.body !== undefined ? validationResults.body : req.body;
      req.query = validationResults.query !== undefined ? validationResults.query : req.query;
      req.params = validationResults.params !== undefined ? validationResults.params : req.params;

      return next();
    } catch (error: any) {
      console.error('Validation middleware error:', error);
      const response: ApiResponse<any> = {
        success: false,
        message: 'Internal server error',
        statusCode: 500
      };
      return res.status(500).json(response);
    }
  };
};

export const validateSchema = <T>(schema: z.ZodType<T>, data: any): { success: boolean; data?: T; error?: ZodError } => {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return { success: false, error: result.error };
  }
};

interface ValidationMiddlewareOptions {
  schema: RequestSchemas;
  onError?: (errors: string[]) => ApiResponse<any>;
}

export const createValidationMiddleware = (options: ValidationMiddlewareOptions) => {
  return (req: Request, res: Response, next: NextFunction): void | Response<any> => {
    const middleware = validateRequest(options.schema);
    return middleware(req, res, next);
  };
};