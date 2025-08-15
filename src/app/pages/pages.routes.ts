// src/app/pages/pages.routes.ts
import { Routes } from '@angular/router';
import { AuthGuard } from '../guards/auth.guard';
import { PagesComponent } from './pages.component';

export const pagesRoutes: Routes = [
  {
    path: '',
    component: PagesComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./base/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'demo', loadComponent: () => import('./base/demo/input.table.component').then(m => m.InputTableComponent) },
      { path: 'changepsw', loadComponent: () => import('./base/changepsw/changepsw.component').then(m => m.ChangepswComponent) },
      { path: 'fin', loadChildren: () => import('./fin/fin.routing').then(m => m.finRoutes) },// 財務會計系統 (FIN)
      { path: 'tls', loadChildren: () => import('./tls/tls.routing').then(m => m.tlsRoutes) },// 銷售管理系統 (TLS)
      { path: 'sys', loadChildren: () => import('./sys/sys.routing').then(m => m.sysRoutes) },// 系統管理 (SYS)
      { path: 'ass', loadChildren: () => import('./ass/ass.routing').then(m => m.assRoutes) },// 資產管理系統 (ASS)
      { path: 'cpm', loadChildren: () => import('./cpm/cpm.routing').then(m => m.cpmRoutes) },// 客戶關係管理 (CPM)
      { path: '**', loadComponent: () => import('./base/notfound/notfound.component').then(m => m.NotfoundComponent) },
    ]
  }
];
