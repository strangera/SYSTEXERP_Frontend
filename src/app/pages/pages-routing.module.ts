import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../service/system/auth.guard';
import { PagesComponent } from './pages.component';

const routes: Routes = [
  {
    path: '',
    component: PagesComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }, // 重定向到 dashboard
      { path: 'dashboard', loadChildren: () => import('./base/dashboard/dashboard.module').then(m => m.DashboardModule), canActivate: [AuthGuard] },
      { path: 'demo', loadChildren: () => import('./base/demo/demo.module').then(m => m.DemoModule), canActivate: [AuthGuard] },
      { path: 'changepsw', loadChildren: () => import('./base/changepsw/changepsw.module').then(m => m.ChangepswModule), canActivate: [AuthGuard] },
      // 1. 財務會計系統 (FIN)
      { path: 'FIN', loadChildren: () => import('./fin/fin.module').then(m => m.FinModule), canActivate: [AuthGuard] },
      // 2. 銷售管理系統 (TLS)
      { path: 'TLS', loadChildren: () => import('./tls/tls.module').then(m => m.TlsModule), canActivate: [AuthGuard] },
      // 3. 資產管理系統 (ASS)
      { path: 'ASS', loadChildren: () => import('./ass/ass.module').then(m => m.AssModule), canActivate: [AuthGuard] },
      // 4. 系統管理 (SYS)
      { path: 'SYS', loadChildren: () => import('./sys/sys.module').then(m => m.SysModule), canActivate: [AuthGuard] },
      // 5. 客戶關係管理 (CPM)
      { path: 'CPM', loadChildren: () => import('./cpm/cpm.module').then(m => m.CpmModule), canActivate: [AuthGuard] },
      {
        path: '**',
        loadChildren: () => import('./base/notfound/notfound.module').then(m => m.NotfoundModule),
      },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule { }
