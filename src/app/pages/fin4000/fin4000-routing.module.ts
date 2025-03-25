import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
//
import { NotfoundComponent } from '../notfound/notfound.component';
import { FIN41010CRUComponent } from './fin41010-cru/fin41010-cru.component';
import { FIN41010Component } from './fin41010/fin41010.component';
import { FIN41020CRUComponent } from './fin41020-cru/fin41020-cru.component';
import { FIN41020Component } from './fin41020/fin41020.component';
import { FIN41030CRUComponent } from './fin41030-cru/fin41030-cru.component';
import { FIN41030Component } from './fin41030/fin41030.component';
import { FIN41040CRUComponent } from './fin41040-cru/fin41040-cru.component';
import { FIN41040Component } from './fin41040/fin41040.component';
import { FIN42010CRUComponent } from './fin42010-cru/fin42010-cru.component';
import { FIN42010Component } from './fin42010/fin42010.component';
import { FIN42020CRUComponent } from './fin42020-cru/fin42020-cru.component';
import { FIN42020Component } from './fin42020/fin42020.component';
import { FIN42030CRUComponent } from './fin42030-cru/fin42030-cru.component';
import { FIN42030Component } from './fin42030/fin42030.component';
import { FIN42040CRUComponent } from './fin42040-cru/fin42040-cru.component';
import { FIN42040Component } from './fin42040/fin42040.component';
import { FIN42050CRUComponent } from './fin42050-cru/fin42050-cru.component';
import { FIN42050Component } from './fin42050/fin42050.component';

const routes: Routes = [
  { path: '', redirectTo: '404', pathMatch: 'full' },
  { path: 'FIN41010', component: FIN41010Component },  // 部門預算匯出轉入作業
  { path: 'FIN41010CRU', component: FIN41010CRUComponent },
  { path: 'FIN41020', component: FIN41020Component },  // 部門預算編制維護
  { path: 'FIN41020CRU', component: FIN41020CRUComponent },
  { path: 'FIN41030', component: FIN41030Component },  // 預算審核作業
  { path: 'FIN41030CRU', component: FIN41030CRUComponent },
  { path: 'FIN41040', component: FIN41040Component },  // 產生年中版本作業
  { path: 'FIN41040CRU', component: FIN41040CRUComponent },
  { path: 'FIN42010', component: FIN42010Component },  // 預計損益表
  { path: 'FIN42010CRU', component: FIN42010CRUComponent },
  { path: 'FIN42020', component: FIN42020Component },  // 預算、實績比較表
  { path: 'FIN42020CRU', component: FIN42020CRUComponent },
  { path: 'FIN42030', component: FIN42030Component },  // 預算同期比較表
  { path: 'FIN42030CRU', component: FIN42030CRUComponent },
  { path: 'FIN42040', component: FIN42040Component },  // 去年同期比較表
  { path: 'FIN42040CRU', component: FIN42040CRUComponent },
  { path: 'FIN42050', component: FIN42050Component },  // 預算版本比較表
  { path: 'FIN42050CRU', component: FIN42050CRUComponent },
  { path: '404', component: NotfoundComponent },
  { path: '**', redirectTo: '404' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FIN4000RoutingModule { }
