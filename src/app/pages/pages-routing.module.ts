// src/app/pages/pages-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../guards/auth.guard'; // 保持引入，因為 PagesComponent 本身可能需要
import { PagesComponent } from './pages.component';

const routes: Routes = [
  {
    path: '', // 這個 '' 是相對於 app-routing.module.ts 中 loadChildren 的空路徑
    component: PagesComponent,
    canActivate: [AuthGuard], // <-- 將 AuthGuard 放在這裡守護所有 PagesModule 的子路由
    children: [
      // 移除這裡所有 canActivate: [AuthGuard]
      { path: 'dashboard', loadChildren: () => import('./base/dashboard/dashboard.module').then(m => m.DashboardModule) },
      { path: 'demo', loadChildren: () => import('./base/demo/demo.module').then(m => m.DemoModule) },
      { path: 'changepsw', loadChildren: () => import('./base/changepsw/changepsw.module').then(m => m.ChangepswModule) },
      // 1. 財務會計系統 (FIN)
      { path: 'FIN', loadChildren: () => import('./fin/fin.module').then(m => m.FinModule) },
      // 2. 銷售管理系統 (TLS)
      { path: 'TLS', loadChildren: () => import('./tls/tls.module').then(m => m.TlsModule) },
      // 3. 資產管理系統 (ASS)
      { path: 'ASS', loadChildren: () => import('./ass/ass.module').then(m => m.AssModule) },
      // 4. 系統管理 (SYS)
      { path: 'SYS', loadChildren: () => import('./sys/sys.module').then(m => m.SysModule) },
      // 5. 客戶關係管理 (CPM)
      { path: 'CPM', loadChildren: () => import('./cpm/cpm.module').then(m => m.CpmModule) },
      // 注意：這裡的 404 路由只會捕獲 PagesModule 內部未匹配的路由
      { path: '**', loadChildren: () => import('./base/notfound/notfound.module').then(m => m.NotfoundModule) },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule { }
