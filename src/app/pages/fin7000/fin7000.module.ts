import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FIN7000RoutingModule } from './fin7000-routing.module';
//
import { FIN71010CRUComponent } from './fin71010-cru/fin71010-cru.component';
import { FIN71010Component } from './fin71010/fin71010.component';
import { FIN71020CRUComponent } from './fin71020-cru/fin71020-cru.component';
import { FIN71020Component } from './fin71020/fin71020.component';
import { FIN72010CRUComponent } from './fin72010-cru/fin72010-cru.component';
import { FIN72010Component } from './fin72010/fin72010.component';
import { FIN72020CRUComponent } from './fin72020-cru/fin72020-cru.component';
import { FIN72020Component } from './fin72020/fin72020.component';
import { FIN72030CRUComponent } from './fin72030-cru/fin72030-cru.component';
import { FIN72030Component } from './fin72030/fin72030.component';
import { FIN72040CRUComponent } from './fin72040-cru/fin72040-cru.component';
import { FIN72040Component } from './fin72040/fin72040.component';
import { FIN72050CRUComponent } from './fin72050-cru/fin72050-cru.component';
import { FIN72050Component } from './fin72050/fin72050.component';
import { FIN73010Component } from './fin73010/fin73010.component';
import { FIN73020CRUComponent } from './fin73020-cru/fin73020-cru.component';
import { FIN73020Component } from './fin73020/fin73020.component';
import { FIN73030Component } from './fin73030/fin73030.component';
import { FIN73040Component } from './fin73040/fin73040.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [
    FIN71010CRUComponent,
    FIN71010Component,
    FIN71020CRUComponent,
    FIN71020Component,
    FIN72010CRUComponent,
    FIN72010Component,
    FIN72020CRUComponent,
    FIN72020Component,
    FIN72030CRUComponent,
    FIN72030Component,
    FIN72040CRUComponent,
    FIN72040Component,
    FIN72050CRUComponent,
    FIN72050Component,
    FIN73010Component,
    FIN73020CRUComponent,
    FIN73020Component,
    FIN73030Component,
    FIN73040Component,
  ],
  imports: [
    CommonModule,
    FIN7000RoutingModule,
    SharedModule
  ]
})
export class FIN7000Module { }
