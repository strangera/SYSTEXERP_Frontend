import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// Shared
import { SharedModule } from '../shared/shared.module';
// Dynamictabview
import { DynamictabviewComponent } from '../dynamictabview/dynamictabview.component';
// Component
import { LayoutComponent } from './layout.component';
import { AppTopbarComponent } from './app.topbar/app.topbar.component';
import { AppMenulistComponent } from './app.menulist/app.menulist.component';
import { SsoDashboardComponent } from '../pages/login-sso/sso-dashboard/sso-dashboard.component';
import { AppMenuItemComponent } from './app.menulist/app-menu-item/app-menu-item.component';

@NgModule({
  declarations: [
    LayoutComponent,
    AppTopbarComponent,
    AppMenulistComponent,
    DynamictabviewComponent,
    SsoDashboardComponent,
    AppMenuItemComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    SharedModule,
  ],
  exports: [
    LayoutComponent,
    AppMenuItemComponent
  ],
})
export class LayoutModule { }
