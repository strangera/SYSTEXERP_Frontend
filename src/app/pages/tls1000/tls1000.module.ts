import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
// Routing
import { TLS1000RoutingModule } from './tls1000-routing.module';
// Component
import { TLS11010CRUComponent } from './tls11010-cru/tls11010-cru.component';
import { TLS11010Component } from './tls11010/tls11010.component';
import { TLS11020CRUComponent } from './tls11020-cru/tls11020-cru.component';
import { TLS11020Component } from './tls11020/tls11020.component';
import { TLS12010CRUComponent } from './tls12010-cru/tls12010-cru.component';
import { TLS12010Component } from './tls12010/tls12010.component';
import { TLS12020CRUComponent } from './tls12020-cru/tls12020-cru.component';
import { TLS12020Component } from './tls12020/tls12020.component';
import { TLS12030CRUComponent } from './tls12030-cru/tls12030-cru.component';
import { TLS12030Component } from './tls12030/tls12030.component';
import { TLS12040CRUComponent } from './tls12040-cru/tls12040-cru.component';
import { TLS12040Component } from './tls12040/tls12040.component';
import { TLS12050CRUComponent } from './tls12050-cru/tls12050-cru.component';
import { TLS12050Component } from './tls12050/tls12050.component';
import { TLS12060Component } from './tls12060/tls12060.component';
import { TLS12070Component } from './tls12070/tls12070.component';
import { TLS13010CRUComponent } from './tls13010-cru/tls13010-cru.component';
import { TLS13010Component } from './tls13010/tls13010.component';
import { TLS13020CRUComponent } from './tls13020-cru/tls13020-cru.component';
import { TLS13020Component } from './tls13020/tls13020.component';
import { TLS13030CRUComponent } from './tls13030-cru/tls13030-cru.component';
import { TLS13030Component } from './tls13030/tls13030.component';
import { TLS13040CRUComponent } from './tls13040-cru/tls13040-cru.component';
import { TLS13040Component } from './tls13040/tls13040.component';
import { TLS13050CRUComponent } from './tls13050-cru/tls13050-cru.component';
import { TLS13050Component } from './tls13050/tls13050.component';
import { TLS13060CRUComponent } from './tls13060-cru/tls13060-cru.component';
import { TLS13060Component } from './tls13060/tls13060.component';
import { TLS13070CRUComponent } from './tls13070-cru/tls13070-cru.component';
import { TLS13070Component } from './tls13070/tls13070.component';
import { TLS14010CRUComponent } from './tls14010-cru/tls14010-cru.component';
import { TLS14010Component } from './tls14010/tls14010.component';
import { TLS14020CRUComponent } from './tls14020-cru/tls14020-cru.component';
import { TLS14020Component } from './tls14020/tls14020.component';
import { TLS13010Next1Component } from './tls13010-next1/tls13010-next1.component';
import { TLS13010Next2Component } from './tls13010-next2/tls13010-next2.component';

@NgModule({
  declarations: [
    TLS11010Component,
    TLS11020Component,
    TLS12010Component,
    TLS12020Component,
    TLS12030Component,
    TLS12040Component,
    TLS12050Component,
    TLS12060Component,
    TLS12070Component,
    TLS13010Component,
    TLS13020Component,
    TLS13030Component,
    TLS13040Component,
    TLS13050Component,
    TLS13060Component,
    TLS13070Component,
    TLS14010Component,
    TLS14020Component,
    TLS11010CRUComponent,
    TLS11020CRUComponent,
    TLS12010CRUComponent,
    TLS12020CRUComponent,
    TLS12030CRUComponent,
    TLS12040CRUComponent,
    TLS12050CRUComponent,
    TLS13010CRUComponent,
    TLS13020CRUComponent,
    TLS13030CRUComponent,
    TLS13040CRUComponent,
    TLS13050CRUComponent,
    TLS13060CRUComponent,
    TLS13070CRUComponent,
    TLS14010CRUComponent,
    TLS14020CRUComponent,
    TLS13010Next1Component,
    TLS13010Next2Component
  ],
  imports: [
    CommonModule,
    TLS1000RoutingModule,
    SharedModule
  ]
})
// 2.1 招商暨合約系統
export class TLS1000Module { }
