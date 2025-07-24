import express from 'express';
import cors from 'cors';
import { healthRouter } from './routes/health';
import { errorHandler } from './middleware/errorHandler';

export const createApp = (): express.Application => {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Routes
  app.use('/api/health', healthRouter);

  // Error handling middleware (must be last)
  app.use(errorHandler);

  return app;
};