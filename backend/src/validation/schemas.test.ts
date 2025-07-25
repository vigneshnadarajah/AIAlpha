import { z } from 'zod';
import { 
  userRegistrationSchema, 
  userLoginSchema, 
  tenantCreationSchema,
  dataVisualizationSchema,
  validateRequest,
  formatValidationErrors
} from './validation';

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

      const result = validateRequest({body: userRegistrationSchema}).safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
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

      const result = validateRequest({body: userRegistrationSchema}).safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(1);
        expect(result.error.issues[0].path).toEqual(['email']);
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

      const result = validateRequest({body: userRegistrationSchema}).safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(issue => issue.path.includes('password'))).toBe(true);
      }
    });

    it('should require all mandatory fields', () => {
      const invalidData = {
        email: 'test@example.com'
      };

      const result = validateRequest({body: userRegistrationSchema}).safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
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

      const result = validateRequest({body: userLoginSchema}).safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('test@example.com');
      }
    });

    it('should reject missing credentials', () => {
      const invalidData = {
        email: 'test@example.com'
      };

      const result = validateRequest({body: userLoginSchema}).safeParse(invalidData);
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

      const result = validateRequest({body: tenantCreationSchema}).safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
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

      const result = validateRequest({body: tenantCreationSchema}).safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('Data Visualization Schema', () => {
    it('should validate chart configuration', () => {
      const validData = {
        type: 'bar',
        title: 'Sales Data',
        data: {
          labels: ['Q1', 'Q2', 'Q3', 'Q4'],
          datasets: [{
            label: 'Revenue',
            data: [100, 200, 150, 300]
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      };

      const result = validateRequest({body: dataVisualizationSchema}).safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid chart type', () => {
      const invalidData = {
        type: 'invalid-chart-type',
        title: 'Sales Data',
        data: {
          labels: ['Q1'],
          datasets: []
        }
      };

      const result = validateRequest({body: dataVisualizationSchema}).safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('Validation Error Formatting', () => {
    it('should format validation errors with clear messages', () => {
      const schema = z.object({
        email: z.string().email(),
        age: z.number().min(18)
      });

      const invalidData = {
        email: 'invalid-email',
        age: 15
      };

      const result = schema.safeParse(invalidData);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        const formattedErrors = formatValidationErrors(result.error);
        expect(formattedErrors).toHaveLength(2);
        expect(formattedErrors[0]).toContain('email');
        expect(formattedErrors[1]).toContain('age');
      }
    });

    it('should handle nested object validation errors', () => {
      const schema = z.object({
        user: z.object({
          profile: z.object({
            name: z.string().min(2),
            age: z.number().positive()
          })
        })
      });

      const invalidData = {
        user: {
          profile: {
            name: 'A',
            age: -5
          }
        }
      };

      const result = schema.safeParse(invalidData);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        const formattedErrors = formatValidationErrors(result.error);
        expect(formattedErrors.length).toBeGreaterThan(0);
        expect(formattedErrors.some(error => error.includes('user.profile.name'))).toBe(true);
      }
    });
  });

  describe('Schema Composition', () => {
    it('should support optional fields with defaults', () => {
      const schema = z.object({
        name: z.string(),
        active: z.boolean().default(true),
        tags: z.array(z.string()).optional()
      });

      const data = { name: 'Test' };
      const result = schema.parse(data);
      
      expect(result.name).toBe('Test');
      expect(result.active).toBe(true);
      expect(result.tags).toBeUndefined();
    });

    it('should support array validation with constraints', () => {
      const schema = z.object({
        items: z.array(z.string()).min(1).max(10),
        numbers: z.array(z.number().positive()).nonempty()
      });

      const validData = {
        items: ['item1', 'item2'],
        numbers: [1, 2, 3]
      };

      const result = validateRequest({body: schema}).safeParse(validData);
      expect(result.success).toBe(true);
    });
  });
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
      if (!result.success) {
        expect(result.error.issues).toHaveLength(1);
        expect(result.error.issues[0].path).toEqual(['email']);
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
      if (!result.success) {
        expect(result.error.issues.some(issue => issue.path.includes('password'))).toBe(true);
      }
    });

    it('should require all mandatory fields', () => {
      const invalidData = {
        email: 'test@example.com'
      };

      const result = validateSchema(userRegistrationSchema, invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
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
      if (result.success) {
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
      if (result.success) {
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
    it('should validate chart configuration', () => {
      const validData = {
        type: 'bar',
        title: 'Sales Data',
        data: {
          labels: ['Q1', 'Q2', 'Q3', 'Q4'],
          datasets: [{
            label: 'Revenue',
            data: [100, 200, 150, 300]
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      };

      const result = validateSchema(dataVisualizationSchema, validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid chart type', () => {
      const invalidData = {
        type: 'invalid-chart-type',
        title: 'Sales Data',
        data: {
          labels: ['Q1'],
          datasets: []
        }
      };

      const result = validateSchema(dataVisualizationSchema, invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('Validation Error Formatting', () => {
    it('should format validation errors with clear messages', () => {
      const schema = z.object({
        email: z.string().email(),
        age: z.number().min(18)
      });

      const invalidData = {
        email: 'invalid-email',
        age: 15
      };

      const result = schema.safeParse(invalidData);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        const formattedErrors = formatValidationErrors(result.error);
        expect(formattedErrors).toHaveLength(2);
        expect(formattedErrors[0]).toContain('email');
        expect(formattedErrors[1]).toContain('age');
      }
    });

    it('should handle nested object validation errors', () => {
      const schema = z.object({
        user: z.object({
          profile: z.object({
            name: z.string().min(2),
            age: z.number().positive()
          })
        })
      });

      const invalidData = {
        user: {
          profile: {
            name: 'A',
            age: -5
          }
        }
      };

      const result = schema.safeParse(invalidData);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        const formattedErrors = formatValidationErrors(result.error);
        expect(formattedErrors.length).toBeGreaterThan(0);
        expect(formattedErrors.some(error => error.includes('user.profile.name'))).toBe(true);
      }
    });
  });

  describe('Schema Composition', () => {
    it('should support optional fields with defaults', () => {
      const schema = z.object({
        name: z.string(),
        active: z.boolean().default(true),
        tags: z.array(z.string()).optional()
      });

      const data = { name: 'Test' };
      const result = schema.parse(data);
      
      expect(result.name).toBe('Test');
      expect(result.active).toBe(true);
      expect(result.tags).toBeUndefined();
    });

    it('should support array validation with constraints', () => {
      const schema = z.object({
        items: z.array(z.string()).min(1).max(10),
        numbers: z.array(z.number().positive()).nonempty()
      });

      const validData = {
        items: ['item1', 'item2'],
        numbers: [1, 2, 3]
      };

      const result = validateSchema(schema, validData);
      expect(result.success).toBe(true);
    });
  });
});