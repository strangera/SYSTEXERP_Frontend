import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ASS2000RoutingModule } from './ass2000-routing.module';
//
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
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [
    ASS21010CRUComponent,
    ASS21010Component,
    ASS21020CRUComponent,
    ASS21020Component,
    ASS21030CRUComponent,
    ASS21030Component,
    ASS21040CRUComponent,
    ASS21040Component,
    ASS21050CRUComponent,
    ASS21050Component,
    ASS21060CRUComponent,
    ASS21060Component,
    ASS22010CRUComponent,
    ASS22010Component,
    ASS22020CRUComponent,
    ASS22020Component,
    ASS22030CRUComponent,
    ASS22030Component,
    ASS22040CRUComponent,
    ASS22040Component,
    ASS23010Component,
    ASS23020Component,
    ASS23030Component,
  ],
  imports: [
    CommonModule,
    ASS2000RoutingModule,
    SharedModule
  ]
})
export class ASS2000Module { }
