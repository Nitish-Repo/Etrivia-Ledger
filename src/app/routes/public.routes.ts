import { Routes } from '@angular/router';
import { LoginGuard } from '@app/core/login.guard';

export const PUBLIC_ROUTES: Routes = [
    {
        path: '',
        children: [
            {
                path: 'login',
                canActivate: [LoginGuard],
                loadComponent: () => import('../features/pages/public/login/login.page').then(m => m.LoginPage)
            },
            {
                path: 'reset-password',
                loadComponent: () => import('../features/pages/public/reset-password/reset-password.page').then(m => m.ResetPasswordPage)
            }
        ]
    }
];
