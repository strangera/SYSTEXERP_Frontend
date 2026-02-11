import { Routes } from '@angular/router';

export const sysRoutes: Routes = [
  { path: 'sysbc00', loadComponent: () => import('./sysbc00/sysbc00.component').then(m => m.SYSBC00Component), data: { progNo: 'SYSBC00' } }, // 銀行基本資料維護作業
  { path: 'sysbc00cru', loadComponent: () => import('./sysbc00.cru/sysbc00.cru.component').then(m => m.SYSBC00CRUComponent), data: { progNo: 'SYSBC00' } }, // 銀行基本資料維護作業 CRU
  { path: 'sysbr10', loadComponent: () => import('./sysbr10/sysbr10.component').then(m => m.SYSBR10Component), data: { progNo: 'SYSBR10' } }, // 佈告欄管理作業
  { path: 'sysbr10cru', loadComponent: () => import('./sysbr10.cru/sysbr10.cru.component').then(m => m.SYSBR10CRUComponent), data: { progNo: 'SYSBR10' } }, // 佈告欄管理作業 CRU
  { path: 'sysbp00', loadComponent: () => import('./sysbp00/sysbp00.component').then(m => m.SYSBP00Component), data: { progNo: 'SYSBP00' } }, // 參數資料設定維護
  { path: 'sysbp00cru', loadComponent: () => import('./sysbp00.cru/sysbp00.cru.component').then(m => m.SYSBP00CRUComponent), data: { progNo: 'SYSBP00' } }, // 參數資料設定維護 CRU
  { path: 'sys0110', loadComponent: () => import('./sys0110/sys0110.component').then(m => m.SYS0110Component), data: { progNo: 'SYS0110' } }, // 使用者基本資料維護
  { path: 'sys0110cru', loadComponent: () => import('./sys0110.cru/sys0110.cru.component').then(m => m.SYS0110CRUComponent), data: { progNo: 'SYS0110' } }, // 使用者基本資料維護 CRU
  { path: 'sys0210', loadComponent: () => import('./sys0210/sys0210.component').then(m => m.SYS0210Component), data: { progNo: 'SYS0210' } }, // 角色基本資料維護
  { path: 'sys0210cru', loadComponent: () => import('./sys0210.cru/sys0210.cru.component').then(m => m.SYS0210CRUComponent), data: { progNo: 'SYS0210' } }, // 角色基本資料維護 CRU
  { path: 'sys0230', loadComponent: () => import('./sys0230/sys0230.component').then(m => m.SYS0230Component), data: { progNo: 'SYS0230' } }, // 角色複製
  { path: 'sys0230cru', loadComponent: () => import('./sys0230.cru/sys0230.cru.component').then(m => m.SYS0230CRUComponent), data: { progNo: 'SYS0230' } }, // 角色複製 CRU
  { path: 'sys0240', loadComponent: () => import('./sys0240/sys0240.component').then(m => m.SYS0240Component), data: { progNo: 'SYS0240' } }, // 使用者之角色設定維護
  { path: 'sys0240cru', loadComponent: () => import('./sys0240.cru/sys0240.cru.component').then(m => m.SYS0240CRUComponent), data: { progNo: 'SYS0240' } }, // 使用者之角色設定維護 CRU
  { path: 'sys0220', loadComponent: () => import('./sys0220/sys0220.component').then(m => m.SYS0220Component), data: { progNo: 'SYS0220' } }, // 角色之使用者設定維護
  { path: 'sys0220cru', loadComponent: () => import('./sys0220.cru/sys0220.cru.component').then(m => m.SYS0220CRUComponent), data: { progNo: 'SYS0220' } }, // 角色之使用者設定維護 CRU
  { path: 'sys0310', loadComponent: () => import('./sys0310/sys0310.component').then(m => m.SYS0310Component), data: { progNo: 'SYS0310' } }, // 角色系統權限設定
  { path: 'sys0310cru', loadComponent: () => import('./sys0310.cru/sys0310.cru.component').then(m => m.SYS0310CRUComponent), data: { progNo: 'SYS0310' } }, // 角色系統權限設定 CRU
  { path: 'sys0320', loadComponent: () => import('./sys0320/sys0320.component').then(m => m.SYS0320Component), data: { progNo: 'SYS0320' } }, // 使用者系統權限設定
  { path: 'sys0320cru', loadComponent: () => import('./sys0320.cru/sys0320.cru.component').then(m => m.SYS0320CRUComponent), data: { progNo: 'SYS0320' } }, // 使用者系統權限設定 CRU
  { path: 'sys0760', loadComponent: () => import('./sys0760/sys0760.component').then(m => m.SYS0760Component), data: { progNo: 'SYS0760' } }, // 使用者異常登入報表
  { path: 'sys0730', loadComponent: () => import('./sys0730/sys0730.component').then(m => m.SYS0730Component), data: { progNo: 'SYS0730' } }, // 角色系統權限列表
  { path: 'sys0710', loadComponent: () => import('./sys0710/sys0710.component').then(m => m.SYS0710Component), data: { progNo: 'SYS0710' } }, // 使用者系統權限列表
  { path: 'sys0740', loadComponent: () => import('./sys0740/sys0740.component').then(m => m.SYS0740Component), data: { progNo: 'SYS0740' } }, // 作業權限之角色列表
  { path: 'sys0750', loadComponent: () => import('./sys0750/sys0750.component').then(m => m.SYS0750Component), data: { progNo: 'SYS0750' } }, // 角色之使用者列表
  { path: 'sys0770', loadComponent: () => import('./sys0770/sys0770.component').then(m => m.SYS0770Component), data: { progNo: 'SYS0770' } }, // 作業權限統計表
  { path: 'sysbq00', loadComponent: () => import('./sysbq00/sysbq00.component').then(m => m.SYSBQ00Component), data: { progNo: 'SYSBQ00' } }, // 簽核權限設定維護
  { path: 'sysbq00cru', loadComponent: () => import('./sysbq00.cru/sysbq00.cru.component').then(m => m.SYSBQ00CRUComponent), data: { progNo: 'SYSBQ00' } }, // 簽核權限設定維護 CRU
];
