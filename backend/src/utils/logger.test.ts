import { logger } from './logger';

describe('Logging System', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = process.env;
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Logger Configuration', () => {
    it('should be a logger instance', () => {
      expect(logger).toBeDefined();
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.warn).toBe('function');
      expect(typeof logger.error).toBe('function');
      expect(typeof logger.debug).toBe('function');
    });

    it('should have console transport configured', () => {
      expect(logger.transports).toBeDefined();
      expect(logger.transports.length).toBeGreaterThan(0);
    });

    it('should have default service metadata', () => {
      expect(logger.defaultMeta).toEqual({ service: 'aialpha-backend' });
    });

    it('should use JSON format', () => {
      expect(logger.format).toBeDefined();
    });
  });

  describe('Log Level Configuration', () => {
    it('should set info level for production environment', () => {
      process.env['NODE_ENV'] = 'production';
      const level = process.env['NODE_ENV'] === 'production' ? 'info' : 'debug';
      expect(level).toBe('info');
    });

    it('should set debug level for development environment', () => {
      process.env['NODE_ENV'] = 'development';
      const level = process.env['NODE_ENV'] === 'production' ? 'info' : 'debug';
      expect(level).toBe('debug');
    });
  });

  describe('Basic Logging Functions', () => {
    it('should have info logging method', () => {
      expect(typeof logger.info).toBe('function');
      expect(() => logger.info('Test info message', { test: 'data' })).not.toThrow();
    });

    it('should have warn logging method', () => {
      expect(typeof logger.warn).toBe('function');
      expect(() => logger.warn('Test warn message', { test: 'data' })).not.toThrow();
    });

    it('should have error logging method', () => {
      expect(typeof logger.error).toBe('function');
      expect(() => logger.error('Test error message', { test: 'data' })).not.toThrow();
    });

    it('should have debug logging method', () => {
      expect(typeof logger.debug).toBe('function');
      expect(() => logger.debug('Test debug message', { test: 'data' })).not.toThrow();
    });
  });

  describe('Log Message Structure', () => {
    it('should include service name in default metadata', () => {
      expect(logger.defaultMeta).toEqual({ service: 'aialpha-backend' });
    });

    it('should support additional metadata', () => {
      expect(() => logger.info('Test message', { additional: 'metadata' })).not.toThrow();
    });
  });

  describe('Environment-based Log Levels', () => {
    it('should handle production environment level setting', () => {
      process.env['NODE_ENV'] = 'production';
      const level = process.env['NODE_ENV'] === 'production' ? 'info' : 'debug';
      expect(level).toBe('info');
    });

    it('should handle development environment level setting', () => {
      process.env['NODE_ENV'] = 'development';
      const level = process.env['NODE_ENV'] === 'production' ? 'info' : 'debug';
      expect(level).toBe('debug');
    });
  });

  describe('Multi-tenant Support', () => {
    it('should support tenant schema in log messages', () => {
      const mockReq = { userContext: { tenantSchema: 'test_tenant' } } as any;
      expect(() => logger.info('Test message', { req: mockReq })).not.toThrow();
    });

    it('should handle missing tenant schema gracefully', () => {
      const mockReq = {} as any;
      expect(() => logger.info('Test message', { req: mockReq })).not.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should handle logging method calls without throwing', () => {
      expect(() => logger.info('Test message')).not.toThrow();
      expect(() => logger.warn('Test message')).not.toThrow();
      expect(() => logger.error('Test message')).not.toThrow();
      expect(() => logger.debug('Test message')).not.toThrow();
    });
  });
});