import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// Routing
import { SYS0000RoutingModule } from './sys0000-routing.module';
// Component
import { SYS0110Component } from './sys0110/sys0110.component';
import { SYS0210Component } from './sys0210/sys0210.component';
import { SYS0220Component } from './sys0220/sys0220.component';
import { SYS0230Component } from './sys0230/sys0230.component';
import { SYS0240Component } from './sys0240/sys0240.component';
import { SYS0310Component } from './sys0310/sys0310.component';
import { SYS0320Component } from './sys0320/sys0320.component';
import { SYS0620Component } from './sys0620/sys0620.component';
import { SYS0710Component } from './sys0710/sys0710.component';
import { SYS0730Component } from './sys0730/sys0730.component';
import { SYS0740Component } from './sys0740/sys0740.component';
import { SYS0750Component } from './sys0750/sys0750.component';
import { SYS0760Component } from './sys0760/sys0760.component';
import { SYS0770Component } from './sys0770/sys0770.component';
import { SYS0780Component } from './sys0780/sys0780.component';
import { SYS0790Component } from './sys0790/sys0790.component';
import { SYS0791Component } from './sys0791/sys0791.component';
import { SYS0792Component } from './sys0792/sys0792.component';
import { SYS0110CRUComponent } from './sys0110.cru/sys0110.cru.component';
import { SYS0210CRUComponent } from './sys0210.cru/sys0210.cru.component';
import { SYS0220CRUComponent } from './sys0220.cru/sys0220.cru.component';
import { SYS0230CRUComponent } from './sys0230.cru/sys0230.cru.component';
import { SYS0240CRUComponent } from './sys0240.cru/sys0240.cru.component';
import { SYS0310CRUComponent } from './sys0310.cru/sys0310.cru.component';
import { SYS0320CRUComponent } from './sys0320.cru/sys0320.cru.component';
import { SYS0620CRUComponent } from './sys0620.cru/sys0620.cru.component';
import { SharedModule } from '../../shared/shared.module';

// 4.2 權限管理系統
@NgModule({
  declarations: [
    SYS0110Component,
    SYS0210Component,
    SYS0220Component,
    SYS0230Component,
    SYS0240Component,
    SYS0310Component,
    SYS0320Component,
    SYS0620Component,
    SYS0710Component,
    SYS0730Component,
    SYS0740Component,
    SYS0750Component,
    SYS0760Component,
    SYS0770Component,
    SYS0780Component,
    SYS0790Component,
    SYS0791Component,
    SYS0792Component,
    SYS0110CRUComponent,
    SYS0210CRUComponent,
    SYS0220CRUComponent,
    SYS0230CRUComponent,
    SYS0240CRUComponent,
    SYS0310CRUComponent,
    SYS0320CRUComponent,
    SYS0620CRUComponent,
  ],
  imports: [
    CommonModule,
    SYS0000RoutingModule,
    SharedModule
  ]
})
export class SYS0000Module { }
