import { Routes } from '@angular/router';
import { AuthGuard } from '@app/core/auth.guard';
import { LoginGuard } from './core/login.guard';

export const routes: Routes = [
  {
    path: 'manage',
    canActivateChild: [AuthGuard],
    loadChildren: () => import('../app/layouts/private/manage-layout/manage-layout.routes').then(m => m.menageRoutes)
  },
  {
    path: '',
    children: [
      {
        path: 'login',
        canActivate: [LoginGuard],
        loadComponent: () => import('../app/features/pages/public/login/login.page').then(m => m.LoginPage)
      },
      {
        path: 'reset-password',
        loadComponent: () => import('../app/features/pages/public/reset-password/reset-password.page').then(m => m.ResetPasswordPage)
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },
  {
    path: '',
    canActivateChild: [AuthGuard],
    loadChildren: () => import('../app/layouts/private/private-layout/private-layout.routes').then((m) => m.protectedRoutes),
  },
];
