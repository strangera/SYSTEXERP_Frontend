import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InputTableComponent } from './input.table/input.table.component';
import { InputTableCRUComponent } from './input.table.cru/input.table.cru.component';

const routes: Routes = [
  { path: '', redirectTo: 'demoinputtable', pathMatch: 'full' },
  { path: 'demoinputtable', component: InputTableComponent }, // case1
  { path: 'demoinputtableCRU', component: InputTableCRUComponent }, // case1 CRU
  { path: '**', redirectTo: '404' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DemoRoutingModule { }
