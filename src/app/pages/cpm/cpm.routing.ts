import { Routes } from '@angular/router';

export const cpmRoutes: Routes = [
  // { path: 'cpm11010', loadComponent: () => import('./cpm11010/cpm11010.component').then(m => m.CPM11010Component) }, // 服務台位置維護作業
  // { path: 'cpm11010cru', loadComponent: () => import('./cpm11010-cru/cpm11010-cru.component').then(m => m.CPM11010CRUComponent) },
  // { path: 'cpm11020', loadComponent: () => import('./cpm11020/cpm11020.component').then(m => m.CPM11020Component) }, // 客服設備資料維護作業
  // { path: 'cpm11020cru', loadComponent: () => import('./cpm11020-cru/cpm11020-cru.component').then(m => m.CPM11020CRUComponent) },
  // { path: 'cpm11030', loadComponent: () => import('./cpm11030/cpm11030.component').then(m => m.CPM11030Component) }, // 設備出借作業
  // { path: 'cpm11030cru', loadComponent: () => import('./cpm11030-cru/cpm11030-cru.component').then(m => m.CPM11030CRUComponent) },
  // { path: 'cpm11040', loadComponent: () => import('./cpm11040/cpm11040.component').then(m => m.CPM11040Component) }, // 設備歸還作業
  // { path: 'cpm11040HQ', loadComponent: () => import('./cpm11040-hq/cpm11040-hq.component').then(m => m.Cpm11040HQComponent) },
  // { path: 'cpm11050', loadComponent: () => import('./cpm11050/cpm11050.component').then(m => m.CPM11050Component) }, // 遺失/拾獲管理作業
  // { path: 'cpm11050FOUND', loadComponent: () => import('./cpm11050-found/cpm11050-found.component').then(m => m.Cpm11050FoundComponent) },
  // { path: 'cpm11050LOST', loadComponent: () => import('./cpm11050-lost/cpm11050-lost.component').then(m => m.Cpm11050LostComponent) },
  // { path: 'cpm11050UNCLAIMED', loadComponent: () => import('./cpm11050-unclaimed/cpm11050-unclaimed.component').then(m => m.Cpm11050UnclaimedComponent) },
  // { path: 'cpm11060', loadComponent: () => import('./cpm11060/cpm11060.component').then(m => m.CPM11060Component) }, // 總機廣播服務
  // { path: 'cpm11060cru', loadComponent: () => import('./cpm11060-cru/cpm11060-cru.component').then(m => m.Cpm11060CRUComponent) }, // 總機廣播服務 CRU
  // { path: 'cpm11070', loadComponent: () => import('./cpm11070/cpm11070.component').then(m => m.CPM11070Component) }, // 全館店櫃資訊查詢
  // { path: 'cpm12010', loadComponent: () => import('./cpm12010/cpm12010.component').then(m => m.CPM12010Component) }, // 顧客意見類別維護
  // { path: 'cpm12010cru', loadComponent: () => import('./cpm12010-cru/cpm12010-cru.component').then(m => m.CPM12010CRUComponent) },
  // { path: 'cpm12020', loadComponent: () => import('./cpm12020/cpm12020.component').then(m => m.CPM12020Component) }, // 顧客意見責任單位維護
  // { path: 'cpm12020cru', loadComponent: () => import('./cpm12020-cru/cpm12020-cru.component').then(m => m.CPM12020CRUComponent) },
  // { path: 'cpm12030', loadComponent: () => import('./cpm12030/cpm12030.component').then(m => m.CPM12030Component) }, // 顧客意見子類別維護
  // { path: 'cpm12030cru', loadComponent: () => import('./cpm12030-cru/cpm12030-cru.component').then(m => m.CPM12030CRUComponent) },
  // { path: 'cpm12040', loadComponent: () => import('./cpm12040/cpm12040.component').then(m => m.CPM12040Component) }, // 顧客意見來源維護
  // { path: 'cpm12040cru', loadComponent: () => import('./cpm12040-cru/cpm12040-cru.component').then(m => m.CPM12040CRUComponent) },
  // { path: 'cpm12050', loadComponent: () => import('./cpm12050/cpm12050.component').then(m => m.CPM12050Component) }, // 顧客意見管理作業
  // { path: 'cpm12050cru', loadComponent: () => import('./cpm12050-cru/cpm12050-cru.component').then(m => m.CPM12050CRUComponent) },
  // { path: 'cpm12050HQ', loadComponent: () => import('./cpm12050-hq/cpm12050-hq.component').then(m => m.Cpm12050HQComponent) },
  // { path: 'cpm12060', loadComponent: () => import('./cpm12060/cpm12060.component').then(m => m.CPM12060Component) }, // 顧客意見處理狀況表
  // { path: 'cpm12070', loadComponent: () => import('./cpm12070/cpm12070.component').then(m => m.CPM12070Component) }, // 顧客意見類別統計表
  // { path: 'cpm13010', loadComponent: () => import('./cpm13010/cpm13010.component').then(m => m.CPM13010Component) }, // 停車費折抵補登作業
  // { path: 'cpm13010cru', loadComponent: () => import('./cpm13010-cru/cpm13010-cru.component').then(m => m.CPM13010CRUComponent) },
  // { path: 'cpm13020', loadComponent: () => import('./cpm13020/cpm13020.component').then(m => m.CPM13020Component) }, // 停車費折抵補登作業(可讀停車車號)
  // { path: 'cpm13020cru', loadComponent: () => import('./cpm13020-cru/cpm13020-cru.component').then(m => m.CPM13020CRUComponent) },
  // { path: 'cpm13030', loadComponent: () => import('./cpm13030/cpm13030.component').then(m => m.CPM13030Component) }, // 非業主POS停車費折抵補登作業
  // { path: 'cpm13030cru', loadComponent: () => import('./cpm13030-cru/cpm13030-cru.component').then(m => m.CPM13030CRUComponent) },
  // { path: 'cpm13040', loadComponent: () => import('./cpm13040/cpm13040.component').then(m => m.CPM13040Component) }, // 非業主POS停車費折抵補登作業(可讀取車號)
  // { path: 'cpm13040cru', loadComponent: () => import('./cpm13040-cru/cpm13040-cru.component').then(m => m.CPM13040CRUComponent) },
  // { path: 'cpm13050', loadComponent: () => import('./cpm13050/cpm13050.component').then(m => m.CPM13050Component) }, // 專櫃停車費折抵設定作業
  // { path: 'cpm13050cru', loadComponent: () => import('./cpm13050-cru/cpm13050-cru.component').then(m => m.CPM13050CRUComponent) },
  // { path: 'cpmLostCode', loadComponent: () => import('./cpm-lost-code/cpm-lost-code.component').then(m => m.CpmLostCodeComponent) }, // 遺拾中分類維護_暫存頁_等代碼開出就會更改
  // { path: 'cpmLostCodeCRU', loadComponent: () => import('./cpm-lost-code-cru/cpm-lost-code-cru.component').then(m => m.CpmLostCodeCRUComponent) }, // 遺拾中分類維護_暫存頁_等代碼開出就會更改
  // { path: 'cpmLostPlace', loadComponent: () => import('./cpm-lost-place/cpm-lost-place.component').then(m => m.CpmLostPlaceComponent) }, // 遺拾商品地點維護 暫存頁_等代碼開出就會更改
  // { path: 'cpmLostPlaceCRU', loadComponent: () => import('./cpm-lost-place-cru/cpm-lost-place-cru.component').then(m => m.CpmLostPlaceCRUComponent) }, // 遺拾商品地點維護 暫存頁_等代碼開出就會更改
  // { path: 'cpmLostPerson', loadComponent: () => import('./cpm-lost-person/cpm-lost-person.component').then(m => m.CpmLostPersonComponent) }, // 尋人廣播服務 暫存頁_等代碼開出就會更改
  // { path: 'cpmLostPersonCRU', loadComponent: () => import('./cpm-lost-person-cru/cpm-lost-person-cru.component').then(m => m.CpmLostPersonCRUComponent) }, // 尋人廣播服務 暫存頁_等代碼開出就會更改
  // { path: 'cpm21010', loadComponent: () => import('./cpm21010/cpm21010.component').then(m => m.CPM21010Component) }, // 區域基本資料維護作業
  // { path: 'cpm21010cru', loadComponent: () => import('./cpm21010-cru/cpm21010-cru.component').then(m => m.CPM21010CRUComponent) },
  // { path: 'cpm21020', loadComponent: () => import('./cpm21020/cpm21020.component').then(m => m.CPM21020Component) }, // 廠商基本資料維護
  // { path: 'cpm21020cru', loadComponent: () => import('./cpm21020-cru/cpm21020-cru.component').then(m => m.CPM21020CRUComponent) },
  // { path: 'cpm21030', loadComponent: () => import('./cpm21030/cpm21030.component').then(m => m.CPM21030Component) }, // 活動場地資料維護
  // { path: 'cpm21030cru', loadComponent: () => import('./cpm21030-cru/cpm21030-cru.component').then(m => m.CPM21030CRUComponent) },
  // { path: 'cpm21040', loadComponent: () => import('./cpm21040/cpm21040.component').then(m => m.CPM21040Component) }, // 設備類別資料維護
  // { path: 'cpm21040cru', loadComponent: () => import('./cpm21040-cru/cpm21040-cru.component').then(m => m.CPM21040CRUComponent) },
  // { path: 'cpm21050', loadComponent: () => import('./cpm21050/cpm21050.component').then(m => m.CPM21050Component) }, // 活動用品資料維護
  // { path: 'cpm21050cru', loadComponent: () => import('./cpm21050-cru/cpm21050-cru.component').then(m => m.CPM21050CRUComponent) },
  // { path: 'cpm21060', loadComponent: () => import('./cpm21060/cpm21060.component').then(m => m.CPM21060Component) }, // 行銷活動類別及任務維護
  // { path: 'cpm21060cru', loadComponent: () => import('./cpm21060-cru/cpm21060-cru.component').then(m => m.CPM21060CRUComponent) },
  // { path: 'cpm22010', loadComponent: () => import('./cpm22010/cpm22010.component').then(m => m.CPM22010Component) }, // 行銷活動維護
  // { path: 'cpm22010cru', loadComponent: () => import('./cpm22010-cru/cpm22010-cru.component').then(m => m.CPM22010CRUComponent) },
  // { path: 'cpm22020', loadComponent: () => import('./cpm22020/cpm22020.component').then(m => m.CPM22020Component) }, // 檔期營業目標維護
  // { path: 'cpm22020cru', loadComponent: () => import('./cpm22020-cru/cpm22020-cru.component').then(m => m.CPM22020CRUComponent) },
  // { path: 'cpm22030', loadComponent: () => import('./cpm22030/cpm22030.component').then(m => m.CPM22030Component) }, // 活動工作進度維護
  // { path: 'cpm22030cru', loadComponent: () => import('./cpm22030-cru/cpm22030-cru.component').then(m => m.CPM22030CRUComponent) },
  // { path: 'cpm22040', loadComponent: () => import('./cpm22040/cpm22040.component').then(m => m.CPM22040Component) }, // 活動場地預約維護
  // { path: 'cpm22040cru', loadComponent: () => import('./cpm22040-cru/cpm22040-cru.component').then(m => m.CPM22040CRUComponent) },
  // { path: 'cpm22050', loadComponent: () => import('./cpm22050/cpm22050.component').then(m => m.CPM22050Component) }, // 活動用品預約維護
  // { path: 'cpm22050cru', loadComponent: () => import('./cpm22050-cru/cpm22050-cru.component').then(m => m.CPM22050CRUComponent) },
  // { path: 'cpm23010', loadComponent: () => import('./cpm23010/cpm23010.component').then(m => m.CPM23010Component) }, // 活動用品管理作業
  // { path: 'cpm23010cru', loadComponent: () => import('./cpm23010-cru/cpm23010-cru.component').then(m => m.CPM23010CRUComponent) },
  // { path: 'cpm23020', loadComponent: () => import('./cpm23020/cpm23020.component').then(m => m.CPM23020Component) }, // 活動用品入庫作業
  // { path: 'cpm23020cru', loadComponent: () => import('./cpm23020-cru/cpm23020-cru.component').then(m => m.CPM23020CRUComponent) },
  // { path: 'cpm23030', loadComponent: () => import('./cpm23030/cpm23030.component').then(m => m.CPM23030Component) }, // 活動用品領用作業
  // { path: 'cpm23030cru', loadComponent: () => import('./cpm23030-cru/cpm23030-cru.component').then(m => m.CPM23030CRUComponent) },
  // { path: 'cpm23040', loadComponent: () => import('./cpm23040/cpm23040.component').then(m => m.CPM23040Component) }, // 活動用品繳回作業
  // { path: 'cpm23040cru', loadComponent: () => import('./cpm23040-cru/cpm23040-cru.component').then(m => m.CPM23040CRUComponent) },
  // { path: 'cpm23050', loadComponent: () => import('./cpm23050/cpm23050.component').then(m => m.CPM23050Component) }, // 租賃活動用品歸還作業
  // { path: 'cpm23050cru', loadComponent: () => import('./cpm23050-cru/cpm23050-cru.component').then(m => m.CPM23050CRUComponent) },
  // { path: 'cpm24010', loadComponent: () => import('./cpm24010/cpm24010.component').then(m => m.CPM24010Component) }, // 活動預算維護
  // { path: 'cpm24010cru', loadComponent: () => import('./cpm24010-cru/cpm24010-cru.component').then(m => m.CPM24010CRUComponent) },
  // { path: 'cpm24020', loadComponent: () => import('./cpm24020/cpm24020.component').then(m => m.CPM24020Component) }, // 活動贊助金維護
  // { path: 'cpm24030', loadComponent: () => import('./cpm24030/cpm24030.component').then(m => m.CPM24030Component) }, // 活動費用維護
  // { path: 'cpm24040', loadComponent: () => import('./cpm24040/cpm24040.component').then(m => m.CPM24040Component) }, // 活動費用傳票報表
  // { path: 'cpm25010', loadComponent: () => import('./cpm25010/cpm25010.component').then(m => m.CPM25010Component) }, // 營業目標達成率報表
  // { path: 'cpm25020', loadComponent: () => import('./cpm25020/cpm25020.component').then(m => m.CPM25020Component) }, // 活動費用預算比較表
  // { path: 'cpm25030', loadComponent: () => import('./cpm25030/cpm25030.component').then(m => m.CPM25030Component) }, // 行銷活動績效表
  // { path: 'cpm25040', loadComponent: () => import('./cpm25040/cpm25040.component').then(m => m.CPM25040Component) }, // 行銷活動類別統計表
  // { path: 'cpm25050', loadComponent: () => import('./cpm25050/cpm25050.component').then(m => m.CPM25050Component) }, // 活動預算及費用統計表
  // { path: 'cpm25060', loadComponent: () => import('./cpm25060/cpm25060.component').then(m => m.CPM25060Component) }, // 活動贊助金統計表
];
