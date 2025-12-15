import { APP_INITIALIZER, importProvidersFrom, provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { Capacitor } from '@capacitor/core';
import { defineCustomElements as pwaElements } from '@ionic/pwa-elements/loader';
import { defineCustomElements as jeepSqlite } from 'jeep-sqlite/loader';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { DatabaseService } from '@app/core/database-services/database.service';
import { createTranslateLoader } from '@app/core/translate-loader';


// Web platform setup for SQLite
const platform = Capacitor.getPlatform();
let jeepSqliteReady: Promise<void> | null = null;

if (platform === "web") {
  // Define custom elements
  pwaElements(window);
  jeepSqlite(window);

  // Create a promise that resolves when jeep-sqlite is ready
  jeepSqliteReady = new Promise((resolve) => {
    window.addEventListener('DOMContentLoaded', async () => {
      try {
        const jeepEl = document.createElement("jeep-sqlite");
        document.body.appendChild(jeepEl);
        await customElements.whenDefined('jeep-sqlite');
        jeepEl.autoSave = true;
        console.log('✅ jeep-sqlite element initialized successfully');
        resolve();
      } catch (err) {
        console.error('❌ Error initializing jeep-sqlite:', err);
        resolve(); // Resolve anyway to prevent hanging
      }
    });
  });
}

// Export for use in services
export { jeepSqliteReady };

// APP_INITIALIZER factory
export function initializeFactory(dbService: DatabaseService) {
  return async () => {
    try {
      console.log('🚀 Initializing database...');
      await dbService.initializeDatabase();
      console.log('✅ Database initialization complete');
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      throw error;
    }
  };
}

bootstrapApplication(AppComponent, {
  providers: [
    // Modern Angular: Zoneless Change Detection (better performance)
    provideZonelessChangeDetection(),
    
    // HTTP Client for translations
    provideHttpClient(),
    
    // Translation Module
    importProvidersFrom(
      TranslateModule.forRoot({
        defaultLanguage: 'en',
        loader: {
          provide: TranslateLoader,
          useFactory: createTranslateLoader,
          deps: [HttpClient]
        }
      })
    ),
    
    // Database Service
    DatabaseService,
    
    // Routing & Ionic
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular({
      mode: 'md',
      innerHTMLTemplatesEnabled: true,
    }),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    
    // App Initialization
    {
      provide: APP_INITIALIZER,
      useFactory: initializeFactory,
      deps: [DatabaseService],
      multi: true
    }
  ],
});
