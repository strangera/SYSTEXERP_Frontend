import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../service/system/auth.guard';
import { PagesComponent } from './pages.component';

const routes: Routes = [
{
  path: '',
  component: PagesComponent,
  children: [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    {
      path: '',
      loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule),
    },
    {
      path: 'demo',
      loadChildren: () => import('./demo/demo.module').then(m => m.DemoModule),
    },
    {
      path: 'FIN1000', // 1.1 發票暨媒體申報系統
      loadChildren: () => import('./fin1000/fin1000.module').then(m => m.FIN1000Module),
    },
    {
      path: 'FIN2000', // 1.2 應付帳款系統
      loadChildren: () => import('./fin2000/fin2000.module').then(m => m.FIN2000Module),
    },
    {
      path: 'FIN3000', // 1.3 應收帳款系統
      loadChildren: () => import('./fin3000/fin3000.module').then(m => m.FIN3000Module),
    },
    {
      path: 'FIN4000', // 1.4 預算管理系統
      loadChildren: () => import('./fin4000/fin4000.module').then(m => m.FIN4000Module),
    },
    {
      path: 'FIN5000', // 1.5 總帳管理系統
      loadChildren: () => import('./fin5000/fin5000.module').then(m => m.FIN5000Module),
    },
    {
      path: 'FIN6000', // 1.6 票據管理系統
      loadChildren: () => import('./fin6000/fin6000.module').then(m => m.FIN6000Module),
    },
    {
      path: 'FIN7000', // 1.7 零用金管理系統
      loadChildren: () => import('./fin7000/fin7000.module').then(m => m.FIN7000Module),
    },
    {
      path: 'TLS1000', // 2.1 招商暨合約系統
      loadChildren: () => import('./tls1000/tls1000.module').then(m => m.TLS1000Module),
    },
    {
      path: 'TLS2000', // 2.2 專櫃營運管理
      loadChildren: () => import('./tls2000/tls2000.module').then(m => m.TLS2000Module),
    },
    {
      path: 'TLS3000', // 2.3 決策支援管理-營運管理及銷售分析報表
      loadChildren: () => import('./tls3000/tls3000.module').then(m => m.TLS3000Module),
    },
    {
      path: 'TLS4000', // 2.4 POS網管系統
      loadChildren: () => import('./tls4000/tls4000.module').then(m => m.TLS4000Module),
    },
    {
      path: 'TLS5000', // 2.5 自營管理系統
      loadChildren: () => import('./tls5000/tls5000.module').then(m => m.TLS5000Module),
    },
    {
      path: 'ASS1000', // 3.1 資材管理系統
      loadChildren: () => import('./ass1000/ass1000.module').then(m => m.ASS1000Module),
    },
    {
      path: 'ASS2000', // 3.2 能源管理系統
      loadChildren: () => import('./ass2000/ass2000.module').then(m => m.ASS2000Module),
    },
    {
      path: 'SYSB000', // 4.1 基本資料管理系統
      loadChildren: () => import('./sysb000/sysb000.module').then(m => m.SYSB000Module),
    },
    {
      path: 'SYS0000', // 4.2 權限管理系統
      loadChildren: () => import('./sys0000/sys0000.module').then(m => m.SYS0000Module),
    },
    {
      path: 'CPM1000', // 5.1 客服客訴系統
      loadChildren: () => import('./cpm1000/cpm1000.module').then(m => m.CPM1000Module),
    },
    {
      path: 'CPM2000', // 5.2 行銷活動管理系統
      loadChildren: () => import('./cpm2000/cpm2000.module').then(m => m.CPM2000Module),
    },
    {
      path: '**',
      loadChildren: () => import('./notfound/notfound.module').then(m => m.NotfoundModule),
    },
    // 其他子路由
  ]
},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule { }
