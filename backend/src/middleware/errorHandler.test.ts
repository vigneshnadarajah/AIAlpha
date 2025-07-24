import request from 'supertest';
import express from 'express';
import { errorHandler } from './errorHandler';
import { createError } from '../utils/errors';
import { ApiResponse } from '../types';

describe('Error Handler Middleware', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
  });

  describe('Unit Tests', () => {
    it('should handle CustomError with status code', () => {
      const mockReq = {} as express.Request;
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      } as any;
      const mockNext = jest.fn();

      const error = createError('Custom error message', 400);
      
      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Custom error message',
        statusCode: 400
      });
    });

    it('should handle generic Error as 500', () => {
      const mockReq = {} as express.Request;
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      } as any;
      const mockNext = jest.fn();

      const error = new Error('Generic error');
      
      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Internal server error',
        statusCode: 500
      });
    });

    it('should handle Zod validation errors', () => {
      const mockReq = {} as express.Request;
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      } as any;
      const mockNext = jest.fn();

      const zodError = new Error('Validation failed');
      (zodError as any).name = 'ZodError';
      (zodError as any).errors = [
        { path: ['email'], message: 'Invalid email' },
        { path: ['password'], message: 'Password too short' }
      ];
      
      errorHandler(zodError, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Validation failed',
        statusCode: 400,
        errors: ['email: Invalid email', 'password: Password too short']
      });
    });
  });

  describe('Integration Tests', () => {
    beforeEach(() => {
      // Add test routes that throw different types of errors
      app.get('/custom-error', () => {
        throw createError('Custom error test', 400);
      });

      app.get('/generic-error', () => {
        throw new Error('Generic error test');
      });

      app.get('/validation-error', () => {
        const error = new Error('Validation failed');
        (error as any).name = 'ZodError';
        (error as any).errors = [
          { path: ['field1'], message: 'Field 1 is required' },
          { path: ['field2', 'nested'], message: 'Nested field invalid' }
        ];
        throw error;
      });

      app.get('/unauthorized-error', () => {
        throw createError('Access denied', 401);
      });

      app.get('/not-found-error', () => {
        throw createError('Resource not found', 404);
      });

      // Add error handler middleware
      app.use(errorHandler);
    });

    it('should handle custom 400 error via HTTP request', async () => {
      const response = await request(app)
        .get('/custom-error')
        .expect(400);

      const body: ApiResponse = response.body;
      expect(body.success).toBe(false);
      expect(body.message).toBe('Custom error test');
      expect(body.statusCode).toBe(400);
    });

    it('should handle generic error as 500 via HTTP request', async () => {
      const response = await request(app)
        .get('/generic-error')
        .expect(500);

      const body: ApiResponse = response.body;
      expect(body.success).toBe(false);
      expect(body.message).toBe('Internal server error');
      expect(body.statusCode).toBe(500);
    });

    it('should handle validation errors via HTTP request', async () => {
      const response = await request(app)
        .get('/validation-error')
        .expect(400);

      const body: ApiResponse = response.body;
      expect(body.success).toBe(false);
      expect(body.message).toBe('Validation failed');
      expect(body.statusCode).toBe(400);
      expect(body.errors).toEqual([
        'field1: Field 1 is required',
        'field2.nested: Nested field invalid'
      ]);
    });

    it('should handle 401 unauthorized error', async () => {
      const response = await request(app)
        .get('/unauthorized-error')
        .expect(401);

      const body: ApiResponse = response.body;
      expect(body.success).toBe(false);
      expect(body.message).toBe('Access denied');
      expect(body.statusCode).toBe(401);
    });

    it('should handle 404 not found error', async () => {
      const response = await request(app)
        .get('/not-found-error')
        .expect(404);

      const body: ApiResponse = response.body;
      expect(body.success).toBe(false);
      expect(body.message).toBe('Resource not found');
      expect(body.statusCode).toBe(404);
    });

    it('should return proper Content-Type header', async () => {
      const response = await request(app)
        .get('/custom-error')
        .expect(400);

      expect(response.headers['content-type']).toMatch(/application\/json/);
    });
  });
});