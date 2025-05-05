import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChangepswComponent } from './changepsw.component';
import { AuthGuard } from '../../service/system/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: 'changepsw', pathMatch: 'full' },
  { path: '', component: ChangepswComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ChangepswRoutingModule { }
