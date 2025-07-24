import { CustomError, createError, isCustomError } from './errors';

describe('Error Utilities', () => {
  describe('CustomError Class', () => {
    it('should create a custom error with message and status code', () => {
      const error = new CustomError('Test error', 400);
      
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
      expect(error.name).toBe('CustomError');
      expect(error instanceof Error).toBe(true);
    });

    it('should default to 500 status code when not provided', () => {
      const error = new CustomError('Server error');
      
      expect(error.message).toBe('Server error');
      expect(error.statusCode).toBe(500);
    });

    it('should include additional context when provided', () => {
      const context = { userId: '123', action: 'login' };
      const error = new CustomError('Login failed', 401, context);
      
      expect(error.message).toBe('Login failed');
      expect(error.statusCode).toBe(401);
      expect(error.context).toEqual(context);
    });
  });

  describe('createError Function', () => {
    it('should create a CustomError instance', () => {
      const error = createError('Test message', 404);
      
      expect(error instanceof CustomError).toBe(true);
      expect(error.message).toBe('Test message');
      expect(error.statusCode).toBe(404);
    });

    it('should default to 500 status code', () => {
      const error = createError('Default error');
      
      expect(error.statusCode).toBe(500);
    });

    it('should accept context parameter', () => {
      const context = { field: 'email' };
      const error = createError('Validation error', 400, context);
      
      expect(error.context).toEqual(context);
    });
  });

  describe('isCustomError Function', () => {
    it('should return true for CustomError instances', () => {
      const customError = new CustomError('Test', 400);
      
      expect(isCustomError(customError)).toBe(true);
    });

    it('should return false for regular Error instances', () => {
      const regularError = new Error('Regular error');
      
      expect(isCustomError(regularError)).toBe(false);
    });

    it('should return false for non-error objects', () => {
      expect(isCustomError({})).toBe(false);
      expect(isCustomError('string')).toBe(false);
      expect(isCustomError(null)).toBe(false);
      expect(isCustomError(undefined)).toBe(false);
    });
  });

  describe('Error Properties', () => {
    it('should maintain error stack trace', () => {
      const error = new CustomError('Stack test', 500);
      
      expect(error.stack).toBeDefined();
      expect(typeof error.stack).toBe('string');
      expect(error.stack).toContain('Stack test');
    });

    it('should be serializable to JSON', () => {
      const error = new CustomError('JSON test', 400, { field: 'test' });
      
      const serialized = JSON.stringify({
        message: error.message,
        statusCode: error.statusCode,
        context: error.context
      });
      
      const parsed = JSON.parse(serialized);
      expect(parsed.message).toBe('JSON test');
      expect(parsed.statusCode).toBe(400);
      expect(parsed.context).toEqual({ field: 'test' });
    });
  });
});