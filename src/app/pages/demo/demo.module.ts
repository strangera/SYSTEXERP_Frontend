import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DemoRoutingModule } from './demo-routing.module';
import { SharedModule } from '../../shared/shared.module';
import { InputTableComponent } from './input.table/input.table.component';
import { InputTableCRUComponent } from './input.table.cru/input.table.cru.component';
import { DynamicallyInputComponent } from './dynamically-input/dynamically-input.component';
import { DemostepsComponent } from './demosteps/demosteps.component';
import { Step1Component } from './demosteps/step1/step1.component';
import { Step2Component } from './demosteps/step2/step2.component';
import { Step3Component } from './demosteps/step3/step3.component';
import { GanttChartComponent } from './gantt-chart/gantt-chart.component';
import { TableStyleComponent } from './table-style/table-style.component';
import { EditableTableComponent } from './editable-table/editable-table.component';
import { BankdemoComponent } from './bankdemo/bankdemo.component';
import { LiveDemoSampleComponent } from './live-demo-sample/live-demo-sample.component';

@NgModule({
  declarations: [
    InputTableComponent,
    InputTableCRUComponent,
    TableStyleComponent,
    DynamicallyInputComponent,
    DemostepsComponent,
    Step1Component,
    Step2Component,
    Step3Component,
    GanttChartComponent,
    EditableTableComponent,
    BankdemoComponent,
    LiveDemoSampleComponent,
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
