import { z } from 'zod';

// Server-side environment variables
const serverEnvSchema = z.object({
  MAPBOX_SECRET_TOKEN: z.string().min(1, 'MAPBOX_SECRET_TOKEN is required'),
  OPENROUTER_API_KEY: z.string().min(1, 'OPENROUTER_API_KEY is required'),
  SUPABASE_URL: z.string().url('SUPABASE_URL must be a valid URL'),
  SUPABASE_ANON_KEY: z.string().min(1, 'SUPABASE_ANON_KEY is required'),
  SUPABASE_SERVICE_KEY: z.string().min(1, 'SUPABASE_SERVICE_KEY is required'),
  TOKEN_SECRET: z.string().min(16, 'TOKEN_SECRET must be at least 16 characters'),
});

// Client-side environment variables (must be prefixed with NEXT_PUBLIC_)
const clientEnvSchema = z.object({
  NEXT_PUBLIC_MAPBOX_TOKEN: z.string().min(1, 'NEXT_PUBLIC_MAPBOX_TOKEN is required'),
});

// Validate server environment variables (only on server)
function validateServerEnv() {
  if (typeof window !== 'undefined') {
    return null; // Skip validation on client
  }

  const parsed = serverEnvSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('Invalid server environment variables:', parsed.error.flatten().fieldErrors);
    // Don't throw during build if env vars are not set
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Invalid server environment variables');
    }
    return null;
  }

  return parsed.data;
}

// Validate client environment variables
function validateClientEnv() {
  const parsed = clientEnvSchema.safeParse({
    NEXT_PUBLIC_MAPBOX_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
  });

  if (!parsed.success) {
    console.error('Invalid client environment variables:', parsed.error.flatten().fieldErrors);
    return null;
  }

  return parsed.data;
}

// Export validated environment
export const serverEnv = validateServerEnv();
export const clientEnv = validateClientEnv();

// Type-safe access to environment variables
export function getServerEnv() {
  if (!serverEnv) {
    throw new Error('Server environment not initialized');
  }
  return serverEnv;
}

export function getClientEnv() {
  if (!clientEnv) {
    throw new Error('Client environment not initialized');
  }
  return clientEnv;
}
