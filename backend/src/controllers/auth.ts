import { Request, Response } from 'express';
import { z } from 'zod';
import { supabase } from '@/services/supabase';
import { TenantService, CreateTenantSchema } from '@/services/tenant';
import { createError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';
import { ApiResponse } from '@/types';

const LoginSchema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(1, 'Password required'),
});

const SignupSchema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  tenantId: z.string().uuid('Valid tenant ID required'),
});

const ValidateSchemaNameSchema = z.object({
  schemaName: z.string()
    .min(1, 'Schema name is required')
    .max(50, 'Schema name too long')
    .regex(/^[a-z][a-z0-9_]*$/, 'Schema name must start with letter and contain only lowercase letters, numbers, and underscores'),
});

export class AuthController {
  private tenantService = new TenantService();

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = LoginSchema.parse(req.body);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data.user) {
        logger.warn('Login attempt failed:', { email, error: error?.message });
        throw createError('Invalid email or password', 401);
      }

      const response: ApiResponse<{
        user: typeof data.user;
        session: typeof data.session;
      }> = {
        success: true,
        message: 'Login successful',
        data: {
          user: data.user,
          session: data.session,
        },
      };

      logger.info('User logged in successfully:', { userId: data.user.id, email });
      res.json(response);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const response: ApiResponse = {
          success: false,
          message: 'Validation failed',
          errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`),
        };
        res.status(400).json(response);
      } else {
        throw error;
      }
    }
  };

  signup = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password, tenantId } = SignupSchema.parse(req.body);

      // Verify tenant exists and is active
      const tenant = await this.tenantService.getTenantById(tenantId);
      if (!tenant || !tenant.isActive) {
        throw createError('Invalid or inactive tenant', 400);
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            tenant_id: tenantId,
            tenant_schema: tenant.schemaName,
            tenant_name: tenant.name,
          },
        },
      });

      if (error) {
        logger.error('Signup failed:', { email, error: error.message });
        throw createError(error.message, 400);
      }

      const response: ApiResponse<{
        user: typeof data.user;
        session: typeof data.session;
      }> = {
        success: true,
        message: 'Signup successful. Please check your email for verification.',
        data: {
          user: data.user,
          session: data.session,
        },
      };

      logger.info('User signed up successfully:', { userId: data.user?.id, email, tenantId });
      res.status(201).json(response);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const response: ApiResponse = {
          success: false,
          message: 'Validation failed',
          errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`),
        };
        res.status(400).json(response);
      } else {
        throw error;
      }
    }
  };

  logout = async (req: Request, res: Response): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        logger.error('Logout failed:', error);
        throw createError('Logout failed', 500);
      }

      const response: ApiResponse = {
        success: true,
        message: 'Logout successful',
      };

      logger.info('User logged out successfully:', { userId: req.userContext?.userId });
      res.json(response);
    } catch (error) {
      throw error;
    }
  };

  createTenant = async (req: Request, res: Response): Promise<void> => {
    try {
      const tenantData = CreateTenantSchema.parse(req.body);

      const result = await this.tenantService.createTenant(tenantData);

      const response: ApiResponse<typeof result> = {
        success: true,
        message: 'Tenant created successfully',
        data: result,
      };

      logger.info('Tenant created via API:', {
        tenantId: result.tenant.id,
        adminUserId: result.adminUserId,
      });

      res.status(201).json(response);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const response: ApiResponse = {
          success: false,
          message: 'Validation failed',
          errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`),
        };
        res.status(400).json(response);
      } else {
        throw error;
      }
    }
  };

  validateSchemaName = async (req: Request, res: Response): Promise<void> => {
    try {
      const { schemaName } = ValidateSchemaNameSchema.parse(req.body);

      const isUnique = await this.tenantService.validateSchemaNameUnique(schemaName);

      const response: ApiResponse<{ isUnique: boolean }> = {
        success: true,
        message: isUnique ? 'Schema name is available' : 'Schema name is already taken',
        data: { isUnique },
      };

      res.json(response);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const response: ApiResponse = {
          success: false,
          message: 'Validation failed',
          errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`),
        };
        res.status(400).json(response);
      } else {
        throw error;
      }
    }
  };

  getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.userContext) {
        throw createError('Authentication required', 401);
      }

      const response: ApiResponse<typeof req.userContext> = {
        success: true,
        message: 'Profile retrieved successfully',
        data: req.userContext,
      };

      res.json(response);
    } catch (error) {
      throw error;
    }
  };
}