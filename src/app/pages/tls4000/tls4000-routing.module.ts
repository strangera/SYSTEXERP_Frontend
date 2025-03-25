import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
// Component
import { NotfoundComponent } from '../notfound/notfound.component';
import { TLS41010CRUComponent } from './tls41010-cru/tls41010-cru.component';
import { TLS41010Component } from './tls41010/tls41010.component';
import { TLS41020CRUComponent } from './tls41020-cru/tls41020-cru.component';
import { TLS41020Component } from './tls41020/tls41020.component';
import { TLS41030CRUComponent } from './tls41030-cru/tls41030-cru.component';
import { TLS41030Component } from './tls41030/tls41030.component';
import { TLS41040CRUComponent } from './tls41040-cru/tls41040-cru.component';
import { TLS41040Component } from './tls41040/tls41040.component';
import { TLS41050CRUComponent } from './tls41050-cru/tls41050-cru.component';
import { TLS41050Component } from './tls41050/tls41050.component';
import { TLS41060CRUComponent } from './tls41060-cru/tls41060-cru.component';
import { TLS41060Component } from './tls41060/tls41060.component';
import { TLS42010CRUComponent } from './tls42010-cru/tls42010-cru.component';
import { TLS42010Component } from './tls42010/tls42010.component';
import { TLS42020CRUComponent } from './tls42020-cru/tls42020-cru.component';
import { TLS42020Component } from './tls42020/tls42020.component';
import { TLS43010CRUComponent } from './tls43010-cru/tls43010-cru.component';
import { TLS43010Component } from './tls43010/tls43010.component';
import { TLS43020CRUComponent } from './tls43020-cru/tls43020-cru.component';
import { TLS43020Component } from './tls43020/tls43020.component';
import { TLS43030CRUComponent } from './tls43030-cru/tls43030-cru.component';
import { TLS43030Component } from './tls43030/tls43030.component';
import { TLS43040CRUComponent } from './tls43040-cru/tls43040-cru.component';
import { TLS43040Component } from './tls43040/tls43040.component';
import { TLS43050CRUComponent } from './tls43050-cru/tls43050-cru.component';
import { TLS43050Component } from './tls43050/tls43050.component';
import { TLS44010CRUComponent } from './tls44010-cru/tls44010-cru.component';
import { TLS44010Component } from './tls44010/tls44010.component';
import { TLS44020CRUComponent } from './tls44020-cru/tls44020-cru.component';
import { TLS44020Component } from './tls44020/tls44020.component';
import { TLS45010CRUComponent } from './tls45010-cru/tls45010-cru.component';
import { TLS45010Component } from './tls45010/tls45010.component';
import { TLS45020CRUComponent } from './tls45020-cru/tls45020-cru.component';
import { TLS45020Component } from './tls45020/tls45020.component';
import { TLS45030CRUComponent } from './tls45030-cru/tls45030-cru.component';
import { TLS45030Component } from './tls45030/tls45030.component';
import { TLS46010CRUComponent } from './tls46010-cru/tls46010-cru.component';
import { TLS46010Component } from './tls46010/tls46010.component';
import { TLS46020CRUComponent } from './tls46020-cru/tls46020-cru.component';
import { TLS46020Component } from './tls46020/tls46020.component';
import { TLS46030CRUComponent } from './tls46030-cru/tls46030-cru.component';
import { TLS46030Component } from './tls46030/tls46030.component';
import { TLS46040CRUComponent } from './tls46040-cru/tls46040-cru.component';
import { TLS46040Component } from './tls46040/tls46040.component';
import { TLS46050CRUComponent } from './tls46050-cru/tls46050-cru.component';
import { TLS46050Component } from './tls46050/tls46050.component';
import { TLS46060CRUComponent } from './tls46060-cru/tls46060-cru.component';
import { TLS46060Component } from './tls46060/tls46060.component';
import { TLS47010CRUComponent } from './tls47010-cru/tls47010-cru.component';
import { TLS47010Component } from './tls47010/tls47010.component';

const routes: Routes = [
  { path: '', redirectTo: '404', pathMatch: 'full' },
  { path: 'TLS41010', component: TLS41010Component }, // 收銀機基本資料維護
  { path: 'TLS41020', component: TLS41020Component }, // 收銀機EDC資料維護
  { path: 'TLS41030', component: TLS41030Component }, // 收銀專櫃人員資料維護作業
  { path: 'TLS41040', component: TLS41040Component }, // POS清機時間設定
  { path: 'TLS41050', component: TLS41050Component }, // 發票訊息維護作業
  { path: 'TLS41060', component: TLS41060Component }, // 收銀機發票安全量參數維護作業
  { path: 'TLS42010', component: TLS42010Component }, // 快速鍵維護作業
  { path: 'TLS42020', component: TLS42020Component }, // 快速鍵名稱維護作業
  { path: 'TLS43010', component: TLS43010Component }, // 訊息登錄作業
  { path: 'TLS43020', component: TLS43020Component }, // 訊息審核作業
  { path: 'TLS43030', component: TLS43030Component }, // 常用訊息維護作業
  { path: 'TLS43040', component: TLS43040Component }, // 訊息群組維護作業
  { path: 'TLS43050', component: TLS43050Component }, // 訊息狀態查詢作業
  { path: 'TLS44010', component: TLS44010Component }, // POS即時連線監看
  { path: 'TLS44020', component: TLS44020Component }, // EDC即時連線監看
  { path: 'TLS45010', component: TLS45010Component }, // 訊息群組報表
  { path: 'TLS45020', component: TLS45020Component }, // 收銀機主檔異動查詢
  { path: 'TLS45030', component: TLS45030Component }, // 收銀機開關機時間表
  { path: 'TLS46010', component: TLS46010Component }, // 網路位置設定
  { path: 'TLS46020', component: TLS46020Component }, // POS環境變數維護作業
  { path: 'TLS46030', component: TLS46030Component }, // TOUCH功能按/關設定
  { path: 'TLS46040', component: TLS46040Component }, // 設定檔群組維護
  { path: 'TLS46050', component: TLS46050Component }, // TM監控報表
  { path: 'TLS46060', component: TLS46060Component }, // 下傳設定
  { path: 'TLS47010', component: TLS47010Component }, // 資料下傳收銀機作業
  { path: 'TLS41010CRU', component: TLS41010CRUComponent }, // 收銀機基本資料維護 CRU
  { path: 'TLS41020CRU', component: TLS41020CRUComponent }, // 收銀機EDC資料維護 CRU
  { path: 'TLS41030CRU', component: TLS41030CRUComponent }, // 收銀專櫃人員資料維護作業 CRU
  { path: 'TLS41040CRU', component: TLS41040CRUComponent }, // POS清機時間設定 CRU
  { path: 'TLS41050CRU', component: TLS41050CRUComponent }, // 發票訊息維護作業 CRU
  { path: 'TLS41060CRU', component: TLS41060CRUComponent }, // 收銀機發票安全量參數維護作業 CRU
  { path: 'TLS42010CRU', component: TLS42010CRUComponent }, // 快速鍵維護作業 CRU
  { path: 'TLS42020CRU', component: TLS42020CRUComponent }, // 快速鍵名稱維護作業 CRU
  { path: 'TLS43010CRU', component: TLS43010CRUComponent }, // 訊息登錄作業 CRU
  { path: 'TLS43020CRU', component: TLS43020CRUComponent }, // 訊息審核作業 CRU
  { path: 'TLS43030CRU', component: TLS43030CRUComponent }, // 常用訊息維護作業 CRU
  { path: 'TLS43040CRU', component: TLS43040CRUComponent }, // 訊息群組維護作業 CRU
  { path: 'TLS43050CRU', component: TLS43050CRUComponent }, // 訊息狀態查詢作業 CRU
  { path: 'TLS44010CRU', component: TLS44010CRUComponent }, // POS即時連線監看 CRU
  { path: 'TLS44020CRU', component: TLS44020CRUComponent }, // EDC即時連線監看 CRU
  { path: 'TLS45010CRU', component: TLS45010CRUComponent }, // 訊息群組報表 CRU
  { path: 'TLS45020CRU', component: TLS45020CRUComponent }, // 收銀機主檔異動查詢 CRU
  { path: 'TLS45030CRU', component: TLS45030CRUComponent }, // 收銀機開關機時間表 CRU
  { path: 'TLS46010CRU', component: TLS46010CRUComponent }, // 網路位置設定 CRU
  { path: 'TLS46020CRU', component: TLS46020CRUComponent }, // POS環境變數維護作業 CRU
  { path: 'TLS46030CRU', component: TLS46030CRUComponent }, // TOUCH功能按鈕開/關設定 CRU
  { path: 'TLS46040CRU', component: TLS46040CRUComponent }, // 設定檔群組維護 CRU
  { path: 'TLS46050CRU', component: TLS46050CRUComponent }, // TM監控報表 CRU
  { path: 'TLS46060CRU', component: TLS46060CRUComponent }, // 下傳設定 CRU
  { path: 'TLS47010CRU', component: TLS47010CRUComponent }, // 資料下傳收銀機作業 CRU
  { path: '404', component: NotfoundComponent },
  { path: '**', redirectTo: '404' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TLS4000RoutingModule { }
