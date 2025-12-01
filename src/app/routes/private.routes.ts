import { Routes } from '@angular/router';
import { AuthGuard } from '@app/core/auth.guard';

export const PRIVATE_ROUTES: Routes = [
    // Routes WITH ion-tabs (inside private layout)
    {
        path: '',
        canActivateChild: [AuthGuard],
        loadComponent: () => import('../layouts/private/private-layout.page').then((m) => m.PrivateLayoutPage),
        children: [
            {
                path: 'home',
                loadComponent: () => import('../features/pages/private/home/home.page').then((m) => m.HomePage),
            },
            {
                path: 'dashboard',
                loadComponent: () => import('../features/pages/private/dashboard/dashboard.page').then(m => m.DashboardPage)
            },
            {
                path: 'sell',
                loadComponent: () => import('../features/pages/private/sell/sell.page').then(m => m.SellPage)
            },
            {
                path: 'settings',
                loadComponent: () => import('../features/pages/private/settings/settings.page').then(m => m.SettingsPage)
            },
            {
                path: '', redirectTo: 'home', pathMatch: 'full'
            }
        ]
    },
    // Routes WITHOUT ion-tabs (standalone pages)
    {
        path: 'products',
        canActivate: [AuthGuard],
        loadComponent: () => import('../features/components/private/products/products.component').then(m => m.ProductsComponent)
    },
    {
        path: 'customers',
        canActivate: [AuthGuard],
        loadComponent: () => import('../features/components/private/customers/customers.component').then(m => m.CustomersComponent)
    }
];
