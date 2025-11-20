import { Routes } from '@angular/router';
import { AuthGuard } from '@app/core/auth.guard';

export const PRIVATE_ROUTES: Routes = [
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
                path: 'product',
                loadComponent: () => import('../features/pages/private/product/product.page').then(m => m.ProductPage)
            },
            {
                path: 'sell',
                loadComponent: () => import('../features/pages/private/sell/sell.page').then(m => m.SellPage)
            },
            { 
                path: '', 
                redirectTo: 'home', 
                pathMatch: 'full' 
            }
        ]
    }
];
