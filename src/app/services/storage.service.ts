import { Injectable } from '@angular/core';
import { SQLiteDBConnection } from '@capacitor-community/sqlite';
import { BehaviorSubject, Observable } from 'rxjs';
import { SQLiteService } from './sqlite.service';
import { DbnameVersionService } from './dbname-version.service';
import { UserUpgradeStatements } from '../upgrades/user.upgrade.statements';
import { User } from '../models/user';

@Injectable()
export class StorageService {
  public userList: BehaviorSubject<User[]> = new BehaviorSubject<User[]>([]);
  private databaseName: string = "";
  private uUpdStmts: UserUpgradeStatements = new UserUpgradeStatements();
  private versionUpgrades;
  private loadToVersion;
  private db!: SQLiteDBConnection;
  private isUserReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private sqliteService: SQLiteService,
    private dbVerService: DbnameVersionService
  ) {
    this.versionUpgrades = this.uUpdStmts.userUpgrades;
    this.loadToVersion = this.versionUpgrades[this.versionUpgrades.length - 1].toVersion;
  }

  async initializeDatabase(dbName: string) {
    this.databaseName = dbName;
    
    // Create upgrade statements
    await this.sqliteService.addUpgradeStatement({
      database: this.databaseName,
      upgrade: this.versionUpgrades
    });
    
    // Create and/or open the database
    this.db = await this.sqliteService.openDatabase(
      this.databaseName,
      false,
      'no-encryption',
      this.loadToVersion,
      false
    );
    
    this.dbVerService.set(this.databaseName, this.loadToVersion);
    await this.getUsers();
  }

  // Observable state
  userState(): Observable<boolean> {
    return this.isUserReady.asObservable();
  }

  fetchUsers(): Observable<User[]> {
    return this.userList.asObservable();
  }

  // CRUD Operations
  async loadUsers() {
    const result = await this.db.query('SELECT * FROM users;');
    const users: User[] = result.values as User[] || [];
    this.userList.next(users);
  }

  async getUsers() {
    await this.loadUsers();
    this.isUserReady.next(true);
  }

  async addUser(name: string) {
    const sql = `INSERT INTO users (name) VALUES (?);`;
    await this.db.run(sql, [name]);
    await this.getUsers();
  }

  async updateUserById(id: string, active: number) {
    const sql = `UPDATE users SET active=? WHERE id=?`;
    await this.db.run(sql, [active, id]);
    await this.getUsers();
  }

  async updateUserName(id: string, name: string) {
    const sql = `UPDATE users SET name=? WHERE id=?`;
    await this.db.run(sql, [name, id]);
    await this.getUsers();
  }

  async deleteUserById(id: string) {
    const sql = `DELETE FROM users WHERE id=?`;
    await this.db.run(sql, [id]);
    await this.getUsers();
  }
}
