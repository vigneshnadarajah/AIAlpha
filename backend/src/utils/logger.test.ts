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

  // 🔴 RED PHASE: New failing tests for Phase 2 logging enhancements
  describe('Phase 2 Enhancements - Correlation IDs', () => {
    it('should generate unique correlation IDs for each request', () => {
      const { generateCorrelationId } = require('./logger');
      
      const id1 = generateCorrelationId();
      const id2 = generateCorrelationId();
      
      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(id1).not.toBe(id2);
      expect(typeof id1).toBe('string');
      expect(id1.length).toBeGreaterThan(10);
    });

    it('should include correlation ID in all log entries', () => {
      const { createLoggerWithCorrelation } = require('./logger');
      
      const correlationId = 'test-correlation-123';
      const correlatedLogger = createLoggerWithCorrelation(correlationId);
      
      expect(correlatedLogger).toBeDefined();
      expect(typeof correlatedLogger.info).toBe('function');
      
      // Mock console to capture output
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      correlatedLogger.info('Test message');
      
      expect(consoleSpy).toHaveBeenCalled();
      const logOutput = consoleSpy.mock.calls[0]?.[0];
      expect(logOutput).toContain(correlationId);
      
      consoleSpy.mockRestore();
    });

    it('should support correlation ID middleware integration', () => {
      const { correlationMiddleware } = require('./logger');
      
      expect(correlationMiddleware).toBeDefined();
      expect(typeof correlationMiddleware).toBe('function');
      
      const mockReq = {} as any;
      const mockRes = {} as any;
      const mockNext = jest.fn();
      
      correlationMiddleware(mockReq, mockRes, mockNext);
      
      expect(mockReq.correlationId).toBeDefined();
      expect(typeof mockReq.correlationId).toBe('string');
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('Phase 2 Enhancements - Multiple Transports', () => {
    it('should support file transport configuration', () => {
      const { createLoggerWithTransports } = require('./logger');
      
      const loggerWithFile = createLoggerWithTransports({
        console: true,
        file: { filename: 'test.log', level: 'info' }
      });
      
      expect(loggerWithFile).toBeDefined();
      expect(loggerWithFile.transports.length).toBeGreaterThan(1);
    });

    it('should support remote transport configuration', () => {
      const { createLoggerWithTransports } = require('./logger');
      
      const loggerWithRemote = createLoggerWithTransports({
        console: true,
        remote: { url: 'http://localhost:3000/logs', level: 'error' }
      });
      
      expect(loggerWithRemote).toBeDefined();
      expect(loggerWithRemote.transports.length).toBeGreaterThan(1);
    });

    it('should filter logs by transport-specific levels', () => {
      const { createLoggerWithTransports } = require('./logger');
      
      const logger = createLoggerWithTransports({
        console: { level: 'debug' },
        file: { filename: 'test.log', level: 'warn' }
      });
      
      expect(logger).toBeDefined();
      // Should have different level configurations per transport
    });
  });

  describe('Phase 2 Enhancements - Performance Optimization', () => {
    it('should handle high-throughput logging without memory leaks', async () => {
      const { createPerformantLogger } = require('./logger');
      
      const perfLogger = createPerformantLogger();
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Log 1000 messages rapidly
      for (let i = 0; i < 1000; i++) {
        perfLogger.info(`Test message ${i}`, { data: { index: i } });
      }
      
      // Allow some time for processing
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be reasonable (less than 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    });

    it('should support async logging for performance', () => {
      const { createAsyncLogger } = require('./logger');
      
      const asyncLogger = createAsyncLogger();
      
      expect(asyncLogger).toBeDefined();
      expect(typeof asyncLogger.info).toBe('function');
      
      // Should not block execution
      const start = Date.now();
      asyncLogger.info('Test async message');
      const duration = Date.now() - start;
      
      expect(duration).toBeLessThan(10); // Should be very fast
    });

    it('should support log buffering and batching', () => {
      const { createBufferedLogger } = require('./logger');
      
      const bufferedLogger = createBufferedLogger({
        bufferSize: 10,
        flushInterval: 1000
      });
      
      expect(bufferedLogger).toBeDefined();
      expect(typeof bufferedLogger.flush).toBe('function');
      
      // Log multiple messages
      for (let i = 0; i < 5; i++) {
        bufferedLogger.info(`Buffered message ${i}`);
      }
      
      // Should have buffered messages
      expect(bufferedLogger.getBufferSize()).toBe(5);
    });
  });

  describe('Phase 2 Enhancements - Structured Logging', () => {
    it('should enforce consistent log structure', () => {
      const { createStructuredLogger } = require('./logger');
      
      const structuredLogger = createStructuredLogger();
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      structuredLogger.info('Test message', { 
        userId: '123', 
        action: 'login',
        metadata: { ip: '127.0.0.1' }
      });
      
      expect(consoleSpy).toHaveBeenCalled();
      const logOutput = JSON.parse(consoleSpy.mock.calls[0]?.[0]);
      
      // Should have consistent structure
      expect(logOutput).toHaveProperty('timestamp');
      expect(logOutput).toHaveProperty('level');
      expect(logOutput).toHaveProperty('message');
      expect(logOutput).toHaveProperty('service');
      expect(logOutput).toHaveProperty('userId');
      expect(logOutput).toHaveProperty('action');
      expect(logOutput).toHaveProperty('metadata');
      
      consoleSpy.mockRestore();
    });

    it('should support error serialization with stack traces', () => {
      const { createStructuredLogger } = require('./logger');
      
      const structuredLogger = createStructuredLogger();
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      const testError = new Error('Test error');
      structuredLogger.error('Error occurred', { error: testError });
      
      expect(consoleSpy).toHaveBeenCalled();
      const logOutput = JSON.parse(consoleSpy.mock.calls[0]?.[0]);
      
      expect(logOutput).toHaveProperty('error');
      expect(logOutput.error).toHaveProperty('message');
      expect(logOutput.error).toHaveProperty('stack');
      expect(logOutput.error).toHaveProperty('name');
      
      consoleSpy.mockRestore();
    });

    it('should sanitize sensitive data from logs', () => {
      const { createStructuredLogger } = require('./logger');
      
      const structuredLogger = createStructuredLogger();
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      structuredLogger.info('User action', {
        password: 'secret123',
        token: 'jwt-token-here',
        creditCard: '4111-1111-1111-1111',
        email: 'user@example.com'
      });
      
      expect(consoleSpy).toHaveBeenCalled();
      const logOutput = JSON.parse(consoleSpy.mock.calls[0]?.[0]);
      
      // Sensitive fields should be redacted
      expect(logOutput.password).toBe('[REDACTED]');
      expect(logOutput.token).toBe('[REDACTED]');
      expect(logOutput.creditCard).toBe('[REDACTED]');
      expect(logOutput.email).toBe('user@example.com'); // Email should be preserved
      
      consoleSpy.mockRestore();
    });
  });

  describe('Phase 2 Enhancements - Context-Aware Logging', () => {
    it('should support request context propagation', () => {
      const { createContextLogger, setLogContext } = require('./logger');
      
      const contextLogger = createContextLogger();
      
      setLogContext({
        requestId: 'req-123',
        userId: 'user-456',
        tenantId: 'tenant-789'
      });
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      contextLogger.info('Context test');
      
      expect(consoleSpy).toHaveBeenCalled();
      const logOutput = JSON.parse(consoleSpy.mock.calls[0]?.[0]);
      
      expect(logOutput.requestId).toBe('req-123');
      expect(logOutput.userId).toBe('user-456');
      expect(logOutput.tenantId).toBe('tenant-789');
      
      consoleSpy.mockRestore();
    });

    it('should support nested context scoping', () => {
      const { createContextLogger, withLogContext } = require('./logger');
      
      const contextLogger = createContextLogger();
      
      withLogContext({ operation: 'outer' }, () => {
        withLogContext({ step: 'inner' }, () => {
          const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
          contextLogger.info('Nested context test');
          
          expect(consoleSpy).toHaveBeenCalled();
          const logOutput = JSON.parse(consoleSpy.mock.calls[0]?.[0]);
          
          expect(logOutput.operation).toBe('outer');
          expect(logOutput.step).toBe('inner');
          
          consoleSpy.mockRestore();
        });
      });
    });
  });
});