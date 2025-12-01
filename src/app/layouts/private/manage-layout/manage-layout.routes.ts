import { Routes } from '@angular/router';

/**
 * Management Layout Routes - WITH sidenav, WITHOUT ion-tabs
 * Data management pages (products, customers, etc.)
 */
export const menageRoutes: Routes = [
    {
        path: '',
        loadComponent: () => import('./manage-layout.page').then((m) => m.ManageLayoutPage),
        children: [
            {
                path: 'products',
                loadComponent: () => import('../../../features/components/private/products/products.component').then(m => m.ProductsComponent)
            },
            {
                path: 'customers',
                loadComponent: () => import('../../../features/components/private/customers/customers.component').then(m => m.CustomersComponent)
            },
            {
                path: '', redirectTo: 'products', pathMatch: 'full'
            }
        ]
    }
];
