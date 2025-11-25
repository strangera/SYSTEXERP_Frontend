import { Routes } from '@angular/router';

export const cpmRoutes: Routes = [
  { path: 'cpm11010', loadComponent: () => import('./cpm11010/cpm11010.component').then(m => m.CPM11010Component) }, // 服務台位置維護作業
  { path: 'cpm11010cru', loadComponent: () => import('./cpm11010-cru/cpm11010-cru.component').then(m => m.CPM11010CRUComponent) },
  // { path: 'cpm11020', loadComponent: () => import('./cpm11020/cpm11020.component').then(m => m.CPM11020Component) }, // 客服設備資料維護作業
  // { path: 'cpm11020cru', loadComponent: () => import('./cpm11020-cru/cpm11020-cru.component').then(m => m.CPM11020CRUComponent) },
  // { path: 'cpm11030', loadComponent: () => import('./cpm11030/cpm11030.component').then(m => m.CPM11030Component) }, // 設備出借作業
  // { path: 'cpm11030cru', loadComponent: () => import('./cpm11030-cru/cpm11030-cru.component').then(m => m.CPM11030CRUComponent) },
  // { path: 'cpm11040', loadComponent: () => import('./cpm11040/cpm11040.component').then(m => m.CPM11040Component) }, // 設備歸還作業
  { path: 'cpm11050', loadComponent: () => import('./cpm11050/cpm11050.component').then(m => m.CPM11050Component) }, // 遺失/拾獲管理作業
  { path: 'cpm11050cru', loadComponent: () => import('./cpm11050-cru/cpm11050-cru.component').then(m => m.CPM11050CRUComponent) }, // 遺失/拾獲管理作業
  { path: 'cpm11060', loadComponent: () => import('./cpm11060/cpm11060.component').then(m => m.CPM11060Component) }, // 總機廣播服務
  { path: 'cpm11060cru', loadComponent: () => import('./cpm11060-cru/cpm11060-cru.component').then(m => m.CPM11060CRUComponent) }, // 總機廣播服務 CRU
  // { path: 'cpm11070', loadComponent: () => import('./cpm11070/cpm11070.component').then(m => m.CPM11070Component) }, // 全館店櫃資訊查詢
  // { path: 'cpm11080', loadComponent: () => import('./cpm11080/cpm11080.component').then(m => m.Cpm11080Component) }, // 總機廣播服務
  // { path: 'cpm11090', loadComponent: () => import('./cpm11090/cpm11090.component').then(m => m.Cpm11090Component) }, // 尋人登錄作業
  // { path: 'cpm11100', loadComponent: () => import('./cpm11100/cpm11100.component').then(m => m.Cpm11100Component) }, // 全館店櫃資訊查詢
  { path: 'cpm12010', loadComponent: () => import('./cpm12010/cpm12010.component').then(m => m.CPM12010Component) }, // 顧客意見類別維護
  { path: 'cpm12010cru', loadComponent: () => import('./cpm12010-cru/cpm12010-cru.component').then(m => m.CPM12010CRUComponent) },
  // { path: 'cpm12020', loadComponent: () => import('./cpm12020/cpm12020.component').then(m => m.CPM12020Component) }, // 顧客意見責任單位維護
  // { path: 'cpm12020cru', loadComponent: () => import('./cpm12020-cru/cpm12020-cru.component').then(m => m.CPM12020CRUComponent) },
  // { path: 'cpm12030', loadComponent: () => import('./cpm12030/cpm12030.component').then(m => m.CPM12030Component) }, // 顧客意見子類別維護
  // { path: 'cpm12030cru', loadComponent: () => import('./cpm12030-cru/cpm12030-cru.component').then(m => m.CPM12030CRUComponent) },
  { path: 'cpm12040', loadComponent: () => import('./cpm12040/cpm12040.component').then(m => m.CPM12040Component) }, // 顧客意見來源維護
  { path: 'cpm12040cru', loadComponent: () => import('./cpm12040-cru/cpm12040-cru.component').then(m => m.CPM12040CRUComponent) },
  // { path: 'cpm12050', loadComponent: () => import('./cpm12050/cpm12050.component').then(m => m.CPM12050Component) }, // 顧客意見管理作業
  // { path: 'cpm12050cru', loadComponent: () => import('./cpm12050-cru/cpm12050-cru.component').then(m => m.CPM12050CRUComponent) },
  // { path: 'cpm12060', loadComponent: () => import('./cpm12060/cpm12060.component').then(m => m.CPM12060Component) }, // 顧客意見處理狀況表
  // { path: 'cpm12070', loadComponent: () => import('./cpm12070/cpm12070.component').then(m => m.CPM12070Component) }, // 顧客意見類別統計表
  { path: 'cpm13010', loadComponent: () => import('./cpm13010/cpm13010.component').then(m => m.CPM13010Component) }, // 停車費折抵補登作業
  { path: 'cpm13010cru', loadComponent: () => import('./cpm13010-cru/cpm13010-cru.component').then(m => m.CPM13010CRUComponent) },
  { path: 'cpm13020', loadComponent: () => import('./cpm13020/cpm13020.component').then(m => m.CPM13020Component) }, // 停車費折抵補登作業(可讀停車車號)
  { path: 'cpm13030', loadComponent: () => import('./cpm13030/cpm13030.component').then(m => m.CPM13030Component) }, // 非業主POS停車費折抵補登作業
  { path: 'cpm13040', loadComponent: () => import('./cpm13040/cpm13040.component').then(m => m.CPM13040Component) }, // 非業主POS停車費折抵補登作業(可讀取車號)
  { path: 'cpm13050', loadComponent: () => import('./cpm13050/cpm13050.component').then(m => m.CPM13050Component) }, // 專櫃停車費折抵設定作業
  { path: 'cpm13060', loadComponent: () => import('./cpm13060/cpm13060.component').then(m => m.CPM13060Component) },
];
