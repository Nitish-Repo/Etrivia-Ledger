import { Routes } from '@angular/router';
import { AuthGuard } from '@app/core/auth.guard';


export const menageRoutes: Routes  = [
    {
        path: '',
        canActivateChild: [AuthGuard],
        loadComponent: () => import('../../private/manage-layout/manage-layout.page').then((m) => m.ManageLayoutPage),
        children: [
            {
                path: 'products',
                loadComponent: () => import('../../../features/components/private/products/products.component').then(m => m.ProductsComponent)
            },
            {
                path: 'customers',
                loadComponent: () => import('../../../features/components/private/customers/customers.component').then(m => m.CustomersComponent)
            },
        ]
    }
];
