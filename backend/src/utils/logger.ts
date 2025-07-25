import winston from 'winston';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

// Enhanced configuration interface
interface LoggerConfig {
  level?: string;
  format?: winston.Logform.Format;
  transports?: winston.transport[];
  defaultMeta?: any;
}

// Transport configuration interfaces
interface FileTransportConfig {
  filename: string;
  level?: string;
  maxsize?: number;
  maxFiles?: number;
}

interface RemoteTransportConfig {
  url: string;
  level?: string;
  headers?: Record<string, string>;
}

interface TransportConfig {
  console?: boolean | { level?: string };
  file?: FileTransportConfig;
  remote?: RemoteTransportConfig;
}

// Context management
let logContext: Record<string, any> = {};

// Sensitive data patterns for sanitization
const SENSITIVE_PATTERNS = [
  'password',
  'token',
  'secret',
  'key',
  'auth',
  'credential',
  'creditCard',
  'ssn',
  'pin'
];

// Utility functions
export const generateCorrelationId = (): string => {
  return randomUUID();
};

const sanitizeData = (data: any): any => {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(sanitizeData);
  }

  const sanitized: any = {};
  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();
    const isSensitive = SENSITIVE_PATTERNS.some(pattern => 
      lowerKey.includes(pattern.toLowerCase())
    );
    
    if (isSensitive && key !== 'email') { // Preserve email for debugging
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object') {
      sanitized[key] = sanitizeData(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
};

const formatError = (error: Error): any => {
  return {
    name: error.name,
    message: error.message,
    stack: error.stack
  };
};

// Enhanced format with error handling and sanitization
const createEnhancedFormat = () => {
  return winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.printf((info) => {
      const { timestamp, level, message, service, ...meta } = info;
      
      // Handle error objects
      if (meta['error'] instanceof Error) {
        meta['error'] = formatError(meta['error']);
      }
      
      // Sanitize sensitive data
      const sanitizedMeta = sanitizeData(meta);
      
      // Add context
      const contextData = { ...logContext };
      
      const logEntry = {
        timestamp,
        level,
        message,
        service,
        ...contextData,
        ...sanitizedMeta
      };
      
      return JSON.stringify(logEntry);
    })
  );
};

// Basic logger configuration
const config: LoggerConfig = {
  level: process.env['NODE_ENV'] === 'production' ? 'info' : 'debug',
  format: createEnhancedFormat(),
  defaultMeta: { service: 'aialpha-backend' },
  transports: [
    new winston.transports.Console(),
  ],
};

export const logger = winston.createLogger(config);

// Enhanced logger factories
export const createLoggerWithCorrelation = (correlationId: string): winston.Logger => {
  return winston.createLogger({
    ...config,
    defaultMeta: { 
      ...config.defaultMeta, 
      correlationId 
    }
  });
};

export const createLoggerWithTransports = (transportConfig: TransportConfig): winston.Logger => {
  const transports: winston.transport[] = [];
  
  // Console transport
  if (transportConfig.console) {
    const consoleLevel = typeof transportConfig.console === 'object' 
      ? transportConfig.console.level || 'debug'
      : 'debug';
    transports.push(new winston.transports.Console({ level: consoleLevel }));
  }
  
  // File transport
  if (transportConfig.file) {
    transports.push(new winston.transports.File({
      filename: transportConfig.file.filename,
      level: transportConfig.file.level || 'info',
      maxsize: transportConfig.file.maxsize || 5242880, // 5MB
      maxFiles: transportConfig.file.maxFiles || 5
    }));
  }
  
  // Remote transport (HTTP)
  if (transportConfig.remote) {
    transports.push(new winston.transports.Http({
      host: new URL(transportConfig.remote.url).hostname,
      port: parseInt(new URL(transportConfig.remote.url).port) || 80,
      path: new URL(transportConfig.remote.url).pathname,
      level: transportConfig.remote.level || 'error'
    }));
  }
  
  return winston.createLogger({
    ...config,
    transports
  });
};

// Performance-optimized logger
export const createPerformantLogger = (): winston.Logger => {
  return winston.createLogger({
    level: 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    defaultMeta: { service: 'aialpha-backend' },
    transports: [
      new winston.transports.Console({
        handleExceptions: false,
        handleRejections: false
      })
    ]
  });
};

// Async logger for non-blocking operations
export const createAsyncLogger = (): winston.Logger => {
  const asyncLogger = winston.createLogger({
    ...config,
    transports: [
      new winston.transports.Console({
        handleExceptions: false,
        handleRejections: false
      })
    ]
  });
  
  // Override methods to be async
  const originalInfo = asyncLogger.info.bind(asyncLogger);
  (asyncLogger as any).info = (message: string, meta?: any) => {
    setImmediate(() => originalInfo(message, meta));
    return asyncLogger;
  };
  
  return asyncLogger;
};

// Buffered logger for batching
interface BufferedLoggerConfig {
  bufferSize: number;
  flushInterval: number;
}

export const createBufferedLogger = (config: BufferedLoggerConfig) => {
  const buffer: any[] = [];
  const baseLogger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [new winston.transports.Console()]
  });
  
  const flush = () => {
    if (buffer.length > 0) {
      buffer.forEach(entry => baseLogger.log(entry));
      buffer.length = 0;
    }
  };
  
  // Auto-flush interval
  setInterval(flush, config.flushInterval);
  
  const bufferedLogger = {
    info: (message: string, meta?: any) => {
      buffer.push({ level: 'info', message, ...meta });
      if (buffer.length >= config.bufferSize) {
        flush();
      }
    },
    warn: (message: string, meta?: any) => {
      buffer.push({ level: 'warn', message, ...meta });
      if (buffer.length >= config.bufferSize) {
        flush();
      }
    },
    error: (message: string, meta?: any) => {
      buffer.push({ level: 'error', message, ...meta });
      if (buffer.length >= config.bufferSize) {
        flush();
      }
    },
    debug: (message: string, meta?: any) => {
      buffer.push({ level: 'debug', message, ...meta });
      if (buffer.length >= config.bufferSize) {
        flush();
      }
    },
    flush,
    getBufferSize: () => buffer.length
  };
  
  return bufferedLogger;
};

// Structured logger with consistent format
export const createStructuredLogger = (): winston.Logger => {
  return winston.createLogger({
    level: 'debug',
    format: createEnhancedFormat(),
    defaultMeta: { service: 'aialpha-backend' },
    transports: [
      new winston.transports.Console()
    ]
  });
};

// Context-aware logging
export const createContextLogger = (): winston.Logger => {
  return winston.createLogger({
    level: 'debug',
    format: createEnhancedFormat(),
    defaultMeta: { service: 'aialpha-backend' },
    transports: [
      new winston.transports.Console()
    ]
  });
};

export const setLogContext = (context: Record<string, any>): void => {
  logContext = { ...logContext, ...context };
};

export const withLogContext = <T>(context: Record<string, any>, fn: () => T): T => {
  const previousContext = { ...logContext };
  logContext = { ...logContext, ...context };
  
  try {
    return fn();
  } finally {
    logContext = previousContext;
  }
};

// Correlation ID middleware
export const correlationMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const correlationId = req.headers['x-correlation-id'] as string || generateCorrelationId();
  (req as any).correlationId = correlationId;
  
  // Set correlation ID in response headers
  res.setHeader('x-correlation-id', correlationId);
  
  // Set in log context for this request
  setLogContext({ correlationId });
  
  next();
};