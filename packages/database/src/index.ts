export * from './client';
export * from './schema';
export * from './utils';

// Re-export commonly used drizzle-orm utilities
// This prevents other packages from needing to import drizzle-orm directly
export { eq, and, or, desc, asc, sql, like, ilike, not, isNull, isNotNull } from 'drizzle-orm';