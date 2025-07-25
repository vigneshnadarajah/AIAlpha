import { z } from 'zod';

// Zod schemas for environment validation
const baseEnvironmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().transform(Number).pipe(z.number().min(1).max(65535)).default('3001'),
  SUPABASE_URL: z.string().url().transform(url => url.endsWith('/') ? url.slice(0, -1) : url), // Remove trailing slash
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  FRONTEND_URL: z.string().url().optional().default('http://localhost:5173'),
  ALLOWED_ORIGINS: z.string().optional().transform(origins => 
    origins ? origins.split(',').map(origin => origin.trim()) : []
  ),
  DB_POOL_SIZE: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional().default('5'),
  DB_TIMEOUT: z.string().transform(Number).pipe(z.number().min(1000)).optional().default('10000'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).optional().default('info'),
  LOG_FORMAT: z.enum(['json', 'simple']).optional().default('json')
});

// Environment-specific schema variations
const developmentSchema = baseEnvironmentSchema.extend({
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('debug'),
  DB_POOL_SIZE: z.string().transform(Number).pipe(z.number().min(1).max(100)).default('3')
});

const productionSchema = baseEnvironmentSchema.extend({
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('warn'),
  DB_POOL_SIZE: z.string().transform(Number).pipe(z.number().min(1).max(100)).default('10'),
  FRONTEND_URL: z.string().url() // Required in production
});

const testSchema = baseEnvironmentSchema.extend({
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('error'),
  DB_POOL_SIZE: z.string().transform(Number).pipe(z.number().min(1).max(100)).default('1')
});

// Export function to get environment-specific schema
export const getEnvironmentSchema = (env: string = process.env['NODE_ENV'] || 'development') => {
  switch (env) {
    case 'production':
      return productionSchema;
    case 'test':
      return testSchema;
    case 'development':
    default:
      return developmentSchema;
  }
};

// Infer TypeScript types from Zod schema
type BaseEnvironmentConfig = z.infer<typeof baseEnvironmentSchema>;

// Enhanced configuration interface with additional properties
export interface EnvironmentConfig {
  nodeEnv: string;
  port: number;
  supabase: {
    url: string;
    anonKey: string;
    serviceRoleKey: string;
  };
  jwt: {
    secret: string;
  };
  cors: {
    origin: string;
  };
  allowedOrigins: string[];
  database: {
    poolSize: number;
    timeout: number;
  };
  logging: {
    level: string;
    format: string;
  };
}

let cachedConfig: EnvironmentConfig | null = null;

export const validateEnvironment = (): void => {
  const schema = getEnvironmentSchema();
  
  try {
    schema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const validationError = new Error(`Environment validation failed: ${error.issues.map(issue => 
        `${issue.path.join('.')}: ${issue.message}`
      ).join(', ')}`);
      (validationError as any).issues = error.issues;
      (validationError as any).errors = error.issues;
      throw validationError;
    }
    throw error;
  }
};

export const getConfig = (): EnvironmentConfig => {
  // In test environment, don't use cache to allow environment changes
  if (process.env['NODE_ENV'] !== 'test' && cachedConfig) {
    return { ...cachedConfig }; // Return a copy to prevent modification
  }

  const schema = getEnvironmentSchema();
  
  let validatedEnv: BaseEnvironmentConfig;
  try {
    validatedEnv = schema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const validationError = new Error(`Environment validation failed: ${error.issues.map(issue => 
        `${issue.path.join('.')}: ${issue.message}`
      ).join(', ')}`);
      (validationError as any).issues = error.issues;
      (validationError as any).errors = error.issues;
      throw validationError;
    }
    throw error;
  }

  const config: EnvironmentConfig = {
    nodeEnv: validatedEnv.NODE_ENV,
    port: validatedEnv.PORT,
    supabase: {
      url: validatedEnv.SUPABASE_URL,
      anonKey: validatedEnv.SUPABASE_ANON_KEY,
      serviceRoleKey: validatedEnv.SUPABASE_SERVICE_ROLE_KEY
    },
    jwt: {
      secret: validatedEnv.JWT_SECRET
    },
    cors: {
      origin: validatedEnv.FRONTEND_URL || 'http://localhost:5173'
    },
    allowedOrigins: validatedEnv.ALLOWED_ORIGINS || [],
    database: {
      poolSize: validatedEnv.DB_POOL_SIZE || 5,
      timeout: validatedEnv.DB_TIMEOUT || 10000
    },
    logging: {
      level: validatedEnv.LOG_LEVEL || 'info',
      format: validatedEnv.LOG_FORMAT || 'json'
    }
  };

  // Only cache in non-test environments
  if (process.env['NODE_ENV'] !== 'test') {
    cachedConfig = { ...config };
  }
  
  return { ...config }; // Return a copy to prevent modification
};