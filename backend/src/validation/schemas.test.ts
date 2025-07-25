import { z } from 'zod';
import { 
  userRegistrationSchema, 
  userLoginSchema, 
  tenantCreationSchema,
  dataVisualizationSchema,
  validateSchema
} from './schemas';

describe('Validation Schemas', () => {
  describe('User Registration Schema', () => {
    it('should validate valid user registration data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'SecurePassword123!',
        firstName: 'John',
        lastName: 'Doe',
        tenantName: 'Acme Corp'
      };

      const result = validateSchema(userRegistrationSchema, validData);
      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.email).toBe('test@example.com');
        expect(result.data.firstName).toBe('John');
      }
    });

    it('should reject invalid email format', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'SecurePassword123!',
        firstName: 'John',
        lastName: 'Doe',
        tenantName: 'Acme Corp'
      };

      const result = validateSchema(userRegistrationSchema, invalidData);
      expect(result.success).toBe(false);
      if (!result.success && result.error) {
        expect(result.error.issues).toHaveLength(1);
        expect(result.error.issues[0]?.path).toEqual(['email']);
      }
    });

    it('should reject weak passwords', () => {
      const invalidData = {
        email: 'test@example.com',
        password: '123',
        firstName: 'John',
        lastName: 'Doe',
        tenantName: 'Acme Corp'
      };

      const result = validateSchema(userRegistrationSchema, invalidData);
      expect(result.success).toBe(false);
      if (!result.success && result.error) {
        expect(result.error.issues.some((issue: any) => issue.path.includes('password'))).toBe(true);
      }
    });

    it('should require all mandatory fields', () => {
      const invalidData = {
        email: 'test@example.com'
      };

      const result = validateSchema(userRegistrationSchema, invalidData);
      expect(result.success).toBe(false);
      if (!result.success && result.error) {
        expect(result.error.issues.length).toBeGreaterThan(1);
      }
    });
  });

  describe('User Login Schema', () => {
    it('should validate valid login data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'SecurePassword123!'
      };

      const result = validateSchema(userLoginSchema, validData);
      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.email).toBe('test@example.com');
      }
    });

    it('should reject missing credentials', () => {
      const invalidData = {
        email: 'test@example.com'
      };

      const result = validateSchema(userLoginSchema, invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('Tenant Creation Schema', () => {
    it('should validate valid tenant data', () => {
      const validData = {
        name: 'Acme Corporation',
        domain: 'acme.com',
        settings: {
          theme: 'dark',
          timezone: 'UTC',
          features: ['analytics', 'reporting']
        }
      };

      const result = validateSchema(tenantCreationSchema, validData);
      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.name).toBe('Acme Corporation');
        expect(result.data.settings.features).toContain('analytics');
      }
    });

    it('should reject invalid domain format', () => {
      const invalidData = {
        name: 'Acme Corporation',
        domain: 'invalid-domain',
        settings: {
          theme: 'dark',
          timezone: 'UTC',
          features: ['analytics']
        }
      };

      const result = validateSchema(tenantCreationSchema, invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('Data Visualization Schema', () => {
    it('should validate valid visualization data', () => {
      const validData = {
        type: 'line' as const,
        title: 'Sales Chart',
        data: {
          labels: ['Jan', 'Feb', 'Mar'],
          datasets: [{
            label: 'Sales',
            data: [100, 200, 150]
          }]
        },
        options: {
          responsive: true
        }
      };

      const result = validateSchema(dataVisualizationSchema, validData);
      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.type).toBe('line');
        expect(result.data.title).toBe('Sales Chart');
      }
    });

    it('should reject invalid chart type', () => {
      const invalidData = {
        type: 'invalid-type',
        title: 'Sales Chart',
        data: {
          labels: ['Jan', 'Feb', 'Mar'],
          datasets: [{
            label: 'Sales',
            data: [100, 200, 150]
          }]
        }
      };

      const result = validateSchema(dataVisualizationSchema, invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('validateSchema function', () => {
    it('should return success for valid data', () => {
      const schema = z.object({
        name: z.string().min(2),
        age: z.number().min(0)
      });
      
      const validData = { name: 'John', age: 25 };
      const result = validateSchema(schema, validData);
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual(validData);
      expect(result.error).toBeUndefined();
    });

    it('should return error for invalid data', () => {
      const schema = z.object({
        name: z.string().min(2),
        age: z.number().min(0)
      });
      
      const invalidData = { name: 'J', age: -5 };
      const result = validateSchema(schema, invalidData);
      
      expect(result.success).toBe(false);
      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      if (result.error) {
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });
  });
});