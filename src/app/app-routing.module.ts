// src/app/app-routing.module.ts
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { PublicGuard } from './guards/public.guard'; // 引入 PublicGuard
import { SsoDashboardComponent } from './pages/base/sso-dashboard/sso-dashboard.component';
import { NotfoundComponent } from './pages/base/notfound/notfound.component';

export const routes: Routes = [
  // 1. 登入頁面：只允許未登入用戶訪問。已登入用戶會被 PublicGuard 導向到 /SSO/dashboard。
  {
    path: 'login',
    loadChildren: () => import('./pages/base/login/login.module').then((m) => m.LoginModule),
    canActivate: [PublicGuard], // 使用 PublicGuard
  },

  // 2. 登入後的主控台頁面 (SSO Dashboard)
  {
    path: 'SSO/dashboard',
    component: SsoDashboardComponent,
    canActivate: [AuthGuard], // 只有登入用戶才能訪問
  },

  // 3. 所有需要認證的「主功能頁面」。
  //    注意：這裡的 path: '' 是為了匹配所有非 'login' 和 'SSO/dashboard' 的根路徑，
  //    然後再由 PagesModule 內部的子路由處理。
  //    PagesModule 的根路由 (path: '') 本身也應該被 AuthGuard 守護。
  {
    path: 'account', // 匹配所有其他路徑，作為 PagesModule 的入口
    loadChildren: () => import('./pages/pages.module').then((m) => m.PagesModule),
    canActivate: [AuthGuard], // 守護 PagesModule 及其所有子路由
  },

  // 4. 根目錄導向邏輯 (放在路由配置的最前方，但實際執行順序會在 PublicGuard 後)
  //    如果用戶訪問根目錄 '/'
  //    - PublicGuard (在 login 路徑被 canActivate) 會將已登入用戶導向 'SSO/dashboard'
  //    - 這裡的 '' redirectTo 'SSO/dashboard' 只會在 AuthGuard 允許時觸發。
  //    - 最佳做法是讓 PublicGuard 處理根路徑的重定向邏輯
  {
    path: '',
    redirectTo: 'SSO/dashboard', // 已登入用戶訪問根目錄時的預設頁面
    pathMatch: 'full',
  },

  // 5. 任何未匹配的路由導向 NotFoundComponent (404 頁面)
  //    注意：這個應該放在所有路由的最後面。
  { path: '**', component: NotfoundComponent }, // 假設你有一個 NotFoundComponent
  // 或者你也可以保持 redirectTo: 'login'，但通常 404 頁面更適合
  // { path: '**', redirectTo: 'login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
