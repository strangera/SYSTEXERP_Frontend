// src/app/app.routing.ts
import { Routes } from '@angular/router';
import { PublicGuard } from './core/guards/public.guard';
import { AuthGuard } from './core/guards/auth.guard';

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
    path: 'demo',
    loadComponent: () => import('./pages/base/demo/input.table.component').then(m => m.InputTableComponent)
  },

  // 5. 任何未匹配的路由導向 NotFoundComponent (404 頁面)
  //    注意：這個應該放在所有路由的最後面。
  // { path: '**', loadComponent: () => import('./pages/base/notfound/notfound.component').then(m => m.NotfoundComponent) },
  // 或者你也可以保持 redirectTo: 'login'，但通常 404 頁面更適合
  { path: '**', redirectTo: 'login' },
];
