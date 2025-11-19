import { Routes } from '@angular/router';

export const PUBLIC_ROUTES: Routes = [
    {
        path: '',
        children: [
            {
                path: 'login',
                loadComponent: () => import('../features/pages/public/login/login.page').then(m => m.LoginPage)
            },
            {
                path: 'reset-password',
                loadComponent: () => import('../features/pages/public/reset-password/reset-password.page').then(m => m.ResetPasswordPage)
            },
            // {
            //     path: 'home',
            //     loadComponent: () =>
            //         import('./home/home.component').then(m => m.HomeComponent)
            // },
            { path: '', redirectTo: 'login', pathMatch: 'full' }
        ]
    }
];
