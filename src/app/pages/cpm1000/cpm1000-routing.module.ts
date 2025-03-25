import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
//
import { NotfoundComponent } from '../notfound/notfound.component';
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
  { path: '404', component: NotfoundComponent },
  { path: '**', redirectTo: '404' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CPM1000RoutingModule { }
