export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UserContext {
  userId: string;
  tenantId: string;
  tenantSchema: string;
  email: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      userContext?: UserContext;
    }
  }
}