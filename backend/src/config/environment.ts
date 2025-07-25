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
}

let cachedConfig: EnvironmentConfig | null = null;

export const validateEnvironment = (): void => {
  const requiredVars = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY', 
    'SUPABASE_SERVICE_ROLE_KEY',
    'JWT_SECRET'
  ];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      throw new Error(`${varName} is required`);
    }
  }

  // Validate SUPABASE_URL format
  const supabaseUrl = process.env['SUPABASE_URL'];
  if (supabaseUrl) {
    try {
      new URL(supabaseUrl);
    } catch {
      throw new Error('SUPABASE_URL must be a valid URL');
    }
  }

  // Validate PORT if provided
  const port = process.env['PORT'];
  if (port && isNaN(Number(port))) {
    throw new Error('PORT must be a valid number');
  }

  // Validate JWT_SECRET length
  const jwtSecret = process.env['JWT_SECRET'];
  if (jwtSecret && jwtSecret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
  }
};

export const getConfig = (): EnvironmentConfig => {
  // In test environment, don't use cache to allow environment changes
  if (process.env['NODE_ENV'] !== 'test' && cachedConfig) {
    return { ...cachedConfig }; // Return a copy to prevent modification
  }

  validateEnvironment();

  const config: EnvironmentConfig = {
    nodeEnv: process.env['NODE_ENV'] || 'development',
    port: Number(process.env['PORT']) || 3001,
    supabase: {
      url: process.env['SUPABASE_URL']!,
      anonKey: process.env['SUPABASE_ANON_KEY']!,
      serviceRoleKey: process.env['SUPABASE_SERVICE_ROLE_KEY']!
    },
    jwt: {
      secret: process.env['JWT_SECRET']!
    },
    cors: {
      origin: process.env['FRONTEND_URL'] || 'http://localhost:5173'
    }
  };

  // Only cache in non-test environments
  if (process.env['NODE_ENV'] !== 'test') {
    cachedConfig = { ...config };
  }
  
  return { ...config }; // Return a copy to prevent modification
};