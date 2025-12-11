import { Injectable } from '@angular/core';

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
   * Build WHERE clause from multiple conditions
   * @param conditions Array of condition objects
   * @returns Combined WHERE clause and parameters
   * 
   * @example
   * const result = this.dbUtil.buildWhere([
   *   { clause: 'isActive = ?', params: [1] },
   *   { clause: 'price > ?', params: [100] }
   * ]);
   * // Returns: { clause: 'isActive = ? AND price > ?', params: [1, 100] }
   */
  buildWhere(
    conditions: Array<{ clause: string; params: any[] }>
  ): { clause: string; params: any[] } {
    const validConditions = conditions.filter(c => c.clause);
    
    if (validConditions.length === 0) {
      return { clause: '', params: [] };
    }

    const clause = validConditions.map(c => c.clause).join(' AND ');
    const params = validConditions.flatMap(c => c.params);

    return { clause, params };
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
}
