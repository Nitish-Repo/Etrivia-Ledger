import { Injectable } from '@angular/core';
import { BehaviorSubject, from, Observable } from 'rxjs';
import { SqliteConnectionService } from './sqlite-connection.service';

/**
 * Generic Database Service
 * Provides CRUD operations for all tables
 */
@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private isReady$ = new BehaviorSubject<boolean>(false);

  constructor(private connectionService: SqliteConnectionService) { }

  /**
   * Initialize database with schema
   */
  async initializeDatabase(): Promise<void> {
    try {
      await this.connectionService.initialize();
      await this.connectionService.openDatabase();
      this.isReady$.next(true);
      console.log('✅ Database service ready');
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      this.isReady$.next(false);
      throw error;
    }
  }

  /**
   * Observable to check if database is ready
   */
  getDatabaseState(): Observable<boolean> {
    return this.isReady$.asObservable();
  }

  /**
   * Check if database is ready
   */
  isReady(): boolean {
    return this.isReady$.value;
  }

  // =============================================
  // GENERIC CRUD OPERATIONS
  // =============================================

  /**
   * Execute a custom SQL query
   * @param sql SQL query string
   * @param params Optional query parameters
   * @returns Array of results
   */
  async query<T>(sql: string, params: any[] = []): Promise<T[]> {
    try {
      const db = this.connectionService.getConnection();
      const result = await db.query(sql, params);
      return (result.values as T[]) || [];
    } catch (error) {
      console.error('❌ Query error:', error);
      throw error;
    }
  }

  /**
   * Execute a non-query SQL statement (INSERT, UPDATE, DELETE)
   * @param sql SQL statement
   * @param params Optional parameters
   * @returns Object with changes count and last inserted ID
   */
  private async executeNonQuery(sql: string, params: any[] = []): Promise<{ changes: number; lastId: number }> {
    try {
      const db = this.connectionService.getConnection();
      const result = await db.run(sql, params);
      
      // Save to store for web platform after write operations
      await this.connectionService.saveToStoreIfWeb();
      
      return {
        changes: result.changes?.changes || 0,
        lastId: result.changes?.lastId || 0
      };
    } catch (error) {
      console.error('❌ Execute error:', error);
      throw error;
    }
  }

  /**
   * Get all records from a table
   * @param table Table name
   * @returns Array of all records
   */
  async getAll<T>(table: string): Promise<T[]> {
    const sql = `SELECT * FROM ${table}`;
    return this.query<T>(sql);
  }

  getAll$<T>(table: string): Observable<T[]> {
    return from(this.getAll<T>(table));
  }

  /**
   * Get paginated records from a table
   * @param table Table name
   * @param limit Number of records per page
   * @param offset Starting position (page * limit)
   * @param orderBy Optional ORDER BY clause (e.g., "createdAt DESC")
   * @returns Array of paginated records
   */
  async getPaginated<T>(q: {table: string, limit: number, offset: number, orderBy?: string}): Promise<T[]> {
    let sql = `SELECT * FROM ${q.table}`;
    if (q.orderBy) {
      sql += ` ORDER BY ${q.orderBy}`;
    }
    sql += ` LIMIT ? OFFSET ?`;
    return this.query<T>(sql, [q.limit, q.offset]);
  }

  getPaginated$<T>(table: string, limit: number, offset: number, orderBy?: string): Observable<T[]> {
    return from(this.getPaginated<T>({table, limit, offset, orderBy}));
  }

  /**
   * Get a single record by ID
   * @param table Table name
   * @param id Record ID (value to match)
   * @param idColumn Column name to match (default: 'id')
   * @returns Single record or null
   */
  async getById<T>(table: string, id: number | string, idColumn: string = 'id'): Promise<T | null> {
    const sql = `SELECT * FROM ${table} WHERE ${idColumn} = ?`;
    const results = await this.query<T>(sql, [id]);
    return results.length > 0 ? results[0] : null;
  }

  getById$<T>(table: string, id: string | number, idColumn: string = 'id'): Observable<T | null> {
    return from(this.getById<T>(table, id, idColumn));
  }


  /**
   * Get records by a specific condition
   * @param table Table name
   * @param where WHERE clause (e.g., "active = ? AND name LIKE ?")
   * @param params Parameters for the WHERE clause
   * @returns Array of matching records
   */
  async getByCondition<T>(table: string, where: string, params: any[] = []): Promise<T[]> {
    const sql = `SELECT * FROM ${table} WHERE ${where}`;
    return this.query<T>(sql, params);
  }

  /**
   * Insert a new record
   * @param table Table name
   * @param data Object with column names as keys
   * @returns ID of inserted record
   */
  async insert(table: string, data: any): Promise<number> {
    try {
      const keys = Object.keys(data).filter(key => data[key] !== undefined);
      const values = keys.map(key => data[key]);
      const placeholders = keys.map(() => '?').join(', ');

      const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;
      const result = await this.executeNonQuery(sql, values);

      console.log(`✅ Inserted into ${table}, ID: ${result.lastId}`);
      return result.lastId;
    } catch (error) {
      console.error(`❌ Insert error in ${table}:`, error);
      throw error;
    }
  }

  insert$(table: string, data: any): Observable<number> {
    return from(this.insert(table, data));   // Convert Promise → Observable
  }

  /**
   * Insert a new record and return the inserted record
   * Uses SQLite RETURNING clause (SQLite 3.35+)
   * @param table Table name
   * @param data Object with column names as keys
   * @returns Inserted record with all columns including auto-generated values
   */
  async insertAndReturn<T>(table: string, data: any): Promise<T | null> {
    try {
      const keys = Object.keys(data).filter(key => data[key] !== undefined);
      const values = keys.map(key => data[key]);
      const placeholders = keys.map(() => '?').join(', ');

      const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`;
      const results = await this.query<T>(sql, values);

      // Save to store for web platform
      await this.connectionService.saveToStoreIfWeb();

      console.log(`✅ Inserted into ${table} and returned record`);
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      console.error(`❌ Insert and return error in ${table}:`, error);
      throw error;
    }
  }

  insertAndReturn$<T>(table: string, data: any): Observable<T | null> {
    return from(this.insertAndReturn<T>(table, data));
  }

  /**
   * Update a record by ID
   * @param table Table name
   * @param id Record ID (value to match)
   * @param data Object with column names as keys
   * @param idColumn Column name to match (default: 'id')
   * @returns Number of affected rows
   */
  async update(table: string, id: string | number, data: any, idColumn: string = 'id'): Promise<number> {
    try {
      const keys = Object.keys(data).filter(key => data[key] !== undefined && key !== idColumn);
      const values = keys.map(key => data[key]);
      const setClause = keys.map(key => `${key} = ?`).join(', ');

      const sql = `UPDATE ${table} SET ${setClause} WHERE ${idColumn} = ?`;
      values.push(id);

      const result = await this.executeNonQuery(sql, values);
      console.log(`✅ Updated ${table}, rows affected: ${result.changes}`);

      return result.changes;
    } catch (error) {
      console.error(`❌ Update error in ${table}:`, error);
      throw error;
    }
  }

  update$(table: string, id: string | number, data: any, idColumn: string = 'id'): Observable<number> {
    return from(this.update(table, id, data, idColumn));
  }

  /**
   * Update a record by ID and return the updated record
   * Uses SQLite RETURNING clause (SQLite 3.35+)
   * @param table Table name
   * @param id Record ID (value to match)
   * @param data Object with column names as keys
   * @param idColumn Column name to match (default: 'id')
   * @returns Updated record
   */
  async updateAndReturn<T>(table: string, id: string | number, data: any, idColumn: string = 'id'): Promise<T | null> {
    try {
      const keys = Object.keys(data).filter(key => data[key] !== undefined && key !== idColumn);
      const values = keys.map(key => data[key]);
      const setClause = keys.map(key => `${key} = ?`).join(', ');

      const sql = `UPDATE ${table} SET ${setClause} WHERE ${idColumn} = ? RETURNING *`;
      values.push(id);

      const results = await this.query<T>(sql, values);
      
      // Save to store for web platform
      await this.connectionService.saveToStoreIfWeb();
      
      console.log(`✅ Updated ${table} and returned record`);
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      console.error(`❌ Update and return error in ${table}:`, error);
      throw error;
    }
  }

  updateAndReturn$<T>(table: string, id: string | number, data: any, idColumn: string = 'id'): Observable<T | null> {
    return from(this.updateAndReturn<T>(table, id, data, idColumn));
  }

  /**
   * Update records by condition
   * @param table Table name
   * @param data Object with column names as keys
   * @param where WHERE clause
   * @param params Parameters for the WHERE clause
   * @returns Number of affected rows
   */
  async updateByCondition(
    table: string,
    data: any,
    where: string,
    params: any[] = []
  ): Promise<number> {
    try {
      const keys = Object.keys(data).filter(key => data[key] !== undefined);
      const values = keys.map(key => data[key]);
      const setClause = keys.map(key => `${key} = ?`).join(', ');

      const sql = `UPDATE ${table} SET ${setClause} WHERE ${where}`;
      const allParams = [...values, ...params];

      const result = await this.executeNonQuery(sql, allParams);
      console.log(`✅ Updated ${table}, rows affected: ${result.changes}`);
      return result.changes;
    } catch (error) {
      console.error(`❌ Update error in ${table}:`, error);
      throw error;
    }
  }

  /**
   * Delete a record by ID
   * @param table Table name
   * @param id Record ID (value to match)
   * @param idColumn Column name to match (default: 'id')
   * @returns Number of affected rows
   */
  async delete(table: string, id: string | number, idColumn: string = 'id'): Promise<number> {
    try {
      const sql = `DELETE FROM ${table} WHERE ${idColumn} = ?`;
      const result = await this.executeNonQuery(sql, [id]);
      console.log(`✅ Deleted from ${table}, rows affected: ${result.changes}`);
      return result.changes;
    } catch (error) {
      console.error(`❌ Delete error in ${table}:`, error);
      throw error;
    }
  }

  delete$(table: string, id: string | number, idColumn: string = 'id') {
    return from(this.delete(table, id, idColumn));
  }

  /**
   * Delete a record by ID and return the deleted record
   * Uses SQLite RETURNING clause (SQLite 3.35+)
   * @param table Table name
   * @param id Record ID (value to match)
   * @param idColumn Column name to match (default: 'id')
   * @returns Deleted record
   */
  async deleteAndReturn<T>(table: string, id: string | number, idColumn: string = 'id'): Promise<T | null> {
    try {
      const sql = `DELETE FROM ${table} WHERE ${idColumn} = ? RETURNING *`;
      const results = await this.query<T>(sql, [id]);
      
      // Save to store for web platform
      await this.connectionService.saveToStoreIfWeb();
      
      console.log(`✅ Deleted from ${table} and returned record`);
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      console.error(`❌ Delete and return error in ${table}:`, error);
      throw error;
    }
  }

  deleteAndReturn$<T>(table: string, id: string | number, idColumn: string = 'id'): Observable<T | null> {
    return from(this.deleteAndReturn<T>(table, id, idColumn));
  }

  /**
   * Delete records by condition
   * @param table Table name
   * @param where WHERE clause
   * @param params Parameters for the WHERE clause
   * @returns Number of affected rows
   */
  async deleteByCondition(table: string, where: string, params: any[] = []): Promise<number> {
    try {
      const sql = `DELETE FROM ${table} WHERE ${where}`;
      const result = await this.executeNonQuery(sql, params);
      console.log(`✅ Deleted from ${table}, rows affected: ${result.changes}`);
      return result.changes;
    } catch (error) {
      console.error(`❌ Delete error in ${table}:`, error);
      throw error;
    }
  }

  /**
   * Count records in a table
   * @param table Table name
   * @param where Optional WHERE clause
   * @param params Optional parameters for WHERE clause
   * @returns Number of records
   */
  async count(table: string, where?: string, params: any[] = []): Promise<number> {
    try {
      const sql = where
        ? `SELECT COUNT(*) as count FROM ${table} WHERE ${where}`
        : `SELECT COUNT(*) as count FROM ${table}`;

      const result = await this.query<{ count: number }>(sql, params);
      return result[0]?.count || 0;
    } catch (error) {
      console.error(`❌ Count error in ${table}:`, error);
      throw error;
    }
  }

  /**
   * Check if a record exists
   * @param table Table name
   * @param where WHERE clause
   * @param params Parameters for WHERE clause
   * @returns True if exists, false otherwise
   */
  async exists(table: string, where: string, params: any[] = []): Promise<boolean> {
    const count = await this.count(table, where, params);
    return count > 0;
  }

  /**
   * Execute a batch of SQL statements (transaction)
   * @param statements Array of SQL statements
   * @returns True if successful
   */
  async executeBatch(statements: string[]): Promise<boolean> {
    try {
      const db = this.connectionService.getConnection();
      await db.execute('BEGIN TRANSACTION;');

      for (const statement of statements) {
        await db.execute(statement);
      }

      await db.execute('COMMIT;');
      console.log('✅ Batch execution successful');
      return true;
    } catch (error) {
      console.error('❌ Batch execution error:', error);
      const db = this.connectionService.getConnection();
      await db.execute('ROLLBACK;');
      throw error;
    }
  }

  /**
   * Truncate a table (delete all records)
   * @param table Table name
   */
  async truncate(table: string): Promise<void> {
    try {
      await this.executeNonQuery(`DELETE FROM ${table}`);
      console.log(`✅ Truncated table ${table}`);
    } catch (error) {
      console.error(`❌ Truncate error in ${table}:`, error);
      throw error;
    }
  }
}
