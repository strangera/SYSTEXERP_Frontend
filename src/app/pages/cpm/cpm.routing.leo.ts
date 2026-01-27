import { Routes } from '@angular/router';

export const cpmRoutes: Routes = [
  { path: 'cpm11090', loadComponent: () => import('./cpm11090/cpm11090.component').then(m => m.Cpm11090Component), data: { progNo: 'Cpm11090' } }, // 尋人登錄作業
  { path: 'cpm11090cru', loadComponent: () => import('./cpm11090cru/cpm11090cru.component').then(m => m.CPM11090CRUComponent), data: { progNo: 'Cpm11090' } }, // 尋人登錄作業
  { path: 'cpm12010', loadComponent: () => import('./cpm12010/cpm12010.component').then(m => m.CPM12010Component), data: { progNo: 'CPM12010' } }, // 顧客意見類別維護
  { path: 'cpm12010cru', loadComponent: () => import('./cpm12010-cru/cpm12010-cru.component').then(m => m.CPM12010CRUComponent), data: { progNo: 'CPM12010' } },
  { path: 'cpm12020', loadComponent: () => import('./cpm12020/cpm12020.component').then(m => m.CPM12020Component), data: { progNo: 'CPM12020' } }, // 顧客意見責任單位維護
  { path: 'cpm12020cru', loadComponent: () => import('./cpm12020-cru/cpm12020-cru.component').then(m => m.CPM12020CRUComponent), data: { progNo: 'CPM12020' } },
  { path: 'cpm12030', loadComponent: () => import('./cpm12030/cpm12030.component').then(m => m.CPM12030Component), data: { progNo: 'CPM12030' } }, // 顧客意見子類別維護
  { path: 'cpm12030cru', loadComponent: () => import('./cpm12030-cru/cpm12030-cru.component').then(m => m.CPM12030CRUComponent), data: { progNo: 'CPM12030' } },
  { path: 'cpm12040', loadComponent: () => import('./cpm12040/cpm12040.component').then(m => m.CPM12040Component), data: { progNo: 'CPM12040' } }, // 顧客意見來源維護
  { path: 'cpm12040cru', loadComponent: () => import('./cpm12040-cru/cpm12040-cru.component').then(m => m.CPM12040CRUComponent), data: { progNo: 'CPM12040' } },
  { path: 'cpm12070', loadComponent: () => import('./cpm12070/cpm12070.component').then(m => m.CPM12070Component), data: { progNo: 'CPM12070' } }, // 顧客意見類別統計表
  { path: 'cpm13010', loadComponent: () => import('./cpm13010/cpm13010.component').then(m => m.CPM13010Component), data: { progNo: 'CPM13010' } }, // 停車費折抵補登作業
  { path: 'cpm13010cru', loadComponent: () => import('./cpm13010-cru/cpm13010-cru.component').then(m => m.CPM13010CRUComponent), data: { progNo: 'CPM13010' } },
];
