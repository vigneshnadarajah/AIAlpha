import { Request, Response, NextFunction } from 'express';
import { z, ZodType } from 'zod';
import { ApiResponse } from '../types';
import { formatValidationErrors } from '../validation/schemas';

interface RequestSchemas {
  body?: z.ZodType<any>;
  query?: z.ZodType<any>;
  params?: z.ZodType<any>;
}

export const validateRequest = (schemas: RequestSchemas) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schemas.body) {
        const result = schemas.body.safeParse(req.body);
        if (!result.success) {
          const errors = formatValidationErrors(result.error);
          const response: ApiResponse = {
            success: false,
            message: 'Validation failed',
            statusCode: 400,
            errors: errors
          };
          return res.status(400).json(response);
        }
        req.body = result.data;
      }

      if (schemas.query) {
        const result = schemas.query.safeParse(req.query);
        if (!result.success) {
          const errors = formatValidationErrors(result.error);
          const response: ApiResponse = {
            success: false,
            message: 'Validation failed',
            statusCode: 400,
            errors: errors
          };
          return res.status(400).json(response);
        }
        req.query = result.data;
      }

      if (schemas.params) {
        const result = schemas.params.safeParse(req.params);
        if (!result.success) {
          const errors = formatValidationErrors(result.error);
          const response: ApiResponse = {
            success: false,
            message: 'Validation failed',
            statusCode: 400,
            errors: errors
          };
          return res.status(400).json(response);
        }
        req.params = result.data;
      }

      next();
    } catch (error) {
      console.error('Validation middleware error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Internal server error',
        statusCode: 500
      };
      res.status(500).json(response);
    }
  };
};

interface ValidationMiddlewareOptions {
  schema: RequestSchemas;
  onError?: (errors: string[]) => ApiResponse;
}

export const createValidationMiddleware = (options: ValidationMiddlewareOptions) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const middleware = validateRequest(options.schema);
    middleware(req, res, (err?: any) => {
      if (err) {
        const errors = formatValidationErrors(err);
        const response = options.onError ? options.onError(errors) : {
          success: false,
          message: 'Validation failed',
          statusCode: 400,
          errors: errors
        };
        return res.status(response.statusCode || 400).json(response);
      }
      next();
    });
  };
};