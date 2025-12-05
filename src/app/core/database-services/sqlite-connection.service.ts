import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Capacitor } from '@capacitor/core';
import { 
  CapacitorSQLite, 
  SQLiteConnection, 
  SQLiteDBConnection, 
  CapacitorSQLitePlugin
} from '@capacitor-community/sqlite';
import { firstValueFrom } from 'rxjs';

/**
 * SQLite Connection Service
 * Manages platform-specific SQLite connections for Web, iOS, and Android
 */
@Injectable({
  providedIn: 'root'
})
export class SqliteConnectionService {
  private sqliteConnection!: SQLiteConnection;
  private sqlitePlugin!: CapacitorSQLitePlugin;
  private platform!: string;
  private isNative: boolean = false;
  private isInitialized: boolean = false;
  private webStoreInitialized: boolean = false;
  private db!: SQLiteDBConnection;
  private dbName: string = 'etrivia_ledger_db';
  private dbVersion: number = 1;

  constructor(private http: HttpClient) {}

  /**
   * Initialize the SQLite plugin and detect platform
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('⚠️ SQLite already initialized');
      return;
    }

    try {
      console.log('🚀 Initializing SQLite plugin...');
      
      // Detect platform
      this.platform = Capacitor.getPlatform();
      this.isNative = this.platform === 'ios' || this.platform === 'android';
      console.log(`📱 Platform detected: ${this.platform} (Native: ${this.isNative})`);
      
      // Initialize plugin
      this.sqlitePlugin = CapacitorSQLite;
      this.sqliteConnection = new SQLiteConnection(this.sqlitePlugin);
      
      // For web platform, initialize web store
      if (this.platform === 'web') {
        await this.initializeWebStore();
      }
      
      this.isInitialized = true;
      console.log('✅ SQLite plugin initialized successfully');
    } catch (error) {
      console.error('❌ SQLite initialization error:', error);
      throw error;
    }
  }

  /**
   * Initialize Web Store for browser-based SQLite
   */
  private async initializeWebStore(): Promise<void> {
    if (this.webStoreInitialized) {
      console.log('⚠️ WebStore already initialized');
      return;
    }
    
    try {
      console.log('⏳ Waiting for jeep-sqlite element...');
      await this.waitForJeepSqlite();
      
      console.log('🔄 Initializing WebStore...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await this.sqliteConnection.initWebStore();
      this.webStoreInitialized = true;
      
      await new Promise(resolve => setTimeout(resolve, 300));
      console.log('✅ WebStore initialized successfully');
    } catch (error) {
      console.error('❌ WebStore initialization error:', error);
      throw error;
    }
  }

  /**
   * Wait for jeep-sqlite custom element to be ready (Web only)
   */
  private async waitForJeepSqlite(): Promise<void> {
    if (this.platform !== 'web') return;

    return new Promise((resolve) => {
      let attempts = 0;
      const maxAttempts = 50; // 5 seconds max
      
      const checkElement = () => {
        attempts++;
        const jeepEl = document.querySelector('jeep-sqlite');
        
        if (jeepEl && customElements.get('jeep-sqlite')) {
          console.log('✅ jeep-sqlite element found and defined');
          resolve();
        } else if (attempts >= maxAttempts) {
          console.error('❌ jeep-sqlite element not found after timeout');
          resolve(); // Resolve anyway to prevent hanging
        } else {
          setTimeout(checkElement, 100);
        }
      };
      
      setTimeout(checkElement, 100);
    });
  }

  /**
   * Open or create database connection
   */
  async openDatabase(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      console.log(`💾 Opening database: ${this.dbName}`);
      
      // Check if connection already exists
      const retCC = (await this.sqliteConnection.checkConnectionsConsistency()).result;
      const isConn = (await this.sqliteConnection.isConnection(this.dbName, false)).result;
      
      if (retCC && isConn) {
        console.log('🔄 Retrieving existing connection...');
        this.db = await this.sqliteConnection.retrieveConnection(this.dbName, false);
      } else {
        console.log('🆕 Creating new connection...');
        this.db = await this.sqliteConnection.createConnection(
          this.dbName,
          false, // encrypted
          'no-encryption', // mode
          this.dbVersion,
          false // readonly
        );
      }
      
      await this.db.open();
      console.log('✅ Database opened successfully');
      
      // Load and execute schema from SQL file
      await this.loadAndExecuteSchema();
      
      // Save to store for web
      if (this.platform === 'web') {
        await this.sqliteConnection.saveToStore(this.dbName);
        console.log('💾 Database saved to IndexedDB');
      }
    } catch (error) {
      console.error('❌ Error opening database:', error);
      throw error;
    }
  }

  /**
   * Load SQL schema from file and execute it
   */
  private async loadAndExecuteSchema(): Promise<void> {
    try {
      console.log('📋 Loading schema from assets/schema.sql...');
      
      // Load SQL file from assets
      const schema = await firstValueFrom(
        this.http.get('assets/schema.sql', { responseType: 'text' })
      );
      
      console.log('✅ Schema file loaded');
      await this.executeSchema(schema);
    } catch (error) {
      console.error('❌ Error loading schema file:', error);
      throw error;
    }
  }

  /**
   * Execute schema SQL statements
   */
  private async executeSchema(schema: string): Promise<void> {
    try {
      console.log('📋 Executing database schema...');
      
      // Split schema into individual statements
      const statements = schema
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));
      
      for (const statement of statements) {
        if (statement) {
          await this.db.execute(statement + ';');
        }
      }
      
      console.log('✅ Schema executed successfully');
    } catch (error) {
      console.error('❌ Error executing schema:', error);
      throw error;
    }
  }

  /**
   * Get the database connection
   */
  getConnection(): SQLiteDBConnection {
    if (!this.db) {
      throw new Error('Database not initialized. Call openDatabase() first.');
    }
    return this.db;
  }

  /**
   * Close database connection
   */
  async closeConnection(): Promise<void> {
    try {
      if (this.db) {
        await this.sqliteConnection.closeConnection(this.dbName, false);
        console.log('✅ Database connection closed');
      }
    } catch (error) {
      console.error('❌ Error closing connection:', error);
      throw error;
    }
  }

  /**
   * Check if database is ready
   */
  isReady(): boolean {
    return this.isInitialized && !!this.db;
  }

  /**
   * Get current platform
   */
  getPlatform(): string {
    return this.platform;
  }

  /**
   * Check if running on native platform
   */
  isNativePlatform(): boolean {
    return this.isNative;
  }
}
