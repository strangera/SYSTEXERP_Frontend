import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CpmRoutingModule } from './cpm-routing.module';

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
import { CPM21010CRUComponent } from './cpm21010-cru/cpm21010-cru.component';
import { CPM21010Component } from './cpm21010/cpm21010.component';
import { CPM21020CRUComponent } from './cpm21020-cru/cpm21020-cru.component';
import { CPM21020Component } from './cpm21020/cpm21020.component';
import { CPM21030CRUComponent } from './cpm21030-cru/cpm21030-cru.component';
import { CPM21030Component } from './cpm21030/cpm21030.component';
import { CPM21040CRUComponent } from './cpm21040-cru/cpm21040-cru.component';
import { CPM21040Component } from './cpm21040/cpm21040.component';
import { CPM21050CRUComponent } from './cpm21050-cru/cpm21050-cru.component';
import { CPM21050Component } from './cpm21050/cpm21050.component';
import { CPM21060CRUComponent } from './cpm21060-cru/cpm21060-cru.component';
import { CPM21060Component } from './cpm21060/cpm21060.component';
import { CPM22010CRUComponent } from './cpm22010-cru/cpm22010-cru.component';
import { CPM22010Component } from './cpm22010/cpm22010.component';
import { CPM22020CRUComponent } from './cpm22020-cru/cpm22020-cru.component';
import { CPM22020Component } from './cpm22020/cpm22020.component';
import { CPM22030CRUComponent } from './cpm22030-cru/cpm22030-cru.component';
import { CPM22030Component } from './cpm22030/cpm22030.component';
import { CPM22040CRUComponent } from './cpm22040-cru/cpm22040-cru.component';
import { CPM22040Component } from './cpm22040/cpm22040.component';
import { CPM22050CRUComponent } from './cpm22050-cru/cpm22050-cru.component';
import { CPM22050Component } from './cpm22050/cpm22050.component';
import { CPM23010CRUComponent } from './cpm23010-cru/cpm23010-cru.component';
import { CPM23010Component } from './cpm23010/cpm23010.component';
import { CPM23020CRUComponent } from './cpm23020-cru/cpm23020-cru.component';
import { CPM23020Component } from './cpm23020/cpm23020.component';
import { CPM23030CRUComponent } from './cpm23030-cru/cpm23030-cru.component';
import { CPM23030Component } from './cpm23030/cpm23030.component';
import { CPM23040CRUComponent } from './cpm23040-cru/cpm23040-cru.component';
import { CPM23040Component } from './cpm23040/cpm23040.component';
import { CPM23050CRUComponent } from './cpm23050-cru/cpm23050-cru.component';
import { CPM23050Component } from './cpm23050/cpm23050.component';
import { CPM24010CRUComponent } from './cpm24010-cru/cpm24010-cru.component';
import { CPM24010Component } from './cpm24010/cpm24010.component';
import { CPM24020Component } from './cpm24020/cpm24020.component';
import { CPM24030Component } from './cpm24030/cpm24030.component';
import { CPM24040Component } from './cpm24040/cpm24040.component';
import { CPM25010Component } from './cpm25010/cpm25010.component';
import { CPM25020Component } from './cpm25020/cpm25020.component';
import { CPM25030Component } from './cpm25030/cpm25030.component';
import { CPM25040Component } from './cpm25040/cpm25040.component';
import { CPM25050Component } from './cpm25050/cpm25050.component';
import { CPM25060Component } from './cpm25060/cpm25060.component';

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
    CPM21010CRUComponent,
    CPM21010Component,
    CPM21020CRUComponent,
    CPM21020Component,
    CPM21030CRUComponent,
    CPM21030Component,
    CPM21040CRUComponent,
    CPM21040Component,
    CPM21050CRUComponent,
    CPM21050Component,
    CPM21060CRUComponent,
    CPM21060Component,
    CPM22010CRUComponent,
    CPM22010Component,
    CPM22020CRUComponent,
    CPM22020Component,
    CPM22030CRUComponent,
    CPM22030Component,
    CPM22040CRUComponent,
    CPM22040Component,
    CPM22050CRUComponent,
    CPM22050Component,
    CPM23010CRUComponent,
    CPM23010Component,
    CPM23020CRUComponent,
    CPM23020Component,
    CPM23030CRUComponent,
    CPM23030Component,
    CPM23040CRUComponent,
    CPM23040Component,
    CPM23050CRUComponent,
    CPM23050Component,
    CPM24010CRUComponent,
    CPM24010Component,
    CPM24020Component,
    CPM24030Component,
    CPM24040Component,
    CPM25010Component,
    CPM25020Component,
    CPM25030Component,
    CPM25040Component,
    CPM25050Component,
    CPM25060Component,
  ],
  imports: [
    CommonModule,
    CpmRoutingModule,
    SharedModule,
  ]
})
export class CpmModule { }
