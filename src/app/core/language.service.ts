import { Injectable, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

/**
 * Language Service - Handles all translation needs
 */
@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private readonly STORAGE_KEY = 'app_locale';
  private readonly DEFAULT_LANG = 'en';

  // Available languages
  readonly languages = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'hi', name: 'Hindi', native: 'हिंदी' }
  ];

  // Current language (reactive signal)
  current = signal<string>(this.DEFAULT_LANG);

  constructor(private translate: TranslateService) {}

  /**
   * Initialize - Call once in AppComponent
   */
  init(): void {
    const codes = this.languages.map(l => l.code);
    this.translate.addLangs(codes);
    this.translate.setDefaultLang(this.DEFAULT_LANG);

    const saved = localStorage.getItem(this.STORAGE_KEY);
    const browser = this.translate.getBrowserLang();
    const use = saved || (browser && codes.includes(browser) ? browser : this.DEFAULT_LANG);
    
    this.change(use);
  }

  /**
   * Change language
   */
  change(code: string): void {
    if (this.translate.getLangs().includes(code)) {
      this.translate.use(code);
      this.current.set(code);
      localStorage.setItem(this.STORAGE_KEY, code);
    }
  }

  /**
   * Get translation (sync)
   */
  t(key: string, params?: any): string {
    return this.translate.instant(key, params);
  }

  /**
   * Get translation (async)
   */
  get(key: string | string[], params?: any) {
    return this.translate.get(key, params);
  }
}
