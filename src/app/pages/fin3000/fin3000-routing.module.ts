import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
//
import { NotfoundComponent } from '../notfound/notfound.component';
import { FIN31010CRUComponent } from './fin31010-cru/fin31010-cru.component';
import { FIN31010Component } from './fin31010/fin31010.component';
import { FIN31020CRUComponent } from './fin31020-cru/fin31020-cru.component';
import { FIN31020Component } from './fin31020/fin31020.component';
import { FIN32010CRUComponent } from './fin32010-cru/fin32010-cru.component';
import { FIN32010Component } from './fin32010/fin32010.component';
import { FIN32020CRUComponent } from './fin32020-cru/fin32020-cru.component';
import { FIN32020Component } from './fin32020/fin32020.component';
import { FIN32030CRUComponent } from './fin32030-cru/fin32030-cru.component';
import { FIN32030Component } from './fin32030/fin32030.component';
import { FIN33010CRUComponent } from './fin33010-cru/fin33010-cru.component';
import { FIN33010Component } from './fin33010/fin33010.component';
import { FIN34010Component } from './fin34010/fin34010.component';
import { FIN34020Component } from './fin34020/fin34020.component';
import { FIN34030CRUComponent } from './fin34030-cru/fin34030-cru.component';
import { FIN34030Component } from './fin34030/fin34030.component';
import { FIN34040CRUComponent } from './fin34040-cru/fin34040-cru.component';
import { FIN34040Component } from './fin34040/fin34040.component';
import { FIN35010CRUComponent } from './fin35010-cru/fin35010-cru.component';
import { FIN35010Component } from './fin35010/fin35010.component';
import { FIN35020CRUComponent } from './fin35020-cru/fin35020-cru.component';
import { FIN35020Component } from './fin35020/fin35020.component';
import { FIN35030CRUComponent } from './fin35030-cru/fin35030-cru.component';
import { FIN35030Component } from './fin35030/fin35030.component';
import { FIN35040CRUComponent } from './fin35040-cru/fin35040-cru.component';
import { FIN35040Component } from './fin35040/fin35040.component';
import { FIN35050CRUComponent } from './fin35050-cru/fin35050-cru.component';
import { FIN35050Component } from './fin35050/fin35050.component';
import { FIN35060CRUComponent } from './fin35060-cru/fin35060-cru.component';
import { FIN35060Component } from './fin35060/fin35060.component';
import { FIN35070CRUComponent } from './fin35070-cru/fin35070-cru.component';
import { FIN35070Component } from './fin35070/fin35070.component';

const routes: Routes = [
  { path: '', redirectTo: '404', pathMatch: 'full' },
  { path: 'FIN31010', component: FIN31010Component },  // 收款項目對照會計科目維護
  { path: 'FIN31010CRU', component: FIN31010CRUComponent },
  { path: 'FIN31020', component: FIN31020Component },  // 應收調整科目設定維護
  { path: 'FIN31020CRU', component: FIN31020CRUComponent },
  { path: 'FIN32010', component: FIN32010Component },  // 應收帳款維護
  { path: 'FIN32010CRU', component: FIN32010CRUComponent },
  { path: 'FIN32020', component: FIN32020Component },  // 應收帳款調整作業
  { path: 'FIN32020CRU', component: FIN32020CRUComponent },
  { path: 'FIN32030', component: FIN32030Component },  // 收款沖帳維護
  { path: 'FIN32030CRU', component: FIN32030CRUComponent },
  { path: 'FIN33010', component: FIN33010Component },  // 拋轉收款沖帳傳票
  { path: 'FIN33010CRU', component: FIN33010CRUComponent },
  { path: 'FIN34010', component: FIN34010Component },  // 應收帳款明細表
  { path: 'FIN34020', component: FIN34020Component },  // 客戶收款明細表
  { path: 'FIN34030', component: FIN34030Component },  // 廠客收/付款彙總表
  { path: 'FIN34030CRU', component: FIN34030CRUComponent },
  { path: 'FIN34040', component: FIN34040Component },  // 應收帳款帳齡分析表
  { path: 'FIN34040CRU', component: FIN34040CRUComponent },
  { path: 'FIN35010', component: FIN35010Component },  // 存入保證金維護作業
  { path: 'FIN35010CRU', component: FIN35010CRUComponent },
  { path: 'FIN35020', component: FIN35020Component },  // 存入保證金拋轉作業
  { path: 'FIN35020CRU', component: FIN35020CRUComponent },
  { path: 'FIN35030', component: FIN35030Component },  // 存入保證金保管聯列印作業
  { path: 'FIN35030CRU', component: FIN35030CRUComponent },
  { path: 'FIN35040', component: FIN35040Component },  // 存入保證金保管聯備註維護
  { path: 'FIN35040CRU', component: FIN35040CRUComponent },
  { path: 'FIN35050', component: FIN35050Component },  // 保證金會計科目設定
  { path: 'FIN35050CRU', component: FIN35050CRUComponent },
  { path: 'FIN35060', component: FIN35060Component },  // 存出保證金維護作業
  { path: 'FIN35060CRU', component: FIN35060CRUComponent },
  { path: 'FIN35070', component: FIN35070Component },  // 存出保證金拋轉作業
  { path: 'FIN35070CRU', component: FIN35070CRUComponent },
  { path: '404', component: NotfoundComponent },
  { path: '**', redirectTo: '404' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FIN3000RoutingModule { }
