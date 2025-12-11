export interface PaginationOptionsModel {
  table: string;              // table name
  limit: number;              // page size
  offset: number;             // page * limit

  columns?: string[];         // SELECT columns
  join?: string;              // JOIN clause
  where?: string;             // WHERE clause (raw)
  having?: string;            // HAVING clause
  orderBy?: string;           // ORDER BY
  params?: any[];             // WHERE params
}

export class PaginationBuilder {
  
  static buildSelect(columns?: string[]): string {
    return columns?.length ? columns.join(', ') : '*';
  }

  static buildJoin(join?: string): string {
    return join ? ` ${join}` : '';
  }

  static buildWhere(where?: string): string {
    return where ? ` WHERE ${where}` : '';
  }

  static buildHaving(having?: string): string {
    return having ? ` HAVING ${having}` : '';
  }

  static buildOrder(orderBy?: string): string {
    return orderBy ? ` ORDER BY ${orderBy}` : '';
  }

  static mergeParams(params: any[] = [], limit: number, offset: number) {
    return [...params, limit, offset];
  }
}
