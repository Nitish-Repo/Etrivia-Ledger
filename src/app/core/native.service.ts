import { Injectable, inject } from '@angular/core';
import { Platform } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { App } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

@Injectable({
  providedIn: 'root'
})
export class NativeService {
  private platform = inject(Platform);
  private router = inject(Router);

  /**
   * Initialize all native features
   */
  async init() {
    await this.platform.ready();
    
    this.setupBackButton();
    // this.setupStatusBar();
    // Add more native feature initializations here
    // this.setupPushNotifications();
    // this.setupSplashScreen();
  }

  /**
   * Setup Android back button handler
   */
  private setupBackButton() {
    if (!Capacitor.isNativePlatform()) return;

    App.addListener('backButton', ({ canGoBack }) => {
      const currentUrl = this.router.url;
      
      // Define routes where back button should exit the app
      const exitRoutes = ['/home', '/dashboard', '/sell'];
      
      // Check if current route is an exit route
      const isExitRoute = exitRoutes.some(route => currentUrl.startsWith(route));
      
      if (!canGoBack || isExitRoute) {
        // Exit the app
        App.exitApp();
      } else {
        // Navigate back
        window.history.back();
      }
    });
  }

  /**
   * Setup status bar styling
   */
  private async setupStatusBar() {
    if (!Capacitor.isNativePlatform()) return;

    try {
      // Set status bar style
      await StatusBar.setStyle({ style: Style.Dark });
      
      // Set status bar background color (optional)
      // await StatusBar.setBackgroundColor({ color: '#ffffff' });
      
      // Show status bar
      await StatusBar.show();
    } catch (error) {
      console.error('Status bar setup error:', error);
    }
  }

  /**
   * Setup push notifications
   * TODO: Implement when needed
   */
  private setupPushNotifications() {
    if (!Capacitor.isNativePlatform()) return;
    
    // Implementation will go here
    // - Request permissions
    // - Register for push notifications
    // - Handle incoming notifications
  }

  /**
   * Hide status bar
   */
  async hideStatusBar() {
    if (!Capacitor.isNativePlatform()) return;
    try {
      await StatusBar.hide();
    } catch (error) {
      console.error('Error hiding status bar:', error);
    }
  }

  /**
   * Show status bar
   */
  async showStatusBar() {
    if (!Capacitor.isNativePlatform()) return;
    try {
      await StatusBar.show();
    } catch (error) {
      console.error('Error showing status bar:', error);
    }
  }

  /**
   * Set status bar color
   */
  async setStatusBarColor(color: string) {
    if (!Capacitor.isNativePlatform()) return;
    try {
      await StatusBar.setBackgroundColor({ color });
    } catch (error) {
      console.error('Error setting status bar color:', error);
    }
  }

  /**
   * Check if app can go back in history
   */
  async canGoBack(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) return false;
    
    const info = await App.getInfo();
    return info !== null;
  }

  /**
   * Exit the app
   */
  exitApp() {
    if (!Capacitor.isNativePlatform()) return;
    App.exitApp();
  }
}
