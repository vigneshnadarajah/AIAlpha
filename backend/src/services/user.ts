import { supabaseAdmin } from '@/services/supabase';
import { createError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';

export interface UpdateUserProfileData {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  updatedAt: string;
}

export class UserService {
  async updateUserProfile(
    userId: string,
    tenantSchema: string,
    updateData: UpdateUserProfileData
  ): Promise<UserProfile> {
    // Validate input parameters
    this.validateUpdateData(updateData);
    this.validateUserIdAndSchema(userId, tenantSchema);

    try {
      // Call the database function with proper parameter mapping
      const { data, error } = await supabaseAdmin.rpc('update_user_profile', {
        user_id: userId,
        schema_name: tenantSchema,
        first_name: updateData.firstName,
        last_name: updateData.lastName,
        phone_number: updateData.phoneNumber,
      });

      if (error) {
        return this.handleDatabaseError(error, userId);
      }

      logger.info('User profile updated successfully', {
        userId,
        tenantSchema,
        updatedFields: Object.keys(updateData),
      });

      return data;
    } catch (error) {
      logger.error('Failed to update user profile', {
        userId,
        tenantSchema,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  private validateUpdateData(updateData: UpdateUserProfileData): void {
    const hasValidField = Object.values(updateData).some(value => 
      value !== undefined && value !== null && value.trim() !== ''
    );
    
    if (!hasValidField) {
      throw createError('At least one field must be provided for update', 400);
    }
  }

  private validateUserIdAndSchema(userId: string, tenantSchema: string): void {
    if (!userId || !tenantSchema) {
      throw createError('User ID and tenant schema are required', 400);
    }
  }

  private handleDatabaseError(error: any, userId: string): never {
    if (error.code === 'PGRST116') {
      logger.warn('User not found for profile update', { userId });
      throw createError('User not found', 404);
    }
    
    logger.error('Database error during profile update', {
      userId,
      error: error.message,
      code: error.code,
    });
    
    throw createError(error.message, 500);
  }
}