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
            // 1. 財務會計系統 (FIN)
            { path: 'fin', loadChildren: () => import('./fin/fin.routing').then(m => m.finRoutes) },
            // 2. 銷售管理系統 (TLS)
            { path: 'tls', loadChildren: () => import('./tls/tls.routing').then(m => m.tlsRoutes) },
            // 3. 資產管理系統 (ASS)
            { path: 'ass', loadChildren: () => import('./ass/ass.routing').then(m => m.assRoutes) },
            // 4. 系統管理 (SYS)
            { path: 'sys', loadChildren: () => import('./sys/sys.routing').then(m => m.sysRoutes) },
            // 5. 客戶關係管理 (CPM)
            { path: 'cpm', loadChildren: () => import('./cpm/cpm.routing').then(m => m.cpmRoutes) },
            // 注意：這裡的 404 路由只會捕獲 PagesModule 內部未匹配的路由
            { path: '**', loadComponent: () => import('./base/notfound/notfound.component').then(m => m.NotfoundComponent) },
        ]
    }
];
