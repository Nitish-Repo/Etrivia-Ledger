import { inject, Injectable } from '@angular/core';
import { TokenService } from './token.service';
import { Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenService = inject(TokenService);

  // login(credentials: { email: string; password: string }): Observable<any> {
  //   return this.api.post<any>('account/login', credentials, { withCredentials: true }).pipe(
  //     tap((res) => {
  //       const token = res?.token ?? res?.accessToken ?? res?.access_token ?? null;
  //       if (token) {
  //         this.tokenService.setToken(token);
  //       }
  //     }),
  //   );
  // }

  /**
   * Call server to clear refresh cookie and remove client token.
   * Returns an observable that completes when logout is finished.
   */
  // logout(): Observable<any> {
  //   return this.api.post<any>('account/logout', {}, { withCredentials: true }).pipe(
  //     tap(() => {
  //       this.tokenService.removeToken();
  //     }),
  //   );
  // }

  getToken(): string | null {
    return this.tokenService.getToken();
  }

  /**
   * Decode JWT payload (no validation) and return parsed object or null.
   */
  getUserFromToken(): any | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const parts = token.split('.');
      if (parts.length < 2) return null;
      const payload = parts[1];
      const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decodeURIComponent(escape(json)));
    } catch (e) {
      return null;
    }
  }
}
