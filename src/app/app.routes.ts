import { Routes } from '@angular/router';
import { AuthGuard } from './core/auth.guard';
import { LoginGuard } from './core/login.guard';

export const routes: Routes = [
  {  
    path: '',
    children: [
      {
        path: 'login',
        canActivate: [LoginGuard],
        loadComponent: () => import('./features/pages/public/login/login.page').then(m => m.LoginPage)
      },
      {
        path: 'reset-password',
        loadComponent: () => import('./features/pages/public/reset-password/reset-password.page').then(m => m.ResetPasswordPage)
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },
  {
    path: '',
    canActivateChild: [AuthGuard],
    loadChildren: () => import('./layouts/private/private-layout/private-layout.routes').then((m) => m.protectedRoutes),
  },
  {
    path: 'manage',
    canActivateChild: [AuthGuard],
    loadChildren: () => import('./layouts/private/manage-layout/manage-layout.routes').then(m => m.menageRoutes)
  },
];
