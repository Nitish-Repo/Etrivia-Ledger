import { Routes } from '@angular/router';
import { AuthGuard } from '@app/core/auth.guard';

export const PRIVATE_ROUTES: Routes = [
    {
        path: '',
        canActivateChild: [AuthGuard],
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
            {
                path: 'product',
                loadComponent: () => import('../features/pages/private/product/product.page').then(m => m.ProductPage)
            },
            { path: '', redirectTo: 'home', pathMatch: 'full' }
        ]
    }
];
