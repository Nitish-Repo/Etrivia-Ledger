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
            { path: '', redirectTo: 'home', pathMatch: 'full' }
        ]
    }
];
