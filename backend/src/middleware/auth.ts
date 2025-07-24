import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { supabase } from '@/services/supabase';
import { config } from '@/config/environment';
import { createError } from '@/middleware/errorHandler';
import { UserContext } from '@/types';
import { logger } from '@/utils/logger';

interface SupabaseJWTPayload {
  sub: string;
  email: string;
  role: string;
  app_metadata: {
    tenant_id?: string;
    tenant_schema?: string;
  };
  user_metadata: Record<string, unknown>;
  aud: string;
  exp: number;
  iat: number;
}

export const authenticateToken = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      throw createError('Access token required', 401);
    }

    // Verify the JWT token
    let decoded: SupabaseJWTPayload;
    try {
      decoded = jwt.verify(token, config.JWT_SECRET) as SupabaseJWTPayload;
    } catch (error) {
      logger.error('JWT verification failed:', error);
      throw createError('Invalid or expired token', 401);
    }

    // Verify user exists in Supabase
    const { data: user, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user.user) {
      logger.error('Supabase user verification failed:', userError);
      throw createError('Invalid user session', 401);
    }

    // Extract tenant information
    const tenantId = decoded.app_metadata.tenant_id;
    const tenantSchema = decoded.app_metadata.tenant_schema;

    if (!tenantId || !tenantSchema) {
      logger.error('Missing tenant information in JWT:', { userId: decoded.sub });
      throw createError('User not associated with a tenant', 403);
    }

    // Create user context
    const userContext: UserContext = {
      userId: decoded.sub,
      tenantId,
      tenantSchema,
      email: decoded.email,
      role: decoded.role || 'user',
    };

    req.userContext = userContext;
    
    logger.debug('User authenticated successfully:', {
      userId: userContext.userId,
      tenantId: userContext.tenantId,
      email: userContext.email,
    });

    next();
  } catch (error) {
    next(error);
  }
};

export const requireRole = (requiredRole: string) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (!req.userContext) {
        throw createError('Authentication required', 401);
      }

      if (req.userContext.role !== requiredRole && req.userContext.role !== 'admin') {
        throw createError(`Access denied. Required role: ${requiredRole}`, 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const requireTenantAccess = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    if (!req.userContext) {
      throw createError('Authentication required', 401);
    }

    const requestedTenantId = req.params['tenantId'] || req.body?.tenantId;
    
    if (requestedTenantId && requestedTenantId !== req.userContext.tenantId) {
      logger.warn('Tenant access violation attempt:', {
        userId: req.userContext.userId,
        userTenantId: req.userContext.tenantId,
        requestedTenantId,
      });
      throw createError('Access denied to requested tenant', 403);
    }

    next();
  } catch (error) {
    next(error);
  }
};