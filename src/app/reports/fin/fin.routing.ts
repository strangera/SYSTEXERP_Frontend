import { Routes } from '@angular/router';

export const finRoutes: Routes = [
  { path: 'fin29050', loadComponent: () => import('./fin29050Report/fin29050Report.component').then(m => m.FIN29050ReportComponent), data: { progNo: 'FIN55080' } },
  { path: 'fin55080', loadComponent: () => import('./fin55080Report/fin55080Report.component').then(m => m.FIN55080ReportComponent), data: { progNo: 'FIN55080' } },
];
