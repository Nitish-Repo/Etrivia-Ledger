import { Routes } from '@angular/router';
import { AuthGuard } from '@app/core/auth.guard';


export const MANAGEMENT_ROUTES: Routes = [
    {
        path: 'manage',
        canActivateChild: [AuthGuard],
        loadComponent: () => import('../layouts/private/private-layout.component').then((m) => m.PrivateLayoutComponent),
        children: [
            {
                path: 'products',
                loadComponent: () => import('../features/components/private/products/products.component').then(m => m.ProductsComponent)
            },
            {
                path: 'customers',
                loadComponent: () => import('../features/components/private/customers/customers.component').then(m => m.CustomersComponent)
            },
        ]
    }
];
