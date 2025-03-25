import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
//
import { NotfoundComponent } from '../notfound/notfound.component';
import { FIN61010CRUComponent } from './fin61010-cru/fin61010-cru.component';
import { FIN61010Component } from './fin61010/fin61010.component';
import { FIN61020CRUComponent } from './fin61020-cru/fin61020-cru.component';
import { FIN61020Component } from './fin61020/fin61020.component';
import { FIN62010CRUComponent } from './fin62010-cru/fin62010-cru.component';
import { FIN62010Component } from './fin62010/fin62010.component';
import { FIN62020CRUComponent } from './fin62020-cru/fin62020-cru.component';
import { FIN62020Component } from './fin62020/fin62020.component';
import { FIN62030CRUComponent } from './fin62030-cru/fin62030-cru.component';
import { FIN62030Component } from './fin62030/fin62030.component';
import { FIN62040CRUComponent } from './fin62040-cru/fin62040-cru.component';
import { FIN62040Component } from './fin62040/fin62040.component';
import { FIN62050CRUComponent } from './fin62050-cru/fin62050-cru.component';
import { FIN62050Component } from './fin62050/fin62050.component';
import { FIN63010CRUComponent } from './fin63010-cru/fin63010-cru.component';
import { FIN63010Component } from './fin63010/fin63010.component';
import { FIN63020CRUComponent } from './fin63020-cru/fin63020-cru.component';
import { FIN63020Component } from './fin63020/fin63020.component';
import { FIN63030CRUComponent } from './fin63030-cru/fin63030-cru.component';
import { FIN63030Component } from './fin63030/fin63030.component';
import { FIN63040CRUComponent } from './fin63040-cru/fin63040-cru.component';
import { FIN63040Component } from './fin63040/fin63040.component';
import { FIN63050CRUComponent } from './fin63050-cru/fin63050-cru.component';
import { FIN63050Component } from './fin63050/fin63050.component';
import { FIN63060CRUComponent } from './fin63060-cru/fin63060-cru.component';
import { FIN63060Component } from './fin63060/fin63060.component';
import { FIN64010CRUComponent } from './fin64010-cru/fin64010-cru.component';
import { FIN64010Component } from './fin64010/fin64010.component';
import { FIN64020CRUComponent } from './fin64020-cru/fin64020-cru.component';
import { FIN64020Component } from './fin64020/fin64020.component';
import { FIN64030CRUComponent } from './fin64030-cru/fin64030-cru.component';
import { FIN64030Component } from './fin64030/fin64030.component';
import { FIN64040CRUComponent } from './fin64040-cru/fin64040-cru.component';
import { FIN64040Component } from './fin64040/fin64040.component';
import { FIN64050CRUComponent } from './fin64050-cru/fin64050-cru.component';
import { FIN64050Component } from './fin64050/fin64050.component';
import { FIN65010CRUComponent } from './fin65010-cru/fin65010-cru.component';
import { FIN65010Component } from './fin65010/fin65010.component';

const routes: Routes = [
  { path: '', redirectTo: '404', pathMatch: 'full' },
  { path: 'FIN61010', component: FIN61010Component },  // 支票號碼維護
  { path: 'FIN61010CRU', component: FIN61010CRUComponent },
  { path: 'FIN61020', component: FIN61020Component },  // 業務員資料維護
  { path: 'FIN61020CRU', component: FIN61020CRUComponent },
  { path: 'FIN62010', component: FIN62010Component },  // 銀行調撥作業
  { path: 'FIN62010CRU', component: FIN62010CRUComponent },
  { path: 'FIN62020', component: FIN62020Component },  // 銀行資金調撥單
  { path: 'FIN62020CRU', component: FIN62020CRUComponent },
  { path: 'FIN62030', component: FIN62030Component },  // 銀行調撥傳票拋轉作業
  { path: 'FIN62030CRU', component: FIN62030CRUComponent },
  { path: 'FIN62040', component: FIN62040Component },  // 出納區間報表
  { path: 'FIN62040CRU', component: FIN62040CRUComponent },
  { path: 'FIN62050', component: FIN62050Component },  // 銀行往來調節表
  { path: 'FIN62050CRU', component: FIN62050CRUComponent },
  { path: 'FIN63010', component: FIN63010Component },  // 套印支票 - 票據套印
  { path: 'FIN63010CRU', component: FIN63010CRUComponent },
  { path: 'FIN63020', component: FIN63020Component },  // 應付票據維護作業
  { path: 'FIN63020CRU', component: FIN63020CRUComponent },
  { path: 'FIN63030', component: FIN63030Component },  // 應付票據到期作業
  { path: 'FIN63030CRU', component: FIN63030CRUComponent },
  { path: 'FIN63040', component: FIN63040Component },  // 應付票據兌現作業
  { path: 'FIN63040CRU', component: FIN63040CRUComponent },
  { path: 'FIN63050', component: FIN63050Component },  // 應付票據撤票作業
  { path: 'FIN63050CRU', component: FIN63050CRUComponent },
  { path: 'FIN63060', component: FIN63060Component },  // 應付票據退票作業
  { path: 'FIN63060CRU', component: FIN63060CRUComponent },
  { path: 'FIN64010', component: FIN64010Component },  // 應收票據維護作業
  { path: 'FIN64010CRU', component: FIN64010CRUComponent },
  { path: 'FIN64020', component: FIN64020Component },  // 應收票據託收作業
  { path: 'FIN64020CRU', component: FIN64020CRUComponent },
  { path: 'FIN64030', component: FIN64030Component },  // 應收票據兌現作業
  { path: 'FIN64030CRU', component: FIN64030CRUComponent },
  { path: 'FIN64040', component: FIN64040Component },  // 應收票據撤票作業
  { path: 'FIN64040CRU', component: FIN64040CRUComponent },
  { path: 'FIN64050', component: FIN64050Component },  // 應收票據退票作業
  { path: 'FIN64050CRU', component: FIN64050CRUComponent },
  { path: 'FIN65010', component: FIN65010Component },  // 應付票據簽回單
  { path: 'FIN65010CRU', component: FIN65010CRUComponent },
  { path: '404', component: NotfoundComponent },
  { path: '**', redirectTo: '404' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FIN6000RoutingModule { }
