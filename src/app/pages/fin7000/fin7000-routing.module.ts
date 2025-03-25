import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
//
import { NotfoundComponent } from '../notfound/notfound.component';
import { FIN71010CRUComponent } from './fin71010-cru/fin71010-cru.component';
import { FIN71010Component } from './fin71010/fin71010.component';
import { FIN71020CRUComponent } from './fin71020-cru/fin71020-cru.component';
import { FIN71020Component } from './fin71020/fin71020.component';
import { FIN72010CRUComponent } from './fin72010-cru/fin72010-cru.component';
import { FIN72010Component } from './fin72010/fin72010.component';
import { FIN72020CRUComponent } from './fin72020-cru/fin72020-cru.component';
import { FIN72020Component } from './fin72020/fin72020.component';
import { FIN72030CRUComponent } from './fin72030-cru/fin72030-cru.component';
import { FIN72030Component } from './fin72030/fin72030.component';
import { FIN72040CRUComponent } from './fin72040-cru/fin72040-cru.component';
import { FIN72040Component } from './fin72040/fin72040.component';
import { FIN72050CRUComponent } from './fin72050-cru/fin72050-cru.component';
import { FIN72050Component } from './fin72050/fin72050.component';
import { FIN73010Component } from './fin73010/fin73010.component';
import { FIN73020CRUComponent } from './fin73020-cru/fin73020-cru.component';
import { FIN73020Component } from './fin73020/fin73020.component';
import { FIN73030Component } from './fin73030/fin73030.component';
import { FIN73040Component } from './fin73040/fin73040.component';

const routes: Routes = [
  { path: '', redirectTo: '404', pathMatch: 'full' },
  { path: 'FIN71010', component: FIN71010Component },  // 零用金參數維護
  { path: 'FIN71010CRU', component: FIN71010CRUComponent },
  { path: 'FIN71020', component: FIN71020Component },  // 保管人及額度設定作業
  { path: 'FIN71020CRU', component: FIN71020CRUComponent },
  { path: 'FIN72010', component: FIN72010Component },  // 零用金維護作業
  { path: 'FIN72010CRU', component: FIN72010CRUComponent },
  { path: 'FIN72020', component: FIN72020Component },  // 零用金請款作業
  { path: 'FIN72020CRU', component: FIN72020CRUComponent },
  { path: 'FIN72030', component: FIN72030Component },  // 零用金拋轉作業
  { path: 'FIN72030CRU', component: FIN72030CRUComponent },
  { path: 'FIN72040', component: FIN72040Component },  // 零用金撥補作業
  { path: 'FIN72040CRU', component: FIN72040CRUComponent },
  { path: 'FIN72050', component: FIN72050Component },  // 零用金盤點作業
  { path: 'FIN72050CRU', component: FIN72050CRUComponent },
  { path: 'FIN73010', component: FIN73010Component },  // 零用金支付表
  { path: 'FIN73020', component: FIN73020Component },  // 支出請款單表
  { path: 'FIN73020CRU', component: FIN73020CRUComponent },
  { path: 'FIN73030', component: FIN73030Component },  // 支付申請單
  { path: 'FIN73040', component: FIN73040Component },  // 零用金撥補明細表
  { path: '404', component: NotfoundComponent },
  { path: '**', redirectTo: '404' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FIN7000RoutingModule { }
