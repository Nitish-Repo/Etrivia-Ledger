import { Routes } from '@angular/router';
import { PUBLIC_ROUTES } from './routes/public.routes';
import { PRIVATE_ROUTES } from './routes/private.routes';
import { MANAGEMENT_ROUTES } from './routes/management.routes';

export const routes: Routes = [
  {
    path: '',
    children: [
      ...PUBLIC_ROUTES,
      ...PRIVATE_ROUTES,
      ...MANAGEMENT_ROUTES
    ]
  },
 
];
