import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotfoundComponent } from '../base/notfound/notfound.component';
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
  { path: '', redirectTo: '404', pathMatch: 'full' },
  { path: 'SYS0110', component: SYS0110Component }, // 使用者基本資料維護
  { path: 'SYS0210', component: SYS0210Component }, // 角色基本資料維護
  { path: 'SYS0220', component: SYS0220Component }, // 角色之使用者設定維護
  { path: 'SYS0230', component: SYS0230Component }, // 角色複製
  { path: 'SYS0240', component: SYS0240Component }, // 使用者之角色設定維護
  { path: 'SYS0310', component: SYS0310Component }, // 角色系統權限設定
  { path: 'SYS0320', component: SYS0320Component }, // 使用者系統權限設定
  { path: 'SYS0620', component: SYS0620Component }, // 角色基本資料異動查詢
  { path: 'SYS0710', component: SYS0710Component }, // 使用者系統權限列表
  { path: 'SYS0730', component: SYS0730Component }, // 角色系統權限列表
  { path: 'SYS0740', component: SYS0740Component }, // 作業權限之角色列表
  { path: 'SYS0750', component: SYS0750Component }, // 角色之使用者列表
  { path: 'SYS0760', component: SYS0760Component }, // 使用者異常登入報表
  { path: 'SYS0770', component: SYS0770Component }, // 作業權限統計表
  { path: 'SYS0780', component: SYS0780Component }, // 作業權限申請表
  { path: 'SYS0790', component: SYS0790Component }, // 使用者作業按鈕歷程報表
  { path: 'SYS0791', component: SYS0791Component }, // 作業使用率查詢
  { path: 'SYS0792', component: SYS0792Component }, // 在線人員查詢作業
  { path: 'SYS0110CRU', component: SYS0110CRUComponent },  // 使用者基本資料維護 CRU
  { path: 'SYS0210CRU', component: SYS0210CRUComponent }, // 角色基本資料維護 CRU
  { path: 'SYS0220CRU', component: SYS0220CRUComponent }, // 角色之使用者設定維護 CRU
  { path: 'SYS0230CRU', component: SYS0230CRUComponent }, // 角色複製 CRU
  { path: 'SYS0240CRU', component: SYS0240CRUComponent }, // 使用者之角色設定維護 CRU
  { path: 'SYS0310CRU', component: SYS0310CRUComponent }, // 角色系統權限設定 CRU
  { path: 'SYS0320CRU', component: SYS0320CRUComponent }, // 使用者系統權限設定 CRU
  { path: 'SYS0620CRU', component: SYS0620CRUComponent }, // 角色基本資料異動查詢 CRU
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
  { path: '**', redirectTo: '404' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SysRoutingModule { }
