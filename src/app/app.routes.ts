import { Routes } from '@angular/router';
import { PUBLIC_ROUTES } from './routes/public.routes';
import { PRIVATE_ROUTES } from './routes/private.routes';

export const routes: Routes = [
  {
    path: '',
    children: [
      ...PUBLIC_ROUTES,
      ...PRIVATE_ROUTES
    ]
  },

];
