import { Routes } from '@angular/router';
import { AuthGuard } from '../core/guards/auth.guard';
import { PagesComponent } from './pages.component';

export const pagesRoutes: Routes = [
  {
    path: '',
    component: PagesComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./base/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'fin', loadChildren: () => import('./fin/fin.routing.leo').then(m => m.finRoutes) },// 財務會計系統 (FIN)
      { path: 'tls', loadChildren: () => import('./tls/tls.routing.leo').then(m => m.tlsRoutes) },// 銷售管理系統 (TLS)
      { path: 'sys', loadChildren: () => import('./sys/sys.routing.leo').then(m => m.sysRoutes) },// 系統管理 (SYS)
      { path: 'ass', loadChildren: () => import('./ass/ass.routing.leo').then(m => m.assRoutes) },// 資產管理系統 (ASS)
      { path: 'cpm', loadChildren: () => import('./cpm/cpm.routing.leo').then(m => m.cpmRoutes) },// 客戶關係管理 (CPM)
      { path: '**', loadComponent: () => import('./base/notfound/notfound.component').then(m => m.NotfoundComponent) },
    ]
  }
];
