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
      {
        path: 'FIN',
        children: [
          { path: '1', loadChildren: () => import('./fin1000/fin1000.module').then(m => m.FIN1000Module), canActivate: [AuthGuard] }, // 1.1 發票暨媒體申報系統
          { path: '2', loadChildren: () => import('./fin2000/fin2000.module').then(m => m.FIN2000Module), canActivate: [AuthGuard] }, // 1.2 應付帳款系統
          { path: '3', loadChildren: () => import('./fin3000/fin3000.module').then(m => m.FIN3000Module), canActivate: [AuthGuard] }, // 1.3 應收帳款系統
          { path: '4', loadChildren: () => import('./fin4000/fin4000.module').then(m => m.FIN4000Module), canActivate: [AuthGuard] }, // 1.4 預算管理系統
          { path: '5', loadChildren: () => import('./fin5000/fin5000.module').then(m => m.FIN5000Module), canActivate: [AuthGuard] }, // 1.5 總帳管理系統
          { path: '6', loadChildren: () => import('./fin6000/fin6000.module').then(m => m.FIN6000Module), canActivate: [AuthGuard] }, // 1.6 票據管理系統
          { path: '7', loadChildren: () => import('./fin7000/fin7000.module').then(m => m.FIN7000Module), canActivate: [AuthGuard] }, // 1.7 零用金管理系統
        ]
      },
      // 2. 銷售管理系統 (TLS)
      { path: 'TLS', loadChildren: () => import('./tls/tls.module').then(m => m.TlsModule), canActivate: [AuthGuard] },

      // 3. 資產管理系統 (ASS)
      {
        path: 'ASS',
        children: [
          { path: '1', loadChildren: () => import('./ass1000/ass1000.module').then(m => m.ASS1000Module), canActivate: [AuthGuard] }, // 3.1 資材管理系統
          { path: '2', loadChildren: () => import('./ass2000/ass2000.module').then(m => m.ASS2000Module), canActivate: [AuthGuard] }, // 3.2 能源管理系統
        ]
      },
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
