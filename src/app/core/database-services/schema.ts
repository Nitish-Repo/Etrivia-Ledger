/**
 * Database Schema and Migrations
 * All database versions and changes in one place
 */

export interface SchemaVersion {
  version: number;
  name: string;
  up: string;
}

/**
 * Database schema versions
 * Each version runs in order for new installations
 * Existing databases only run versions higher than their current version
 */
export const SCHEMA_VERSIONS: SchemaVersion[] = [
  {
    version: 1,
    name: 'Initial schema',
    up: `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT,
        active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        quantity INTEGER DEFAULT 0,
        active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_users_name ON users(name);
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_active ON users(active);
      CREATE INDEX IF NOT EXISTS idx_products_title ON products(title);
      CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);
    `
  },
  
  // Add future versions here:
  // {
  //   version: 3,
  //   name: 'Add orders table',
  //   up: `
  //     CREATE TABLE IF NOT EXISTS orders (
  //       id INTEGER PRIMARY KEY AUTOINCREMENT,
  //       user_id INTEGER NOT NULL,
  //       product_id INTEGER NOT NULL,
  //       quantity INTEGER DEFAULT 1,
  //       total_price REAL NOT NULL,
  //       created_at TEXT DEFAULT CURRENT_TIMESTAMP
  //     );
  //     CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
  //   `
  // },
  // {
  //   version: 3,
  //   name: 'Add orders table',
  //   up: `
  //     CREATE TABLE IF NOT EXISTS orders (
  //       id INTEGER PRIMARY KEY AUTOINCREMENT,
  //       user_id INTEGER NOT NULL,
  //       product_id INTEGER NOT NULL,
  //       quantity INTEGER DEFAULT 1,
  //       total_price REAL NOT NULL,
  //       created_at TEXT DEFAULT CURRENT_TIMESTAMP
  //     );
  //     CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
  //   `
  // }
];

/**
 * Get the latest schema version
 */
export function getLatestVersion(): number {
  return SCHEMA_VERSIONS[SCHEMA_VERSIONS.length - 1]?.version || 1;
}

/**
 * Get all versions from a specific version onwards
 */
export function getVersionsFrom(fromVersion: number): SchemaVersion[] {
  return SCHEMA_VERSIONS.filter(v => v.version > fromVersion);
}
