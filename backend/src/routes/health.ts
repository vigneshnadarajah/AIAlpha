import { Router, Request, Response } from 'express';
import { HealthStatus, ApiResponse } from '../types';

export const getHealthStatus = (): HealthStatus => {
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'aialpha-backend'
  };
};

export const healthRouter = Router();

healthRouter.get('/', (req: Request, res: Response, next: Function): void => {
  try {
    // Use request method to prevent unused parameter warning
    if (req.method !== 'GET') {
      throw new Error('Invalid method');
    }

    const healthStatus = getHealthStatus();
    
    const response: ApiResponse<HealthStatus> = {
      success: true,
      message: 'Service is healthy',
      data: healthStatus
    };
    
    res.json(response);
  } catch (error) {
    next(error);
  }
});