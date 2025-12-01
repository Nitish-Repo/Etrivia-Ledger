import { Routes } from '@angular/router';
import { PUBLIC_ROUTES } from './routes/public.routes';
import { AuthGuard } from '@app/core/auth.guard';

export const routes: Routes = [
  // Public routes (no guard)
  {
    path: '',
    children: PUBLIC_ROUTES
  },
  // Private routes with tabs (home, dashboard, sell, settings)
  {
    path: '',
    canActivateChild: [AuthGuard],
    loadChildren: () => import('./routes/private.routes').then((m) => m.PRIVATE_ROUTES),
  },
  // Management routes without tabs (products, customers)
  {
    path: 'manage',
    canActivateChild: [AuthGuard],
    loadChildren: () => import('./routes/management.routes').then((m) => m.MANAGEMENT_ROUTES),
  },
];
