import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
// Component
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
import { NotfoundComponent } from '../notfound/notfound.component';

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
  { path: '404', component: NotfoundComponent },
  { path: '**', redirectTo: '404' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SYS0000RoutingModule { }
