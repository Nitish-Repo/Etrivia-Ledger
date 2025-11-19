import { Routes } from '@angular/router';

export const PUBLIC_ROUTES: Routes = [
    {
        path: '',
        children: [
            {
                path: 'login',
                loadComponent: () => import('../pages/public/login/login.page').then(m => m.LoginPage)
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
