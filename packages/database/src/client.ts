import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

/**
 * Database Connection
 * Creates a PostgreSQL connection and Drizzle ORM instance.
 */
const connectionString = process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/monorepo_db';

// Create postgres connection
export const queryClient = postgres(connectionString);

// Create Drizzle ORM instance with schema
export const db = drizzle(queryClient, { schema });

// Re-export schema for convenience
export * from './schema';