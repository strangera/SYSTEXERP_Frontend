import { Routes } from '@angular/router';

export const assRoutes: Routes = [
  { path: 'ass21020', loadComponent: () => import('./ass21020/ass21020.component').then(m => m.ASS21020Component), data: { progNo: 'ASS21020' } }, // 基本資料設定-能元攤提設定
  { path: 'ass21020cru', loadComponent: () => import('./ass21020-cru/ass21020-cru.component').then(m => m.ASS21020CRUComponent), data: { progNo: 'ASS21020' } },
  { path: 'ass21040', loadComponent: () => import('./ass21040/ass21040.component').then(m => m.ASS21040Component), data: { progNo: 'ASS21040' } }, // 基本資料設定-電錶攤提設定
  { path: 'ass16070cru', loadComponent: () => import('./ass16070-cru/ass16070-cru.component').then(m => m.ASS16070CRUComponent), data: { progNo: 'ASS16070' } },
];
