import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { SQLiteService } from './sqlite.service';
import { StorageService } from './storage.service';

@Injectable()
export class InitializeAppService {
  isAppInit: boolean = false;
  platform!: string;

  constructor(
    private sqliteService: SQLiteService,
    private storageService: StorageService,
  ) {}

  async initializeApp() {
    console.log('🚀 Starting app initialization...');
    
    try {
      // Initialize SQLite plugin
      await this.sqliteService.initializePlugin();
      this.platform = this.sqliteService.platform;
      console.log(`📱 Platform detected: ${this.platform}`);
      
      // For web platform, wait for jeep-sqlite to be ready
      if (this.platform === 'web') {
        console.log('⏳ Waiting for jeep-sqlite element...');
        await this.waitForJeepSqlite();
        console.log('✅ jeep-sqlite ready, initializing web store...');
        
        // Add delay to ensure element is fully ready
        await new Promise(resolve => setTimeout(resolve, 500));
        
        await this.sqliteService.initWebStore();
        console.log('✅ WebStore initialized');
        
        // Add another small delay after WebStore init
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      // Initialize the database
      const DB_USERS = 'myuserdb';
      console.log(`💾 Initializing database: ${DB_USERS}`);
      await this.storageService.initializeDatabase(DB_USERS);
      
      // Save to store for web
      if (this.platform === 'web') {
        await this.sqliteService.saveToStore(DB_USERS);
        console.log('💾 Database saved to IndexedDB');
      }
      
      this.isAppInit = true;
      console.log('✅ App initialization complete!');
    } catch (error) {
      console.error('❌ App initialization error:', error);
      this.isAppInit = false;
    }
  }

  private async waitForJeepSqlite(): Promise<void> {
    const platform = Capacitor.getPlatform();
    if (platform !== 'web') return;

    // Wait for jeep-sqlite custom element to be defined
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
      
      // Start checking after a small delay
      setTimeout(checkElement, 100);
    });
  }
}
