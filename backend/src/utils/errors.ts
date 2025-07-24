export class CustomError extends Error {
  public readonly statusCode: number;
  public readonly context?: any;

  constructor(message: string, statusCode: number = 500, context?: any) {
    super(message);
    this.name = 'CustomError';
    this.statusCode = statusCode;
    this.context = context;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CustomError);
    }
  }
}

export const createError = (
  message: string, 
  statusCode: number = 500, 
  context?: any
): CustomError => {
  return new CustomError(message, statusCode, context);
};

export const isCustomError = (error: any): error is CustomError => {
  return error instanceof CustomError;
};