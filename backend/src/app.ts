import express from 'express';
import cors from 'cors';
import { healthRouter } from './routes/health';
import { errorHandler } from './middleware/errorHandler';
import { getConfig } from './config/environment';
import { ApiResponse } from './types';
import { CustomError } from './utils/errors';

export const createApp = (options: { addTestRoutes?: boolean } = {}): express.Application => {
  const app = express();

  try {
    // Load configuration (this will throw an error if invalid)
    getConfig();

    // Middleware
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Routes
    app.use('/api/health', healthRouter);

    // Optional test routes for integration testing
    if (options.addTestRoutes) {
      app.get('/api/test-env', (_req, res) => {
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

      app.post('/api/test-validation', (req, res) => {
        const { body } = req;
        if (!body.requiredField) {
          throw new CustomError('Validation failed', 400, {
            requiredField: 'This field is required'
          });
        }
        res.json({ success: true, data: body });
      });
    }

    // 404 handler
    app.use((_req, res) => {
      const response: ApiResponse = {
        success: false,
        message: 'Not Found',
        statusCode: 404
      };
      res.status(404).json(response);
    });

    // Error handling middleware (must be last)
    app.use(errorHandler);

    return app;
  } catch (error) {
    // If there's an error during setup, re-throw it
    console.error('Error during app setup:', error);
    throw error;
  }
};