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

healthRouter.get('/', (_req: Request, res: Response): void => {
  const healthStatus = getHealthStatus();
  
  const response: ApiResponse<HealthStatus> = {
    success: true,
    message: 'Service is healthy',
    data: healthStatus
  };
  
  res.json(response);
});