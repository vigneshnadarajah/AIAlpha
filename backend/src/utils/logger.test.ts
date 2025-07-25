import { logger } from './logger';
import { EnvironmentConfig } from '../config/environment';

/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*describe('Logging System', () => {
});*/
});*/
});*/
});*/
});*/
});*/
});*/
});*/
});*/
});*/
});*/
});*/
});*/
});*/
});*/
});*/
});*/
});*/
});*/
  // Mock console methods
  let consoleLogSpy: jest.SpyInstance;
  let consoleInfoSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    originalEnv = process.env;
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleInfoSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    process.env = originalEnv;
  });

  it('should log info messages with correct format', () => {
    logger.info('Test info message', { test: 'data' });

    expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
    const logMessage = consoleInfoSpy.mock.calls[0][0];
    expect(logMessage).toContain('Test info message');
    expect(logMessage).toContain(JSON.stringify({ test: 'data' }));
  });

  it('should log warn messages with correct format', () => {
    logger.warn('Test warn message', { test: 'data' });

    expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
    const logMessage = consoleWarnSpy.mock.calls[0][0];
    expect(logMessage).toContain('Test warn message');
    expect(logMessage).toContain(JSON.stringify({ test: 'data' }));
  });

  it('should log error messages with correct format', () => {
    logger.error('Test error message', { test: 'data' });

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    const logMessage = consoleErrorSpy.mock.calls[0][0];
    expect(logMessage).toContain('Test error message');
    expect(logMessage).toContain(JSON.stringify({ test: 'data' }));
  });

  it('should log debug messages with correct format', () => {
    logger.debug('Test debug message', { test: 'data' });

    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    const logMessage = consoleLogSpy.mock.calls[0][0];
    expect(logMessage).toContain('Test debug message');
    expect(logMessage).toContain(JSON.stringify({ test: 'data' }));
  });

  it('should include service name in log messages', () => {
    logger.info('Test message');
    expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
    const logMessage = consoleInfoSpy.mock.calls[0][0];
    expect(logMessage).toContain(`\"service\": \"aialpha-backend\"`);
  });

  it('should include timestamp in log messages', () => {
    logger.info('Test message');
    expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
    const logMessage = consoleInfoSpy.mock.calls[0][0];
    expect(logMessage).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/);
  });

  it('should handle different log levels based on NODE_ENV', () => {
    // Test in production environment
    process.env['NODE_ENV'] = 'production';
    logger.info('Info message');
    logger.debug('Debug message');
    expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
    expect(consoleLogSpy).not.toHaveBeenCalled();

    // Test in development environment
    process.env['NODE_ENV'] = 'development';
    logger.info('Info message');
    logger.debug('Debug message');
    expect(consoleInfoSpy).toHaveBeenCalledTimes(2);
    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
  });

  it('should handle different log levels based on NODE_ENV', () => {
    // Test in production environment
    process.env['NODE_ENV'] = 'production';
    logger.info('Info message');
    logger.debug('Debug message');
    expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
    expect(consoleLogSpy).not.toHaveBeenCalled();

    // Test in development environment
    process.env['NODE_ENV'] = 'development';
    logger.info('Info message');
    logger.debug('Debug message');
    expect(consoleInfoSpy).toHaveBeenCalledTimes(2);
    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
  });

  it('should include tenant schema in log messages when available', () => {
    // Mock request object with tenant schema
    const mockReq = { userContext: { tenantSchema: 'test_tenant' } } as any;
    logger.info('Test message', { req: mockReq });

    expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
    const logMessage = consoleInfoSpy.mock.calls[0][0];
    expect(logMessage).toContain(`\"tenantSchema\": \"test_tenant\"`);
  });

  it('should handle missing tenant schema gracefully', () => {
    // Mock request object without tenant schema
    const mockReq = {} as any;
    logger.info('Test message', { req: mockReq });

    expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
    const logMessage = consoleInfoSpy.mock.calls[0][0];
    expect(logMessage).not.toContain('tenantSchema':');
  });

  it('should handle errors during logging gracefully', () => {
    // Mock console.log to throw an error
    consoleInfoSpy.mockImplementation(() => {
      throw new Error('Logging failed');
    });

    // Should not throw an error
    expect(() => logger.info('Test message')).not.toThrow();
  });
});*/
  // Mock console methods
  let consoleLogSpy: jest.SpyInstance;
  let consoleInfoSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    originalEnv = process.env;
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleInfoSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    process.env = originalEnv;
  });

  it('should log info messages with correct format', () => {
    logger.info('Test info message', { test: 'data' });

    expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
    const logMessage = consoleInfoSpy.mock.calls[0][0];
    expect(logMessage).toContain('Test info message');
    expect(logMessage).toContain(JSON.stringify({ test: 'data' }));
  });

  it('should log warn messages with correct format', () => {
    logger.warn('Test warn message', { test: 'data' });

    expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
    const logMessage = consoleWarnSpy.mock.calls[0][0];
    expect(logMessage).toContain('Test warn message');
    expect(logMessage).toContain(JSON.stringify({ test: 'data' }));
  });

  it('should log error messages with correct format', () => {
    logger.error('Test error message', { test: 'data' });

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    const logMessage = consoleErrorSpy.mock.calls[0][0];
    expect(logMessage).toContain('Test error message');
    expect(logMessage).toContain(JSON.stringify({ test: 'data' }));
  });

  it('should log debug messages with correct format', () => {
    logger.debug('Test debug message', { test: 'data' });

    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    const logMessage = consoleLogSpy.mock.calls[0][0];
    expect(logMessage).toContain('Test debug message');
    expect(logMessage).toContain(JSON.stringify({ test: 'data' }));
  });

  it('should include service name in log messages', () => {
    logger.info('Test message');
    expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
    const logMessage = consoleInfoSpy.mock.calls[0][0];
    expect(logMessage).toContain(`\"service\": \"aialpha-backend\"`);
  });

  it('should include timestamp in log messages', () => {
    logger.info('Test message');
    expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
    const logMessage = consoleInfoSpy.mock.calls[0][0];
    expect(logMessage).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/);
  });

  it('should handle different log levels based on NODE_ENV', () => {
    // Test in production environment
    process.env['NODE_ENV'] = 'production';
    logger.info('Info message');
    logger.debug('Debug message');
    expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
    expect(consoleLogSpy).not.toHaveBeenCalled();

    // Test in development environment
    process.env['NODE_ENV'] = 'development';
    logger.info('Info message');
    logger.debug('Debug message');
    expect(consoleInfoSpy).toHaveBeenCalledTimes(2);
    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
  });

  it('should handle different log levels based on NODE_ENV', () => {
    // Test in production environment
    process.env['NODE_ENV'] = 'production';
    logger.info('Info message');
    logger.debug('Debug message');
    expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
    expect(consoleLogSpy).not.toHaveBeenCalled();

    // Test in development environment
    process.env['NODE_ENV'] = 'development';
    logger.info('Info message');
    logger.debug('Debug message');
    expect(consoleInfoSpy).toHaveBeenCalledTimes(2);
    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
  });

  it('should include tenant schema in log messages when available', () => {
    // Mock request object with tenant schema
    const mockReq = { userContext: { tenantSchema: 'test_tenant' } } as any;
    logger.info('Test message', { req: mockReq });

    expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
    const logMessage = consoleInfoSpy.mock.calls[0][0];
    expect(logMessage).toContain(`\"tenantSchema\": \"test_tenant\"`);
  });

  it('should handle missing tenant schema gracefully', () => {
    // Mock request object without tenant schema
    const mockReq = {} as any;
    logger.info('Test message', { req: mockReq });

    expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
    const logMessage = consoleInfoSpy.mock.calls[0][0];
    expect(logMessage).not.toContain('tenantSchema':');
  });

  it('should handle errors during logging gracefully', () => {
    // Mock console.log to throw an error
    consoleInfoSpy.mockImplementation(() => {
    throw new Error('Logging failed');
    });

    // Should not throw an error
    expect(() => logger.info('Test message')).not.toThrow();
  });
});*/
  let consoleLogSpy: jest.SpyInstance;
  let consoleInfoSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Mock console methods
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    // Store original environment variables and set test env
    originalEnv = process.env;
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore console methods and environment variables
    consoleLogSpy.mockRestore();
    consoleInfoSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    process.env = originalEnv;
  });

  it('should log info messages with correct format', () => {
    logger.info('Test info message', { test: 'data' });

    expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
    const logMessage = consoleInfoSpy.mock.calls[0][0];
    expect(logMessage).toContain('Test info message');
    expect(logMessage).toContain(JSON.stringify({ test: 'data' }));
  });

  it('should log warn messages with correct format', () => {
    logger.warn('Test warn message', { test: 'data' });

    expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
    const logMessage = consoleWarnSpy.mock.calls[0][0];
    expect(logMessage).toContain('Test warn message');
    expect(logMessage).toContain(JSON.stringify({ test: 'data' }));
  });

  it('should log error messages with correct format', () => {
    logger.error('Test error message', { test: 'data' });

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    const logMessage = consoleErrorSpy.mock.calls[0][0];
    expect(logMessage).toContain('Test error message');
    expect(logMessage).toContain(JSON.stringify({ test: 'data' }));
  });

  it('should log debug messages with correct format', () => {
    logger.debug('Test debug message', { test: 'data' });

    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    const logMessage = consoleLogSpy.mock.calls[0][0];
    expect(logMessage).toContain('Test debug message');
    expect(logMessage).toContain(JSON.stringify({ test: 'data' }));
  });

  it('should include service name in log messages', () => {
    logger.info('Test message');
    expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
    const logMessage = consoleInfoSpy.mock.calls[0][0];
    expect(logMessage).toContain(`\"service\": \"aialpha-backend\"`);
  });

  it('should include timestamp in log messages', () => {
    logger.info('Test message');
    expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
    const logMessage = consoleInfoSpy.mock.calls[0][0];
    expect(logMessage).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/);
  });

  it('should handle different log levels based on NODE_ENV', () => {
    // Test in production environment
    process.env['NODE_ENV'] = 'production';
    logger.info('Info message');
    logger.debug('Debug message');
    expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
    expect(consoleLogSpy).not.toHaveBeenCalled();

    // Test in development environment
    process.env['NODE_ENV'] = 'development';
    logger.info('Info message');
    logger.debug('Debug message');
    expect(consoleInfoSpy).toHaveBeenCalledTimes(2);
    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
  });

  it('should handle different log levels based on NODE_ENV', () => {
    // Test in production environment
    process.env['NODE_ENV'] = 'production';
    logger.info('Info message');
    logger.debug('Debug message');
    expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
    expect(consoleLogSpy).not.toHaveBeenCalled();

    // Test in development environment
    process.env['NODE_ENV'] = 'development';
    logger.info('Info message');
    logger.debug('Debug message');
    expect(consoleInfoSpy).toHaveBeenCalledTimes(2);
    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
  });

  it('should include tenant schema in log messages when available', () => {
    // Mock request object with tenant schema
    const mockReq = { userContext: { tenantSchema: 'test_tenant' } } as any;
    logger.info('Test message', { req: mockReq });

    expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
    const logMessage = consoleInfoSpy.mock.calls[0][0];
    expect(logMessage).toContain(`\"tenantSchema\": \"test_tenant\"`);
  });

  it('should handle missing tenant schema gracefully', () => {
    // Mock request object without tenant schema
    const mockReq = {} as any;
    logger.info('Test message', { req: mockReq });

    expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
    const logMessage = consoleInfoSpy.mock.calls[0][0];
    expect(logMessage).not.toContain('tenantSchema':');
  });

  it('should handle errors during logging gracefully', () => {
    // Mock console.log to throw an error
    consoleInfoSpy.mockImplementation(() => {
      throw new Error('Logging failed');
    });

    // Should not throw an error
    expect(() => logger.info('Test message')).not.toThrow();
  });
});*/
  // Mock console methods
  let consoleLogSpy: jest.SpyInstance;
  let consoleInfoSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    originalEnv = process.env;
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleInfoSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    process.env = originalEnv;
  });

  it('should log info messages with correct format', () => {
    logger.info('Test info message', { test: 'data' });

    expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
    const logMessage = consoleInfoSpy.mock.calls[0][0];
    expect(logMessage).toContain('Test info message');
    expect(logMessage).toContain(JSON.stringify({ test: 'data' }));
  });

  it('should log warn messages with correct format', () => {
    logger.warn('Test warn message', { test: 'data' });

    expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
    const logMessage = consoleWarnSpy.mock.calls[0][0];
    expect(logMessage).toContain('Test warn message');
    expect(logMessage).toContain(JSON.stringify({ test: 'data' }));
  });

  it('should log error messages with correct format', () => {
    logger.error('Test error message', { test: 'data' });

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    const logMessage = consoleErrorSpy.mock.calls[0][0];
    expect(logMessage).toContain('Test error message');
    expect(logMessage).toContain(JSON.stringify({ test: 'data' }));
  });

  it('should log debug messages with correct format', () => {
    logger.debug('Test debug message', { test: 'data' });

    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    const logMessage = consoleLogSpy.mock.calls[0][0];
    expect(logMessage).toContain('Test debug message');
    expect(logMessage).toContain(JSON.stringify({ test: 'data' }));
  });

  it('should include service name in log messages', () => {
    logger.info('Test message');
    expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
    const logMessage = consoleInfoSpy.mock.calls[0][0];
    expect(logMessage).toContain(`\"service\": \"aialpha-backend\"`);
  });

  it('should include timestamp in log messages', () => {
    logger.info('Test message');
    expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
    const logMessage = consoleInfoSpy.mock.calls[0][0];
    expect(logMessage).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/);
  });

  it('should handle different log levels based on NODE_ENV', () => {
    // Test in production environment
    process.env['NODE_ENV'] = 'production';
    logger.info('Info message');
    logger.debug('Debug message');
    expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
    expect(consoleLogSpy).not.toHaveBeenCalled();

    // Test in development environment
    process.env['NODE_ENV'] = 'development';
    logger.info('Info message');
    logger.debug('Debug message');
    expect(consoleInfoSpy).toHaveBeenCalledTimes(2);
    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
  });

  it('should handle different log levels based on NODE_ENV', () => {
    // Test in production environment
    process.env['NODE_ENV'] = 'production';
    logger.info('Info message');
    logger.debug('Debug message');
    expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
    expect(consoleLogSpy).not.toHaveBeenCalled();

    // Test in development environment
    process.env['NODE_ENV'] = 'development';
    logger.info('Info message');
    logger.debug('Debug message');
    expect(consoleInfoSpy).toHaveBeenCalledTimes(2);
    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
  });

  it('should include tenant schema in log messages when available', () => {
    // Mock request object with tenant schema
    const mockReq = { userContext: { tenantSchema: 'test_tenant' } } as any;
    logger.info('Test message', { req: mockReq });

    expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
    const logMessage = consoleInfoSpy.mock.calls[0][0];
    expect(logMessage).toContain(`\"tenantSchema\": \"test_tenant\"`);
  });

  it('should handle missing tenant schema gracefully', () => {
    // Mock request object without tenant schema
    const mockReq = {} as any;
    logger.info('Test message', { req: mockReq });

    expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
    const logMessage = consoleInfoSpy.mock.calls[0][0];
    expect(logMessage).not.toContain('tenantSchema':');
  });

  it('should handle errors during logging gracefully', () => {
    // Mock console.log to throw an error
    consoleInfoSpy.mockImplementation(() => {
      throw new Error('Logging failed');
    });

    // Should not throw an error
    expect(() => logger.info('Test message')).not.toThrow();
  });
});*/*/
});*/
  let consoleLogSpy: jest.SpyInstance;
  let consoleInfoSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Mock console methods
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    // Store original environment variables and set test env
    originalEnv = process.env;
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore console methods and environment variables
    consoleLogSpy.mockRestore();
    consoleInfoSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    process.env = originalEnv;
  });

  it('should log info messages with correct format', () => {
    logger.info('Test info message', { test: 'data' });

    expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
    const logMessage = consoleInfoSpy.mock.calls[0][0];
    expect(logMessage).toContain('Test info message');
    expect(logMessage).toContain(`\"test\": \"data\"`);
  });

  it('should log warn messages with correct format', () => {
    logger.warn('Test warn message', { test: 'data' });

    expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
    const logMessage = consoleWarnSpy.mock.calls[0][0];
    expect(logMessage).toContain('Test warn message');
    expect(logMessage).toContain(`\"test\": \"data\"`);
  });

  it('should log error messages with correct format', () => {
    logger.error('Test error message', { test: 'data' });

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    const logMessage = consoleErrorSpy.mock.calls[0][0];
    expect(logMessage).toContain('Test error message');
    expect(logMessage).toContain(`\"test\": \"data\"`);
  });

  it('should log debug messages with correct format', () => {
    logger.debug('Test debug message', { test: 'data' });

    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    const logMessage = consoleLogSpy.mock.calls[0][0];
    expect(logMessage).toContain('Test debug message');
    expect(logMessage).toContain(`\"test\": \"data\"`);
  });

  it('should include service name in log messages', () => {
    logger.info('Test message');
    expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
    const logMessage = consoleInfoSpy.mock.calls[0][0];
    expect(logMessage).toContain(`\"service\": \"aialpha-backend\"`);
  });

  it('should include timestamp in log messages', () => {
    logger.info('Test message');
    expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
    const logMessage = consoleInfoSpy.mock.calls[0][0];
    expect(logMessage).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/);
  });

  it('should handle different log levels based on NODE_ENV', () => {
    // Test in production environment
    process.env['NODE_ENV'] = 'production';
    logger.info('Info message');
    logger.debug('Debug message');
    expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
    expect(consoleLogSpy).not.toHaveBeenCalled();

    // Test in development environment
    process.env['NODE_ENV'] = 'development';
    logger.info('Info message');
    logger.debug('Debug message');
    expect(consoleInfoSpy).toHaveBeenCalledTimes(2);
    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
  });

  it('should handle different log levels based on NODE_ENV', () => {
    // Test in production environment
    process.env['NODE_ENV'] = 'production';
    logger.info('Info message');
    logger.debug('Debug message');
    expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
    expect(consoleLogSpy).not.toHaveBeenCalled();

    // Test in development environment
    process.env['NODE_ENV'] = 'development';
    logger.info('Info message');
    logger.debug('Debug message');
    expect(consoleInfoSpy).toHaveBeenCalledTimes(2);
    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
  });

  it('should include tenant schema in log messages when available', () => {
    // Mock request object with tenant schema
    const mockReq = { userContext: { tenantSchema: 'test_tenant' } } as any;
    logger.info('Test message', { req: mockReq });

    expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
    const logMessage = consoleInfoSpy.mock.calls[0][0];
    expect(logMessage).toContain(`\"tenantSchema\": \"test_tenant\"`);
  });

  it('should handle missing tenant schema gracefully', () => {
    // Mock request object without tenant schema
    const mockReq = {} as any;
    logger.info('Test message', { req: mockReq });

    expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
    const logMessage = consoleInfoSpy.mock.calls[0][0];
    expect(logMessage).not.toContain('tenantSchema':');
  });

  it('should handle errors during logging gracefully', () => {
    // Mock console.log to throw an error
    consoleInfoSpy.mockImplementation(() => {
      throw new Error('Logging failed');
    });

    // Should not throw an error
    expect(() => logger.info('Test message')).not.toThrow();
  });
});*/

  afterEach(() => {
    // Restore console methods and environment variables
    consoleLogSpy.mockRestore();
    consoleInfoSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    process.env = originalEnv;
  });

  it('should log info messages with correct format', () => {
    logger.info('Test info message', { test: 'data' });

    expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
    const logMessage = consoleInfoSpy.mock.calls[0][0];
    expect(logMessage).toContain('Test info message');
    expect(logMessage).toContain('test': 'data'');
  });

  it('should log warn messages with correct format', () => {
    logger.warn('Test warn message', { test: 'data' });

    expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
    const logMessage = consoleWarnSpy.mock.calls[0][0];
    expect(logMessage).toContain('Test warn message');
    expect(logMessage).toContain('test': 'data'');
  });

  it('should log error messages with correct format', () => {
    logger.error('Test error message', { test: 'data' });

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    const logMessage = consoleErrorSpy.mock.calls[0][0];
    expect(logMessage).toContain('Test error message');
    expect(logMessage).toContain('test': 'data'');
  });

  it('should log debug messages with correct format', () => {
    logger.debug('Test debug message', { test: 'data' });

    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    const logMessage = consoleLogSpy.mock.calls[0][0];
    expect(logMessage).toContain('Test debug message');
    expect(logMessage).toContain('test': 'data'');
  });

  it('should include service name in log messages', () => {
    logger.info('Test message');
    expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
    const logMessage = consoleInfoSpy.mock.calls[0][0];
    expect(logMessage).toContain(`"service": "aialpha-backend"`);
  });

  it('should include timestamp in log messages', () => {
    logger.info('Test message');
    expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
    const logMessage = consoleInfoSpy.mock.calls[0][0];
    expect(logMessage).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/);
  });

  it('should handle different log levels based on NODE_ENV', () => {
    // Test in production environment
    process.env['NODE_ENV'] = 'production';
    logger.info('Info message');
    logger.debug('Debug message');
    expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
    expect(consoleLogSpy).not.toHaveBeenCalled();

    // Test in development environment
    process.env['NODE_ENV'] = 'development';
    logger.info('Info message');
    logger.debug('Debug message');
    expect(consoleInfoSpy).toHaveBeenCalledTimes(2);
    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
  });

  it('should handle different log levels based on NODE_ENV', () => {
    // Test in production environment
    process.env['NODE_ENV'] = 'production';
    logger.info('Info message');
    logger.debug('Debug message');
    expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
    expect(consoleLogSpy).not.toHaveBeenCalled();

    // Test in development environment
    process.env['NODE_ENV'] = 'development';
    logger.info('Info message');
    logger.debug('Debug message');
    expect(consoleInfoSpy).toHaveBeenCalledTimes(2);
    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
  });

  it('should include tenant schema in log messages when available', () => {
    // Mock request object with tenant schema
    const mockReq = { userContext: { tenantSchema: 'test_tenant' } } as any;
    logger.info('Test message', { req: mockReq });

    expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
    const logMessage = consoleInfoSpy.mock.calls[0][0];
    expect(logMessage).toContain(`"tenantSchema": "test_tenant"`);
  });

  it('should handle missing tenant schema gracefully', () => {
    // Mock request object without tenant schema
    const mockReq = {} as any;
    logger.info('Test message', { req: mockReq });

    expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
    const logMessage = consoleInfoSpy.mock.calls[0][0];
    expect(logMessage).not.toContain('tenantSchema':');
  });

  it('should handle errors during logging gracefully', () => {
    // Mock console.log to throw an error
    consoleInfoSpy.mockImplementation(() => {
      throw new Error('Logging failed');
    });

    // Should not throw an error
    expect(() => logger.info('Test message')).not.toThrow();
  });
});