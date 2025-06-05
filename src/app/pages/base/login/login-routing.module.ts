import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
// Component
import { LoginComponent } from './login.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' }, // 重定向到 dashboard
  {
    path: 'login',
    component: LoginComponent
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ],
})
export class LoginRoutingModule { }
