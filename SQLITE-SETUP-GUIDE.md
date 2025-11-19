# SQLite Database Setup Guide for Ionic Angular

This guide explains how to implement SQLite database in your Ionic Angular project using the same pattern as this project.

## 📋 Prerequisites

- Ionic Angular project (standalone components recommended)
- Angular 18+
- Capacitor 7+

## 📦 Required Packages

```json
"dependencies": {
  "@capacitor-community/sqlite": "^7.0.2",
  "@capacitor/android": "^7.4.4",
  "@capacitor/core": "^7.0.0",
  "@capacitor/ios": "^7.4.4",
  "@capacitor/toast": "^7.0.2",
  "@ionic/pwa-elements": "^3.3.0",
  "jeep-sqlite": "2.6.4",
  "sql.js": "1.10.2",
  "rxjs": "^7.8.0"
}
```

## 🚀 Installation Steps

### Step 1: Install Dependencies

```powershell
# Install SQLite and Capacitor packages
npm install @capacitor-community/sqlite@^7.0.2
npm install @capacitor/toast@^7.0.2
npm install @ionic/pwa-elements@^3.3.0
npm install jeep-sqlite@2.6.4
npm install sql.js@1.10.2

# Sync with native platforms
npx cap sync
```

### Step 2: Configure Package Scripts

Add to `package.json`:

```json
"scripts": {
  "ionic:serve:before": "npm run copy:sql:wasm",
  "copy:sql:wasm": "copyfiles -u 3 node_modules/sql.js/dist/sql-wasm.wasm src/assets"
}
```

Install copyfiles:
```powershell
npm install copyfiles --save-dev
```

### Step 3: Configure Main.ts

Update `src/main.ts`:

```typescript
import { enableProdMode, importProvidersFrom, APP_INITIALIZER } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { Capacitor } from '@capacitor/core';
import { defineCustomElements as pwaElements } from '@ionic/pwa-elements/loader';
import { defineCustomElements as jeepSqlite } from 'jeep-sqlite/loader';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';
import { InitializeAppService } from './app/services/initialize.app.service';
import { SQLiteService } from './app/services/sqlite.service';
import { StorageService } from './app/services/storage.service';
import { DbnameVersionService } from './app/services/dbname-version.service';

if (environment.production) {
  enableProdMode();
}

// Web platform setup for SQLite
const platform = Capacitor.getPlatform();
if (platform === "web") {
  pwaElements(window);
  jeepSqlite(window);

  window.addEventListener('DOMContentLoaded', async () => {
    try {
      const jeepEl = document.createElement("jeep-sqlite");
      document.body.appendChild(jeepEl);
      await customElements.whenDefined('jeep-sqlite');
      jeepEl.autoSave = true;
      console.log('jeep-sqlite element initialized successfully');
    } catch (err) {
      console.error('Error initializing jeep-sqlite:', err);
    }
  });
}

// APP_INITIALIZER factory
export function initializeFactory(init: InitializeAppService) {
  return () => init.initializeApp();
}

bootstrapApplication(AppComponent, {
  providers: [
    SQLiteService,
    InitializeAppService,
    StorageService,
    DbnameVersionService,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    importProvidersFrom(IonicModule.forRoot({})),
    provideRouter(routes),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeFactory,
      deps: [InitializeAppService],
      multi: true
    }
  ],
});
```

## 📁 File Structure

Create the following structure:

```
src/app/
├── models/
│   └── user.ts                      # Data model interface
├── services/
│   ├── sqlite.service.ts            # Core SQLite wrapper
│   ├── storage.service.ts           # Database operations (CRUD)
│   ├── initialize.app.service.ts    # App initialization
│   └── dbname-version.service.ts    # Version tracking
├── upgrades/
│   └── user.upgrade.statements.ts   # Database schema migrations
└── components/
    └── users/
        ├── users.component.ts       # Example component using DB
        ├── users.component.html
        └── users.component.scss
```

## 📝 File Contents

### 1. Model: `src/app/models/user.ts`

```typescript
export interface User {
  id: number;
  name: string;
  active: number;
}
```

### 2. Service: `src/app/services/dbname-version.service.ts`

```typescript
import { Injectable } from '@angular/core';

@Injectable()
export class DbnameVersionService {
  private _dbNameVersionDict: Map<string, number> = new Map();

  set(dbName: string, version: number) {
    this._dbNameVersionDict.set(dbName, version);
  }

  getVersion(dbName: string) {
    return this._dbNameVersionDict.has(dbName) 
      ? this._dbNameVersionDict.get(dbName) 
      : -1;
  }
}
```

### 3. Service: `src/app/services/sqlite.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { 
  CapacitorSQLite, 
  SQLiteConnection, 
  SQLiteDBConnection, 
  CapacitorSQLitePlugin,
  capSQLiteUpgradeOptions 
} from '@capacitor-community/sqlite';

@Injectable()
export class SQLiteService {
  sqliteConnection!: SQLiteConnection;
  isService: boolean = false;
  platform!: string;
  sqlitePlugin!: CapacitorSQLitePlugin;
  native: boolean = false;

  async initializePlugin(): Promise<boolean> {
    this.platform = Capacitor.getPlatform();
    if (this.platform === 'ios' || this.platform === 'android') {
      this.native = true;
    }
    this.sqlitePlugin = CapacitorSQLite;
    this.sqliteConnection = new SQLiteConnection(this.sqlitePlugin);
    this.isService = true;
    return true;
  }

  async initWebStore(): Promise<void> {
    try {
      await this.sqliteConnection.initWebStore();
    } catch (err: any) {
      return Promise.reject(`initWebStore: ${err}`);
    }
  }

  async openDatabase(
    dbName: string, 
    encrypted: boolean, 
    mode: string, 
    version: number, 
    readonly: boolean
  ): Promise<SQLiteDBConnection> {
    let db: SQLiteDBConnection;
    const retCC = (await this.sqliteConnection.checkConnectionsConsistency()).result;
    let isConn = (await this.sqliteConnection.isConnection(dbName, readonly)).result;
    
    if (retCC && isConn) {
      db = await this.sqliteConnection.retrieveConnection(dbName, readonly);
    } else {
      db = await this.sqliteConnection.createConnection(
        dbName, encrypted, mode, version, readonly
      );
    }
    await db.open();
    return db;
  }

  async retrieveConnection(dbName: string, readonly: boolean): Promise<SQLiteDBConnection> {
    return await this.sqliteConnection.retrieveConnection(dbName, readonly);
  }

  async closeConnection(database: string, readonly?: boolean): Promise<void> {
    const readOnly = readonly ? readonly : false;
    return await this.sqliteConnection.closeConnection(database, readOnly);
  }

  async addUpgradeStatement(options: capSQLiteUpgradeOptions): Promise<void> {
    await this.sqlitePlugin.addUpgradeStatement(options);
  }

  async saveToStore(database: string): Promise<void> {
    return await this.sqliteConnection.saveToStore(database);
  }
}
```

### 4. Upgrades: `src/app/upgrades/user.upgrade.statements.ts`

```typescript
export class UserUpgradeStatements {
  userUpgrades = [
    {
      toVersion: 1,
      statements: [
        `CREATE TABLE IF NOT EXISTS users(
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          active INTEGER DEFAULT 1
        );`
      ]
    },
    // Add new versions here:
    // {
    //   toVersion: 2,
    //   statements: [
    //     `ALTER TABLE users ADD COLUMN email TEXT;`,
    //   ]
    // },
  ]
}
```

### 5. Service: `src/app/services/storage.service.ts`

```typescript
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
    const users: User[] = (await this.db.query('SELECT * FROM users;')).values as User[];
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

  async deleteUserById(id: string) {
    const sql = `DELETE FROM users WHERE id=?`;
    await this.db.run(sql, [id]);
    await this.getUsers();
  }
}
```

### 6. Service: `src/app/services/initialize.app.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { SQLiteService } from './sqlite.service';
import { StorageService } from './storage.service';
import { Toast } from '@capacitor/toast';

@Injectable()
export class InitializeAppService {
  isAppInit: boolean = false;
  platform!: string;

  constructor(
    private sqliteService: SQLiteService,
    private storageService: StorageService,
  ) {}

  async initializeApp() {
    await this.sqliteService.initializePlugin().then(async (ret) => {
      this.platform = this.sqliteService.platform;
      try {
        if (this.sqliteService.platform === 'web') {
          await this.sqliteService.initWebStore();
        }
        
        // Initialize the database
        const DB_USERS = 'myuserdb';
        await this.storageService.initializeDatabase(DB_USERS);
        
        if (this.sqliteService.platform === 'web') {
          await this.sqliteService.saveToStore(DB_USERS);
        }
        
        this.isAppInit = true;
      } catch (error) {
        console.log(`initializeAppError: ${error}`);
        await Toast.show({
          text: `initializeAppError: ${error}`,
          duration: 'long'
        });
      }
    });
  }
}
```

### 7. Component: `src/app/components/users/users.component.ts`

```typescript
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { StorageService } from '../../services/storage.service';
import { User } from '../../models/user';
import { of, switchMap } from 'rxjs';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
  imports: [CommonModule, IonicModule, FormsModule],
  standalone: true,
})
export class UsersComponent implements OnInit {
  newUserName = '';
  userList: User[] = [];
  dbStatus = 'Initializing...';
  isDbConnected = false;

  constructor(private storage: StorageService) {}

  ngOnInit() {
    this.storage.userState().pipe(
      switchMap(res => {
        if (res) {
          this.dbStatus = 'Connected';
          this.isDbConnected = true;
          return this.storage.fetchUsers();
        } else {
          this.dbStatus = 'Not Connected';
          this.isDbConnected = false;
          return of([]);
        }
      })
    ).subscribe(data => {
      this.userList = data;
    });
  }

  async createUser() {
    if (this.newUserName.trim()) {
      await this.storage.addUser(this.newUserName);
      this.newUserName = '';
    }
  }

  updateUser(user: User) {
    const active = user.active === 0 ? 1 : 0;
    this.storage.updateUserById(user.id.toString(), active);
  }

  deleteUser(user: User) {
    this.storage.deleteUserById(user.id.toString());
  }
}
```

### 8. Template: `src/app/components/users/users.component.html`

```html
<ion-card>
  <ion-card-header>
    <ion-card-title>Users Database</ion-card-title>
    <ion-card-subtitle>Status: {{ dbStatus }}</ion-card-subtitle>
  </ion-card-header>
  
  <ion-card-content>
    <!-- Add User Form -->
    <ion-item>
      <ion-label position="floating">User Name</ion-label>
      <ion-input [(ngModel)]="newUserName" type="text"></ion-input>
    </ion-item>
    <ion-button expand="block" (click)="createUser()" [disabled]="!isDbConnected">
      Add User
    </ion-button>

    <!-- User List -->
    <ion-list *ngIf="userList.length > 0">
      <ion-item *ngFor="let user of userList">
        <ion-label>
          {{ user.name }}
          <p>ID: {{ user.id }} | Active: {{ user.active }}</p>
        </ion-label>
        <ion-button slot="end" fill="clear" (click)="updateUser(user)">
          <ion-icon name="{{ user.active ? 'toggle' : 'toggle-outline' }}"></ion-icon>
        </ion-button>
        <ion-button slot="end" fill="clear" color="danger" (click)="deleteUser(user)">
          <ion-icon name="trash"></ion-icon>
        </ion-button>
      </ion-item>
    </ion-list>
    
    <ion-text *ngIf="userList.length === 0 && isDbConnected">
      <p>No users found. Add one above!</p>
    </ion-text>
  </ion-card-content>
</ion-card>
```

## 🔧 Android Configuration

Update `android/app/build.gradle`:

```gradle
android {
  ...
  defaultConfig {
    ...
    minSdkVersion 22  // Required for SQLite
  }
}
```

## 🍎 iOS Configuration

No special configuration needed. Just run:

```powershell
npx cap sync ios
```

## 🌐 Testing

### Web Browser
```powershell
npm run start:all
```

### Android
```powershell
npx cap run android
```

### iOS
```powershell
npx cap run ios
```

## 🐛 Common Issues

### Issue: "jeep-sqlite not found"
**Solution**: Make sure you run `npm run copy:sql:wasm` before serving

### Issue: "Database not opening"
**Solution**: Check browser console for errors. Clear browser storage and reload.

### Issue: Android build fails
**Solution**: Ensure `minSdkVersion` is at least 22

## 📊 Database Schema Versioning

To add new database versions:

1. Update `user.upgrade.statements.ts`:
```typescript
{
  toVersion: 2,
  statements: [
    `ALTER TABLE users ADD COLUMN email TEXT;`,
  ]
},
```

2. Update model interface:
```typescript
export interface User {
  id: number;
  name: string;
  active: number;
  email?: string;  // New field
}
```

3. The database will auto-migrate on next app launch!

## 🎯 Best Practices

1. ✅ Always use parameterized queries (`?` placeholders)
2. ✅ Handle errors with try-catch blocks
3. ✅ Use BehaviorSubject for reactive state
4. ✅ Initialize database in APP_INITIALIZER
5. ✅ Test on all platforms (web, Android, iOS)
6. ✅ Use versioning for schema changes
7. ✅ Save to store on web platform

## 📚 Additional Resources

- [Capacitor SQLite Docs](https://github.com/capacitor-community/sqlite)
- [Ionic Framework](https://ionicframework.com/)
- [RxJS Documentation](https://rxjs.dev/)

---

**Created from**: Etrivia-Ledger project
**Last Updated**: November 19, 2025
