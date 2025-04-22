import { LoginRoutingModule } from './login-routing.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// Component
import { LoginComponent } from './login.component';
import { PasswordModule } from 'primeng/password';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';

@NgModule({
    declarations: [
      LoginComponent
    ],
    imports: [
      CommonModule,
      LoginRoutingModule,
      PasswordModule,
      FormsModule,
      ReactiveFormsModule,
      ButtonModule
    ],
})
export class LoginModule { }
