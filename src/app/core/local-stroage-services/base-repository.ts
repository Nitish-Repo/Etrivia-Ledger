import { SQLiteDBConnection } from "@capacitor-community/sqlite";

export abstract class BaseRepository<T> {
  constructor(
    protected table: string,
    protected db: SQLiteDBConnection
  ) {}

  async getAll(): Promise<T[]> {
    const result = await this.db.query(`SELECT * FROM ${this.table}`);
    return result.values as T[];
  }

  async getById(id: number): Promise<T | null> {
    const result = await this.db.query(
      `SELECT * FROM ${this.table} WHERE id = ?`, [id]
    );
    return result.values?.[0] ?? null;
  }

  async insert(data: any): Promise<number> {
    const keys = Object.keys(data);
    const values = Object.values(data);

    const sql = `INSERT INTO ${this.table} (${keys.join(',')}) VALUES (${keys.map(() => '?').join(',')})`;

    const r = await this.db.run(sql, values);
    return r.changes?.lastId ?? 0;
  }

  async update(id: number, data: any): Promise<void> {
    const keys = Object.keys(data);
    const values = Object.values(data);

    const sql = `
      UPDATE ${this.table}
      SET ${keys.map(k => `${k} = ?`).join(',')}
      WHERE id = ?
    `;

    values.push(id);
    await this.db.run(sql, values);
  }

  async delete(id: number): Promise<void> {
    await this.db.run(`DELETE FROM ${this.table} WHERE id = ?`, [id]);
  }
}
