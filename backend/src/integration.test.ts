import request from 'supertest';
import { createApp } from './app';
import { ApiResponse, HealthStatus } from './types';
import { CustomError } from './utils/errors';

describe('Phase 2: Comprehensive Integration Testing', () => {
  let app: any;

  beforeAll(() => {
    // Set a test-specific environment variable to prevent config validation failure
    process.env['SUPABASE_URL'] = 'https://test.supabase.co';
    process.env['NODE_ENV'] = 'test';
    app = createApp({ addTestRoutes: true });
  });

  afterAll(() => {
    // Clean up environment variables
    delete process.env['SUPABASE_URL'];
    delete process.env['NODE_ENV'];
  });

  describe('Environment Configuration', () => {
    it('should access environment variables in health check endpoint', async () => {
      process.env['TEST_ENV_VAR'] = 'integration_test_value';

      const response = await request(app)
        .get('/api/test-env')
        .expect(200);

      const body: ApiResponse<any> = response.body;
      expect(body.success).toBe(true);
      expect(body.data.nodeEnv).toBeDefined();
      expect(body.data.port).toBeDefined();
      expect(body.data.testEnvVar).toBe('integration_test_value');
    });

     it('should validate required environment variables on app startup', async () => {
      const originalSupabaseUrl = process.env['SUPABASE_URL'];
      delete process.env['SUPABASE_URL'];

      let errorWasThrown = false;
      try {
        createApp();
      } catch (e: unknown) {
        errorWasThrown = true;
        expect(e).toBeInstanceOf(Error);
        if (e instanceof Error) {
          expect(e.message).toContain('Environment validation failed');
        }
      }

      expect(errorWasThrown).toBe(true);

      if (originalSupabaseUrl) {
        process.env['SUPABASE_URL'] = originalSupabaseUrl;
      }
    });
  });

  describe('Health Check Endpoint', () => {
    it('should load configuration in health check endpoint', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      const body: ApiResponse<HealthStatus> = response.body;
      expect(body.success).toBe(true);
      expect(body.data?.service).toBe('aialpha-backend');
    });

      it('should handle unexpected errors in health check', async () => {
       // Temporarily modify health route to throw an error
       const originalHealthRoute = app._router.stack.find((layer: any) => 
         layer.route && layer.route.path === '/');

       app._router.stack = app._router.stack.filter((layer: any) => 
         !(layer.route && layer.route.path === '/'));

       app.use('/api/health', (_req: any, _res: any) => {
         throw new Error('Simulated health check failure');
       });

       const response = await request(app)
         .get('/api/health')
         .expect(500);

       const body: ApiResponse<any> = response.body;
       expect(body.success).toBe(false);
       expect(body.message).toBe('Internal server error');
       expect(body.errors?.[0]).toContain('Simulated health check failure');

       // Restore original health route
       if (originalHealthRoute) {
         app._router.stack.push(originalHealthRoute);
       }
     });  });
  describe('Error Handling Middleware', () => {
    it('should handle 404 Not Found errors', async () => {
      const response = await request(app)
        .get('/api/non-existent-route')
        .expect(404);

      const body: ApiResponse<any> = response.body;
      expect(body.success).toBe(false);
      expect(body.message).toBe('Not Found');
    });

    it('should handle validation errors with structured response', async () => {
      // Add a test route that triggers validation error
      app.post('/api/test-validation', (req: any, res: any) => {
        const { body } = req;
        if (!body.requiredField) {
          throw new CustomError('Validation failed', 400, {
            requiredField: 'This field is required'
          });
        }
        res.json({ success: true, data: body });
      });

      const response = await request(app)
        .post('/api/test-validation')
        .send({})
        .expect(400);

      const body: ApiResponse<any> = response.body;
      expect(body.success).toBe(false);
      expect(body.message).toBe('Validation failed');
    });
  });
});