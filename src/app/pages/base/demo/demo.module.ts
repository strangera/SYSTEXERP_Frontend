import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DemoRoutingModule } from './demo-routing.module';
import { InputTableComponent } from './input.table/input.table.component';
import { InputTableCRUComponent } from './input.table.cru/input.table.cru.component';
import { GanttChartComponent } from './gantt-chart/gantt-chart.component';
import { SharedModule } from '../../../shared/shared.module';

@NgModule({
  declarations: [
    InputTableComponent,
    InputTableCRUComponent,
    GanttChartComponent,
  ],
  imports: [
    CommonModule,
    DemoRoutingModule,
    SharedModule,
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA // 任何自訂的元素名稱中有出現減號 ( - ) 的都是允許的元素 (例如: my-hgroup )
  ],
})
export class DemoModule { }
