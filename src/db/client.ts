import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from './schema';
import { sqliteDb } from './connection';

export { DB_NAME, getSqliteDb, sqliteDb } from './connection';

// Initialize Drizzle ORM dengan proxy yang resilient
export const db = drizzle(sqliteDb, { schema });


export { TABLES_DDL, INDEXES_DDL } from './schema-sql';
export { initDatabase } from './migrations';
