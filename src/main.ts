import { APP_INITIALIZER } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { Capacitor } from '@capacitor/core';
import { defineCustomElements as pwaElements } from '@ionic/pwa-elements/loader';
import { defineCustomElements as jeepSqlite } from 'jeep-sqlite/loader';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { InitializeAppService } from './app/services/initialize.app.service';
import { SQLiteService } from './app/services/sqlite.service';
import { StorageService } from './app/services/storage.service';
import { DbnameVersionService } from './app/services/dbname-version.service';

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
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeFactory,
      deps: [InitializeAppService],
      multi: true
    }
  ],
});
