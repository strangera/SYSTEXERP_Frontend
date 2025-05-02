import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
//
import { FIN51010CRUComponent } from './fin51010-cru/fin51010-cru.component';
import { FIN51010Component } from './fin51010/fin51010.component';
import { FIN51020CRUComponent } from './fin51020-cru/fin51020-cru.component';
import { FIN51020Component } from './fin51020/fin51020.component';
import { FIN51030CRUComponent } from './fin51030-cru/fin51030-cru.component';
import { FIN51030Component } from './fin51030/fin51030.component';
import { FIN51040CRUComponent } from './fin51040-cru/fin51040-cru.component';
import { FIN51040Component } from './fin51040/fin51040.component';
import { FIN51050CRUComponent } from './fin51050-cru/fin51050-cru.component';
import { FIN51050Component } from './fin51050/fin51050.component';
import { FIN51060CRUComponent } from './fin51060-cru/fin51060-cru.component';
import { FIN51060Component } from './fin51060/fin51060.component';
import { FIN52010CRUComponent } from './fin52010-cru/fin52010-cru.component';
import { FIN52010Component } from './fin52010/fin52010.component';
import { FIN52020CRUComponent } from './fin52020-cru/fin52020-cru.component';
import { FIN52020Component } from './fin52020/fin52020.component';
import { FIN52030CRUComponent } from './fin52030-cru/fin52030-cru.component';
import { FIN52030Component } from './fin52030/fin52030.component';
import { FIN52040CRUComponent } from './fin52040-cru/fin52040-cru.component';
import { FIN52040Component } from './fin52040/fin52040.component';
import { FIN52050CRUComponent } from './fin52050-cru/fin52050-cru.component';
import { FIN52050Component } from './fin52050/fin52050.component';
import { FIN52060CRUComponent } from './fin52060-cru/fin52060-cru.component';
import { FIN52060Component } from './fin52060/fin52060.component';
import { FIN52070CRUComponent } from './fin52070-cru/fin52070-cru.component';
import { FIN52070Component } from './fin52070/fin52070.component';
import { FIN52080CRUComponent } from './fin52080-cru/fin52080-cru.component';
import { FIN52080Component } from './fin52080/fin52080.component';
import { FIN52090CRUComponent } from './fin52090-cru/fin52090-cru.component';
import { FIN52090Component } from './fin52090/fin52090.component';
import { FIN53010CRUComponent } from './fin53010-cru/fin53010-cru.component';
import { FIN53010Component } from './fin53010/fin53010.component';
import { FIN54010CRUComponent } from './fin54010-cru/fin54010-cru.component';
import { FIN54010Component } from './fin54010/fin54010.component';
import { FIN54015CRUComponent } from './fin54015-cru/fin54015-cru.component';
import { FIN54015Component } from './fin54015/fin54015.component';
import { FIN54020CRUComponent } from './fin54020-cru/fin54020-cru.component';
import { FIN54020Component } from './fin54020/fin54020.component';
import { FIN54025CRUComponent } from './fin54025-cru/fin54025-cru.component';
import { FIN54025Component } from './fin54025/fin54025.component';
import { FIN54030CRUComponent } from './fin54030-cru/fin54030-cru.component';
import { FIN54030Component } from './fin54030/fin54030.component';
import { FIN54035CRUComponent } from './fin54035-cru/fin54035-cru.component';
import { FIN54035Component } from './fin54035/fin54035.component';
import { FIN54040CRUComponent } from './fin54040-cru/fin54040-cru.component';
import { FIN54040Component } from './fin54040/fin54040.component';
import { FIN54045CRUComponent } from './fin54045-cru/fin54045-cru.component';
import { FIN54045Component } from './fin54045/fin54045.component';
import { FIN55010CRUComponent } from './fin55010-cru/fin55010-cru.component';
import { FIN55010Component } from './fin55010/fin55010.component';
import { FIN55020CRUComponent } from './fin55020-cru/fin55020-cru.component';
import { FIN55020Component } from './fin55020/fin55020.component';
import { FIN55030CRUComponent } from './fin55030-cru/fin55030-cru.component';
import { FIN55030Component } from './fin55030/fin55030.component';
import { FIN55040CRUComponent } from './fin55040-cru/fin55040-cru.component';
import { FIN55040Component } from './fin55040/fin55040.component';
import { FIN55050CRUComponent } from './fin55050-cru/fin55050-cru.component';
import { FIN55050Component } from './fin55050/fin55050.component';
import { FIN55060CRUComponent } from './fin55060-cru/fin55060-cru.component';
import { FIN55060Component } from './fin55060/fin55060.component';
import { FIN55070CRUComponent } from './fin55070-cru/fin55070-cru.component';
import { FIN55070Component } from './fin55070/fin55070.component';
import { FIN55080CRUComponent } from './fin55080-cru/fin55080-cru.component';
import { FIN55080Component } from './fin55080/fin55080.component';
import { FIN55090CRUComponent } from './fin55090-cru/fin55090-cru.component';
import { FIN55090Component } from './fin55090/fin55090.component';
import { FIN55100CRUComponent } from './fin55100-cru/fin55100-cru.component';
import { FIN55100Component } from './fin55100/fin55100.component';
import { FIN55110CRUComponent } from './fin55110-cru/fin55110-cru.component';
import { FIN55110Component } from './fin55110/fin55110.component';
import { FIN55120CRUComponent } from './fin55120-cru/fin55120-cru.component';
import { FIN55120Component } from './fin55120/fin55120.component';
import { FIN55130CRUComponent } from './fin55130-cru/fin55130-cru.component';
import { FIN55130Component } from './fin55130/fin55130.component';

const routes: Routes = [
  { path: 'FIN51010', component: FIN51010Component },  // 資材系統
  { path: 'FIN51010CRU', component: FIN51010CRUComponent },
  { path: 'FIN51020', component: FIN51020Component },  // 人資系統
  { path: 'FIN51020CRU', component: FIN51020CRUComponent },
  { path: 'FIN51030', component: FIN51030Component },  // 禮券管理系統
  { path: 'FIN51030CRU', component: FIN51030CRUComponent },
  { path: 'FIN51040', component: FIN51040Component },  // 專櫃營運系統
  { path: 'FIN51040CRU', component: FIN51040CRUComponent },
  { path: 'FIN51050', component: FIN51050Component },  // 自營進銷存管理系統
  { path: 'FIN51050CRU', component: FIN51050CRUComponent },
  { path: 'FIN51060', component: FIN51060Component },  // 電子商務管理系統
  { path: 'FIN51060CRU', component: FIN51060CRUComponent },
  { path: 'FIN52010', component: FIN52010Component },  // 基本資料作業-總帳參數維謢
  { path: 'FIN52010CRU', component: FIN52010CRUComponent },
  { path: 'FIN52020', component: FIN52020Component },  // 基本資料作業-傳票型態設定維護
  { path: 'FIN52020CRU', component: FIN52020CRUComponent },
  { path: 'FIN52030', component: FIN52030Component },  // 基本資料作業-常用傳票維護
  { path: 'FIN52030CRU', component: FIN52030CRUComponent },
  { path: 'FIN52040', component: FIN52040Component },  // 基本資料作業-對象及對帳維護作業
  { path: 'FIN52040CRU', component: FIN52040CRUComponent },
  { path: 'FIN52050', component: FIN52050Component },  // 會計科目作業-科目大分類代號維護
  { path: 'FIN52050CRU', component: FIN52050CRUComponent },
  { path: 'FIN52060', component: FIN52060Component },  // 會計科目作業-科目中分類代號維謢
  { path: 'FIN52060CRU', component: FIN52060CRUComponent },
  { path: 'FIN52070', component: FIN52070Component },  // 會計科目作業-科目三碼代號維護
  { path: 'FIN52070CRU', component: FIN52070CRUComponent },
  { path: 'FIN52080', component: FIN52080Component },  // 會計科目作業-會計科目代號維護
  { path: 'FIN52080CRU', component: FIN52080CRUComponent },
  { path: 'FIN52090', component: FIN52090Component },  // 會計科目作業-會計科目摘要維護
  { path: 'FIN52090CRU', component: FIN52090CRUComponent },
  { path: 'FIN53010', component: FIN53010Component },  // 傳票登入作業-傳票資料維護
  { path: 'FIN53010CRU', component: FIN53010CRUComponent },
  { path: 'FIN54010', component: FIN54010Component },  // 傳票確認作業-傳票確認作業
  { path: 'FIN54010CRU', component: FIN54010CRUComponent },
  { path: 'FIN54015', component: FIN54015Component },  // 傳票確認作業-傳票反確認作業
  { path: 'FIN54015CRU', component: FIN54015CRUComponent },
  { path: 'FIN54020', component: FIN54020Component },  // 傳票過帳作業-傳票過帳
  { path: 'FIN54020CRU', component: FIN54020CRUComponent },
  { path: 'FIN54025', component: FIN54025Component },  // 傳票過帳作業-傳票反過帳
  { path: 'FIN54025CRU', component: FIN54025CRUComponent },
  { path: 'FIN54030', component: FIN54030Component },  // 傳票關帳作業-關帳作業
  { path: 'FIN54030CRU', component: FIN54030CRUComponent },
  { path: 'FIN54035', component: FIN54035Component },  // 傳票關帳作業-反關帳作業
  { path: 'FIN54035CRU', component: FIN54035CRUComponent },
  { path: 'FIN54040', component: FIN54040Component },  // 年結作業-過帳資料年結處理作業
  { path: 'FIN54040CRU', component: FIN54040CRUComponent },
  { path: 'FIN54045', component: FIN54045Component },  // 年結作業-反年結作業
  { path: 'FIN54045CRU', component: FIN54045CRUComponent },
  { path: 'FIN55010', component: FIN55010Component },  // 總帳報表-傳票列印
  { path: 'FIN55010CRU', component: FIN55010CRUComponent },
  { path: 'FIN55020', component: FIN55020Component },  // 總帳報表-日記帳表
  { path: 'FIN55020CRU', component: FIN55020CRUComponent },
  { path: 'FIN55030', component: FIN55030Component },  // 總帳報表-立沖科目餘額表
  { path: 'FIN55030CRU', component: FIN55030CRUComponent },
  { path: 'FIN55040', component: FIN55040Component },  // 總帳報表-立沖科目明細表
  { path: 'FIN55040CRU', component: FIN55040CRUComponent },
  { path: 'FIN55050', component: FIN55050Component },  // 總帳報表-分類帳
  { path: 'FIN55050CRU', component: FIN55050CRUComponent },
  { path: 'FIN55060', component: FIN55060Component },  // 總帳報表-分類帳彙總報表
  { path: 'FIN55060CRU', component: FIN55060CRUComponent },
  { path: 'FIN55070', component: FIN55070Component },  // 總帳報表-試算表
  { path: 'FIN55070CRU', component: FIN55070CRUComponent },
  { path: 'FIN55080', component: FIN55080Component },  // 總帳報表-損益表
  { path: 'FIN55080CRU', component: FIN55080CRUComponent },
  { path: 'FIN55090', component: FIN55090Component },  // 總帳報表-當期/累計損益表
  { path: 'FIN55090CRU', component: FIN55090CRUComponent },
  { path: 'FIN55100', component: FIN55100Component },  // 總帳報表-損益比較表
  { path: 'FIN55100CRU', component: FIN55100CRUComponent },
  { path: 'FIN55110', component: FIN55110Component },  // 總帳報表-部門科目明細表
  { path: 'FIN55110CRU', component: FIN55110CRUComponent },
  { path: 'FIN55120', component: FIN55120Component },  // 總帳報表-資產負債表
  { path: 'FIN55120CRU', component: FIN55120CRUComponent },
  { path: 'FIN55130', component: FIN55130Component },  // 總帳報表-資產負債比較表
  { path: 'FIN55130CRU', component: FIN55130CRUComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FIN5000RoutingModule { }
