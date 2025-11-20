import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { config } from '../config/environment.js';

export const pool = new pg.Pool({
  connectionString: config.databaseUrl,
});

export const db = drizzle(pool);

export type DatabaseClient = typeof db;
