# SQLite Database Setup Script for New Ionic Angular Project
# Run this in your NEW project directory

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "SQLite Database Setup Script" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in an Ionic project
if (-not (Test-Path "ionic.config.json")) {
    Write-Host "ERROR: Not an Ionic project. Run this in your Ionic project root." -ForegroundColor Red
    exit 1
}

# Step 1: Install Dependencies
Write-Host "[1/7] Installing SQLite dependencies..." -ForegroundColor Yellow
npm install @capacitor-community/sqlite@^7.0.2 `
            @capacitor/toast@^7.0.2 `
            @ionic/pwa-elements@^3.3.0 `
            jeep-sqlite@2.6.4 `
            sql.js@1.10.2 `
            copyfiles --save-dev

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: npm install failed" -ForegroundColor Red
    exit 1
}

# Step 2: Create directory structure
Write-Host "[2/7] Creating directory structure..." -ForegroundColor Yellow
$directories = @(
    "src/app/models",
    "src/app/services",
    "src/app/upgrades",
    "src/app/components/users"
)

foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "  Created: $dir" -ForegroundColor Gray
    }
}

# Step 3: Create model file
Write-Host "[3/7] Creating model files..." -ForegroundColor Yellow
$userModel = @"
export interface User {
  id: number;
  name: string;
  active: number;
}
"@
Set-Content -Path "src/app/models/user.ts" -Value $userModel

# Step 4: Create upgrade statements
Write-Host "[4/7] Creating upgrade statements..." -ForegroundColor Yellow
$upgradeStatements = @"
export class UserUpgradeStatements {
  userUpgrades = [
    {
      toVersion: 1,
      statements: [
        ``CREATE TABLE IF NOT EXISTS users(
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          active INTEGER DEFAULT 1
        );``
      ]
    },
  ]
}
"@
Set-Content -Path "src/app/upgrades/user.upgrade.statements.ts" -Value $upgradeStatements

# Step 5: Create services
Write-Host "[5/7] Creating service files..." -ForegroundColor Yellow

# DbnameVersionService
$dbnameVersionService = @"
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
"@
Set-Content -Path "src/app/services/dbname-version.service.ts" -Value $dbnameVersionService

# SQLiteService
$sqliteService = @"
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
      return Promise.reject(``initWebStore: `${err}``);
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
"@
Set-Content -Path "src/app/services/sqlite.service.ts" -Value $sqliteService

Write-Host "  Created SQLite service files" -ForegroundColor Gray

# Step 6: Update package.json scripts
Write-Host "[6/7] Updating package.json scripts..." -ForegroundColor Yellow
$packageJson = Get-Content "package.json" | ConvertFrom-Json
if (-not $packageJson.scripts."ionic:serve:before") {
    $packageJson.scripts | Add-Member -MemberType NoteProperty -Name "ionic:serve:before" -Value "npm run copy:sql:wasm" -Force
    $packageJson.scripts | Add-Member -MemberType NoteProperty -Name "copy:sql:wasm" -Value "copyfiles -u 3 node_modules/sql.js/dist/sql-wasm.wasm src/assets" -Force
    $packageJson | ConvertTo-Json -Depth 10 | Set-Content "package.json"
    Write-Host "  Added copy:sql:wasm script" -ForegroundColor Gray
}

# Step 7: Sync Capacitor
Write-Host "[7/7] Syncing Capacitor..." -ForegroundColor Yellow
npx cap sync

Write-Host ""
Write-Host "=====================================" -ForegroundColor Green
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""
Write-Host "Created Files:" -ForegroundColor Cyan
Write-Host "  - src/app/models/user.ts" -ForegroundColor White
Write-Host "  - src/app/services/sqlite.service.ts" -ForegroundColor White
Write-Host "  - src/app/services/dbname-version.service.ts" -ForegroundColor White
Write-Host "  - src/app/upgrades/user.upgrade.statements.ts" -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Copy remaining service files from source project:" -ForegroundColor White
Write-Host "   - storage.service.ts" -ForegroundColor Gray
Write-Host "   - initialize.app.service.ts" -ForegroundColor Gray
Write-Host "2. Update main.ts with APP_INITIALIZER (see SQLITE-SETUP-GUIDE.md)" -ForegroundColor White
Write-Host "3. Create your component (see example in guide)" -ForegroundColor White
Write-Host "4. Test: npm run start:all" -ForegroundColor White
Write-Host ""
Write-Host "Full documentation: SQLITE-SETUP-GUIDE.md" -ForegroundColor Yellow
