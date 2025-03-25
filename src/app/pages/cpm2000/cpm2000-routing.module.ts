import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotfoundComponent } from '../notfound/notfound.component';
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
export class CPM2000RoutingModule { }
