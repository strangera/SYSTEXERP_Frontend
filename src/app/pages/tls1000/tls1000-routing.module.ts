import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
//
import { NotfoundComponent } from '../notfound/notfound.component';
import { TLS11010CRUComponent } from './tls11010-cru/tls11010-cru.component';
import { TLS11010Component } from './tls11010/tls11010.component';
import { TLS11020CRUComponent } from './tls11020-cru/tls11020-cru.component';
import { TLS11020Component } from './tls11020/tls11020.component';
import { TLS12010CRUComponent } from './tls12010-cru/tls12010-cru.component';
import { TLS12010Component } from './tls12010/tls12010.component';
import { TLS12020CRUComponent } from './tls12020-cru/tls12020-cru.component';
import { TLS12020Component } from './tls12020/tls12020.component';
import { TLS12030CRUComponent } from './tls12030-cru/tls12030-cru.component';
import { TLS12030Component } from './tls12030/tls12030.component';
import { TLS12040CRUComponent } from './tls12040-cru/tls12040-cru.component';
import { TLS12040Component } from './tls12040/tls12040.component';
import { TLS12050CRUComponent } from './tls12050-cru/tls12050-cru.component';
import { TLS12050Component } from './tls12050/tls12050.component';
import { TLS12060Component } from './tls12060/tls12060.component';
import { TLS12070Component } from './tls12070/tls12070.component';
import { TLS13010CRUComponent } from './tls13010-cru/tls13010-cru.component';
import { TLS13010Component } from './tls13010/tls13010.component';
import { TLS13020CRUComponent } from './tls13020-cru/tls13020-cru.component';
import { TLS13020Component } from './tls13020/tls13020.component';
import { TLS13030CRUComponent } from './tls13030-cru/tls13030-cru.component';
import { TLS13030Component } from './tls13030/tls13030.component';
import { TLS13040CRUComponent } from './tls13040-cru/tls13040-cru.component';
import { TLS13040Component } from './tls13040/tls13040.component';
import { TLS13050CRUComponent } from './tls13050-cru/tls13050-cru.component';
import { TLS13050Component } from './tls13050/tls13050.component';
import { TLS13060CRUComponent } from './tls13060-cru/tls13060-cru.component';
import { TLS13060Component } from './tls13060/tls13060.component';
import { TLS13070CRUComponent } from './tls13070-cru/tls13070-cru.component';
import { TLS13070Component } from './tls13070/tls13070.component';
import { TLS14010CRUComponent } from './tls14010-cru/tls14010-cru.component';
import { TLS14010Component } from './tls14010/tls14010.component';
import { TLS14020CRUComponent } from './tls14020-cru/tls14020-cru.component';
import { TLS14020Component } from './tls14020/tls14020.component';
import { TLS13010Next1Component } from './tls13010-next1/tls13010-next1.component';
import { TLS13010Next2Component } from './tls13010-next2/tls13010-next2.component';


const routes: Routes = [
  { path: '', redirectTo: '404', pathMatch: 'full' },
  { path: 'TLS11010', component: TLS11010Component }, // 專櫃位置資料維護
  { path: 'TLS11020', component: TLS11020Component }, // 扣款項目維護作業
  { path: 'TLS12010', component: TLS12010Component }, // 潛在客戶資料維護
  { path: 'TLS12020', component: TLS12020Component }, // 專櫃訪談記錄維護
  { path: 'TLS12030', component: TLS12030Component }, // 專櫃意向書維護
  { path: 'TLS12040', component: TLS12040Component }, // 專櫃要約書維護
  { path: 'TLS12050', component: TLS12050Component }, // 專櫃位置圖
  { path: 'TLS12060', component: TLS12060Component }, // 招商進度監控
  { path: 'TLS12070', component: TLS12070Component }, // 專櫃訪談紀錄追蹤表
  { path: 'TLS13010', component: TLS13010Component }, // 專櫃契約書維護
  { path: 'TLS13020', component: TLS13020Component }, // 專櫃契約書續約維護作業
  { path: 'TLS13030', component: TLS13030Component }, // 專櫃契約代扣款報表
  { path: 'TLS13040', component: TLS13040Component }, // 專櫃契約抽成報表
  { path: 'TLS13050', component: TLS13050Component }, // 年度目標營業額管制報表
  { path: 'TLS13060', component: TLS13060Component }, // 櫃位營運事項明細查詢作業
  { path: 'TLS13070', component: TLS13070Component }, // 調整櫃位合約一覽表
  { path: 'TLS14010', component: TLS14010Component }, // 合約狀態清單
  { path: 'TLS14020', component: TLS14020Component }, // 專櫃契約書列印
  { path: 'TLS11010CRU', component: TLS11010CRUComponent }, // 專櫃位置資料維護 CRU
  { path: 'TLS11020CRU', component: TLS11020CRUComponent }, // 扣款項目維護作業 CRU
  { path: 'TLS12010CRU', component: TLS12010CRUComponent }, // 潛在客戶資料維護 CRU
  { path: 'TLS12020CRU', component: TLS12020CRUComponent }, // 專櫃訪談記錄維護 CRU
  { path: 'TLS12030CRU', component: TLS12030CRUComponent }, // 專櫃意向書維護 CRU
  { path: 'TLS12040CRU', component: TLS12040CRUComponent }, // 專櫃要約書維護 CRU
  { path: 'TLS12050CRU', component: TLS12050CRUComponent }, // 專櫃位置圖 CRU
  { path: 'TLS13010CRU', component: TLS13010CRUComponent }, // 專櫃契約書維護 CRU
  { path: 'TLS13020CRU', component: TLS13020CRUComponent }, // 專櫃契約書續約維護作業 CRU
  { path: 'TLS13030CRU', component: TLS13030CRUComponent }, // 專櫃契約代扣款報表 CRU
  { path: 'TLS13040CRU', component: TLS13040CRUComponent }, // 專櫃契約抽成報表
  { path: 'TLS13050CRU', component: TLS13050CRUComponent }, // 年度目標營業額管制報表 CRU
  { path: 'TLS13060CRU', component: TLS13060CRUComponent }, // 櫃位營運事項明細查詢作業 CRU
  { path: 'TLS13070CRU', component: TLS13070CRUComponent }, // 調整櫃位合約一覽表 CRU
  { path: 'TLS14010CRU', component: TLS14010CRUComponent }, // 合約狀態清單 CRU
  { path: 'TLS14020CRU', component: TLS14020CRUComponent }, // 專櫃契約書列印 CRU
  { path: 'TLS13010NEXT1', component: TLS13010Next1Component }, // 專櫃契約書維護 NEXT1
  { path: 'TLS13010NEXT2', component: TLS13010Next2Component }, // 專櫃契約書維護 NEXT2
  { path: '404', component: NotfoundComponent },
  { path: '**', redirectTo: '404' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TLS1000RoutingModule { }
