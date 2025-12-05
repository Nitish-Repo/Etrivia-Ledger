/**
 * Query Result Interface
 * Represents the result of a database query operation
 */
export interface QueryResult {
  /** Number of rows affected by the query */
  changes: number;
  
  /** Last inserted row ID (for INSERT operations) */
  lastId: number;
}
