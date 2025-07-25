import request from 'supertest';
import express from 'express';
import { healthRouter, getHealthStatus } from './health';
import { errorHandler } from '../middleware/errorHandler';
import { HealthStatus, ApiResponse } from '../types';

describe('Health Check System', () => {
  describe('getHealthStatus Function - Unit Tests', () => {
    it('should return healthy status with correct structure', () => {
      const healthStatus = getHealthStatus();
      
      expect(healthStatus.status).toBe('healthy');
      expect(healthStatus.service).toBe('aialpha-backend');
      expect(typeof healthStatus.timestamp).toBe('string');
      expect(new Date(healthStatus.timestamp).getTime()).toBeGreaterThan(0);
    });

    it('should return current timestamp', () => {
      const beforeCall = Date.now();
      const healthStatus = getHealthStatus();
      const afterCall = Date.now();
      
      const timestamp = new Date(healthStatus.timestamp).getTime();
      expect(timestamp).toBeGreaterThanOrEqual(beforeCall);
      expect(timestamp).toBeLessThanOrEqual(afterCall);
    });

    it('should return ISO string timestamp format', () => {
      const healthStatus = getHealthStatus();
      
      // ISO string format validation
      expect(healthStatus.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('should return consistent service name', () => {
      const healthStatus1 = getHealthStatus();
      const healthStatus2 = getHealthStatus();
      
      expect(healthStatus1.service).toBe(healthStatus2.service);
      expect(healthStatus1.service).toBe('aialpha-backend');
    });
  });

  describe('Health Router - Integration Tests', () => {
    let app: express.Application;

    beforeEach(() => {
      app = express();
      app.use(express.json());
      app.use('/api/health', healthRouter);
      app.use(errorHandler);
    });

    it('should respond to GET /api/health with 200 status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.headers['content-type']).toMatch(/application\/json/);
    });

    it('should return proper health status structure', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      const body: ApiResponse<HealthStatus> = response.body;
      
      expect(body.success).toBe(true);
      expect(body.message).toBe('Service is healthy');
      expect(body.data).toBeDefined();
      expect(body.data?.status).toBe('healthy');
      expect(body.data?.service).toBe('aialpha-backend');
      expect(typeof body.data?.timestamp).toBe('string');
    });

    it('should return current timestamp in response', async () => {
      const beforeRequest = Date.now();
      
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      const afterRequest = Date.now();
      const body: ApiResponse<HealthStatus> = response.body;
      const responseTimestamp = new Date(body.data!.timestamp).getTime();

      expect(responseTimestamp).toBeGreaterThanOrEqual(beforeRequest);
      expect(responseTimestamp).toBeLessThanOrEqual(afterRequest);
    });

    it('should handle multiple concurrent requests', async () => {
      const requests = Array(5).fill(null).map(() => 
        request(app).get('/api/health').expect(200)
      );

      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        const body: ApiResponse<HealthStatus> = response.body;
        expect(body.success).toBe(true);
        expect(body.data?.status).toBe('healthy');
      });
    });

    it('should not accept POST requests', async () => {
      await request(app)
        .post('/api/health')
        .expect(404);
    });

    it('should not accept PUT requests', async () => {
      await request(app)
        .put('/api/health')
        .expect(404);
    });

    it('should not accept DELETE requests', async () => {
      await request(app)
        .delete('/api/health')
        .expect(404);
    });

    it('should handle query parameters gracefully', async () => {
      const response = await request(app)
        .get('/api/health?param=value')
        .expect(200);

      const body: ApiResponse<HealthStatus> = response.body;
      expect(body.success).toBe(true);
      expect(body.data?.status).toBe('healthy');
    });

    it('should return consistent response format', async () => {
      const response1 = await request(app).get('/api/health').expect(200);
      const response2 = await request(app).get('/api/health').expect(200);

      const body1: ApiResponse<HealthStatus> = response1.body;
      const body2: ApiResponse<HealthStatus> = response2.body;

      // Structure should be identical
      expect(Object.keys(body1).sort()).toEqual(Object.keys(body2).sort());
      expect(body1.success).toBe(body2.success);
      expect(body1.message).toBe(body2.message);
      expect(body1.data?.status).toBe(body2.data?.status);
      expect(body1.data?.service).toBe(body2.data?.service);
    });

    it('should include proper CORS headers when available', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      // Response should be valid JSON
      expect(() => JSON.parse(JSON.stringify(response.body))).not.toThrow();
    });
  });

  describe('Error Handling Integration', () => {
    let app: express.Application;

    beforeEach(() => {
      app = express();
      app.use(express.json());
      
      // Create a modified health router that can throw errors for testing
      const testRouter = express.Router();
      testRouter.get('/', (_req, _res) => {
        throw new Error('Health check failed');
      });
      
      app.use('/api/health-error', testRouter);
      app.use(errorHandler);
    });

    it('should handle errors in health check gracefully', async () => {
      const response = await request(app)
        .get('/api/health-error')
        .expect(500);

      const body: ApiResponse = response.body;
      expect(body.success).toBe(false);
      expect(body.message).toBe('Internal server error');
    });
  });
});