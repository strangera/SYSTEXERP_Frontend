import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
//
import { NotfoundComponent } from '../notfound/notfound.component';
import { FIN21010CRUComponent } from './fin21010-cru/fin21010-cru.component';
import { FIN21010Component } from './fin21010/fin21010.component';
import { FIN21020CRUComponent } from './fin21020-cru/fin21020-cru.component';
import { FIN21020Component } from './fin21020/fin21020.component';
import { FIN21030CRUComponent } from './fin21030-cru/fin21030-cru.component';
import { FIN21030Component } from './fin21030/fin21030.component';
import { FIN22010CRUComponent } from './fin22010-cru/fin22010-cru.component';
import { FIN22010Component } from './fin22010/fin22010.component';
import { FIN22020CRUComponent } from './fin22020-cru/fin22020-cru.component';
import { FIN22020Component } from './fin22020/fin22020.component';
import { FIN22030CRUComponent } from './fin22030-cru/fin22030-cru.component';
import { FIN22030Component } from './fin22030/fin22030.component';
import { FIN23010CRUComponent } from './fin23010-cru/fin23010-cru.component';
import { FIN23010Component } from './fin23010/fin23010.component';
import { FIN23020CRUComponent } from './fin23020-cru/fin23020-cru.component';
import { FIN23020Component } from './fin23020/fin23020.component';
import { FIN23030CRUComponent } from './fin23030-cru/fin23030-cru.component';
import { FIN23030Component } from './fin23030/fin23030.component';
import { FIN23040CRUComponent } from './fin23040-cru/fin23040-cru.component';
import { FIN23040Component } from './fin23040/fin23040.component';
import { FIN23050CRUComponent } from './fin23050-cru/fin23050-cru.component';
import { FIN23050Component } from './fin23050/fin23050.component';
import { FIN23060CRUComponent } from './fin23060-cru/fin23060-cru.component';
import { FIN23060Component } from './fin23060/fin23060.component';
import { FIN23070Component } from './fin23070/fin23070.component';
import { FIN24010CRUComponent } from './fin24010-cru/fin24010-cru.component';
import { FIN24010Component } from './fin24010/fin24010.component';
import { FIN24020CRUComponent } from './fin24020-cru/fin24020-cru.component';
import { FIN24020Component } from './fin24020/fin24020.component';
import { FIN24030CRUComponent } from './fin24030-cru/fin24030-cru.component';
import { FIN24030Component } from './fin24030/fin24030.component';
import { FIN25010CRUComponent } from './fin25010-cru/fin25010-cru.component';
import { FIN25010Component } from './fin25010/fin25010.component';
import { FIN25020CRUComponent } from './fin25020-cru/fin25020-cru.component';
import { FIN25020Component } from './fin25020/fin25020.component';
import { FIN26010CRUComponent } from './fin26010-cru/fin26010-cru.component';
import { FIN26010Component } from './fin26010/fin26010.component';
import { FIN27010CRUComponent } from './fin27010-cru/fin27010-cru.component';
import { FIN27010Component } from './fin27010/fin27010.component';
import { FIN27020CRUComponent } from './fin27020-cru/fin27020-cru.component';
import { FIN27020Component } from './fin27020/fin27020.component';
import { FIN28010CRUComponent } from './fin28010-cru/fin28010-cru.component';
import { FIN28010Component } from './fin28010/fin28010.component';
import { FIN28020CRUComponent } from './fin28020-cru/fin28020-cru.component';
import { FIN28020Component } from './fin28020/fin28020.component';
import { FIN29010CRUComponent } from './fin29010-cru/fin29010-cru.component';
import { FIN29010Component } from './fin29010/fin29010.component';
import { FIN29020CRUComponent } from './fin29020-cru/fin29020-cru.component';
import { FIN29020Component } from './fin29020/fin29020.component';
import { FIN29030CRUComponent } from './fin29030-cru/fin29030-cru.component';
import { FIN29030Component } from './fin29030/fin29030.component';
import { FIN29040CRUComponent } from './fin29040-cru/fin29040-cru.component';
import { FIN29040Component } from './fin29040/fin29040.component';
import { FIN29050CRUComponent } from './fin29050-cru/fin29050-cru.component';
import { FIN29050Component } from './fin29050/fin29050.component';
import { FIN29060CRUComponent } from './fin29060-cru/fin29060-cru.component';
import { FIN29060Component } from './fin29060/fin29060.component';
import { FIN29070CRUComponent } from './fin29070-cru/fin29070-cru.component';
import { FIN29070Component } from './fin29070/fin29070.component';
import { FIN29080CRUComponent } from './fin29080-cru/fin29080-cru.component';
import { FIN29080Component } from './fin29080/fin29080.component';
import { FIN29090CRUComponent } from './fin29090-cru/fin29090-cru.component';
import { FIN29090Component } from './fin29090/fin29090.component';
import { FIN29100CRUComponent } from './fin29100-cru/fin29100-cru.component';
import { FIN29100Component } from './fin29100/fin29100.component';
import { FIN29110CRUComponent } from './fin29110-cru/fin29110-cru.component';
import { FIN29110Component } from './fin29110/fin29110.component';
import { FIN29120CRUComponent } from './fin29120-cru/fin29120-cru.component';
import { FIN29120Component } from './fin29120/fin29120.component';

const routes: Routes = [
  { path: '', redirectTo: '404', pathMatch: 'full' },
  { path: 'FIN21010', component: FIN21010Component },  // 公司銀行資料維護
  { path: 'FIN21010CRU', component: FIN21010CRUComponent },
  { path: 'FIN21020', component: FIN21020Component },  // 費率對照維護
  { path: 'FIN21020CRU', component: FIN21020CRUComponent },
  { path: 'FIN21030', component: FIN21030Component },  // 廠客資料維護
  { path: 'FIN21030CRU', component: FIN21030CRUComponent },
  { path: 'FIN22010', component: FIN22010Component },  // 請款單作業
  { path: 'FIN22010CRU', component: FIN22010CRUComponent },
  { path: 'FIN22020', component: FIN22020Component },  // 一般請款單
  { path: 'FIN22020CRU', component: FIN22020CRUComponent },
  { path: 'FIN22030', component: FIN22030Component },  // 請款傳票拋轉
  { path: 'FIN22030CRU', component: FIN22030CRUComponent },
  { path: 'FIN23010', component: FIN23010Component },  // 暫付款申請作業
  { path: 'FIN23010CRU', component: FIN23010CRUComponent },
  { path: 'FIN23020', component: FIN23020Component },  // 暫付款申請傳票拋轉作業
  { path: 'FIN23020CRU', component: FIN23020CRUComponent },
  { path: 'FIN23030', component: FIN23030Component },  // 暫付款申請單列印
  { path: 'FIN23030CRU', component: FIN23030CRUComponent },
  { path: 'FIN23040', component: FIN23040Component },  // 暫付款核銷作業
  { path: 'FIN23040CRU', component: FIN23040CRUComponent },
  { path: 'FIN23050', component: FIN23050Component },  // 暫付款核銷傳票拋轉作業
  { path: 'FIN23050CRU', component: FIN23050CRUComponent },
  { path: 'FIN23060', component: FIN23060Component },  // 暫付款申請結案作業
  { path: 'FIN23060CRU', component: FIN23060CRUComponent },
  { path: 'FIN23070', component: FIN23070Component },  // 暫付款核銷報表
  { path: 'FIN24010', component: FIN24010Component },  // 應付帳款維護
  { path: 'FIN24010CRU', component: FIN24010CRUComponent },
  { path: 'FIN24020', component: FIN24020Component },  // 保留款沖款維護
  { path: 'FIN24020CRU', component: FIN24020CRUComponent },
  { path: 'FIN24030', component: FIN24030Component },  // 帳款貼現沖帳維護
  { path: 'FIN24030CRU', component: FIN24030CRUComponent },
  { path: 'FIN25010', component: FIN25010Component },  // 產生電匯付款資料
  { path: 'FIN25010CRU', component: FIN25010CRUComponent },
  { path: 'FIN25020', component: FIN25020Component },  // 形成電匯明細資料
  { path: 'FIN25020CRU', component: FIN25020CRUComponent },
  { path: 'FIN26010', component: FIN26010Component },  // 匯款銀行
  { path: 'FIN26010CRU', component: FIN26010CRUComponent },
  { path: 'FIN27010', component: FIN27010Component },  // 產生開票付款資料
  { path: 'FIN27010CRU', component: FIN27010CRUComponent },
  { path: 'FIN27020', component: FIN27020Component },  // 形成開票明細資料
  { path: 'FIN27020CRU', component: FIN27020CRUComponent },
  { path: 'FIN28010', component: FIN28010Component },  // 形成電匯付款傳票
  { path: 'FIN28010CRU', component: FIN28010CRUComponent },
  { path: 'FIN28020', component: FIN28020Component },  // 形成開票付款傳票
  { path: 'FIN28020CRU', component: FIN28020CRUComponent },
  { path: 'FIN29010', component: FIN29010Component },  // 保留款彙總表
  { path: 'FIN29010CRU', component: FIN29010CRUComponent },
  { path: 'FIN29020', component: FIN29020Component },  // 匯款明細表
  { path: 'FIN29020CRU', component: FIN29020CRUComponent },
  { path: 'FIN29030', component: FIN29030Component },  // 開票明細表
  { path: 'FIN29030CRU', component: FIN29030CRUComponent },
  { path: 'FIN29040', component: FIN29040Component },  // AP及ARNET之報表
  { path: 'FIN29040CRU', component: FIN29040CRUComponent },
  { path: 'FIN29050', component: FIN29050Component },  // 應付帳款明細表
  { path: 'FIN29050CRU', component: FIN29050CRUComponent },
  { path: 'FIN29060', component: FIN29060Component },  // 廠商付款明細表
  { path: 'FIN29060CRU', component: FIN29060CRUComponent },
  { path: 'FIN29070', component: FIN29070Component },  // 廠商應付對科目明細表
  { path: 'FIN29070CRU', component: FIN29070CRUComponent },
  { path: 'FIN29080', component: FIN29080Component },  // 應付帳款預估表
  { path: 'FIN29080CRU', component: FIN29080CRUComponent },
  { path: 'FIN29090', component: FIN29090Component },  // 貼現三聯式發票列印
  { path: 'FIN29090CRU', component: FIN29090CRUComponent },
  { path: 'FIN29100', component: FIN29100Component },  // 支出憑單明細表
  { path: 'FIN29100CRU', component: FIN29100CRUComponent },
  { path: 'FIN29110', component: FIN29110Component },  // 應付帳款帳齡分析表
  { path: 'FIN29110CRU', component: FIN29110CRUComponent },
  { path: 'FIN29120', component: FIN29120Component },  // 應付帳款進項發票對應表
  { path: 'FIN29120CRU', component: FIN29120CRUComponent },
  { path: '404', component: NotfoundComponent },
  { path: '**', redirectTo: '404' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FIN2000RoutingModule { }
