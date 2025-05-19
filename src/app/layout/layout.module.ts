import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// Component
import { LayoutComponent } from './layout.component';
import { AppTopbarComponent } from './app.topbar/app.topbar.component';
import { AppMenulistComponent } from './app.menulist/app.menulist.component';
import { SsoDashboardComponent } from '../pages/base/sso-dashboard/sso-dashboard.component';
import { AppMenuItemComponent } from './app.menulist/app-menu-item/app-menu-item.component';
import { MenuModule } from 'primeng/menu';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { DividerModule } from 'primeng/divider';
import { DialogModule } from 'primeng/dialog';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TabViewModule } from 'primeng/tabview';
// Dynamictabview
import { DynamictabviewComponent } from './dynamictabview/dynamictabview.component';

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
    MenuModule,
    AutoCompleteModule,
    OverlayPanelModule,
    ButtonModule,
    PasswordModule,
    DividerModule,
    DialogModule,
    CardModule,
    ProgressSpinnerModule,
    MenuModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    IconFieldModule,
    InputIconModule,
    TabViewModule
  ],
  exports: [
    LayoutComponent,
    AppMenuItemComponent
  ],
})
export class LayoutModule { }
