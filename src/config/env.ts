/**
 * Environment Configuration
 * Validates and provides typed access to environment variables
 */

interface Config {
  gemini: {
    apiKey: string;
  };
  app: {
    env: 'development' | 'production' | 'test';
    isProd: boolean;
    isDev: boolean;
  };
  api: {
    baseUrl: string;
  };
}

function getEnvVar(key: string, defaultValue?: string): string {
  const value = import.meta.env[key] || defaultValue;

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

function validateConfig(): Config {
  const nodeEnv = import.meta.env.MODE || 'development';

  return {
    gemini: {
      apiKey: getEnvVar('VITE_GEMINI_API_KEY', import.meta.env.GEMINI_API_KEY)
    },
    app: {
      env: nodeEnv as 'development' | 'production' | 'test',
      isProd: nodeEnv === 'production',
      isDev: nodeEnv === 'development'
    },
    api: {
      baseUrl: getEnvVar('VITE_API_URL', 'http://localhost:3001')
    }
  };
}

// Validate configuration on module load
export const config = validateConfig();

// Log configuration in development
if (config.app.isDev) {
  console.log('🔧 App Configuration:', {
    env: config.app.env,
    hasGeminiKey: !!config.gemini.apiKey,
    apiBaseUrl: config.api.baseUrl
  });
}
