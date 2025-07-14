import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SsoDashboardComponent } from './sso-dashboard.component';
import { AuthGuard } from '../../../guards/auth.guard';

const routes: Routes = [
  {
    path: '', // 這個 '' 是相對於 app-routing.module.ts 中 loadChildren 的空路徑
    component: SsoDashboardComponent,
    canActivate: [AuthGuard], // <-- 將 AuthGuard 放在這裡守護所有 PagesModule 的子路由
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SsoDashboardRoutingModule { }
