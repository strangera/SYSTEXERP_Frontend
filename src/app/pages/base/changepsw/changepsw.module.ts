import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChangepswRoutingModule } from './changepsw-routing.module';
import { SharedModule } from '../../../shared/shared.module';
import { ChangepswComponent } from './changepsw.component';

@NgModule({
  declarations: [
    ChangepswComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    ChangepswRoutingModule
  ]
})
export class ChangepswModule { }
