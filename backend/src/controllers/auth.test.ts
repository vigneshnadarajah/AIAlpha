import request from 'supertest';
import { app } from '../index';
import { TenantService } from '@/services/tenant';

// Mock the services
jest.mock('@/services/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
    },
  },
  supabaseAdmin: {
    from: jest.fn(),
    auth: {
      admin: {
        createUser: jest.fn(),
      },
    },
    rpc: jest.fn(),
  },
}));

jest.mock('@/services/tenant');

const mockTenantService = TenantService as jest.MockedClass<typeof TenantService>;

describe('Auth Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/validate-schema-name', () => {
    it('should return true for available schema name', async () => {
      const mockTenantServiceInstance = {
        validateSchemaNameUnique: jest.fn().mockResolvedValue(true),
      };
      mockTenantService.mockImplementation(() => mockTenantServiceInstance as any);

      const response = await request(app)
        .post('/api/auth/validate-schema-name')
        .send({
          schemaName: 'available_schema',
        })
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Schema name is available',
        data: { isUnique: true },
      });
    });

    it('should return false for taken schema name', async () => {
      const mockTenantServiceInstance = {
        validateSchemaNameUnique: jest.fn().mockResolvedValue(false),
      };
      mockTenantService.mockImplementation(() => mockTenantServiceInstance as any);

      const response = await request(app)
        .post('/api/auth/validate-schema-name')
        .send({
          schemaName: 'taken_schema',
        })
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Schema name is already taken',
        data: { isUnique: false },
      });
    });

    it('should return 400 for invalid schema name format', async () => {
      const response = await request(app)
        .post('/api/auth/validate-schema-name')
        .send({
          schemaName: '123invalid',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });
  });

  describe('POST /api/auth/tenant', () => {
    it('should create tenant successfully', async () => {
      const mockTenant = {
        id: 'tenant-123',
        name: 'Test Tenant',
        schemaName: 'test_tenant',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
        isActive: true,
      };

      const mockTenantServiceInstance = {
        createTenant: jest.fn().mockResolvedValue({
          tenant: mockTenant,
          adminUserId: 'admin-123',
        }),
      };
      mockTenantService.mockImplementation(() => mockTenantServiceInstance as any);

      const response = await request(app)
        .post('/api/auth/tenant')
        .send({
          name: 'Test Tenant',
          schemaName: 'test_tenant',
          adminEmail: 'admin@test.com',
          adminPassword: 'password123',
        })
        .expect(201);

      expect(response.body).toEqual({
        success: true,
        message: 'Tenant created successfully',
        data: {
          tenant: mockTenant,
          adminUserId: 'admin-123',
        },
      });
    });

    it('should return 400 for invalid tenant data', async () => {
      const response = await request(app)
        .post('/api/auth/tenant')
        .send({
          name: '',
          schemaName: '123invalid',
          adminEmail: 'invalid-email',
          adminPassword: '123',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toHaveLength(4);
    });
  });
});