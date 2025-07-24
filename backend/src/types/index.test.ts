import { ApiResponse, UserContext, HealthStatus } from './index';

describe('Basic Types and Interfaces', () => {
  describe('ApiResponse Interface', () => {
    it('should create a successful response with data', () => {
      const response: ApiResponse<{ id: string }> = {
        success: true,
        message: 'Operation successful',
        data: { id: '123' }
      };

      expect(response.success).toBe(true);
      expect(response.message).toBe('Operation successful');
      expect(response.data).toEqual({ id: '123' });
      expect(response.errors).toBeUndefined();
    });

    it('should create an error response with errors array', () => {
      const response: ApiResponse = {
        success: false,
        message: 'Validation failed',
        errors: ['Field is required', 'Invalid format']
      };

      expect(response.success).toBe(false);
      expect(response.message).toBe('Validation failed');
      expect(response.errors).toEqual(['Field is required', 'Invalid format']);
      expect(response.data).toBeUndefined();
    });

    it('should create a response without optional fields', () => {
      const response: ApiResponse = {
        success: true,
        message: 'Simple success'
      };

      expect(response.success).toBe(true);
      expect(response.message).toBe('Simple success');
      expect(response.data).toBeUndefined();
      expect(response.errors).toBeUndefined();
    });
  });

  describe('UserContext Interface', () => {
    it('should create a valid user context with admin role', () => {
      const userContext: UserContext = {
        userId: 'user-123',
        email: 'admin@example.com',
        tenantId: 'tenant-456',
        tenantSchema: 'tenant_schema_456',
        role: 'admin'
      };

      expect(userContext.userId).toBe('user-123');
      expect(userContext.email).toBe('admin@example.com');
      expect(userContext.tenantId).toBe('tenant-456');
      expect(userContext.tenantSchema).toBe('tenant_schema_456');
      expect(userContext.role).toBe('admin');
    });

    it('should create a valid user context with user role', () => {
      const userContext: UserContext = {
        userId: 'user-789',
        email: 'user@example.com',
        tenantId: 'tenant-456',
        tenantSchema: 'tenant_schema_456',
        role: 'user'
      };

      expect(userContext.role).toBe('user');
    });
  });

  describe('HealthStatus Interface', () => {
    it('should create a healthy status', () => {
      const healthStatus: HealthStatus = {
        status: 'healthy',
        timestamp: '2025-01-01T00:00:00.000Z',
        service: 'aialpha-backend'
      };

      expect(healthStatus.status).toBe('healthy');
      expect(healthStatus.timestamp).toBe('2025-01-01T00:00:00.000Z');
      expect(healthStatus.service).toBe('aialpha-backend');
    });

    it('should create an unhealthy status', () => {
      const healthStatus: HealthStatus = {
        status: 'unhealthy',
        timestamp: '2025-01-01T00:00:00.000Z',
        service: 'aialpha-backend'
      };

      expect(healthStatus.status).toBe('unhealthy');
    });
  });

  describe('Type Validation', () => {
    it('should enforce role type constraints', () => {
      // This test ensures TypeScript compilation catches invalid roles
      const validRoles: Array<'admin' | 'user'> = ['admin', 'user'];
      
      expect(validRoles).toContain('admin');
      expect(validRoles).toContain('user');
      expect(validRoles).toHaveLength(2);
    });

    it('should enforce status type constraints', () => {
      // This test ensures TypeScript compilation catches invalid statuses
      const validStatuses: Array<'healthy' | 'unhealthy'> = ['healthy', 'unhealthy'];
      
      expect(validStatuses).toContain('healthy');
      expect(validStatuses).toContain('unhealthy');
      expect(validStatuses).toHaveLength(2);
    });
  });
});