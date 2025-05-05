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
      { path: 'dashboard', loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule), canActivate: [AuthGuard] },
      { path: 'demo', loadChildren: () => import('./demo/demo.module').then(m => m.DemoModule), canActivate: [AuthGuard] },
      { path: 'changepsw', loadChildren: () => import('./changepsw/changepsw.module').then(m => m.ChangepswModule), canActivate: [AuthGuard] },
      // 1. 財務會計系統 (FIN)
      { path: 'FIN', loadChildren: () => import('./fin/fin.module').then(m => m.FinModule), canActivate: [AuthGuard] },
      // 2. 銷售管理系統 (TLS)
      { path: 'TLS', loadChildren: () => import('./tls/tls.module').then(m => m.TlsModule), canActivate: [AuthGuard] },
      // 3. 資產管理系統 (ASS)
      { path: 'ASS', loadChildren: () => import('./ass/ass.module').then(m => m.AssModule), canActivate: [AuthGuard] },
      // 4. 系統管理 (SYS)
      { path: 'SYS', loadChildren: () => import('./sys/sys.module').then(m => m.SysModule), canActivate: [AuthGuard] },
      // 5. 客戶關係管理 (CPM)
      {
        path: 'CPM',
        children: [
          { path: '1', loadChildren: () => import('./cpm1000/cpm1000.module').then(m => m.CPM1000Module), canActivate: [AuthGuard] }, // 5.1 客服客訴系統
          { path: '2', loadChildren: () => import('./cpm2000/cpm2000.module').then(m => m.CPM2000Module), canActivate: [AuthGuard] }, // 5.2 行銷活動管理系統
        ]
      },
      {
        path: '**',
        loadChildren: () => import('./notfound/notfound.module').then(m => m.NotfoundModule),
      },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule { }
