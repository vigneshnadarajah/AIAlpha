import { UserService } from './user';
import { supabaseAdmin } from '@/services/supabase';

// Mock the supabase client
jest.mock('@/services/supabase');

const mockSupabaseAdmin = supabaseAdmin as jest.Mocked<typeof supabaseAdmin>;

describe('UserService - TDD Implementation', () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
    jest.clearAllMocks();
  });

  describe('updateUserProfile', () => {
    it('should update user profile successfully', async () => {
      // Arrange - Set up test data
      const userId = 'user-123';
      const tenantSchema = 'test_tenant';
      const updateData = {
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '+1234567890',
      };

      const expectedUpdatedUser = {
        id: userId,
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '+1234567890',
        updatedAt: '2023-01-01T00:00:00Z',
      };

      // Mock the database response
      (mockSupabaseAdmin.rpc as jest.Mock).mockResolvedValue({
        data: expectedUpdatedUser,
        error: null,
      });

      // Act - Call the method that doesn't exist yet
      const result = await userService.updateUserProfile(userId, tenantSchema, updateData);

      // Assert - Verify the expected behavior
      expect(result).toEqual(expectedUpdatedUser);
      expect(mockSupabaseAdmin.rpc).toHaveBeenCalledWith('update_user_profile', {
        user_id: userId,
        schema_name: tenantSchema,
        first_name: updateData.firstName,
        last_name: updateData.lastName,
        phone_number: updateData.phoneNumber,
      });
    });

    it('should throw error when user not found', async () => {
      // Arrange
      const userId = 'non-existent-user';
      const tenantSchema = 'test_tenant';
      const updateData = { firstName: 'John' };

      (mockSupabaseAdmin.rpc as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'User not found', code: 'PGRST116' },
      });

      // Act & Assert - Expect the method to throw an error
      await expect(
        userService.updateUserProfile(userId, tenantSchema, updateData)
      ).rejects.toThrow('User not found');
    });

    it('should validate required fields', async () => {
      // Arrange
      const userId = 'user-123';
      const tenantSchema = 'test_tenant';
      const invalidUpdateData = {}; // Empty data should fail validation

      // Act & Assert - Expect validation error
      await expect(
        userService.updateUserProfile(userId, tenantSchema, invalidUpdateData)
      ).rejects.toThrow('At least one field must be provided for update');
    });

    // RED: Add new failing test for empty string validation
    it('should reject empty string values', async () => {
      // Arrange
      const userId = 'user-123';
      const tenantSchema = 'test_tenant';
      const invalidUpdateData = {
        firstName: '',
        lastName: '   ', // whitespace only
        phoneNumber: '',
      };

      // Act & Assert - Expect validation error
      await expect(
        userService.updateUserProfile(userId, tenantSchema, invalidUpdateData)
      ).rejects.toThrow('At least one field must be provided for update');
    });

    // RED: Add new failing test for missing userId
    it('should validate userId is provided', async () => {
      // Arrange
      const userId = '';
      const tenantSchema = 'test_tenant';
      const updateData = { firstName: 'John' };

      // Act & Assert - Expect validation error
      await expect(
        userService.updateUserProfile(userId, tenantSchema, updateData)
      ).rejects.toThrow('User ID and tenant schema are required');
    });

    // RED: Add new failing test for missing tenantSchema
    it('should validate tenantSchema is provided', async () => {
      // Arrange
      const userId = 'user-123';
      const tenantSchema = '';
      const updateData = { firstName: 'John' };

      // Act & Assert - Expect validation error
      await expect(
        userService.updateUserProfile(userId, tenantSchema, updateData)
      ).rejects.toThrow('User ID and tenant schema are required');
    });
  });
});