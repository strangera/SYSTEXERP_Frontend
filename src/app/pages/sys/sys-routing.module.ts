import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
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

const routes: Routes = [
  { path: 'sys0110', component: SYS0110Component }, // 使用者基本資料維護
  { path: 'sys0210', component: SYS0210Component }, // 角色基本資料維護
  { path: 'sys0220', component: SYS0220Component }, // 角色之使用者設定維護
  { path: 'sys0230', component: SYS0230Component }, // 角色複製
  { path: 'sys0240', component: SYS0240Component }, // 使用者之角色設定維護
  { path: 'sys0310', component: SYS0310Component }, // 角色系統權限設定
  { path: 'sys0320', component: SYS0320Component }, // 使用者系統權限設定
  { path: 'sys0620', component: SYS0620Component }, // 角色基本資料異動查詢
  { path: 'sys0710', component: SYS0710Component }, // 使用者系統權限列表
  { path: 'sys0730', component: SYS0730Component }, // 角色系統權限列表
  { path: 'sys0740', component: SYS0740Component }, // 作業權限之角色列表
  { path: 'sys0750', component: SYS0750Component }, // 角色之使用者列表
  { path: 'sys0760', component: SYS0760Component }, // 使用者異常登入報表
  { path: 'sys0770', component: SYS0770Component }, // 作業權限統計表
  { path: 'sys0780', component: SYS0780Component }, // 作業權限申請表
  { path: 'sys0790', component: SYS0790Component }, // 使用者作業按鈕歷程報表
  { path: 'sys0791', component: SYS0791Component }, // 作業使用率查詢
  { path: 'sys0792', component: SYS0792Component }, // 在線人員查詢作業
  { path: 'sys0110cru', component: SYS0110CRUComponent },  // 使用者基本資料維護 CRU
  { path: 'sys0210cru', component: SYS0210CRUComponent }, // 角色基本資料維護 CRU
  { path: 'sys0220cru', component: SYS0220CRUComponent }, // 角色之使用者設定維護 CRU
  { path: 'sys0230cru', component: SYS0230CRUComponent }, // 角色複製 CRU
  { path: 'sys0240cru', component: SYS0240CRUComponent }, // 使用者之角色設定維護 CRU
  { path: 'sys0310cru', component: SYS0310CRUComponent }, // 角色系統權限設定 CRU
  { path: 'sys0320cru', component: SYS0320CRUComponent }, // 使用者系統權限設定 CRU
  { path: 'sys0620cru', component: SYS0620CRUComponent }, // 角色基本資料異動查詢 CRU
  { path: 'sysb100', component: SYSB100Component }, // 公司基本資料維護作業
  { path: 'sysb200', component: SYSB200Component }, // 廠商基本資料維護作業
  { path: 'sysb300', component: SYSB300Component }, // 組織階層設定作業
  { path: 'sysb400', component: SYSB400Component }, // 組織碼設定作業
  { path: 'sysb500', component: SYSB500Component }, // 區域基本資料維護作業
  { path: 'sysb600', component: SYSB600Component }, // 樓層基本資料維護作業
  { path: 'sysb800', component: SYSB800Component }, // 大分類基本資料維護作業
  { path: 'sysb900', component: SYSB900Component }, // 中分類維護作業
  { path: 'sysb920', component: SYSB920Component }, // 小分類維護作業
  { path: 'sysbC00', component: SYSBC00Component }, // 銀行基本資料維護作業
  { path: 'sysbP00', component: SYSBP00Component }, // 參數資料設定維護
  { path: 'sysbQ00', component: SYSBQ00Component }, // 簽核權限設定維護
  { path: 'sysbR00', component: SYSBR00Component }, // 縣市區域資料維護作業
  { path: 'sysbR10', component: SYSBR10Component }, // 佈告欄管理作業
  { path: 'sysb100cru', component: SYSB100CRUComponent }, // 公司基本資料維護作業 CRU
  { path: 'sysb200cru', component: SYSB200CRUComponent }, // 廠商基本資料維護作業 CRU
  { path: 'sysb300cru', component: SYSB300CRUComponent }, // 組織階層設定作業 CRU
  { path: 'sysb400cru', component: SYSB400CRUComponent }, // 組織碼設定作業 CRU
  { path: 'sysb400os', component: Sysb400OsComponent }, // 組織碼設定作業 OS
  { path: 'sysb500cru', component: SYSB500CRUComponent }, // 區域基本資料維護作業 CRU
  { path: 'sysb600cru', component: SYSB600CRUComponent }, // 樓層基本資料維護作業 CRU
  { path: 'sysb800cru', component: SYSB800CRUComponent }, // 大分類基本資料維護作業 CRU
  { path: 'sysb900cru', component: SYSB900CRUComponent }, // 中分類維護作業 CRU
  { path: 'sysb920cru', component: SYSB920CRUComponent }, // 小分類維護作業 CRU
  { path: 'sysbc00cru', component: SYSBC00CRUComponent }, // 銀行基本資料維護作業 CRU
  { path: 'sysbp00cru', component: SYSBP00CRUComponent }, // 參數資料設定維護 CRU
  { path: 'sysbq00cru', component: SYSBQ00CRUComponent }, // 簽核權限設定維護 CRU
  { path: 'sysbr00cru', component: SYSBR00CRUComponent }, // 縣市區域資料維護作業 CRU
  { path: 'sysbr10cru', component: SYSBR10CRUComponent }, // 佈告欄管理作業 CRU
  { path: 'sysb400os', component: Sysb400OsComponent }, // 組織碼設定作業 OS
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SysRoutingModule { }
