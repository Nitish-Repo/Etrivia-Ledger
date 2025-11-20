import { inject, Injectable } from '@angular/core';

const TOKEN_KEY = 'auth_token';

@Injectable({ providedIn: 'root' })
export class TokenService {
  private storage = localStorage;

  setToken(token: string): void {
    this.storage.setItem(TOKEN_KEY, token);
  }

  getToken(): string | null {
    return this.storage.getItem(TOKEN_KEY);
  }

  removeToken(): void {
    this.storage.removeItem(TOKEN_KEY);
  }
}
