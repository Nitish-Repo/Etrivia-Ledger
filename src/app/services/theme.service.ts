import { Injectable, inject } from '@angular/core';

export type ThemeMode = 'auto' | 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'app-theme-mode';
  private prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

  constructor() {
    this.initializeTheme();
    this.listenToSystemChanges();
  }

  private initializeTheme(): void {
    const savedMode = this.getThemeMode();
    this.applyTheme(savedMode);
  }

  private listenToSystemChanges(): void {
    this.prefersDark.addEventListener('change', (mediaQuery) => {
      const currentMode = this.getThemeMode();
      // Only auto-update if mode is 'auto'
      if (currentMode === 'auto') {
        this.applyDarkMode(mediaQuery.matches);
      }
    });
  }

  private applyTheme(mode: ThemeMode): void {
    if (mode === 'auto') {
      this.applyDarkMode(this.prefersDark.matches);
    } else if (mode === 'dark') {
      this.applyDarkMode(true);
    } else {
      this.applyDarkMode(false);
    }
  }

  private applyDarkMode(isDark: boolean): void {
    document.documentElement.classList.toggle('ion-palette-dark', isDark);
  }

  /**
   * Set theme mode: 'auto' (system), 'light', or 'dark'
   */
  setThemeMode(mode: ThemeMode): void {
    localStorage.setItem(this.THEME_KEY, mode);
    this.applyTheme(mode);
  }

  /**
   * Get current theme mode
   */
  getThemeMode(): ThemeMode {
    const saved = localStorage.getItem(this.THEME_KEY) as ThemeMode;
    return saved || 'auto';
  }

  /**
   * Check if dark mode is currently active
   */
  isDarkModeActive(): boolean {
    return document.documentElement.classList.contains('ion-palette-dark');
  }
}
