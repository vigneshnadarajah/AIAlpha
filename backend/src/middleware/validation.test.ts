import request from 'supertest';
import express from 'express';
import { z } from 'zod';
import { validateRequest, createValidationMiddleware } from './validation';
import { ApiResponse } from '../types';

describe('Validation Middleware', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
  });

  describe('validateRequest middleware', () => {
    it('should pass valid request data through', async () => {
      const schema = z.object({
        name: z.string().min(2),
        email: z.string().email()
      });

      app.post('/test', validateRequest({ body: schema }), (_req, res) => {
        res.json({ success: true, data: _req.body });
      });

      const validData = {
        name: 'John Doe',
        email: 'john@example.com'
      };

      const response = await request(app)
        .post('/test')
        .send(validData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('John Doe');
    });

    it('should reject invalid request body with 400 status', async () => {
      const schema = z.object({
        name: z.string().min(2),
        email: z.string().email()
      });

      app.post('/test', validateRequest({ body: schema }), (_req, res) => {
        res.json({ success: true });
      });

      const invalidData = {
        name: 'A',
        email: 'invalid-email'
      };

      const response = await request(app)
        .post('/test')
        .send(invalidData)
        .expect(400);

      const body: ApiResponse = response.body;
      expect(body.success).toBe(false);
      expect(body.message).toBe('Validation failed');
      expect(body.errors).toBeDefined();
      expect(body.errors?.length).toBeGreaterThan(0);
    });

    it('should validate query parameters', async () => {
      const schema = z.object({
        page: z.string().transform(Number).pipe(z.number().min(1)),
        limit: z.string().transform(Number).pipe(z.number().max(100))
      });

      app.get('/test', validateRequest({ query: schema }), (_req, res) => {
        res.json({ success: true, query: _req.query });
      });

      const response = await request(app)
        .get('/test?page=1&limit=10')
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should validate URL parameters', async () => {
      const schema = z.object({
        id: z.string().uuid(),
        tenantId: z.string().min(1)
      });

      app.get('/test/:tenantId/:id', validateRequest({ params: schema }), (_req, res) => {
        res.json({ success: true, params: _req.params });
      });

      const validUuid = '123e4567-e89b-12d3-a456-426614174000';
      
      const response = await request(app)
        .get(`/test/tenant123/${validUuid}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should handle validation errors with proper error format', async () => {
      const schema = z.object({
        nested: z.object({
          field: z.string().min(5)
        }),
        array: z.array(z.number().positive()).min(1)
      });

      app.post('/test', validateRequest({ body: schema }), (_req, res) => {
        res.json({ success: true });
      });

      const invalidData = {
        nested: { field: 'abc' },
        array: [-1, 0]
      };

      const response = await request(app)
        .post('/test')
        .send(invalidData)
        .expect(400);

      const body: ApiResponse = response.body;
      expect(body.errors).toBeDefined();
      expect(body.errors?.some(error => error.includes('nested.field'))).toBe(true);
    });
  });

  describe('createValidationMiddleware factory', () => {
    it('should create middleware with custom error handling', async () => {
      const schema = z.object({
        value: z.number().min(10)
      });

      const customMiddleware = createValidationMiddleware({
        schema: { body: schema },
        onError: (errors) => ({
          success: false,
          message: 'Custom validation error',
          statusCode: 422,
          errors
        })
      });

      app.post('/test', customMiddleware, (_req, res) => {
        res.json({ success: true });
      });

      const response = await request(app)
        .post('/test')
        .send({ value: 5 })
        .expect(422);

      expect(response.body.message).toBe('Custom validation error');
    });

    it('should support data transformation', async () => {
      const schema = z.object({
        price: z.string().transform(Number),
        tags: z.string().transform(str => str.split(','))
      });

      app.post('/test', validateRequest({ body: schema }), (_req, res) => {
        res.json({ success: true, transformed: _req.body });
      });

      const response = await request(app)
        .post('/test')
        .send({ price: '99.99', tags: 'tag1,tag2,tag3' })
        .expect(200);

      expect(response.body.transformed.price).toBe(99.99);
      expect(response.body.transformed.tags).toEqual(['tag1', 'tag2', 'tag3']);
    });
  });

  describe('Multi-tenant validation', () => {
    it('should validate tenant context in requests', async () => {
      const schema = z.object({
        data: z.string(),
        tenantId: z.string().uuid()
      });

      app.post('/test', validateRequest({ body: schema }), (_req, res) => {
        res.json({ success: true, tenantId: _req.body.tenantId });
      });

      const validData = {
        data: 'test data',
        tenantId: '123e4567-e89b-12d3-a456-426614174000'
      };

      const response = await request(app)
        .post('/test')
        .send(validData)
        .expect(200);

      expect(response.body.tenantId).toBe(validData.tenantId);
    });
  });

  describe('Performance and edge cases', () => {
    it('should handle large payloads efficiently', async () => {
      const schema = z.object({
        items: z.array(z.object({
          id: z.string(),
          value: z.number()
        })).max(1000)
      });

      const largeData = {
        items: Array.from({ length: 500 }, (_, i) => ({
          id: `item-${i}`,
          value: i
        }))
      };

      app.post('/test', validateRequest({ body: schema }), (_req, res) => {
        res.json({ success: true, count: _req.body.items.length });
      });

      const startTime = Date.now();
      const response = await request(app)
        .post('/test')
        .send(largeData)
        .expect(200);

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
      expect(response.body.count).toBe(500);
    });

    it('should handle malformed JSON gracefully', async () => {
      const schema = z.object({
        name: z.string()
      });

      app.post('/test', validateRequest({ body: schema }), (_req, res) => {
        res.json({ success: true });
      });

      const response = await request(app)
        .post('/test')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});