import { Router, Request, Response } from 'express';
import { logger } from '@/utils/logger';

const router = Router();

router.get('/', (req: Request, res: Response): void => {
  logger.debug('Health check requested');
  
  res.json({
    success: true,
    message: 'AIAlpha Backend is healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

export { router as healthRouter };