import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * Login Guard - Prevents authenticated users from accessing login page
 * Redirects to home if already logged in
 */
export const LoginGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = auth.getToken();
  
  if (token) {
    // User is already logged in, redirect to home
    router.navigate(['/home']);
    return false;
  }
  
  // User not logged in, allow access to login page
  return true;
};
