import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { errorHandler, createError } from './errorHandler';

// Mock logger
jest.mock('@/utils/logger', () => ({
  logger: {
    error: jest.fn(),
  },
}));

describe('Error Handler Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    
    mockReq = {
      url: '/test',
      method: 'POST',
      ip: '127.0.0.1',
    };
    mockRes = {
      status: statusMock,
    };
    mockNext = jest.fn();
    
    jest.clearAllMocks();
  });

  describe('createError', () => {
    it('should create AppError with correct properties', () => {
      const error = createError('Test error', 400);
      
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
      expect(error.isOperational).toBe(true);
    });
  });

  describe('errorHandler', () => {
    it('should handle ZodError correctly', () => {
      const zodError = new ZodError([
        {
          code: 'invalid_type',
          expected: 'string',
          received: 'number',
          path: ['email'],
          message: 'Expected string, received number',
        },
      ]);

      errorHandler(zodError, mockReq as Request, mockRes as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Validation Error',
        details: [
          {
            field: 'email',
            message: 'Expected string, received number',
          },
        ],
      });
    });

    it('should handle AppError correctly', () => {
      const appError = createError('Custom error', 404);

      errorHandler(appError, mockReq as Request, mockRes as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Custom error',
      });
    });

    it('should handle UnauthorizedError', () => {
      const error = new Error('Unauthorized access');
      error.name = 'UnauthorizedError';

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Unauthorized',
      });
    });

    it('should handle ValidationError', () => {
      const error = new Error('Validation failed');
      error.name = 'ValidationError';

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Validation failed',
      });
    });

    it('should handle generic errors', () => {
      const error = new Error('Something went wrong');

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Internal Server Error',
      });
    });

    it('should include stack trace in development', () => {
      const originalEnv = process.env['NODE_ENV'];
      process.env['NODE_ENV'] = 'development';

      const error = new Error('Test error');
      error.stack = 'Error stack trace';

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Internal Server Error',
        stack: 'Error stack trace',
      });

      process.env['NODE_ENV'] = originalEnv;
    });
  });
});