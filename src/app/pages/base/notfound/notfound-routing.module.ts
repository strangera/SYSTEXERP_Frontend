import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
// Component
import { NotfoundComponent } from './notfound.component';

const routes: Routes = [
  { path: '', redirectTo: '404', pathMatch: 'full' },
  { path: '404', component: NotfoundComponent }
];

@NgModule({
  declarations: [],
  imports: [
    RouterModule.forChild(routes),
  ],
  exports: [
    RouterModule
  ],
})
export class NotfoundRoutingModule { }
