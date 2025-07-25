import request from 'supertest';
import { createApp } from './app';
import { ApiResponse, HealthStatus } from './types';
import { getConfig } from './config/environment';

describe('Phase 1 + Environment Configuration Integration', () => {
  let app: any;

  beforeAll(() => {
    app = createApp();
  });

  it('should access environment variables in health check endpoint', async () => {
    // Set test-specific environment variables
    process.env['TEST_ENV_VAR'] = 'integration_test_value';

    // Add a test route to access the environment variable
    app.get('/api/test-env', (_req: any, res: any) => {
      const config = getConfig();
      res.json({
        success: true,
        message: 'Environment test',
        data: {
          nodeEnv: config.nodeEnv,
          port: config.port,
          testEnvVar: process.env['TEST_ENV_VAR']
        }
      });
    });

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
      // Store the original value of SUPABASE_URL
      const originalSupabaseUrl = process.env['SUPABASE_URL'];

      // Clear required environment variables
      delete process.env['SUPABASE_URL'];

      let errorWasThrown = false;
      try {
        createApp();
      } catch (e) {
        errorWasThrown = true;
      }

      expect(errorWasThrown).toBe(true);

      // Restore the environment variable only if it existed before
      if (originalSupabaseUrl) {
        process.env['SUPABASE_URL'] = originalSupabaseUrl;
      }
    });
  it('should load configuration in health check endpoint', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect(200);

    const body: ApiResponse<HealthStatus> = response.body;
    expect(body.success).toBe(true);
    expect(body.data?.service).toBe('aialpha-backend');
  });
});