import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { PublicGuard } from './core/guards/public.guard';
import { PerfDashboardComponent } from './core/layout/debug-sql-display/perf-dashboard/perf-dashboard.component';

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
  { path: 'debug-log', component: PerfDashboardComponent, canActivate: [AuthGuard], data: { role: 'admin' } },
  { path: '**', redirectTo: 'login' },
];
