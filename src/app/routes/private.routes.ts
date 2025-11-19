import { Routes } from '@angular/router';

export const PRIVATE_ROUTES: Routes = [
    {
        path: '',
        children: [
            //   {
            //     path: 'login',
            //     loadComponent: () =>
            //       import('./login/login.component').then(m => m.LoginComponent)
            //   },
            {
                path: 'home',
                loadComponent: () => import('../home/home.page').then((m) => m.HomePage),
            },
            {
                path: 'sell',
                loadComponent: () => import('../features/pages/private/sell/sell.page').then(m => m.SellPage)
            },
            {
                path: 'dashboard',
                loadComponent: () => import('../features/pages/private/dashboard/dashboard.page').then(m => m.DashboardPage)
            },
            { path: '', redirectTo: 'home', pathMatch: 'full' }
        ]
    }
];
