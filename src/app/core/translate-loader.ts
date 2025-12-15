import { HttpClient, HttpParams } from '@angular/common/http';
import { TranslateLoader } from '@ngx-translate/core';
import { Observable } from 'rxjs';

/**
 * Custom Translation Loader with Cache Busting
 * Loads translation files with version parameter to prevent caching issues
 */
export class CustomTranslateLoader implements TranslateLoader {
  constructor(
    private http: HttpClient,
    private prefix: string = '/assets/i18n/',
    private suffix: string = '.json'
  ) {}

  /**
   * Load translation file with cache-busting parameter
   */
  getTranslation(lang: string): Observable<any> {
    const timestamp = new Date().getTime();
    const params = new HttpParams().set('v', timestamp.toString());
    
    return this.http.get(`${this.prefix}${lang}${this.suffix}`, { params });
  }
}

/**
 * Factory function for creating TranslateLoader
 */
export function createTranslateLoader(http: HttpClient): TranslateLoader {
  return new CustomTranslateLoader(http, '/assets/i18n/', '.json');
}
