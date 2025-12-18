import { Injectable, inject } from '@angular/core';
import { Platform, ModalController, AlertController, PopoverController } from '@ionic/angular/standalone';
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
  private modalCtrl = inject(ModalController);
  private alertCtrl = inject(AlertController);
  private popoverCtrl = inject(PopoverController);

  private readonly EXIT_ROUTES = ['/home', '/dashboard', '/settings'];

  /**
   * Initialize all native features
   */
  async init() {
    await this.platform.ready();
    
    this.setBackButton();
    // this.setupStatusBar();
    // Add more native feature initializations here
    // this.setupPushNotifications();
    // this.setupSplashScreen();
  }

  /**
   * Configure hardware back button behavior
   * Priority: Dismiss overlays > Handle navigation > Exit app
   */
  private setBackButton() {
    if (!Capacitor.isNativePlatform()) return;

    App.addListener('backButton', async ({ canGoBack }) => {
      // Check and dismiss any open overlays
      if (await this.dismissOpenOverlay()) {
        return;
      }

      // Handle page navigation or app exit
      this.handleNavigation(canGoBack);
    });
  }

  /**
   * Dismiss any open overlay (modal, alert, popover)
   * @returns true if an overlay was dismissed
   */
  private async dismissOpenOverlay(): Promise<boolean> {
    const modal = await this.modalCtrl.getTop();
    if (modal) {
      await modal.dismiss();
      return true;
    }

    const alert = await this.alertCtrl.getTop();
    if (alert) {
      await alert.dismiss();
      return true;
    }

    const popover = await this.popoverCtrl.getTop();
    if (popover) {
      await popover.dismiss();
      return true;
    }

    return false;
  }

  /**
   * Handle page navigation or app exit
   */
  private handleNavigation(canGoBack: boolean) {
    const currentUrl = this.router.url;
    const isExitRoute = this.EXIT_ROUTES.some(route => currentUrl.startsWith(route));
    
    if (!canGoBack || isExitRoute) {
      App.exitApp();
    } else {
      window.history.back();
    }
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
