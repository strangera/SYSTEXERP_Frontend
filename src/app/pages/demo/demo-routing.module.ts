import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotfoundComponent } from '../notfound/notfound.component';
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

const routes: Routes = [
  { path: '', redirectTo: '404', pathMatch: 'full' },
  { path: 'demoInputTable', component: InputTableComponent }, // case1
  { path: 'demoTableStyle', component: TableStyleComponent }, // case1
  { path: 'demoInputTableCRU', component: InputTableCRUComponent }, // case1 CRU
  { path: 'DynamicallyInput', component: DynamicallyInputComponent }, // case1 CRU
  { path: 'Demosteps', component: DemostepsComponent }, // case1 CRU
  { path: 'step1', component: Step1Component },
  { path: 'step2', component: Step2Component },
  { path: 'step3', component: Step3Component },
  { path: 'GanttChart', component: GanttChartComponent },
  { path: 'EditableTable', component: EditableTableComponent },
  { path: 'BankDemo', component: BankdemoComponent },
  { path: 'LiveDemoSample', component: LiveDemoSampleComponent },
  { path: '404', component: NotfoundComponent },
  { path: '**', redirectTo: '404' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DemoRoutingModule { }
