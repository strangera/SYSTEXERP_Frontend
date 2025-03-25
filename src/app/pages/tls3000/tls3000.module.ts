import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
// Routing
import { TLS3000RoutingModule } from './tls3000-routing.module';
//
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

@NgModule({
  declarations: [
    TLS31010Component,
    TLS31020Component,
    TLS31030Component,
    TLS31040Component,
    TLS31050Component,
    TLS31060Component,
    TLS31070Component,
    TLS31080Component,
    TLS31090Component,
    TLS32010Component,
    TLS32020Component,
    TLS32030Component,
    TLS32040Component,
    TLS32050Component,
    TLS32060Component,
  ],
  imports: [
    CommonModule,
    TLS3000RoutingModule,
    SharedModule,
  ]
})
// 2.3 決策支援管理-營運管理及銷售分析報表
export class TLS3000Module { }
