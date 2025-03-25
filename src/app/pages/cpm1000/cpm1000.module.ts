import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CPM1000RoutingModule } from './cpm1000-routing.module';
//
import { CPM11010CRUComponent } from './cpm11010-cru/cpm11010-cru.component';
import { CPM11010Component } from './cpm11010/cpm11010.component';
import { CPM11020CRUComponent } from './cpm11020-cru/cpm11020-cru.component';
import { CPM11020Component } from './cpm11020/cpm11020.component';
import { CPM11030CRUComponent } from './cpm11030-cru/cpm11030-cru.component';
import { CPM11030Component } from './cpm11030/cpm11030.component';
import { Cpm11040HQComponent } from './cpm11040-hq/cpm11040-hq.component';
import { CPM11040Component } from './cpm11040/cpm11040.component';
import { Cpm11050FoundComponent } from './cpm11050-found/cpm11050-found.component';
import { Cpm11050LostComponent } from './cpm11050-lost/cpm11050-lost.component';
import { Cpm11050UnclaimedComponent } from './cpm11050-unclaimed/cpm11050-unclaimed.component';
import { CPM11050Component } from './cpm11050/cpm11050.component';
import { CPM11060Component } from './cpm11060/cpm11060.component';
import { CPM11070Component } from './cpm11070/cpm11070.component';
import { CPM12010CRUComponent } from './cpm12010-cru/cpm12010-cru.component';
import { CPM12010Component } from './cpm12010/cpm12010.component';
import { CPM12020CRUComponent } from './cpm12020-cru/cpm12020-cru.component';
import { CPM12020Component } from './cpm12020/cpm12020.component';
import { CPM12030CRUComponent } from './cpm12030-cru/cpm12030-cru.component';
import { CPM12030Component } from './cpm12030/cpm12030.component';
import { CPM12040CRUComponent } from './cpm12040-cru/cpm12040-cru.component';
import { CPM12040Component } from './cpm12040/cpm12040.component';
import { Cpm12050HQComponent } from './cpm12050-hq/cpm12050-hq.component';
import { CPM12050CRUComponent } from './cpm12050-cru/cpm12050-cru.component';
import { CPM12050Component } from './cpm12050/cpm12050.component';
import { CPM12060Component } from './cpm12060/cpm12060.component';
import { CPM12070Component } from './cpm12070/cpm12070.component';
import { CPM13010CRUComponent } from './cpm13010-cru/cpm13010-cru.component';
import { CPM13010Component } from './cpm13010/cpm13010.component';
import { CPM13020CRUComponent } from './cpm13020-cru/cpm13020-cru.component';
import { CPM13020Component } from './cpm13020/cpm13020.component';
import { CPM13030CRUComponent } from './cpm13030-cru/cpm13030-cru.component';
import { CPM13030Component } from './cpm13030/cpm13030.component';
import { CPM13040CRUComponent } from './cpm13040-cru/cpm13040-cru.component';
import { CPM13040Component } from './cpm13040/cpm13040.component';
import { CPM13050CRUComponent } from './cpm13050-cru/cpm13050-cru.component';
import { CPM13050Component } from './cpm13050/cpm13050.component';
import { SharedModule } from '../../shared/shared.module';
import { Cpm11060CRUComponent } from './cpm11060-cru/cpm11060-cru.component';
import { CpmLostCodeComponent } from './cpm-lost-code/cpm-lost-code.component';
import { CpmLostPlaceComponent } from './cpm-lost-place/cpm-lost-place.component';
import { CpmLostCodeCRUComponent } from './cpm-lost-code-cru/cpm-lost-code-cru.component';
import { CpmLostPlaceCRUComponent } from './cpm-lost-place-cru/cpm-lost-place-cru.component';
import { CpmLostPersonComponent } from './cpm-lost-person/cpm-lost-person.component';
import { CpmLostPersonCRUComponent } from './cpm-lost-person-cru/cpm-lost-person-cru.component';


@NgModule({
  declarations: [
    CPM11010CRUComponent,
    CPM11010Component,
    CPM11020CRUComponent,
    CPM11020Component,
    CPM11030CRUComponent,
    CPM11030Component,
    Cpm11040HQComponent,
    CPM11040Component,
    Cpm11050FoundComponent,
    Cpm11050LostComponent,
    Cpm11050UnclaimedComponent,
    CPM11050Component,
    CPM11060Component,
    Cpm11060CRUComponent,
    CPM11070Component,
    CPM12010CRUComponent,
    CPM12010Component,
    CPM12020CRUComponent,
    CPM12020Component,
    CPM12030CRUComponent,
    CPM12030Component,
    CPM12040CRUComponent,
    CPM12040Component,
    Cpm12050HQComponent,
    CPM12050CRUComponent,
    CPM12050Component,
    CPM12060Component,
    CPM12070Component,
    CPM13010CRUComponent,
    CPM13010Component,
    CPM13020CRUComponent,
    CPM13020Component,
    CPM13030CRUComponent,
    CPM13030Component,
    CPM13040CRUComponent,
    CPM13040Component,
    CPM13050CRUComponent,
    CPM13050Component,
    
    CpmLostCodeComponent,   //暫存頁_等code出來就刪除
    CpmLostCodeCRUComponent,
    CpmLostPlaceComponent,  //暫存頁_等code出來就刪除
    CpmLostPlaceCRUComponent,
    CpmLostPersonComponent, //暫存頁_等code出來就刪除
    CpmLostPersonCRUComponent,
  ],
  imports: [
    CommonModule,
    CPM1000RoutingModule,
    SharedModule,
  ]
})
export class CPM1000Module { }
