import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChangepswRoutingModule } from './changepsw-routing.module';
import { SharedModule } from '../../../shared/shared.module';
import { ChangepswComponent } from './changepsw.component';
import { PasswordComponent } from './password/password.component';
import { PasswordModule } from 'primeng/password';

@NgModule({
  declarations: [
    ChangepswComponent,
    PasswordComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    ChangepswRoutingModule,
    PasswordModule
  ]
})
export class ChangepswModule { }
