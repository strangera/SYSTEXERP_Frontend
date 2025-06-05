import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// Routing
import { NotfoundRoutingModule } from './notfound-routing.module';
// Component
import { NotfoundComponent } from './notfound.component';

@NgModule({
  declarations: [
    NotfoundComponent,
  ],
  imports: [
    CommonModule,
    NotfoundRoutingModule,
  ]
})
export class NotfoundModule { }
