import { z, ZodError } from 'zod';

export const formatValidationErrors = (error: ZodError): string[] => {
  return error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`);
};