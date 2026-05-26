import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { PublicGuard } from './core/guards/public.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'account', pathMatch: 'full', },
  {
    path: 'login',
    loadComponent: () => import('./pages/base/login/login.component').then(m => m.LoginComponent),
    canActivate: [PublicGuard]
  },
  {
    path: 'sso/dashboard',
    loadComponent: () => import('./pages/base/sso-dashboard/sso-dashboard.component').then(m => m.SsoDashboardComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'account',
    loadChildren: () => import('./pages/pages.routes').then(m => m.pagesRoutes),
    canActivate: [AuthGuard]
  },
  {
    path: 'reports',
    loadChildren: () => import('./reports/reports.routes').then(m => m.reportsRoutes),
    canActivate: [AuthGuard]
  },
  {
    path: 'demo',
    loadComponent: () => import('./pages/base/demo/input.table.component').then(m => m.InputTableComponent)
  },
  { path: '**', redirectTo: 'login' },
];
