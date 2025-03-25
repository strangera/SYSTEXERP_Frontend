import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FIN4000RoutingModule } from './fin4000-routing.module';
//
import { FIN41010CRUComponent } from './fin41010-cru/fin41010-cru.component';
import { FIN41010Component } from './fin41010/fin41010.component';
import { FIN41020CRUComponent } from './fin41020-cru/fin41020-cru.component';
import { FIN41020Component } from './fin41020/fin41020.component';
import { FIN41030CRUComponent } from './fin41030-cru/fin41030-cru.component';
import { FIN41030Component } from './fin41030/fin41030.component';
import { FIN41040CRUComponent } from './fin41040-cru/fin41040-cru.component';
import { FIN41040Component } from './fin41040/fin41040.component';
import { FIN42010CRUComponent } from './fin42010-cru/fin42010-cru.component';
import { FIN42010Component } from './fin42010/fin42010.component';
import { FIN42020CRUComponent } from './fin42020-cru/fin42020-cru.component';
import { FIN42020Component } from './fin42020/fin42020.component';
import { FIN42030CRUComponent } from './fin42030-cru/fin42030-cru.component';
import { FIN42030Component } from './fin42030/fin42030.component';
import { FIN42040CRUComponent } from './fin42040-cru/fin42040-cru.component';
import { FIN42040Component } from './fin42040/fin42040.component';
import { FIN42050CRUComponent } from './fin42050-cru/fin42050-cru.component';
import { FIN42050Component } from './fin42050/fin42050.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [
    FIN41010CRUComponent,
    FIN41010Component,
    FIN41020CRUComponent,
    FIN41020Component,
    FIN41030CRUComponent,
    FIN41030Component,
    FIN41040CRUComponent,
    FIN41040Component,
    FIN42010CRUComponent,
    FIN42010Component,
    FIN42020CRUComponent,
    FIN42020Component,
    FIN42030CRUComponent,
    FIN42030Component,
    FIN42040CRUComponent,
    FIN42040Component,
    FIN42050CRUComponent,
    FIN42050Component,
  ],
  imports: [
    CommonModule,
    FIN4000RoutingModule,
    SharedModule,
  ]
})
export class FIN4000Module { }
