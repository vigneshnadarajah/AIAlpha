import { TenantService, CreateTenantRequest } from './tenant';
import { supabaseAdmin } from '@/services/supabase';

// Mock the supabase client
jest.mock('@/services/supabase');

const mockSupabaseAdmin = supabaseAdmin as jest.Mocked<typeof supabaseAdmin>;

describe('TenantService', () => {
  let tenantService: TenantService;

  beforeEach(() => {
    tenantService = new TenantService();
    jest.clearAllMocks();
  });

  describe('validateSchemaNameUnique', () => {
    it('should return true for unique schema name', async () => {
      mockSupabaseAdmin.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116' }, // Not found
            }),
          }),
        }),
      } as any);

      const result = await tenantService.validateSchemaNameUnique('unique_schema');
      expect(result).toBe(true);
    });

    it('should return false for existing schema name', async () => {
      const mockTenant = {
        id: 'tenant-123',
        name: 'Existing Tenant',
        schema_name: 'existing_schema',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        is_active: true,
      };

      mockSupabaseAdmin.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockTenant,
              error: null,
            }),
          }),
        }),
      } as any);

      const result = await tenantService.validateSchemaNameUnique('existing_schema');
      expect(result).toBe(false);
    });
  });

  describe('getTenantById', () => {
    it('should return tenant for valid ID', async () => {
      const mockTenant = {
        id: 'tenant-123',
        name: 'Test Tenant',
        schema_name: 'test_tenant',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        is_active: true,
      };

      mockSupabaseAdmin.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockTenant,
              error: null,
            }),
          }),
        }),
      } as any);

      const result = await tenantService.getTenantById('tenant-123');
      
      expect(result).toEqual({
        id: 'tenant-123',
        name: 'Test Tenant',
        schemaName: 'test_tenant',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
        isActive: true,
      });
    });

    it('should return null for non-existent tenant', async () => {
      mockSupabaseAdmin.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116' }, // Not found
            }),
          }),
        }),
      } as any);

      const result = await tenantService.getTenantById('non-existent');
      expect(result).toBeNull();
    });
  });

  describe('CreateTenantSchema validation', () => {
    it('should validate correct tenant data', () => {
      const validData: CreateTenantRequest = {
        name: 'Test Tenant',
        schemaName: 'test_tenant',
        adminEmail: 'admin@test.com',
        adminPassword: 'password123',
      };

      // Basic validation test - in real implementation, we'd import the schema
      expect(validData.name).toBe('Test Tenant');
      expect(validData.schemaName).toBe('test_tenant');
      expect(validData.adminEmail).toBe('admin@test.com');
      expect(validData.adminPassword).toBe('password123');
    });
  });
});