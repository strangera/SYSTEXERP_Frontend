import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
// Component
import { SYSB100Component } from './sysb100/sysb100.component';
import { SYSB200Component } from './sysb200/sysb200.component';
import { SYSB300Component } from './sysb300/sysb300.component';
import { SYSB400Component } from './sysb400/sysb400.component';
import { SYSB500Component } from './sysb500/sysb500.component';
import { SYSB600Component } from './sysb600/sysb600.component';
import { SYSB800Component } from './sysb800/sysb800.component';
import { SYSB900Component } from './sysb900/sysb900.component';
import { SYSB920Component } from './sysb920/sysb920.component';
import { SYSBC00Component } from './sysbc00/sysbc00.component';
import { SYSBP00Component } from './sysbp00/sysbp00.component';
import { SYSBQ00Component } from './sysbq00/sysbq00.component';
import { SYSBR00Component } from './sysbr00/sysbr00.component';
import { SYSBR10Component } from './sysbr10/sysbr10.component';
import { SYSB100CRUComponent } from './sysb100.cru/sysb100.cru.component';
import { SYSB200CRUComponent } from './sysb200.cru/sysb200.cru.component';
import { SYSB300CRUComponent } from './sysb300.cru/sysb300.cru.component';
import { SYSB400CRUComponent } from './sysb400.cru/sysb400.cru.component';
import { SYSB500CRUComponent } from './sysb500.cru/sysb500.cru.component';
import { SYSB600CRUComponent } from './sysb600.cru/sysb600.cru.component';
import { SYSB800CRUComponent } from './sysb800.cru/sysb800.cru.component';
import { SYSB900CRUComponent } from './sysb900.cru/sysb900.cru.component';
import { SYSB920CRUComponent } from './sysb920.cru/sysb920.cru.component';
import { SYSBC00CRUComponent } from './sysbc00.cru/sysbc00.cru.component';
import { SYSBP00CRUComponent } from './sysbp00.cru/sysbp00.cru.component';
import { SYSBQ00CRUComponent } from './sysbq00.cru/sysbq00.cru.component';
import { SYSBR00CRUComponent } from './sysbr00.cru/sysbr00.cru.component';
import { SYSBR10CRUComponent } from './sysbr10.cru/sysbr10.cru.component';
import { NotfoundComponent } from '../notfound/notfound.component';
import { Sysb400OsComponent } from './sysb400.os/sysb400.os.component';

const routes: Routes = [
  { path: '', redirectTo: '404', pathMatch: 'full' },
  { path: 'SYSB100', component: SYSB100Component }, // 公司基本資料維護作業
  { path: 'SYSB200', component: SYSB200Component }, // 廠商基本資料維護作業
  { path: 'SYSB300', component: SYSB300Component }, // 組織階層設定作業
  { path: 'SYSB400', component: SYSB400Component }, // 組織碼設定作業
  { path: 'SYSB500', component: SYSB500Component }, // 區域基本資料維護作業
  { path: 'SYSB600', component: SYSB600Component }, // 樓層基本資料維護作業
  { path: 'SYSB800', component: SYSB800Component }, // 業種基本資料維護作業
  { path: 'SYSB900', component: SYSB900Component }, // 商品類別維護作業
  { path: 'SYSB920', component: SYSB920Component }, // 小分類維護作業
  { path: 'SYSBC00', component: SYSBC00Component }, // 銀行基本資料維護作業
  { path: 'SYSBP00', component: SYSBP00Component }, // 參數資料設定維護
  { path: 'SYSBQ00', component: SYSBQ00Component }, // 簽核權限設定維護
  { path: 'SYSBR00', component: SYSBR00Component }, // 縣市區域資料維護作業
  { path: 'SYSBR10', component: SYSBR10Component }, // 佈告欄管理作業
  { path: 'SYSB100CRU', component: SYSB100CRUComponent }, // 公司基本資料維護作業 CRU
  { path: 'SYSB200CRU', component: SYSB200CRUComponent }, // 廠商基本資料維護作業 CRU
  { path: 'SYSB300CRU', component: SYSB300CRUComponent }, // 組織階層設定作業 CRU
  { path: 'SYSB400CRU', component: SYSB400CRUComponent }, // 組織碼設定作業 CRU
  { path: 'SYSB500CRU', component: SYSB500CRUComponent }, // 區域基本資料維護作業 CRU
  { path: 'SYSB600CRU', component: SYSB600CRUComponent }, // 樓層基本資料維護作業 CRU
  { path: 'SYSB800CRU', component: SYSB800CRUComponent }, // 業種基本資料維護作業 CRU
  { path: 'SYSB900CRU', component: SYSB900CRUComponent }, // 商品類別維護作業 CRU
  { path: 'SYSB920CRU', component: SYSB920CRUComponent }, // 小分類維護作業 CRU
  { path: 'SYSBC00CRU', component: SYSBC00CRUComponent }, // 銀行基本資料維護作業 CRU
  { path: 'SYSBP00CRU', component: SYSBP00CRUComponent }, // 參數資料設定維護 CRU
  { path: 'SYSBQ00CRU', component: SYSBQ00CRUComponent }, // 簽核權限設定維護 CRU
  { path: 'SYSBR00CRU', component: SYSBR00CRUComponent }, // 縣市區域資料維護作業 CRU
  { path: 'SYSBR10CRU', component: SYSBR10CRUComponent }, // 佈告欄管理作業 CRU
  { path: 'SYSB400OS', component: Sysb400OsComponent }, // 組織碼設定作業 OS

  { path: '404', component: NotfoundComponent },
  { path: '**', redirectTo: '404' },];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SYSB000RoutingModule { }
