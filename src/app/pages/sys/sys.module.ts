import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SysRoutingModule } from './sys-routing.module';
import { SYS0110Component } from './sys0110/sys0110.component';
import { SYS0210Component } from './sys0210/sys0210.component';
import { SYS0220Component } from './sys0220/sys0220.component';
import { SYS0230Component } from './sys0230/sys0230.component';
import { SYS0240Component } from './sys0240/sys0240.component';
import { SYS0310Component } from './sys0310/sys0310.component';
import { SYS0320Component } from './sys0320/sys0320.component';
import { SYS0620Component } from './sys0620/sys0620.component';
import { SYS0710Component } from './sys0710/sys0710.component';
import { SYS0730Component } from './sys0730/sys0730.component';
import { SYS0740Component } from './sys0740/sys0740.component';
import { SYS0750Component } from './sys0750/sys0750.component';
import { SYS0760Component } from './sys0760/sys0760.component';
import { SYS0770Component } from './sys0770/sys0770.component';
import { SYS0780Component } from './sys0780/sys0780.component';
import { SYS0790Component } from './sys0790/sys0790.component';
import { SYS0791Component } from './sys0791/sys0791.component';
import { SYS0792Component } from './sys0792/sys0792.component';
import { SYS0110CRUComponent } from './sys0110.cru/sys0110.cru.component';
import { SYS0210CRUComponent } from './sys0210.cru/sys0210.cru.component';
import { SYS0220CRUComponent } from './sys0220.cru/sys0220.cru.component';
import { SYS0230CRUComponent } from './sys0230.cru/sys0230.cru.component';
import { SYS0240CRUComponent } from './sys0240.cru/sys0240.cru.component';
import { SYS0310CRUComponent } from './sys0310.cru/sys0310.cru.component';
import { SYS0320CRUComponent } from './sys0320.cru/sys0320.cru.component';
import { SYS0620CRUComponent } from './sys0620.cru/sys0620.cru.component';
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
import { SharedModule } from '../../shared/shared.module';
import { ScrollingModule } from '@angular/cdk/scrolling';


@NgModule({
  declarations: [
    SYS0110Component,
    SYS0210Component,
    SYS0220Component,
    SYS0230Component,
    SYS0240Component,
    SYS0310Component,
    SYS0320Component,
    SYS0620Component,
    SYS0710Component,
    SYS0730Component,
    SYS0740Component,
    SYS0750Component,
    SYS0760Component,
    SYS0770Component,
    SYS0780Component,
    SYS0790Component,
    SYS0791Component,
    SYS0792Component,
    SYS0110CRUComponent,
    SYS0210CRUComponent,
    SYS0220CRUComponent,
    SYS0230CRUComponent,
    SYS0240CRUComponent,
    SYS0310CRUComponent,
    SYS0320CRUComponent,
    SYS0620CRUComponent,
    SYSB100Component, // 公司基本資料維護作業
    SYSB200Component, // 廠商基本資料維護作業
    SYSB300Component, // 組織階層設定作業
    SYSB400Component, // 組織碼設定作業
    SYSB500Component, // 區域基本資料維護作業
    SYSB600Component, // 樓層基本資料維護作業
    SYSB800Component, // 大分類基本資料維護作業
    SYSB900Component, // 中分類維護作業
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
    SYSB800CRUComponent, // 大分類基本資料維護作業
    SYSB900CRUComponent, // 中分類維護作業
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
    SysRoutingModule,
    SharedModule,
    ScrollingModule
  ]
})
export class SysModule { }
