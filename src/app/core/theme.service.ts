import { Injectable, signal, effect, computed } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { inject } from '@angular/core';

/**
 * Theme modes supported by the application
 */
export type ThemeMode = 'light' | 'dark' | 'auto';

/**
 * Service to manage application theme (light/dark mode)
 * Integrates with Angular Material 3 theming system
 * Supports:
 * - Auto detection from system preference
 * - Manual light/dark toggle
 * - Persists user preference to localStorage
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private document = inject(DOCUMENT);
  private readonly STORAGE_KEY = 'app-theme-mode';

  // Current theme mode selected by user
  private themeModeSignal = signal<ThemeMode>(this.getInitialTheme());

  // Actual theme applied (resolves 'auto' to light/dark)
  actualTheme = computed(() => {
    const mode = this.themeModeSignal();
    if (mode === 'auto') {
      return this.getSystemTheme();
    }
    return mode;
  });

  // Public read-only signal for current theme mode
  themeMode = this.themeModeSignal.asReadonly();

  // Check if dark mode is active
  isDarkMode = computed(() => this.actualTheme() === 'dark');

  constructor() {
    // Apply theme whenever it changes
    effect(() => {
      const theme = this.actualTheme();
      this.applyTheme(theme);
    });

    // Listen to system theme changes when in auto mode
    if (typeof window !== 'undefined') {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (this.themeModeSignal() === 'auto') {
          // Trigger re-computation by updating signal
          this.themeModeSignal.set('auto');
        }
      });
    }
  }

  /**
   * Set theme mode (light, dark, or auto)
   */
  setThemeMode(mode: ThemeMode): void {
    this.themeModeSignal.set(mode);
    this.saveThemePreference(mode);
  }

  /**
   * Toggle between light and dark mode
   * If currently in auto mode, switch to explicit light/dark based on current system preference
   */
  toggleTheme(): void {
    const current = this.actualTheme();
    const next: ThemeMode = current === 'dark' ? 'light' : 'dark';
    this.setThemeMode(next);
  }

  /**
   * Get initial theme from localStorage or default to auto
   */
  private getInitialTheme(): ThemeMode {
    if (typeof localStorage === 'undefined') {
      return 'auto';
    }
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return (stored as ThemeMode) || 'auto';
  }

  /**
   * Get system theme preference
   */
  private getSystemTheme(): 'light' | 'dark' {
    if (typeof window === 'undefined') {
      return 'light';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  /**
   * Apply theme by adding/removing CSS classes on html element
   * Material 3 themes are applied via these classes in styles.scss
   */
  private applyTheme(theme: 'light' | 'dark'): void {
    const html = this.document.documentElement;
    html.classList.remove('light-theme', 'dark-theme');
    html.classList.add(`${theme}-theme`);
  }

  /**
   * Save theme preference to localStorage
   */
  private saveThemePreference(mode: ThemeMode): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEY, mode);
    }
  }
}
