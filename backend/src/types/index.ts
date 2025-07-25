export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
  statusCode?: number;
  validationErrors?: Record<string, string>;
}

export interface UserContext {
  userId: string;
  email: string;
  tenantId: string;
  tenantSchema: string;
  role: 'admin' | 'user';
}

export interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  service: string;
}

// Extend Express Request interface to include userContext
declare global {
  namespace Express {
    interface Request {
      userContext?: UserContext;
    }
  }
}