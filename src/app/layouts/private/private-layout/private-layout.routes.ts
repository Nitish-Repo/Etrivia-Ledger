import { Routes } from '@angular/router';

/**
 * Private Layout Routes - WITH ion-tabs
 * Main app navigation pages (home, dashboard, sell, settings)
 */
export const protectedRoutes: Routes = [
    {
        path: '',
        loadComponent: () => import('./private-layout.page').then((m) => m.PrivateLayoutPage),
        children: [
            {
                path: 'home',
                loadComponent: () => import('../../../features/pages/private/home/home.page').then((m) => m.HomePage),
            },
            {
                path: 'dashboard',
                loadComponent: () => import('../../../features/pages/private/dashboard/dashboard.page').then(m => m.DashboardPage)
            },
            {
                path: 'sell',
                loadComponent: () => import('../../../features/pages/private/sell/sell.page').then(m => m.SellPage)
            },
            {
                path: 'settings',
                loadComponent: () => import('../../../features/pages/private/settings/settings.page').then(m => m.SettingsPage)
            },
            {
                path: '', redirectTo: 'home', pathMatch: 'full'
            }
        ]
    }
];
