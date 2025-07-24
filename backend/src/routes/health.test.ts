import request from 'supertest';
import express from 'express';
import { healthRouter } from './health';

const app = express();
app.use('/health', healthRouter);

describe('Health Router', () => {
  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'AIAlpha Backend is healthy',
        timestamp: expect.any(String),
        environment: process.env.NODE_ENV,
      });
    });

    it('should return valid timestamp', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      const timestamp = new Date(response.body.timestamp);
      expect(timestamp).toBeInstanceOf(Date);
      expect(timestamp.getTime()).not.toBeNaN();
    });
  });
});