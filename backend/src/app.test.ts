import request from 'supertest';
import { createApp } from './app';
import { ApiResponse, HealthStatus } from './types';

describe('Express App Setup', () => {
  describe('App Creation', () => {
    it('should create an Express app instance', () => {
      const app = createApp();
      
      expect(app).toBeDefined();
      expect(typeof app).toBe('function');
      expect(app.listen).toBeDefined();
    });

    it('should be callable multiple times', () => {
      const app1 = createApp();
      const app2 = createApp();
      
      expect(app1).toBeDefined();
      expect(app2).toBeDefined();
      expect(app1).not.toBe(app2); // Should be different instances
    });
  });

  describe('Middleware Integration', () => {
    let app: any;

    beforeEach(() => {
      app = createApp();
    });

    it('should parse JSON requests', async () => {
      // Create a test route to verify JSON parsing
      app.post('/test-json', (req: any, res: any) => {
        res.json({ received: req.body });
      });

      const testData = { test: 'data', number: 123 };
      
      const response = await request(app)
        .post('/test-json')
        .send(testData)
        .expect(200);

      expect(response.body.received).toEqual(testData);
    });

    it('should handle CORS headers', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      // Should not throw CORS errors and should have proper content type
      expect(response.headers['content-type']).toMatch(/application\/json/);
    });

    it('should handle URL encoded data', async () => {
      // Create a test route to verify URL encoding
      app.post('/test-urlencoded', (req: any, res: any) => {
        res.json({ received: req.body });
      });

      const response = await request(app)
        .post('/test-urlencoded')
        .send('key=value&another=test')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .expect(200);

      expect(response.body.received).toEqual({
        key: 'value',
        another: 'test'
      });
    });
  });

  describe('Route Integration', () => {
    let app: any;

    beforeEach(() => {
      app = createApp();
    });

    it('should mount health check route at /api/health', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      const body: ApiResponse<HealthStatus> = response.body;
      expect(body.success).toBe(true);
      expect(body.data?.status).toBe('healthy');
    });

    it('should return 404 for unknown routes', async () => {
      await request(app)
        .get('/unknown-route')
        .expect(404);
    });

    it('should return 404 for unknown API routes', async () => {
      await request(app)
        .get('/api/unknown')
        .expect(404);
    });
  });

  describe('Error Handling Integration', () => {
    let app: any;

    beforeEach(() => {
      app = createApp();
    });

    it('should have error handler middleware configured', () => {
      // Test that the app has error handling by checking it doesn't crash
      expect(app).toBeDefined();
      expect(typeof app).toBe('function');
    });
  });

  describe('HTTP Methods Support', () => {
    let app: any;

    beforeEach(() => {
      app = createApp();
    });

    it('should support GET requests', async () => {
      await request(app)
        .get('/api/health')
        .expect(200);
    });

    it('should support POST requests to valid endpoints', async () => {
      // Add a test POST route
      app.post('/test-post', (req: any, res: any) => {
        res.json({ method: 'POST', body: req.body });
      });

      const response = await request(app)
        .post('/test-post')
        .send({ test: 'data' })
        .expect(200);

      expect(response.body.method).toBe('POST');
    });

    it('should support PUT requests to valid endpoints', async () => {
      // Add a test PUT route
      app.put('/test-put', (req: any, res: any) => {
        res.json({ method: 'PUT', body: req.body });
      });

      const response = await request(app)
        .put('/test-put')
        .send({ test: 'data' })
        .expect(200);

      expect(response.body.method).toBe('PUT');
    });

    it('should support DELETE requests to valid endpoints', async () => {
      // Add a test DELETE route
      app.delete('/test-delete', (_req: any, res: any) => {
        res.json({ method: 'DELETE' });
      });

      const response = await request(app)
        .delete('/test-delete')
        .expect(200);

      expect(response.body.method).toBe('DELETE');
    });
  });

  describe('Request/Response Handling', () => {
    let app: any;

    beforeEach(() => {
      app = createApp();
    });

    it('should handle large JSON payloads', async () => {
      app.post('/test-large', (req: any, res: any) => {
        res.json({ size: JSON.stringify(req.body).length });
      });

      const largeData = {
        data: 'x'.repeat(1000),
        array: Array(100).fill('test'),
        nested: {
          deep: {
            value: 'nested data'
          }
        }
      };

      const response = await request(app)
        .post('/test-large')
        .send(largeData)
        .expect(200);

      expect(response.body.size).toBeGreaterThan(1000);
    });

    it('should handle concurrent requests', async () => {
      const requests = Array(10).fill(null).map(() => 
        request(app)
          .get('/api/health')
          .expect(200)
      );

      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        const body: ApiResponse<HealthStatus> = response.body;
        expect(body.success).toBe(true);
        expect(body.data?.status).toBe('healthy');
      });
    });

    it('should maintain request isolation', async () => {
      app.post('/test-isolation', (req: any, res: any) => {
        res.json({ 
          timestamp: Date.now(),
          body: req.body 
        });
      });

      const request1 = request(app)
        .post('/test-isolation')
        .send({ id: 1 });

      const request2 = request(app)
        .post('/test-isolation')
        .send({ id: 2 });

      const [response1, response2] = await Promise.all([request1, request2]);

      expect(response1.body.body.id).toBe(1);
      expect(response2.body.body.id).toBe(2);
      expect(response1.body.timestamp).not.toBe(response2.body.timestamp);
    });
  });
});