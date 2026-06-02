import { Routes } from '@angular/router';

export const finRoutes: Routes = [
  { path: 'fin24010', loadComponent: () => import('./fin24010Report/fin24010-report.component').then(m => m.FIN24010ReportComponent), data: { progNo: 'FIN29050' } },
  { path: 'fin29050', loadComponent: () => import('./fin29050Report/fin29050Report.component').then(m => m.FIN29050ReportComponent), data: { progNo: 'FIN29050' } },
  { path: 'fin29060', loadComponent: () => import('./fin29060Report/fin29060Report.component').then(m => m.FIN29060ReportComponent), data: { progNo: 'FIN29060' } },
  { path: 'fin55080', loadComponent: () => import('./fin55080Report/fin55080Report.component').then(m => m.FIN55080ReportComponent), data: { progNo: 'FIN55080' } },
];
