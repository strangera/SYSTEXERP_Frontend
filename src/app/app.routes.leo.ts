// src/app/app.routes.dev.ts
import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'account', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./pages/base/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'account',
    loadChildren: () => import('./pages/pages.routes.leo').then(m => {
      return m.pagesRoutes;
    }),
    canActivate: [AuthGuard]
  },
  { path: '**', redirectTo: 'login' }
];
