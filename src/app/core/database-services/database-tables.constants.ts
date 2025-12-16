/**
 * Database Table Names Constants
 * Centralized place to define all table names to avoid typos and spelling mistakes
 */

export const DB_TABLES = {
  PRODUCTS: 'products',
  CUSTOMERS: 'customers',
  SUPPLIERS: 'suppliers',
  SALES: 'sales',
  SALE_ITEMS: 'sale_items',
  ADDITIONAL_CHARGES: 'additional_charges',
  PURCHASES: 'purchases',
  PURCHASE_ITEMS: 'purchase_items',
  PAYMENTS: 'payments',
  EXPENSES: 'expenses',
  STOCK_ADJUSTMENTS: 'stock_adjustments',
  BUSINESS_SETTINGS: 'business_settings',
} as const;

/**
 * Type-safe table name type
 */
export type TableName = typeof DB_TABLES[keyof typeof DB_TABLES];

/**
 * Helper function to get table name with type safety
 */
export function getTableName(table: keyof typeof DB_TABLES): string {
  return DB_TABLES[table];
}
