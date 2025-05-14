import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { NotfoundComponent } from '../base/notfound/notfound.component';
import { CPM11010CRUComponent } from './cpm11010-cru/cpm11010-cru.component';
import { CPM11010Component } from './cpm11010/cpm11010.component';
import { CPM11020CRUComponent } from './cpm11020-cru/cpm11020-cru.component';
import { CPM11020Component } from './cpm11020/cpm11020.component';
import { CPM11030CRUComponent } from './cpm11030-cru/cpm11030-cru.component';
import { CPM11030Component } from './cpm11030/cpm11030.component';
import { CPM11040Component } from './cpm11040/cpm11040.component';
import { CPM11050Component } from './cpm11050/cpm11050.component';
import { CPM11060Component } from './cpm11060/cpm11060.component';
import { CPM11070Component } from './cpm11070/cpm11070.component';
import { CPM12010CRUComponent } from './cpm12010-cru/cpm12010-cru.component';
import { CPM12010Component } from './cpm12010/cpm12010.component';
import { CPM12020CRUComponent } from './cpm12020-cru/cpm12020-cru.component';
import { CPM12020Component } from './cpm12020/cpm12020.component';
import { CPM12030CRUComponent } from './cpm12030-cru/cpm12030-cru.component';
import { CPM12030Component } from './cpm12030/cpm12030.component';
import { CPM12040CRUComponent } from './cpm12040-cru/cpm12040-cru.component';
import { CPM12040Component } from './cpm12040/cpm12040.component';
import { Cpm12050HQComponent } from './cpm12050-hq/cpm12050-hq.component';
import { CPM12050CRUComponent } from './cpm12050-cru/cpm12050-cru.component';
import { CPM12050Component } from './cpm12050/cpm12050.component';
import { CPM12060Component } from './cpm12060/cpm12060.component';
import { CPM12070Component } from './cpm12070/cpm12070.component';
import { CPM13010CRUComponent } from './cpm13010-cru/cpm13010-cru.component';
import { CPM13010Component } from './cpm13010/cpm13010.component';
import { CPM13020CRUComponent } from './cpm13020-cru/cpm13020-cru.component';
import { CPM13020Component } from './cpm13020/cpm13020.component';
import { CPM13030CRUComponent } from './cpm13030-cru/cpm13030-cru.component';
import { CPM13030Component } from './cpm13030/cpm13030.component';
import { CPM13040CRUComponent } from './cpm13040-cru/cpm13040-cru.component';
import { CPM13040Component } from './cpm13040/cpm13040.component';
import { CPM13050CRUComponent } from './cpm13050-cru/cpm13050-cru.component';
import { CPM13050Component } from './cpm13050/cpm13050.component';
import { Cpm11040HQComponent } from './cpm11040-hq/cpm11040-hq.component';
import { Cpm11050FoundComponent } from './cpm11050-found/cpm11050-found.component';
import { Cpm11050LostComponent } from './cpm11050-lost/cpm11050-lost.component';
import { Cpm11050UnclaimedComponent } from './cpm11050-unclaimed/cpm11050-unclaimed.component';
import { Cpm11060CRUComponent } from './cpm11060-cru/cpm11060-cru.component';
import { CpmLostCodeComponent } from './cpm-lost-code/cpm-lost-code.component';
import { CpmLostPlaceComponent } from './cpm-lost-place/cpm-lost-place.component';
import { CpmLostCodeCRUComponent } from './cpm-lost-code-cru/cpm-lost-code-cru.component';
import { CpmLostPlaceCRUComponent } from './cpm-lost-place-cru/cpm-lost-place-cru.component';
import { CpmLostPersonComponent } from './cpm-lost-person/cpm-lost-person.component';
import { CpmLostPersonCRUComponent } from './cpm-lost-person-cru/cpm-lost-person-cru.component';
import { CPM21010CRUComponent } from './cpm21010-cru/cpm21010-cru.component';
import { CPM21010Component } from './cpm21010/cpm21010.component';
import { CPM21020CRUComponent } from './cpm21020-cru/cpm21020-cru.component';
import { CPM21020Component } from './cpm21020/cpm21020.component';
import { CPM21030CRUComponent } from './cpm21030-cru/cpm21030-cru.component';
import { CPM21030Component } from './cpm21030/cpm21030.component';
import { CPM21040CRUComponent } from './cpm21040-cru/cpm21040-cru.component';
import { CPM21040Component } from './cpm21040/cpm21040.component';
import { CPM21050CRUComponent } from './cpm21050-cru/cpm21050-cru.component';
import { CPM21050Component } from './cpm21050/cpm21050.component';
import { CPM21060CRUComponent } from './cpm21060-cru/cpm21060-cru.component';
import { CPM21060Component } from './cpm21060/cpm21060.component';
import { CPM22010CRUComponent } from './cpm22010-cru/cpm22010-cru.component';
import { CPM22010Component } from './cpm22010/cpm22010.component';
import { CPM22020CRUComponent } from './cpm22020-cru/cpm22020-cru.component';
import { CPM22020Component } from './cpm22020/cpm22020.component';
import { CPM22030CRUComponent } from './cpm22030-cru/cpm22030-cru.component';
import { CPM22030Component } from './cpm22030/cpm22030.component';
import { CPM22040CRUComponent } from './cpm22040-cru/cpm22040-cru.component';
import { CPM22040Component } from './cpm22040/cpm22040.component';
import { CPM22050CRUComponent } from './cpm22050-cru/cpm22050-cru.component';
import { CPM22050Component } from './cpm22050/cpm22050.component';
import { CPM23010CRUComponent } from './cpm23010-cru/cpm23010-cru.component';
import { CPM23010Component } from './cpm23010/cpm23010.component';
import { CPM23020CRUComponent } from './cpm23020-cru/cpm23020-cru.component';
import { CPM23020Component } from './cpm23020/cpm23020.component';
import { CPM23030CRUComponent } from './cpm23030-cru/cpm23030-cru.component';
import { CPM23030Component } from './cpm23030/cpm23030.component';
import { CPM23040CRUComponent } from './cpm23040-cru/cpm23040-cru.component';
import { CPM23040Component } from './cpm23040/cpm23040.component';
import { CPM23050CRUComponent } from './cpm23050-cru/cpm23050-cru.component';
import { CPM23050Component } from './cpm23050/cpm23050.component';
import { CPM24010CRUComponent } from './cpm24010-cru/cpm24010-cru.component';
import { CPM24010Component } from './cpm24010/cpm24010.component';
import { CPM24020Component } from './cpm24020/cpm24020.component';
import { CPM24030Component } from './cpm24030/cpm24030.component';
import { CPM24040Component } from './cpm24040/cpm24040.component';
import { CPM25010Component } from './cpm25010/cpm25010.component';
import { CPM25020Component } from './cpm25020/cpm25020.component';
import { CPM25030Component } from './cpm25030/cpm25030.component';
import { CPM25040Component } from './cpm25040/cpm25040.component';
import { CPM25050Component } from './cpm25050/cpm25050.component';
import { CPM25060Component } from './cpm25060/cpm25060.component';
const routes: Routes = [
  { path: '', redirectTo: '404', pathMatch: 'full' },
  { path: 'CPM11010', component: CPM11010Component },  // 服務台位置維護作業
  { path: 'CPM11010CRU', component: CPM11010CRUComponent },
  { path: 'CPM11020', component: CPM11020Component },  // 客服設備資料維護作業
  { path: 'CPM11020CRU', component: CPM11020CRUComponent },
  { path: 'CPM11030', component: CPM11030Component },  // 設備出借作業
  { path: 'CPM11030CRU', component: CPM11030CRUComponent },
  { path: 'CPM11040', component: CPM11040Component },  // 設備歸還作業
  { path: 'CPM11040HQ', component: Cpm11040HQComponent },
  { path: 'CPM11050', component: CPM11050Component },  // 遺失/拾獲管理作業
  { path: 'CPM11050FOUND', component: Cpm11050FoundComponent },
  { path: 'CPM11050LOST', component: Cpm11050LostComponent },
  { path: 'CPM11050UNCLAIMED', component: Cpm11050UnclaimedComponent },
  { path: 'CPM11060', component: CPM11060Component },  // 總機廣播服務
  { path: 'CPM11060CRU', component: Cpm11060CRUComponent },  // 總機廣播服務  CRU
  { path: 'CPM11070', component: CPM11070Component },  // 全館店櫃資訊查詢
  { path: 'CPM12010', component: CPM12010Component },  // 顧客意見類別維護
  { path: 'CPM12010CRU', component: CPM12010CRUComponent },
  { path: 'CPM12020', component: CPM12020Component },  // 顧客意見責任單位維護
  { path: 'CPM12020CRU', component: CPM12020CRUComponent },
  { path: 'CPM12030', component: CPM12030Component },  // 顧客意見子類別維護
  { path: 'CPM12030CRU', component: CPM12030CRUComponent },
  { path: 'CPM12040', component: CPM12040Component },  // 顧客意見來源維護
  { path: 'CPM12040CRU', component: CPM12040CRUComponent },
  { path: 'CPM12050', component: CPM12050Component },  // 顧客意見管理作業
  { path: 'CPM12050CRU', component: CPM12050CRUComponent },
  { path: 'CPM12050HQ', component: Cpm12050HQComponent },
  { path: 'CPM12060', component: CPM12060Component },  // 顧客意見處理狀況表
  { path: 'CPM12070', component: CPM12070Component },  // 顧客意見類別統計表
  { path: 'CPM13010', component: CPM13010Component },  // 停車費折抵補登作業
  { path: 'CPM13010CRU', component: CPM13010CRUComponent },
  { path: 'CPM13020', component: CPM13020Component },  // 停車費折抵補登作業(可讀停車車號)
  { path: 'CPM13020CRU', component: CPM13020CRUComponent },
  { path: 'CPM13030', component: CPM13030Component },  // 非業主POS停車費折抵補登作業
  { path: 'CPM13030CRU', component: CPM13030CRUComponent },
  { path: 'CPM13040', component: CPM13040Component },  // 非業主POS停車費折抵補登作業(可讀取車號)
  { path: 'CPM13040CRU', component: CPM13040CRUComponent },
  { path: 'CPM13050', component: CPM13050Component },  // 專櫃停車費折抵設定作業
  { path: 'CPM13050CRU', component: CPM13050CRUComponent },
  { path: 'CpmLostCode', component: CpmLostCodeComponent },  // 遺拾商品類別維護_暫存頁_等代碼開出就會更改
  { path: 'CpmLostCodeCRU', component: CpmLostCodeCRUComponent },  // 遺拾商品類別維護_暫存頁_等代碼開出就會更改
  { path: 'CpmLostPlace', component: CpmLostPlaceComponent },  // 遺拾商品地點維護 暫存頁_等代碼開出就會更改
  { path: 'CpmLostPlaceCRU', component: CpmLostPlaceCRUComponent },  // 遺拾商品地點維護 暫存頁_等代碼開出就會更改
  { path: 'CpmLostPerson', component: CpmLostPersonComponent },  // 尋人廣播服務 暫存頁_等代碼開出就會更改
  { path: 'CpmLostPersonCRU', component: CpmLostPersonCRUComponent },  // 尋人廣播服務 暫存頁_等代碼開出就會更改
  { path: 'CPM21010', component: CPM21010Component },  // 區域基本資料維護作業
  { path: 'CPM21010CRU', component: CPM21010CRUComponent },
  { path: 'CPM21020', component: CPM21020Component },  // 廠商基本資料維護
  { path: 'CPM21020CRU', component: CPM21020CRUComponent },
  { path: 'CPM21030', component: CPM21030Component },  // 活動場地資料維護
  { path: 'CPM21030CRU', component: CPM21030CRUComponent },
  { path: 'CPM21040', component: CPM21040Component },  // 設備類別資料維護
  { path: 'CPM21040CRU', component: CPM21040CRUComponent },
  { path: 'CPM21050', component: CPM21050Component },  // 活動用品資料維護
  { path: 'CPM21050CRU', component: CPM21050CRUComponent },
  { path: 'CPM21060', component: CPM21060Component },  // 行銷活動類別及任務維護
  { path: 'CPM21060CRU', component: CPM21060CRUComponent },
  { path: 'CPM22010', component: CPM22010Component },  // 行銷活動維護
  { path: 'CPM22010CRU', component: CPM22010CRUComponent },
  { path: 'CPM22020', component: CPM22020Component },  // 檔期營業目標維護
  { path: 'CPM22020CRU', component: CPM22020CRUComponent },
  { path: 'CPM22030', component: CPM22030Component },  // 活動工作進度維護
  { path: 'CPM22030CRU', component: CPM22030CRUComponent },
  { path: 'CPM22040', component: CPM22040Component },  // 活動場地預約維護
  { path: 'CPM22040CRU', component: CPM22040CRUComponent },
  { path: 'CPM22050', component: CPM22050Component },  // 活動用品預約維護
  { path: 'CPM22050CRU', component: CPM22050CRUComponent },
  { path: 'CPM23010', component: CPM23010Component },  // 活動用品管理作業
  { path: 'CPM23010CRU', component: CPM23010CRUComponent },
  { path: 'CPM23020', component: CPM23020Component },  // 活動用品入庫作業
  { path: 'CPM23020CRU', component: CPM23020CRUComponent },
  { path: 'CPM23030', component: CPM23030Component },  // 活動用品領用作業
  { path: 'CPM23030CRU', component: CPM23030CRUComponent },
  { path: 'CPM23040', component: CPM23040Component },  // 活動用品繳回作業
  { path: 'CPM23040CRU', component: CPM23040CRUComponent },
  { path: 'CPM23050', component: CPM23050Component },  // 租賃活動用品歸還作業
  { path: 'CPM23050CRU', component: CPM23050CRUComponent },
  { path: 'CPM24010', component: CPM24010Component },  // 活動預算維護
  { path: 'CPM24010CRU', component: CPM24010CRUComponent },
  { path: 'CPM24020', component: CPM24020Component },  // 活動贊助金維護
  { path: 'CPM24030', component: CPM24030Component },  // 活動費用維護
  { path: 'CPM24040', component: CPM24040Component },  // 活動費用傳票報表
  { path: 'CPM25010', component: CPM25010Component },  // 營業目標達成率報表
  { path: 'CPM25020', component: CPM25020Component },  // 活動費用預算比較表
  { path: 'CPM25030', component: CPM25030Component },  // 行銷活動績效表
  { path: 'CPM25040', component: CPM25040Component },  // 行銷活動類別統計表
  { path: 'CPM25050', component: CPM25050Component },  // 活動預算及費用統計表
  { path: 'CPM25060', component: CPM25060Component },  // 活動贊助金統計表
  { path: '404', component: NotfoundComponent },
  { path: '**', redirectTo: '404' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CpmRoutingModule { }
