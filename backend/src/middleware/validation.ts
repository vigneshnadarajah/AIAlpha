import { Request, Response, NextFunction } from 'express';
import { z, ZodType, ZodError } from 'zod';
import { ApiResponse } from '../types';
import { formatValidationErrors } from '../utils/validation';

interface RequestSchemas {
  body?: z.ZodType<any>;
  query?: z.ZodType<any>;
  params?: z.ZodType<any>;
}

export const validateRequest = (schemas: RequestSchemas) => {
  return (req: Request, res: Response, next: NextFunction) => {
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

interface ValidationMiddlewareOptions {
  schema: RequestSchemas;
  onError?: (errors: string[]) => ApiResponse<any>;
}

export const createValidationMiddleware = (options: ValidationMiddlewareOptions) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const middleware = validateRequest(options.schema);
    middleware(req, res, (err: any) => {
      if (err) {
        let errors: string[];
        if (err instanceof z.ZodError) {
          errors = formatValidationErrors(err);
        } else {
          errors = [err.message];
        }
        const response = options.onError ? options.onError(errors) : {
          success: false,
          message: 'Validation failed',
          statusCode: 400,
          errors: errors
        };
        return res.status(response.statusCode || 400).json(response);
      }
      return next();
    });
  };
};
          return res.status(400).json(response);
        } else {
          req.body = result.data;
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
          req.query = result.data;
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
          req.params = result.data;
        }
      }

      next();
    } catch (error:any) {
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

interface ValidationMiddlewareOptions {
  schema: RequestSchemas;
  onError?: (errors: string[]) => ApiResponse<any>;
}

export const createValidationMiddleware = (options: ValidationMiddlewareOptions) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const middleware = validateRequest(options.schema);
    middleware(req, res, (err:any) => {
      if (err) {
        let errors: string[];
        if (err instanceof z.ZodError) {
          errors = formatValidationErrors(err);
        } else {
          errors = [err.message];
        }
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
    } catch (error:any) {
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

interface ValidationMiddlewareOptions {
  schema: RequestSchemas;
  onError?: (errors: string[]) => ApiResponse<any>;
}

export const createValidationMiddleware = (options: ValidationMiddlewareOptions) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const middleware = validateRequest(options.schema);
    middleware(req, res, (err?: any) => {
      if (err) {
        let errors: string[];
        if (err instanceof z.ZodError) {
          errors = formatValidationErrors(err);
        } else {
          errors = [err.message];
        }
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

      next();
    } catch (error:any) {
      console.error('Validation middleware error:', error);
      const response: ApiResponse<any> = {
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
  onError?: (errors: string[]) => ApiResponse<any>;
}

export const createValidationMiddleware = (options: ValidationMiddlewareOptions) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const middleware = validateRequest(options.schema);
    middleware(req, res, (err:any) => {
      if (err) {
        let errors: string[];
        if (err instanceof z.ZodError) {
          errors = formatValidationErrors(err);
        } else {
          errors = [err.message];
        }
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

      next();
    } catch (error:any) {
      console.error('Validation middleware error:', error);
      const response: ApiResponse<any> = {
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
  onError?: (errors: string[]) => ApiResponse<any>;
}

export const createValidationMiddleware = (options: ValidationMiddlewareOptions) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const middleware = validateRequest(options.schema);
    middleware(req, res, (err:any) => {
      if (err) {
        let errors: string[];
        if (err instanceof z.ZodError) {
          errors = formatValidationErrors(err);
        } else {
          errors = [err.message];
        }
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
          return res.status(400).json(response);
        }
        req.body = result.data;
      }

      if (schemas.query) {
        const result = schemas.query.safeParse(req.query);
        if (!result.success) {
          const errors = formatValidationErrors(result.error);
          const response: ApiResponse<any> = {
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
          const response: ApiResponse<any> = {
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
    } catch (error:any) {
      console.error('Validation middleware error:', error);
      const response: ApiResponse<any> = {
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
  onError?: (errors: string[]) => ApiResponse<any>;
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