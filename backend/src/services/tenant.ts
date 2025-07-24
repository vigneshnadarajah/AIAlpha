import { supabaseAdmin } from '@/services/supabase';
import { logger } from '@/utils/logger';
import { createError } from '@/middleware/errorHandler';
import { z } from 'zod';

export const CreateTenantSchema = z.object({
  name: z.string().min(1, 'Tenant name is required').max(100, 'Tenant name too long'),
  schemaName: z.string()
    .min(1, 'Schema name is required')
    .max(50, 'Schema name too long')
    .regex(/^[a-z][a-z0-9_]*$/, 'Schema name must start with letter and contain only lowercase letters, numbers, and underscores'),
  adminEmail: z.string().email('Valid email required'),
  adminPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

export type CreateTenantRequest = z.infer<typeof CreateTenantSchema>;

export interface Tenant {
  id: string;
  name: string;
  schemaName: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export class TenantService {
  async createTenant(data: CreateTenantRequest): Promise<{ tenant: Tenant; adminUserId: string }> {
    const { name, schemaName, adminEmail, adminPassword } = data;

    try {
      // Check if schema name is unique
      const existingTenant = await this.getTenantBySchemaName(schemaName);
      if (existingTenant) {
        throw createError('Schema name already exists', 400);
      }

      // Create tenant record in public schema
      const { data: tenant, error: tenantError } = await supabaseAdmin
        .from('tenants')
        .insert({
          name,
          schema_name: schemaName,
          is_active: true,
        })
        .select()
        .single();

      if (tenantError) {
        logger.error('Failed to create tenant:', tenantError);
        throw createError('Failed to create tenant', 500);
      }

      // Create tenant schema
      await this.createTenantSchema(schemaName);

      // Create admin user
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
        app_metadata: {
          tenant_id: tenant.id,
          tenant_schema: schemaName,
          role: 'admin',
        },
        user_metadata: {
          tenant_name: name,
        },
      });

      if (authError || !authUser.user) {
        logger.error('Failed to create admin user:', authError);
        // Cleanup: delete tenant and schema
        await this.deleteTenant(tenant.id);
        throw createError('Failed to create admin user', 500);
      }

      // Create user record in tenant schema
      await this.createUserInTenantSchema(schemaName, {
        id: authUser.user.id,
        email: adminEmail,
        role: 'admin',
        tenantId: tenant.id,
      });

      logger.info('Tenant created successfully:', {
        tenantId: tenant.id,
        schemaName,
        adminUserId: authUser.user.id,
      });

      return {
        tenant: {
          id: tenant.id,
          name: tenant.name,
          schemaName: tenant.schema_name,
          createdAt: tenant.created_at,
          updatedAt: tenant.updated_at,
          isActive: tenant.is_active,
        },
        adminUserId: authUser.user.id,
      };
    } catch (error) {
      logger.error('Tenant creation failed:', error);
      throw error;
    }
  }

  async getTenantById(tenantId: string): Promise<Tenant | null> {
    const { data, error } = await supabaseAdmin
      .from('tenants')
      .select('*')
      .eq('id', tenantId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      logger.error('Failed to get tenant by ID:', error);
      throw createError('Failed to retrieve tenant', 500);
    }

    return {
      id: data.id,
      name: data.name,
      schemaName: data.schema_name,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      isActive: data.is_active,
    };
  }

  async getTenantBySchemaName(schemaName: string): Promise<Tenant | null> {
    const { data, error } = await supabaseAdmin
      .from('tenants')
      .select('*')
      .eq('schema_name', schemaName)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      logger.error('Failed to get tenant by schema name:', error);
      throw createError('Failed to retrieve tenant', 500);
    }

    return {
      id: data.id,
      name: data.name,
      schemaName: data.schema_name,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      isActive: data.is_active,
    };
  }

  async validateSchemaNameUnique(schemaName: string): Promise<boolean> {
    const tenant = await this.getTenantBySchemaName(schemaName);
    return tenant === null;
  }

  private async createTenantSchema(schemaName: string): Promise<void> {
    try {
      // Create schema
      const { error: schemaError } = await supabaseAdmin.rpc('create_tenant_schema', {
        schema_name: schemaName,
      });

      if (schemaError) {
        logger.error('Failed to create tenant schema:', schemaError);
        throw createError('Failed to create tenant schema', 500);
      }

      // Create standard tables in the new schema
      await this.createStandardTables(schemaName);

      logger.info('Tenant schema created successfully:', { schemaName });
    } catch (error) {
      logger.error('Schema creation failed:', error);
      throw error;
    }
  }

  private async createStandardTables(schemaName: string): Promise<void> {
    const tables = [
      // Users table in tenant schema
      `CREATE TABLE "${schemaName}".users (
        id UUID PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'user',
        tenant_id UUID NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`,
      
      // Projects table
      `CREATE TABLE "${schemaName}".projects (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_by UUID NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        FOREIGN KEY (created_by) REFERENCES "${schemaName}".users(id)
      )`,
      
      // Versions table
      `CREATE TABLE "${schemaName}".versions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id UUID NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_by UUID NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        FOREIGN KEY (project_id) REFERENCES "${schemaName}".projects(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES "${schemaName}".users(id)
      )`,
    ];

    for (const tableSQL of tables) {
      const { error } = await supabaseAdmin.rpc('execute_sql', { sql: tableSQL });
      if (error) {
        logger.error('Failed to create table:', { error, sql: tableSQL });
        throw createError('Failed to create standard tables', 500);
      }
    }
  }

  private async createUserInTenantSchema(
    schemaName: string,
    userData: {
      id: string;
      email: string;
      role: string;
      tenantId: string;
    }
  ): Promise<void> {
    const { error } = await supabaseAdmin.rpc('insert_tenant_user', {
      schema_name: schemaName,
      user_id: userData.id,
      user_email: userData.email,
      user_role: userData.role,
      tenant_id: userData.tenantId,
    });

    if (error) {
      logger.error('Failed to create user in tenant schema:', error);
      throw createError('Failed to create user in tenant schema', 500);
    }
  }

  private async deleteTenant(tenantId: string): Promise<void> {
    try {
      const { error } = await supabaseAdmin
        .from('tenants')
        .delete()
        .eq('id', tenantId);

      if (error) {
        logger.error('Failed to delete tenant:', error);
      }
    } catch (error) {
      logger.error('Tenant cleanup failed:', error);
    }
  }
}