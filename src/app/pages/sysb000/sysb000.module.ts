import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
// Routing
import { SYSB000RoutingModule } from './sysb000-routing.module';
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
import { Sysb400OsComponent } from './sysb400.os/sysb400.os.component';

// 4.1 基本資料管理系統
@NgModule({
  declarations: [
    SYSB100Component, // 公司基本資料維護作業
    SYSB200Component, // 廠商基本資料維護作業
    SYSB300Component, // 組織階層設定作業
    SYSB400Component, // 組織碼設定作業
    SYSB500Component, // 區域基本資料維護作業
    SYSB600Component, // 樓層基本資料維護作業
    SYSB800Component, // 業種基本資料維護作業
    SYSB900Component, // 商品類別維護作業
    SYSB920Component, // 小分類維護作業
    SYSBC00Component, // 銀行基本資料維護作業
    SYSBP00Component, // 參數資料設定維護
    SYSBQ00Component, // 簽核權限設定維護
    SYSBR00Component, // 縣市區域資料維護作業
    SYSBR10Component, // 佈告欄管理作業
    SYSB100CRUComponent, // 公司基本資料維護作業
    SYSB200CRUComponent, // 廠商基本資料維護作業
    SYSB300CRUComponent, // 組織階層設定作業
    SYSB400CRUComponent, // 組織碼設定作業
    SYSB500CRUComponent, // 區域基本資料維護作業
    SYSB600CRUComponent, // 樓層基本資料維護作業
    SYSB800CRUComponent, // 業種基本資料維護作業
    SYSB900CRUComponent, // 商品類別維護作業
    SYSB920CRUComponent, // 小分類維護作業
    SYSBC00CRUComponent, // 銀行基本資料維護作業
    SYSBP00CRUComponent, // 參數資料設定維護
    SYSBQ00CRUComponent, // 簽核權限設定維護
    SYSBR00CRUComponent, // 縣市區域資料維護作業
    SYSBR10CRUComponent, // 佈告欄管理作業
    Sysb400OsComponent, // 組織架構
  ],
  imports: [
    CommonModule,
    SYSB000RoutingModule,
    SharedModule,
  ]
})
export class SYSB000Module { }
