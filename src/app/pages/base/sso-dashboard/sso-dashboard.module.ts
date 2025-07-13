import { SsoDashboardRoutingModule } from './sso-dashboard-routing.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SsoDashboardComponent } from './sso-dashboard.component';
import { TranslateModule } from '@ngx-translate/core';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CardModule } from 'primeng/card';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { DividerModule } from 'primeng/divider';
import { PasswordModule } from 'primeng/password';

@NgModule({
    imports: [
        CommonModule,
        SsoDashboardRoutingModule,
        TranslateModule,
        ProgressSpinnerModule,
        CardModule,
        MenuModule,
        ButtonModule,
        DialogModule,
        ReactiveFormsModule,
        DividerModule,
        PasswordModule,
        SsoDashboardComponent
    ],
})
export class SsoDashboardModule { }
