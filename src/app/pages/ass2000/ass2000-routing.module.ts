import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotfoundComponent } from '../notfound/notfound.component';
import { ASS21010CRUComponent } from './ass21010-cru/ass21010-cru.component';
import { ASS21010Component } from './ass21010/ass21010.component';
import { ASS21020CRUComponent } from './ass21020-cru/ass21020-cru.component';
import { ASS21020Component } from './ass21020/ass21020.component';
import { ASS21030CRUComponent } from './ass21030-cru/ass21030-cru.component';
import { ASS21030Component } from './ass21030/ass21030.component';
import { ASS21040CRUComponent } from './ass21040-cru/ass21040-cru.component';
import { ASS21040Component } from './ass21040/ass21040.component';
import { ASS21050CRUComponent } from './ass21050-cru/ass21050-cru.component';
import { ASS21050Component } from './ass21050/ass21050.component';
import { ASS21060CRUComponent } from './ass21060-cru/ass21060-cru.component';
import { ASS21060Component } from './ass21060/ass21060.component';
import { ASS22010CRUComponent } from './ass22010-cru/ass22010-cru.component';
import { ASS22010Component } from './ass22010/ass22010.component';
import { ASS22020CRUComponent } from './ass22020-cru/ass22020-cru.component';
import { ASS22020Component } from './ass22020/ass22020.component';
import { ASS22030CRUComponent } from './ass22030-cru/ass22030-cru.component';
import { ASS22030Component } from './ass22030/ass22030.component';
import { ASS22040CRUComponent } from './ass22040-cru/ass22040-cru.component';
import { ASS22040Component } from './ass22040/ass22040.component';
import { ASS23010Component } from './ass23010/ass23010.component';
import { ASS23020Component } from './ass23020/ass23020.component';
import { ASS23030Component } from './ass23030/ass23030.component';

const routes: Routes = [
  { path: '', redirectTo: '404', pathMatch: 'full' },
  { path: 'ASS21010', component: ASS21010Component },  // 基本資料設定-能源錶號地點維護作業
  { path: 'ASS21010CRU', component: ASS21010CRUComponent },
  { path: 'ASS21020', component: ASS21020Component },  // 基本資料設定-能源錶號基本維護
  { path: 'ASS21020CRU', component: ASS21020CRUComponent },
  { path: 'ASS21030', component: ASS21030Component },  // 基本資料設定-水錶攤提設定
  { path: 'ASS21030CRU', component: ASS21030CRUComponent },
  { path: 'ASS21040', component: ASS21040Component },  // 基本資料設定-電錶攤提設定
  { path: 'ASS21040CRU', component: ASS21040CRUComponent },
  { path: 'ASS21050', component: ASS21050Component },  // 基本資料設定-瓦斯錶攤提設定
  { path: 'ASS21050CRU', component: ASS21050CRUComponent },
  { path: 'ASS21060', component: ASS21060Component },  // 基本資料設定-能源單價設定
  { path: 'ASS21060CRU', component: ASS21060CRUComponent },
  { path: 'ASS22010', component: ASS22010Component },  // 能源使用狀況作業-水錶抄錶作業
  { path: 'ASS22010CRU', component: ASS22010CRUComponent },
  { path: 'ASS22020', component: ASS22020Component },  // 能源使用狀況作業-電錶抄錶作業
  { path: 'ASS22020CRU', component: ASS22020CRUComponent },
  { path: 'ASS22030', component: ASS22030Component },  // 能源使用狀況作業-瓦斯錶抄錶作業
  { path: 'ASS22030CRU', component: ASS22030CRUComponent },
  { path: 'ASS22040', component: ASS22040Component },  // 能源使用狀況作業-電子錶匯入作業
  { path: 'ASS22040CRU', component: ASS22040CRUComponent },
  { path: 'ASS23010', component: ASS23010Component },  // 能源計費攤提作業-水錶攤提計算作業
  { path: 'ASS23020', component: ASS23020Component },  // 能源計費攤提作業-電錶攤提計算作業
  { path: 'ASS23030', component: ASS23030Component },  // 能源計費攤提作業-瓦斯攤提計算作業
  { path: '404', component: NotfoundComponent },
  { path: '**', redirectTo: '404' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ASS2000RoutingModule { }
