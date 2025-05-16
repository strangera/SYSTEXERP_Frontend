import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// Routing
import { DashboardRoutingModule } from './dashboard-routing.module';
// Component
import { DashboardComponent } from './dashboard.component';
import { SharedModule } from '../../../shared/shared.module';

@NgModule({
  declarations: [
    DashboardComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    DashboardRoutingModule,
  ]
})
export class DashboardModule { }
