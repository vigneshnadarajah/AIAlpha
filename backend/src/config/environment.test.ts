import { getConfig, validateEnvironment, EnvironmentConfig } from './environment';

// Mock the cached config to ensure fresh config for each test
jest.mock('./environment', () => {
  const originalModule = jest.requireActual('./environment');
  return {
    ...originalModule,
    getConfig: jest.fn(() => originalModule.getConfig()),
    validateEnvironment: jest.fn(() => originalModule.validateEnvironment())
  };
});

describe('Environment Configuration', () => {
  // Store original environment variables
  const originalEnv = process.env;
  const validJwtSecret = 'test_jwt_secret_with_sufficient_length_32chars';

  beforeEach(() => {
    // Reset environment variables for each test
    jest.resetModules();
    process.env = { ...originalEnv };
    jest.clearAllMocks();
  });

  afterAll(() => {
    // Restore original environment variables
    process.env = originalEnv;
  });

  describe('getConfig Function', () => {
    it('should return configuration object with all required fields', () => {
      // Set required environment variables
      process.env['NODE_ENV'] = 'test';
      process.env['PORT'] = '3001';
      process.env['SUPABASE_URL'] = 'https://test.supabase.co';
      process.env['SUPABASE_ANON_KEY'] = 'test_anon_key';
      process.env['SUPABASE_SERVICE_ROLE_KEY'] = 'test_service_key';
      process.env['JWT_SECRET'] = validJwtSecret;
      process.env['FRONTEND_URL'] = 'http://localhost:5173';

      const config = getConfig();

      expect(config).toEqual({
        nodeEnv: 'test',
        port: 3001,
        supabase: {
          url: 'https://test.supabase.co',
          anonKey: 'test_anon_key',
          serviceRoleKey: 'test_service_key'
        },
        jwt: {
          secret: validJwtSecret
        },
        cors: {
          origin: 'http://localhost:5173'
        },
        allowedOrigins: [],
        database: {
          poolSize: 1, // test environment default
          timeout: 10000
        },
        logging: {
          level: 'error', // test environment default
          format: 'json'
        }
      });
    });

    it('should use default values for optional environment variables', () => {
      // Set only required environment variables, delete optional ones
      delete process.env['NODE_ENV'];
      delete process.env['PORT'];
      delete process.env['FRONTEND_URL'];
      process.env['SUPABASE_URL'] = 'https://test.supabase.co';
      process.env['SUPABASE_ANON_KEY'] = 'test_anon_key';
      process.env['SUPABASE_SERVICE_ROLE_KEY'] = 'test_service_key';
      process.env['JWT_SECRET'] = validJwtSecret;

      const config = getConfig();

      expect(config.nodeEnv).toBe('development'); // default
      expect(config.port).toBe(3001); // default
      expect(config.cors.origin).toBe('http://localhost:5173'); // default
    });

    it('should parse PORT as number', () => {
      process.env['PORT'] = '8080';
      process.env['SUPABASE_URL'] = 'https://test.supabase.co';
      process.env['SUPABASE_ANON_KEY'] = 'test_anon_key';
      process.env['SUPABASE_SERVICE_ROLE_KEY'] = 'test_service_key';
      process.env['JWT_SECRET'] = validJwtSecret;

      const config = getConfig();

      expect(config.port).toBe(8080);
      expect(typeof config.port).toBe('number');
    });

    it('should handle different NODE_ENV values', () => {
      // Test production environment
      process.env['NODE_ENV'] = 'production';
      process.env['SUPABASE_URL'] = 'https://test.supabase.co';
      process.env['SUPABASE_ANON_KEY'] = 'test_anon_key';
      process.env['SUPABASE_SERVICE_ROLE_KEY'] = 'test_service_key';
      process.env['JWT_SECRET'] = validJwtSecret;

      // Clear module cache to get fresh config
      jest.resetModules();
      const { getConfig: freshGetConfig } = require('./environment');
      const config = freshGetConfig();
      
      expect(config.nodeEnv).toBe('production');
    });
  });

  describe('validateEnvironment Function', () => {
    it('should validate all required environment variables are present', () => {
      process.env['SUPABASE_URL'] = 'https://test.supabase.co';
      process.env['SUPABASE_ANON_KEY'] = 'test_anon_key';
      process.env['SUPABASE_SERVICE_ROLE_KEY'] = 'test_service_key';
      process.env['JWT_SECRET'] = validJwtSecret;

      expect(() => validateEnvironment()).not.toThrow();
    });

    it('should throw error when SUPABASE_URL is missing', () => {
      delete process.env['SUPABASE_URL'];
      process.env['SUPABASE_ANON_KEY'] = 'test_anon_key';
      process.env['SUPABASE_SERVICE_ROLE_KEY'] = 'test_service_key';
      process.env['JWT_SECRET'] = validJwtSecret;

      expect(() => validateEnvironment()).toThrow('SUPABASE_URL: Required');
    });

    it('should throw error when SUPABASE_ANON_KEY is missing', () => {
      process.env['SUPABASE_URL'] = 'https://test.supabase.co';
      delete process.env['SUPABASE_ANON_KEY'];
      process.env['SUPABASE_SERVICE_ROLE_KEY'] = 'test_service_key';
      process.env['JWT_SECRET'] = validJwtSecret;

      expect(() => validateEnvironment()).toThrow('SUPABASE_ANON_KEY: Required');
    });

    it('should throw error when SUPABASE_SERVICE_ROLE_KEY is missing', () => {
      process.env['SUPABASE_URL'] = 'https://test.supabase.co';
      process.env['SUPABASE_ANON_KEY'] = 'test_anon_key';
      delete process.env['SUPABASE_SERVICE_ROLE_KEY'];
      process.env['JWT_SECRET'] = validJwtSecret;

      expect(() => validateEnvironment()).toThrow('SUPABASE_SERVICE_ROLE_KEY: Required');
    });

    it('should throw error when JWT_SECRET is missing', () => {
      process.env['SUPABASE_URL'] = 'https://test.supabase.co';
      process.env['SUPABASE_ANON_KEY'] = 'test_anon_key';
      process.env['SUPABASE_SERVICE_ROLE_KEY'] = 'test_service_key';
      delete process.env['JWT_SECRET'];

      expect(() => validateEnvironment()).toThrow('JWT_SECRET: Required');
    });

    it('should validate URL format for SUPABASE_URL', () => {
      process.env['SUPABASE_URL'] = 'invalid-url';
      process.env['SUPABASE_ANON_KEY'] = 'test_anon_key';
      process.env['SUPABASE_SERVICE_ROLE_KEY'] = 'test_service_key';
      process.env['JWT_SECRET'] = validJwtSecret;

      expect(() => validateEnvironment()).toThrow('SUPABASE_URL: Invalid url');
    });

    it('should validate PORT is a valid number', () => {
      process.env['PORT'] = 'not-a-number';
      process.env['SUPABASE_URL'] = 'https://test.supabase.co';
      process.env['SUPABASE_ANON_KEY'] = 'test_anon_key';
      process.env['SUPABASE_SERVICE_ROLE_KEY'] = 'test_service_key';
      process.env['JWT_SECRET'] = validJwtSecret;

      expect(() => validateEnvironment()).toThrow('PORT: Expected number, received nan');
    });

    it('should validate JWT_SECRET minimum length', () => {
      process.env['SUPABASE_URL'] = 'https://test.supabase.co';
      process.env['SUPABASE_ANON_KEY'] = 'test_anon_key';
      process.env['SUPABASE_SERVICE_ROLE_KEY'] = 'test_service_key';
      process.env['JWT_SECRET'] = '123'; // too short

      expect(() => validateEnvironment()).toThrow('JWT_SECRET: String must contain at least 32 character(s)');
    });
  });

  describe('EnvironmentConfig Type', () => {
    it('should enforce correct type structure', () => {
      process.env['SUPABASE_URL'] = 'https://test.supabase.co';
      process.env['SUPABASE_ANON_KEY'] = 'test_anon_key';
      process.env['SUPABASE_SERVICE_ROLE_KEY'] = 'test_service_key';
      process.env['JWT_SECRET'] = validJwtSecret;

      const config: EnvironmentConfig = getConfig();

      // TypeScript should enforce these types at compile time
      expect(typeof config.nodeEnv).toBe('string');
      expect(typeof config.port).toBe('number');
      expect(typeof config.supabase).toBe('object');
      expect(typeof config.supabase.url).toBe('string');
      expect(typeof config.supabase.anonKey).toBe('string');
      expect(typeof config.supabase.serviceRoleKey).toBe('string');
      expect(typeof config.jwt).toBe('object');
      expect(typeof config.jwt.secret).toBe('string');
      expect(typeof config.cors).toBe('object');
      expect(typeof config.cors.origin).toBe('string');
    });
  });

  describe('Environment-specific Configuration', () => {
    it('should handle production environment configuration', () => {
      process.env['NODE_ENV'] = 'production';
      process.env['PORT'] = '80';
      process.env['SUPABASE_URL'] = 'https://prod.supabase.co';
      process.env['SUPABASE_ANON_KEY'] = 'prod_anon_key';
      process.env['SUPABASE_SERVICE_ROLE_KEY'] = 'prod_service_key';
      process.env['JWT_SECRET'] = 'production_jwt_secret_with_sufficient_length_32chars';
      process.env['FRONTEND_URL'] = 'https://myapp.com';

      // Clear module cache to get fresh config
      jest.resetModules();
      const { getConfig: freshGetConfig } = require('./environment');
      const config = freshGetConfig();

      expect(config.nodeEnv).toBe('production');
      expect(config.port).toBe(80);
      expect(config.cors.origin).toBe('https://myapp.com');
      expect(config.supabase.url).toBe('https://prod.supabase.co');
    });

    it('should handle development environment configuration', () => {
      process.env['NODE_ENV'] = 'development';
      process.env['SUPABASE_URL'] = 'https://dev.supabase.co';
      process.env['SUPABASE_ANON_KEY'] = 'dev_anon_key';
      process.env['SUPABASE_SERVICE_ROLE_KEY'] = 'dev_service_key';
      process.env['JWT_SECRET'] = 'development_jwt_secret_with_sufficient_length_32chars';

      const config = getConfig();

      expect(config.nodeEnv).toBe('development');
      expect(config.port).toBe(3001); // default
      expect(config.cors.origin).toBe('http://localhost:5173'); // default
    });
  });

  describe('Configuration Immutability', () => {
    it('should return the same configuration object on multiple calls', () => {
      process.env['SUPABASE_URL'] = 'https://test.supabase.co';
      process.env['SUPABASE_ANON_KEY'] = 'test_anon_key';
      process.env['SUPABASE_SERVICE_ROLE_KEY'] = 'test_service_key';
      process.env['JWT_SECRET'] = validJwtSecret;

      const config1 = getConfig();
      const config2 = getConfig();

      expect(config1).toEqual(config2);
    });

    it('should not allow modification of returned configuration object', () => {
      process.env['SUPABASE_URL'] = 'https://test.supabase.co';
      process.env['SUPABASE_ANON_KEY'] = 'test_anon_key';
      process.env['SUPABASE_SERVICE_ROLE_KEY'] = 'test_service_key';
      process.env['JWT_SECRET'] = validJwtSecret;

      const config = getConfig();

      // Attempting to modify should not affect the original
      expect(() => {
        (config as any).port = 9999;
      }).not.toThrow();

      // Get fresh config to verify immutability
      const freshConfig = getConfig();
      expect(freshConfig.port).not.toBe(9999);
    });
  });

  // 🔴 RED PHASE: New failing tests for Zod validation enhancement
  describe('Zod Schema Validation (Phase 2 Enhancement)', () => {
    it('should use Zod schema for environment validation', () => {
      process.env['SUPABASE_URL'] = 'https://test.supabase.co';
      process.env['SUPABASE_ANON_KEY'] = 'test_anon_key';
      process.env['SUPABASE_SERVICE_ROLE_KEY'] = 'test_service_key';
      process.env['JWT_SECRET'] = validJwtSecret;

      // This should use Zod validation internally
      expect(() => getConfig()).not.toThrow();
      
      // Should have access to Zod schema for external validation
      const { getEnvironmentSchema } = require('./environment');
      expect(getEnvironmentSchema).toBeDefined();
      expect(typeof getEnvironmentSchema).toBe('function');
    });

    it('should provide detailed Zod validation errors', () => {
      process.env['SUPABASE_URL'] = 'invalid-url';
      process.env['SUPABASE_ANON_KEY'] = 'test_anon_key';
      process.env['SUPABASE_SERVICE_ROLE_KEY'] = 'test_service_key';
      process.env['JWT_SECRET'] = 'short'; // too short

      try {
        getConfig();
        fail('Should have thrown validation error');
      } catch (error: any) {
        // Should contain detailed Zod validation information
        expect(error.message).toContain('validation');
        expect(error.issues || error.errors).toBeDefined();
      }
    });

    it('should support environment-specific schema validation', () => {
      const { getEnvironmentSchema } = require('./environment');
      
      // Should have different schemas for different environments
      const devSchema = getEnvironmentSchema('development');
      const prodSchema = getEnvironmentSchema('production');
      const testSchema = getEnvironmentSchema('test');

      expect(devSchema).toBeDefined();
      expect(prodSchema).toBeDefined();
      expect(testSchema).toBeDefined();
      
      // Schemas should be different for different environments
      expect(devSchema).not.toBe(prodSchema);
    });

    it('should transform and sanitize configuration values', () => {
      process.env['PORT'] = '  3001  '; // with whitespace
      process.env['SUPABASE_URL'] = 'https://test.supabase.co/';
      process.env['SUPABASE_ANON_KEY'] = 'test_anon_key';
      process.env['SUPABASE_SERVICE_ROLE_KEY'] = 'test_service_key';
      process.env['JWT_SECRET'] = validJwtSecret;

      const config = getConfig();

      // Should trim whitespace and normalize values
      expect(config.port).toBe(3001);
      expect(config.supabase.url).toBe('https://test.supabase.co'); // trailing slash removed
    });

    it('should provide type-safe configuration with Zod inference', () => {
      process.env['SUPABASE_URL'] = 'https://test.supabase.co';
      process.env['SUPABASE_ANON_KEY'] = 'test_anon_key';
      process.env['SUPABASE_SERVICE_ROLE_KEY'] = 'test_service_key';
      process.env['JWT_SECRET'] = validJwtSecret;

      const config = getConfig();
      
      // TypeScript should infer types from Zod schema
      // This is tested at compile time, but we can verify runtime types
      expect(typeof config.port).toBe('number');
      expect(typeof config.nodeEnv).toBe('string');
      expect(Array.isArray(config.allowedOrigins || [])).toBe(true);
    });
  });

  describe('Enhanced Configuration Features (Phase 2)', () => {
    it('should support multiple CORS origins', () => {
      process.env['SUPABASE_URL'] = 'https://test.supabase.co';
      process.env['SUPABASE_ANON_KEY'] = 'test_anon_key';
      process.env['SUPABASE_SERVICE_ROLE_KEY'] = 'test_service_key';
      process.env['JWT_SECRET'] = validJwtSecret;
      process.env['ALLOWED_ORIGINS'] = 'http://localhost:3000,http://localhost:5173,https://myapp.com';

      const config = getConfig();

      expect(config.allowedOrigins).toEqual([
        'http://localhost:3000',
        'http://localhost:5173', 
        'https://myapp.com'
      ]);
    });

    it('should support database configuration', () => {
      process.env['SUPABASE_URL'] = 'https://test.supabase.co';
      process.env['SUPABASE_ANON_KEY'] = 'test_anon_key';
      process.env['SUPABASE_SERVICE_ROLE_KEY'] = 'test_service_key';
      process.env['JWT_SECRET'] = validJwtSecret;
      process.env['DB_POOL_SIZE'] = '10';
      process.env['DB_TIMEOUT'] = '30000';

      const config = getConfig();

      expect(config.database).toBeDefined();
      expect(config.database.poolSize).toBe(10);
      expect(config.database.timeout).toBe(30000);
    });

    it('should support logging configuration', () => {
      process.env['SUPABASE_URL'] = 'https://test.supabase.co';
      process.env['SUPABASE_ANON_KEY'] = 'test_anon_key';
      process.env['SUPABASE_SERVICE_ROLE_KEY'] = 'test_service_key';
      process.env['JWT_SECRET'] = validJwtSecret;
      process.env['LOG_LEVEL'] = 'debug';
      process.env['LOG_FORMAT'] = 'json';

      const config = getConfig();

      expect(config.logging).toBeDefined();
      expect(config.logging.level).toBe('debug');
      expect(config.logging.format).toBe('json');
    });

    it('should validate enum values for environment-specific settings', () => {
      process.env['SUPABASE_URL'] = 'https://test.supabase.co';
      process.env['SUPABASE_ANON_KEY'] = 'test_anon_key';
      process.env['SUPABASE_SERVICE_ROLE_KEY'] = 'test_service_key';
      process.env['JWT_SECRET'] = validJwtSecret;
      process.env['LOG_LEVEL'] = 'invalid-level';

      expect(() => getConfig()).toThrow();
    });
  });
});