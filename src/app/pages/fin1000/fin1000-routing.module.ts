import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
//
import { NotfoundComponent } from '../notfound/notfound.component';
import { FIN11010CRUComponent } from './fin11010-cru/fin11010-cru.component';
import { FIN11010Component } from './fin11010/fin11010.component';
import { FIN11020CRUComponent } from './fin11020-cru/fin11020-cru.component';
import { FIN11020Component } from './fin11020/fin11020.component';
import { FIN11030CRUComponent } from './fin11030-cru/fin11030-cru.component';
import { FIN11030Component } from './fin11030/fin11030.component';
import { FIN11040CRUComponent } from './fin11040-cru/fin11040-cru.component';
import { FIN11040Component } from './fin11040/fin11040.component';
import { FIN11050Component } from './fin11050/fin11050.component';
import { FIN11060Component } from './fin11060/fin11060.component';
import { FIN11070Component } from './fin11070/fin11070.component';
import { FIN11080CRUComponent } from './fin11080-cru/fin11080-cru.component';
import { FIN11080Component } from './fin11080/fin11080.component';
import { FIN11090CRUComponent } from './fin11090-cru/fin11090-cru.component';
import { FIN11090Component } from './fin11090/fin11090.component';
import { FIN12010CRUComponent } from './fin12010-cru/fin12010-cru.component';
import { FIN12010Component } from './fin12010/fin12010.component';
import { FIN12020CRUComponent } from './fin12020-cru/fin12020-cru.component';
import { FIN12020Component } from './fin12020/fin12020.component';
import { FIN12030Component } from './fin12030/fin12030.component';
import { FIN13010CRUComponent } from './fin13010-cru/fin13010-cru.component';
import { FIN13010Component } from './fin13010/fin13010.component';
import { FIN13020CRUComponent } from './fin13020-cru/fin13020-cru.component';
import { FIN13020Component } from './fin13020/fin13020.component';
import { FIN13030CRUComponent } from './fin13030-cru/fin13030-cru.component';
import { FIN13030Component } from './fin13030/fin13030.component';
import { FIN14010CRUComponent } from './fin14010-cru/fin14010-cru.component';
import { FIN14010Component } from './fin14010/fin14010.component';
import { FIN14020CRUComponent } from './fin14020-cru/fin14020-cru.component';
import { FIN14020Component } from './fin14020/fin14020.component';
import { FIN14030CRUComponent } from './fin14030-cru/fin14030-cru.component';
import { FIN14030Component } from './fin14030/fin14030.component';
import { FIN14040CRUComponent } from './fin14040-cru/fin14040-cru.component';
import { FIN14040Component } from './fin14040/fin14040.component';
import { FIN14050CRUComponent } from './fin14050-cru/fin14050-cru.component';
import { FIN14050Component } from './fin14050/fin14050.component';
import { FIN14060CRUComponent } from './fin14060-cru/fin14060-cru.component';
import { FIN14060Component } from './fin14060/fin14060.component';
import { FIN14070CRUComponent } from './fin14070-cru/fin14070-cru.component';
import { FIN14070Component } from './fin14070/fin14070.component';
import { FIN14080CRUComponent } from './fin14080-cru/fin14080-cru.component';
import { FIN14080Component } from './fin14080/fin14080.component';
import { FIN14090CRUComponent } from './fin14090-cru/fin14090-cru.component';
import { FIN14090Component } from './fin14090/fin14090.component';
import { FIN14100CRUComponent } from './fin14100-cru/fin14100-cru.component';
import { FIN14100Component } from './fin14100/fin14100.component';
import { FIN14110CRUComponent } from './fin14110-cru/fin14110-cru.component';
import { FIN14110Component } from './fin14110/fin14110.component';
import { FIN15010CRUComponent } from './fin15010-cru/fin15010-cru.component';
import { FIN15010Component } from './fin15010/fin15010.component';
import { FIN15020CRUComponent } from './fin15020-cru/fin15020-cru.component';
import { FIN15020Component } from './fin15020/fin15020.component';
import { FIN15030CRUComponent } from './fin15030-cru/fin15030-cru.component';
import { FIN15030Component } from './fin15030/fin15030.component';
import { FIN15040CRUComponent } from './fin15040-cru/fin15040-cru.component';
import { FIN15040Component } from './fin15040/fin15040.component';
import { FIN16010Component } from './fin16010/fin16010.component';
import { FIN16020Component } from './fin16020/fin16020.component';
import { FIN16030Component } from './fin16030/fin16030.component';
import { FIN16040Component } from './fin16040/fin16040.component';
import { FIN16050Component } from './fin16050/fin16050.component';
import { FIN16060Component } from './fin16060/fin16060.component';
import { FIN16070Component } from './fin16070/fin16070.component';
import { FIN16080Component } from './fin16080/fin16080.component';
import { FIN16090Component } from './fin16090/fin16090.component';
import { FIN16100Component } from './fin16100/fin16100.component';
import { FIN16110Component } from './fin16110/fin16110.component';

const routes: Routes = [
  { path: '', redirectTo: '404', pathMatch: 'full' },
  { path: 'FIN11010', component: FIN11010Component },  // 營業人申報設定
  { path: 'FIN11010CRU', component: FIN11010CRUComponent },
  { path: 'FIN11020', component: FIN11020Component },  // 發票基本資料維護
  { path: 'FIN11020CRU', component: FIN11020CRUComponent },
  { path: 'FIN11030', component: FIN11030Component },  // 銷項品項資料設定
  { path: 'FIN11030CRU', component: FIN11030CRUComponent },
  { path: 'FIN11040', component: FIN11040Component },  // 發票格式代號維護
  { path: 'FIN11040CRU', component: FIN11040CRUComponent },
  { path: 'FIN11050', component: FIN11050Component },  // 二聯式電子發票上送狀況表
  { path: 'FIN11060', component: FIN11060Component },  // 產生二聯式電子未使用空白發票檔案
  { path: 'FIN11070', component: FIN11070Component },  // 二聯式電子發票筆數核對表
  { path: 'FIN11080', component: FIN11080Component },  // 二電退貨發票號碼清空重新上送作業
  { path: 'FIN11080CRU', component: FIN11080CRUComponent },
  { path: 'FIN11090', component: FIN11090Component },  // 非業主收銀機二聯式電子發票配號作業
  { path: 'FIN11090CRU', component: FIN11090CRUComponent },
  { path: 'FIN12010', component: FIN12010Component },  // 電子式發票各系統配號維護
  { path: 'FIN12010CRU', component: FIN12010CRUComponent },
  { path: 'FIN12020', component: FIN12020Component },  // 使用完/空白發票繳回作業
  { path: 'FIN12020CRU', component: FIN12020CRUComponent },
  { path: 'FIN12030', component: FIN12030Component },  // 發票狀況明細查詢
  { path: 'FIN13010', component: FIN13010Component },  // 專櫃發票轉媒體作業
  { path: 'FIN13010CRU', component: FIN13010CRUComponent },
  { path: 'FIN13020', component: FIN13020Component },  // 二聯發票核對作業
  { path: 'FIN13020CRU', component: FIN13020CRUComponent },
  { path: 'FIN13030', component: FIN13030Component },  // 二收及二電發票表
  { path: 'FIN13030CRU', component: FIN13030CRUComponent },
  { path: 'FIN14010', component: FIN14010Component },  // 補登進項稅額
  { path: 'FIN14010CRU', component: FIN14010CRUComponent },
  { path: 'FIN14020', component: FIN14020Component },  // 進貨退出或折讓資料維護
  { path: 'FIN14020CRU', component: FIN14020CRUComponent },
  { path: 'FIN14030', component: FIN14030Component },  // 補登銷項稅額
  { path: 'FIN14030CRU', component: FIN14030CRUComponent },
  { path: 'FIN14040', component: FIN14040Component },  // 銷貨退回或折讓資料維護
  { path: 'FIN14040CRU', component: FIN14040CRUComponent },
  { path: 'FIN14050', component: FIN14050Component },  // 零稅率清單維護
  { path: 'FIN14050CRU', component: FIN14050CRUComponent },
  { path: 'FIN14060', component: FIN14060Component },  // 非二聯式收銀機發票調整作業
  { path: 'FIN14060CRU', component: FIN14060CRUComponent },
  { path: 'FIN14070', component: FIN14070Component },  // 二聯收銀機發票維護
  { path: 'FIN14070CRU', component: FIN14070CRUComponent },
  { path: 'FIN14080', component: FIN14080Component },  // 進項發票調整
  { path: 'FIN14080CRU', component: FIN14080CRUComponent },
  { path: 'FIN14090', component: FIN14090Component },  // 銷項發票調整
  { path: 'FIN14090CRU', component: FIN14090CRUComponent },
  { path: 'FIN14100', component: FIN14100Component },  // 刪除二聯收銀發票退回作業
  { path: 'FIN14100CRU', component: FIN14100CRUComponent },
  { path: 'FIN14110', component: FIN14110Component },  // 折讓資料刪除作業
  { path: 'FIN14110CRU', component: FIN14110CRUComponent },
  { path: 'FIN15010', component: FIN15010Component },  // 申報書維護
  { path: 'FIN15010CRU', component: FIN15010CRUComponent },
  { path: 'FIN15020', component: FIN15020Component },  // 資料結轉
  { path: 'FIN15020CRU', component: FIN15020CRUComponent },
  { path: 'FIN15030', component: FIN15030Component },  // 形成申報書
  { path: 'FIN15030CRU', component: FIN15030CRUComponent },
  { path: 'FIN15040', component: FIN15040Component },  // 形成媒體申報檔
  { path: 'FIN15040CRU', component: FIN15040CRUComponent },
  { path: 'FIN16010', component: FIN16010Component },  // 進項發票明細表
  { path: 'FIN16020', component: FIN16020Component },  // 進貨退出或折讓明細表
  { path: 'FIN16030', component: FIN16030Component },  // 銷貨退回或折讓明細表
  { path: 'FIN16040', component: FIN16040Component },  // 銷項二聯式收銀機發票明細表
  { path: 'FIN16050', component: FIN16050Component },  // 銷項發票明細表
  { path: 'FIN16060', component: FIN16060Component },  // 三聯電子式發票列印
  { path: 'FIN16070', component: FIN16070Component },  // 零稅率銷售額清單
  { path: 'FIN16080', component: FIN16080Component },  // 媒申核對報表
  { path: 'FIN16090', component: FIN16090Component },  // 營業人媒體檔案申報表
  { path: 'FIN16100', component: FIN16100Component },  // 營業人媒體檔案遞送單
  { path: 'FIN16110', component: FIN16110Component },  // 銷貨退回或折讓單列印
  { path: '404', component: NotfoundComponent },
  { path: '**', redirectTo: '404' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FIN1000RoutingModule { }
