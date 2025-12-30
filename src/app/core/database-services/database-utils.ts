import { Injectable } from '@angular/core';
import { Device } from '@capacitor/device';
import type { DatabaseService } from './database.service';

/**
 * Database Utility Service
 * Helper functions for building SQL queries
 */
@Injectable({
  providedIn: 'root'
})
export class DatabaseUtilityService {

  /**
   * Build search clause and parameters for SQL queries
   * @param columns Array of column names to search in
   * @param search Search term
   * @returns Object with SQL clause and parameters
   * 
   * @example
   * const result = this.dbUtil.buildSearch(['name', 'email'], 'john');
   * // Returns: { clause: '(name LIKE ? OR email LIKE ?)', params: ['%john%', '%john%'] }
   */
  buildSearch(
    columns: string[],
    search: string
  ): { clause: string; params: string[] } {
    if (!search || !search.trim()) {
      return { clause: '', params: [] };
    }

    const likeClause = columns.map(col => `${col} LIKE ?`).join(' OR ');
    const likeParams = columns.map(() => `%${search}%`);

    return {
      clause: `(${likeClause})`,
      params: likeParams
    };
  }

  /**
   * Sanitize table/column names to prevent SQL injection
   * @param name Table or column name
   * @returns Sanitized name
   */
  sanitizeIdentifier(name: string): string {
    // Only allow alphanumeric and underscore
    return name.replace(/[^a-zA-Z0-9_]/g, '');
  }

  /**
   * Build ORDER BY clause
   * @param orderBy Column name or array of column names
   * @param direction Sort direction
   * @returns ORDER BY clause
   */
  buildOrderBy(
    orderBy: string | string[],
    direction: 'ASC' | 'DESC' = 'ASC'
  ): string {
    const columns = Array.isArray(orderBy) ? orderBy : [orderBy];
    return columns.map(col => `${this.sanitizeIdentifier(col)} ${direction}`).join(', ');
  }

  /**
   * Build LIMIT and OFFSET clause for pagination
   * @param page Page number (0-based)
   * @param limit Items per page
   * @returns Object with limit and offset
   */
  buildPagination(
    page: number,
    limit: number
  ): { limit: number; offset: number } {
    return {
      limit: Math.max(1, limit),
      offset: Math.max(0, page * limit)
    };
  }

  /**
   * Convert object to SQL SET clause for UPDATE
   * @param data Object with column-value pairs
   * @param excludeKeys Keys to exclude from update
   * @returns SET clause and parameters
   */
  buildUpdateSet(
    data: Record<string, any>,
    excludeKeys: string[] = []
  ): { clause: string; params: any[] } {
    const entries = Object.entries(data)
      .filter(([key]) => !excludeKeys.includes(key));

    if (entries.length === 0) {
      return { clause: '', params: [] };
    }

    const clause = entries.map(([key]) => `${key} = ?`).join(', ');
    const params = entries.map(([, value]) => value);

    return { clause, params };
  }

  /**
   * Apply initial values to tables after DB initialization.
   * Accepts the `DatabaseService` instance so this utility stays DI-safe.
   * Call: `await dbUtil.setTableValue(thisDatabaseServiceInstance)`
   */
  async setTableValue(dbService: DatabaseService): Promise<void> {
    try {
      const info = await Device.getId();
      const deviceId = info?.identifier || '';

      // Ensure invoice_counter row has device_id set (id = 1)
      await dbService.upsertById('invoice_counter', 'id', 1, { device_id: deviceId });

      // Future: add other initializations here (business settings, prefs, etc.)
    } catch (err) {
      console.warn('⚠️ database-utils: setTableValue failed', err);
    }
  }
}
