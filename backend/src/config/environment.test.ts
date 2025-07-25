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

      expect(() => validateEnvironment()).toThrow('SUPABASE_URL is required');
    });

    it('should throw error when SUPABASE_ANON_KEY is missing', () => {
      process.env['SUPABASE_URL'] = 'https://test.supabase.co';
      delete process.env['SUPABASE_ANON_KEY'];
      process.env['SUPABASE_SERVICE_ROLE_KEY'] = 'test_service_key';
      process.env['JWT_SECRET'] = validJwtSecret;

      expect(() => validateEnvironment()).toThrow('SUPABASE_ANON_KEY is required');
    });

    it('should throw error when SUPABASE_SERVICE_ROLE_KEY is missing', () => {
      process.env['SUPABASE_URL'] = 'https://test.supabase.co';
      process.env['SUPABASE_ANON_KEY'] = 'test_anon_key';
      delete process.env['SUPABASE_SERVICE_ROLE_KEY'];
      process.env['JWT_SECRET'] = validJwtSecret;

      expect(() => validateEnvironment()).toThrow('SUPABASE_SERVICE_ROLE_KEY is required');
    });

    it('should throw error when JWT_SECRET is missing', () => {
      process.env['SUPABASE_URL'] = 'https://test.supabase.co';
      process.env['SUPABASE_ANON_KEY'] = 'test_anon_key';
      process.env['SUPABASE_SERVICE_ROLE_KEY'] = 'test_service_key';
      delete process.env['JWT_SECRET'];

      expect(() => validateEnvironment()).toThrow('JWT_SECRET is required');
    });

    it('should validate URL format for SUPABASE_URL', () => {
      process.env['SUPABASE_URL'] = 'invalid-url';
      process.env['SUPABASE_ANON_KEY'] = 'test_anon_key';
      process.env['SUPABASE_SERVICE_ROLE_KEY'] = 'test_service_key';
      process.env['JWT_SECRET'] = validJwtSecret;

      expect(() => validateEnvironment()).toThrow('SUPABASE_URL must be a valid URL');
    });

    it('should validate PORT is a valid number', () => {
      process.env['PORT'] = 'not-a-number';
      process.env['SUPABASE_URL'] = 'https://test.supabase.co';
      process.env['SUPABASE_ANON_KEY'] = 'test_anon_key';
      process.env['SUPABASE_SERVICE_ROLE_KEY'] = 'test_service_key';
      process.env['JWT_SECRET'] = validJwtSecret;

      expect(() => validateEnvironment()).toThrow('PORT must be a valid number');
    });

    it('should validate JWT_SECRET minimum length', () => {
      process.env['SUPABASE_URL'] = 'https://test.supabase.co';
      process.env['SUPABASE_ANON_KEY'] = 'test_anon_key';
      process.env['SUPABASE_SERVICE_ROLE_KEY'] = 'test_service_key';
      process.env['JWT_SECRET'] = '123'; // too short

      expect(() => validateEnvironment()).toThrow('JWT_SECRET must be at least 32 characters long');
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
});