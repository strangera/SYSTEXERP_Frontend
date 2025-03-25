import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
// Component
import { NotfoundComponent } from '../notfound/notfound.component';
import { TLS31010Component } from './tls31010/tls31010.component';
import { TLS31020Component } from './tls31020/tls31020.component';
import { TLS31030Component } from './tls31030/tls31030.component';
import { TLS31040Component } from './tls31040/tls31040.component';
import { TLS31050Component } from './tls31050/tls31050.component';
import { TLS31060Component } from './tls31060/tls31060.component';
import { TLS31070Component } from './tls31070/tls31070.component';
import { TLS31080Component } from './tls31080/tls31080.component';
import { TLS31090Component } from './tls31090/tls31090.component';
import { TLS32010Component } from './tls32010/tls32010.component';
import { TLS32020Component } from './tls32020/tls32020.component';
import { TLS32030Component } from './tls32030/tls32030.component';
import { TLS32040Component } from './tls32040/tls32040.component';
import { TLS32050Component } from './tls32050/tls32050.component';
import { TLS32060Component } from './tls32060/tls32060.component';

const routes: Routes = [
  { path: '', redirectTo: '404', pathMatch: 'full' },
  { path: 'TLS31010', component: TLS31010Component }, // 即時業績查詢
  { path: 'TLS31020', component: TLS31020Component }, // 各樓層之營業報表
  { path: 'TLS31030', component: TLS31030Component }, // 各業種之營業報表
  { path: 'TLS31040', component: TLS31040Component }, // 各櫃別之營業報表
  { path: 'TLS31050', component: TLS31050Component }, // 各抽成別之營業報表
  { path: 'TLS31060', component: TLS31060Component }, // 各組織之營業報表
  { path: 'TLS31070', component: TLS31070Component }, // 各營業型態之營業報表
  { path: 'TLS31080', component: TLS31080Component }, // 各時段之樓層營業報表
  { path: 'TLS31090', component: TLS31090Component }, // 各時段之業種營業報表
  { path: 'TLS32010', component: TLS32010Component }, // 銷售排名分析報表
  { path: 'TLS32020', component: TLS32020Component }, // 期間業績分析報表
  { path: 'TLS32030', component: TLS32030Component }, // 成長率分析報表
  { path: 'TLS32040', component: TLS32040Component }, // 成長率分析報表
  { path: 'TLS32050', component: TLS32050Component }, // 成長率分析報表
  { path: 'TLS32060', component: TLS32060Component }, // 成長率分析報表
  { path: '404', component: NotfoundComponent },
  { path: '**', redirectTo: '404' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TLS3000RoutingModule { }
