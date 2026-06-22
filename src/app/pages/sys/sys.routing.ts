import { Routes } from '@angular/router';

export const sysRoutes: Routes = [
  { path: 'sys0110', loadComponent: () => import('./sys0110/sys0110.component').then(m => m.SYS0110Component), data: { progNo: 'SYS0110' } }, // 使用者基本資料維護
  { path: 'sys0210', loadComponent: () => import('./sys0210/sys0210.component').then(m => m.SYS0210Component), data: { progNo: 'SYS0210' } }, // 角色基本資料維護
  { path: 'sys0220', loadComponent: () => import('./sys0220/sys0220.component').then(m => m.SYS0220Component), data: { progNo: 'SYS0220' } }, // 角色之使用者設定維護
  { path: 'sys0230', loadComponent: () => import('./sys0230/sys0230.component').then(m => m.SYS0230Component), data: { progNo: 'SYS0230' } }, // 角色複製
  { path: 'sys0240', loadComponent: () => import('./sys0240/sys0240.component').then(m => m.SYS0240Component), data: { progNo: 'SYS0240' } }, // 使用者之角色設定維護
  { path: 'sys0310', loadComponent: () => import('./sys0310/sys0310.component').then(m => m.SYS0310Component), data: { progNo: 'SYS0310' } }, // 角色系統權限設定
  { path: 'sys0320', loadComponent: () => import('./sys0320/sys0320.component').then(m => m.SYS0320Component), data: { progNo: 'SYS0320' } }, // 使用者系統權限設定
  // { path: 'sys0620', loadComponent: () => import('./sys0620/sys0620.component').then(m => m.SYS0620Component),data: { progNo:'SYS0620'} }, // 角色基本資料異動查詢
  { path: 'sys0710', loadComponent: () => import('./sys0710/sys0710.component').then(m => m.SYS0710Component), data: { progNo: 'SYS0710' } }, // 使用者系統權限列表
  { path: 'sys0730', loadComponent: () => import('./sys0730/sys0730.component').then(m => m.SYS0730Component), data: { progNo: 'SYS0730' } }, // 角色系統權限列表
  { path: 'sys0740', loadComponent: () => import('./sys0740/sys0740.component').then(m => m.SYS0740Component), data: { progNo: 'SYS0740' } }, // 作業權限之角色列表
  { path: 'sys0750', loadComponent: () => import('./sys0750/sys0750.component').then(m => m.SYS0750Component), data: { progNo: 'SYS0750' } }, // 角色之使用者列表
  { path: 'sys0760', loadComponent: () => import('./sys0760/sys0760.component').then(m => m.SYS0760Component), data: { progNo: 'SYS0760' } }, // 使用者異常登入報表
  { path: 'sys0770', loadComponent: () => import('./sys0770/sys0770.component').then(m => m.SYS0770Component), data: { progNo: 'SYS0770' } }, // 作業權限統計表
  { path: 'sys0780', loadComponent: () => import('./sys0780/sys0780.component').then(m => m.SYS0780Component), data: { progNo: 'SYS0780' } }, // 作業權限申請表
  { path: 'sys0790', loadComponent: () => import('./sys0790/sys0790.component').then(m => m.SYS0790Component), data: { progNo: 'SYS0790' } }, // 使用者作業按鈕歷程報表
  // { path: 'sys0791', loadComponent: () => import('./sys0791/sys0791.component').then(m => m.SYS0791Component),data: { progNo:'SYS0791'} }, // 作業使用率查詢
  { path: 'sys0792', loadComponent: () => import('./sys0792/sys0792.component').then(m => m.SYS0792Component),data: { progNo:'SYS0792'} }, // 在線人員查詢作業
  { path: 'sys0110cru', loadComponent: () => import('./sys0110.cru/sys0110.cru.component').then(m => m.SYS0110CRUComponent), data: { progNo: 'SYS0110' } }, // 使用者基本資料維護 CRU
  { path: 'sys0210cru', loadComponent: () => import('./sys0210.cru/sys0210.cru.component').then(m => m.SYS0210CRUComponent), data: { progNo: 'SYS0210' } }, // 角色基本資料維護 CRU
  { path: 'sys0220cru', loadComponent: () => import('./sys0220.cru/sys0220.cru.component').then(m => m.SYS0220CRUComponent), data: { progNo: 'SYS0220' } }, // 角色之使用者設定維護 CRU
  { path: 'sys0230cru', loadComponent: () => import('./sys0230.cru/sys0230.cru.component').then(m => m.SYS0230CRUComponent), data: { progNo: 'SYS0230' } }, // 角色複製 CRU
  { path: 'sys0240cru', loadComponent: () => import('./sys0240.cru/sys0240.cru.component').then(m => m.SYS0240CRUComponent), data: { progNo: 'SYS0240' } }, // 使用者之角色設定維護 CRU
  { path: 'sys0310cru', loadComponent: () => import('./sys0310.cru/sys0310.cru.component').then(m => m.SYS0310CRUComponent), data: { progNo: 'SYS0310' } }, // 角色系統權限設定 CRU
  { path: 'sys0320cru', loadComponent: () => import('./sys0320.cru/sys0320.cru.component').then(m => m.SYS0320CRUComponent), data: { progNo: 'SYS0320' } }, // 使用者系統權限設定 CRU
  // { path: 'sys0620cru', loadComponent: () => import('./sys0620.cru/sys0620.cru.component').then(m => m.SYS0620CRUComponent), data: { progNo: 'SYS0620' } }, // 角色基本資料異動查詢 CRU
  { path: 'sysb100', loadComponent: () => import('./sysb100/sysb100.component').then(m => m.SYSB100Component), data: { progNo: 'SYSB100' } }, // 公司基本資料維護作業
  { path: 'sysb200', loadComponent: () => import('./sysb200/sysb200.component').then(m => m.SYSB200Component), data: { progNo: 'SYSB200' } }, // 廠商基本資料維護作業
  { path: 'sysb300', loadComponent: () => import('./sysb300/sysb300.component').then(m => m.SYSB300Component), data: { progNo: 'SYSB300' } }, // 組織階層設定作業
  { path: 'sysb400', loadComponent: () => import('./sysb400/sysb400.component').then(m => m.SYSB400Component), data: { progNo: 'SYSB400' } }, // 組織碼設定作業
  { path: 'sysb500', loadComponent: () => import('./sysb500/sysb500.component').then(m => m.SYSB500Component), data: { progNo: 'SYSB500' } }, // 區域基本資料維護作業
  { path: 'sysb600', loadComponent: () => import('./sysb600/sysb600.component').then(m => m.SYSB600Component), data: { progNo: 'SYSB600' } }, // 樓層基本資料維護作業
  { path: 'sysb800', loadComponent: () => import('./sysb800/sysb800.component').then(m => m.SYSB800Component), data: { progNo: 'SYSB800' } }, // 大分類基本資料維護作業
  { path: 'sysb900', loadComponent: () => import('./sysb900/sysb900.component').then(m => m.SYSB900Component), data: { progNo: 'SYSB900' } }, // 中分類維護作業
  { path: 'sysb920', loadComponent: () => import('./sysb920/sysb920.component').then(m => m.SYSB920Component), data: { progNo: 'SYSB920' } }, // 小分類維護作業
  { path: 'sysbc00', loadComponent: () => import('./sysbc00/sysbc00.component').then(m => m.SYSBC00Component), data: { progNo: 'SYSBC00' } }, // 銀行基本資料維護作業
  { path: 'sysbp00', loadComponent: () => import('./sysbp00/sysbp00.component').then(m => m.SYSBP00Component), data: { progNo: 'SYSBP00' } }, // 參數資料設定維護
  { path: 'sysbq00', loadComponent: () => import('./sysbq00/sysbq00.component').then(m => m.SYSBQ00Component), data: { progNo: 'SYSBQ00' } }, // 簽核權限設定維護
  { path: 'sysbr00', loadComponent: () => import('./sysbr00/sysbr00.component').then(m => m.SYSBR00Component), data: { progNo: 'SYSBR00' } }, // 縣市區域資料維護作業
  { path: 'sysbr10', loadComponent: () => import('./sysbr10/sysbr10.component').then(m => m.SYSBR10Component), data: { progNo: 'SYSBR10' } }, // 佈告欄管理作業
  { path: 'sysb100cru', loadComponent: () => import('./sysb100.cru/sysb100.cru.component').then(m => m.SYSB100CRUComponent), data: { progNo: 'SYSB100' } }, // 公司基本資料維護作業 CRU
  { path: 'sysb200cru', loadComponent: () => import('./sysb200.cru/sysb200.cru.component').then(m => m.SYSB200CRUComponent), data: { progNo: 'SYSB200' } }, // 廠商基本資料維護作業 CRU
  { path: 'sysb300cru', loadComponent: () => import('./sysb300.cru/sysb300.cru.component').then(m => m.SYSB300CRUComponent), data: { progNo: 'SYSB300' } }, // 組織階層設定作業 CRU
  { path: 'sysb400cru', loadComponent: () => import('./sysb400.cru/sysb400.cru.component').then(m => m.SYSB400CRUComponent), data: { progNo: 'SYSB400' } }, // 組織碼設定作業 CRU
  { path: 'sysb400os', loadComponent: () => import('./sysb400.os/sysb400.os.component').then(m => m.Sysb400OsComponent), data: { progNo: 'SYSB400' } }, // 組織碼設定作業 OS
  { path: 'sysb500cru', loadComponent: () => import('./sysb500.cru/sysb500.cru.component').then(m => m.SYSB500CRUComponent), data: { progNo: 'SYSB500' } }, // 區域基本資料維護作業 CRU
  { path: 'sysb600cru', loadComponent: () => import('./sysb600.cru/sysb600.cru.component').then(m => m.SYSB600CRUComponent), data: { progNo: 'SYSB600' } }, // 樓層基本資料維護作業 CRU
  { path: 'sysb800cru', loadComponent: () => import('./sysb800.cru/sysb800.cru.component').then(m => m.SYSB800CRUComponent), data: { progNo: 'SYSB800' } }, // 大分類基本資料維護作業 CRU
  { path: 'sysb900cru', loadComponent: () => import('./sysb900.cru/sysb900.cru.component').then(m => m.SYSB900CRUComponent), data: { progNo: 'SYSB900' } }, // 中分類維護作業 CRU
  { path: 'sysb920cru', loadComponent: () => import('./sysb920.cru/sysb920.cru.component').then(m => m.SYSB920CRUComponent), data: { progNo: 'SYSB920' } }, // 小分類維護作業 CRU
  { path: 'sysbc00cru', loadComponent: () => import('./sysbc00.cru/sysbc00.cru.component').then(m => m.SYSBC00CRUComponent), data: { progNo: 'SYSBC00' } }, // 銀行基本資料維護作業 CRU
  { path: 'sysbp00cru', loadComponent: () => import('./sysbp00.cru/sysbp00.cru.component').then(m => m.SYSBP00CRUComponent), data: { progNo: 'SYSBP00' } }, // 參數資料設定維護 CRU
  { path: 'sysbq00cru', loadComponent: () => import('./sysbq00.cru/sysbq00.cru.component').then(m => m.SYSBQ00CRUComponent), data: { progNo: 'SYSBQ00' } }, // 簽核權限設定維護 CRU
  { path: 'sysbr00cru', loadComponent: () => import('./sysbr00.cru/sysbr00.cru.component').then(m => m.SYSBR00CRUComponent), data: { progNo: 'SYSBR00' } }, // 縣市區域資料維護作業 CRU
  { path: 'sysbr10cru', loadComponent: () => import('./sysbr10.cru/sysbr10.cru.component').then(m => m.SYSBR10CRUComponent), data: { progNo: 'SYSBR10' } }, // 佈告欄管理作業 CRU
];
