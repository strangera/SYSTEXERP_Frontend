import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InputTableComponent } from './input.table/input.table.component';
import { InputTableCRUComponent } from './input.table.cru/input.table.cru.component';
import { NotfoundComponent } from '../notfound/notfound.component';

const routes: Routes = [
  { path: '', redirectTo: '404', pathMatch: 'full' },
  { path: 'demoInputTable', component: InputTableComponent }, // case1
  { path: 'demoInputTableCRU', component: InputTableCRUComponent }, // case1 CRU
  { path: '404', component: NotfoundComponent },
  { path: '**', redirectTo: '404' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DemoRoutingModule { }
