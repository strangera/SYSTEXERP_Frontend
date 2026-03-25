import { Routes } from '@angular/router';
import { AuthGuard } from '../core/guards/auth.guard';
import { ReportsComponent } from './reports.component';

export const reportsRoutes: Routes = [
  {
    path: '',
    component: ReportsComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'fin', loadChildren: () => import('./fin/fin.routing').then(m => m.finRoutes) },// 財務會計系統 (FIN)
    ]
  }
];
