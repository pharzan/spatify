import { config as loadEnv } from 'dotenv';

loadEnv();

const requireEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export const config = {
  port: Number(process.env.PORT) || 3333,
  host: process.env.HOST || '0.0.0.0',
  databaseUrl: requireEnv('DATABASE_URL'),
};
