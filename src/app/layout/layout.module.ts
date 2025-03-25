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
import { AppFooterComponent } from './app.footer/app.footer.component';
import { AppMenulistComponent } from './app.menulist/app.menulist.component';

@NgModule({
  declarations: [
    LayoutComponent,
    AppTopbarComponent,
    AppMenulistComponent,
    AppFooterComponent,
    DynamictabviewComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    SharedModule,
  ],
  exports: [
    LayoutComponent,
  ],
})
export class LayoutModule { }
