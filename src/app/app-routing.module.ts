import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

export const routes: Routes = [
{
    path: 'account',
    loadChildren: () => import('./pages/login/login.module').then(m => m.LoginModule),
  },
  {
    path: '',
    loadChildren: () => import('./pages/pages.module').then(m => m.PagesModule),
  },
  { path: '**',
    redirectTo: ''
  } // 重定向未匹配的路徑
];

@NgModule({
  imports: [RouterModule.forRoot(routes),],
  exports: [RouterModule,]
})
export class AppRoutingModule { }
