import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FIN3000RoutingModule } from './fin3000-routing.module';
//
import { FIN31010CRUComponent } from './fin31010-cru/fin31010-cru.component';
import { FIN31010Component } from './fin31010/fin31010.component';
import { FIN31020CRUComponent } from './fin31020-cru/fin31020-cru.component';
import { FIN31020Component } from './fin31020/fin31020.component';
import { FIN32010CRUComponent } from './fin32010-cru/fin32010-cru.component';
import { FIN32010Component } from './fin32010/fin32010.component';
import { FIN32020CRUComponent } from './fin32020-cru/fin32020-cru.component';
import { FIN32020Component } from './fin32020/fin32020.component';
import { FIN32030CRUComponent } from './fin32030-cru/fin32030-cru.component';
import { FIN32030Component } from './fin32030/fin32030.component';
import { FIN33010CRUComponent } from './fin33010-cru/fin33010-cru.component';
import { FIN33010Component } from './fin33010/fin33010.component';
import { FIN34010Component } from './fin34010/fin34010.component';
import { FIN34020Component } from './fin34020/fin34020.component';
import { FIN34030CRUComponent } from './fin34030-cru/fin34030-cru.component';
import { FIN34030Component } from './fin34030/fin34030.component';
import { FIN34040CRUComponent } from './fin34040-cru/fin34040-cru.component';
import { FIN34040Component } from './fin34040/fin34040.component';
import { FIN35010CRUComponent } from './fin35010-cru/fin35010-cru.component';
import { FIN35010Component } from './fin35010/fin35010.component';
import { FIN35020CRUComponent } from './fin35020-cru/fin35020-cru.component';
import { FIN35020Component } from './fin35020/fin35020.component';
import { FIN35030CRUComponent } from './fin35030-cru/fin35030-cru.component';
import { FIN35030Component } from './fin35030/fin35030.component';
import { FIN35040CRUComponent } from './fin35040-cru/fin35040-cru.component';
import { FIN35040Component } from './fin35040/fin35040.component';
import { FIN35050CRUComponent } from './fin35050-cru/fin35050-cru.component';
import { FIN35050Component } from './fin35050/fin35050.component';
import { FIN35060CRUComponent } from './fin35060-cru/fin35060-cru.component';
import { FIN35060Component } from './fin35060/fin35060.component';
import { FIN35070CRUComponent } from './fin35070-cru/fin35070-cru.component';
import { FIN35070Component } from './fin35070/fin35070.component';
import { SharedModule } from '../../shared/shared.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  declarations: [
    FIN31010CRUComponent,
    FIN31010Component,
    FIN31020CRUComponent,
    FIN31020Component,
    FIN32010CRUComponent,
    FIN32010Component,
    FIN32020CRUComponent,
    FIN32020Component,
    FIN32030CRUComponent,
    FIN32030Component,
    FIN33010CRUComponent,
    FIN33010Component,
    FIN34010Component,
    FIN34020Component,
    FIN34030CRUComponent,
    FIN34030Component,
    FIN34040CRUComponent,
    FIN34040Component,
    FIN35010CRUComponent,
    FIN35010Component,
    FIN35020CRUComponent,
    FIN35020Component,
    FIN35030CRUComponent,
    FIN35030Component,
    FIN35040CRUComponent,
    FIN35040Component,
    FIN35050CRUComponent,
    FIN35050Component,
    FIN35060CRUComponent,
    FIN35060Component,
    FIN35070CRUComponent,
    FIN35070Component,
    FIN34040Component  ],
  imports: [
    CommonModule,
    FIN3000RoutingModule,
    SharedModule
  ]
})
export class FIN3000Module { }
