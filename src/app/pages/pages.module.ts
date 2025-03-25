import { NgModule } from '@angular/core';
import { PagesRoutingModule } from './pages-routing.module';
import { SharedModule } from '../shared/shared.module';
import { PagesComponent } from './pages.component';
import { LayoutModule } from '../layout/layout.module';
import { DatePipe } from '@angular/common';
import { SYS0110Component } from './sys0000/sys0110/sys0110.component';

@NgModule({
  declarations: [
    PagesComponent,
    
  ],
  imports: [
    PagesRoutingModule,
    SharedModule,
    LayoutModule,
  ],
  providers: [
    DatePipe,
  ],
})
export class PagesModule { }
