import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './service/system/auth.guard';
import { SsoDashboardComponent } from './pages/base/sso-dashboard/sso-dashboard.component';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./pages/base/login/login.module').then(m => m.LoginModule),
  },
  { path: 'SSO/dashboard', component: SsoDashboardComponent, canActivate: [AuthGuard] },
  {
    path: '',
    loadChildren: () => import('./pages/pages.module').then(m => m.PagesModule),
    canActivate: [AuthGuard], // 添加路由守衛
  },
  {
    path: '**',
    redirectTo: ''
  } // 重定向未匹配的路徑
];

@NgModule({
  imports: [RouterModule.forRoot(routes),],
  exports: [RouterModule,]
})
export class AppRoutingModule { }
