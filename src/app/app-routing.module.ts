// src/app/app-routing.module.ts
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { PublicGuard } from './guards/public.guard'; // 引入 PublicGuard

export const routes: Routes = [
  { path: '', redirectTo: 'sso/dashboard', pathMatch: 'full', },
  {
    path: 'login',
    loadChildren: () => import('./pages/base/login/login.module').then((m) => m.LoginModule),
    canActivate: [PublicGuard], // 使用 PublicGuard
  },
  {
    path: 'sso/dashboard',
    loadChildren: () => import('./pages/base/sso-dashboard/sso-dashboard.module').then((m) => m.SsoDashboardModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'account', // 匹配所有其他路徑，作為 PagesModule 的入口
    loadChildren: () => import('./pages/pages.module').then((m) => m.PagesModule),
    canActivate: [AuthGuard], // 守護 PagesModule 及其所有子路由
  },
  // 5. 任何未匹配的路由導向 NotFoundComponent (404 頁面)
  //    注意：這個應該放在所有路由的最後面。
  { path: '**', loadChildren: () => import('./pages/base/notfound/notfound.module').then(m => m.NotfoundModule) },
  // 或者你也可以保持 redirectTo: 'login'，但通常 404 頁面更適合
  // { path: '**', redirectTo: 'login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
