import { Routes } from '@angular/router';

export const sysRoutes: Routes = [
  { path: 'sys0780report', loadComponent: () => import('./sys0780Report/sys0780Report.component').then(m => m.SYS0780ReportComponent), data: { progNo: 'SYS0780' } },
];
