import express from 'express';
import cors from 'cors';
import { healthRouter } from './routes/health';
import { errorHandler } from './middleware/errorHandler';
import { getConfig } from './config/environment';

export const createApp = (): express.Application => {
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

    // Error handling middleware (must be last)
    app.use(errorHandler);

    return app;
  } catch (error) {
    // If there's an error during setup, re-throw it
    console.error('Error during app setup:', error);
    throw error;
  }
};