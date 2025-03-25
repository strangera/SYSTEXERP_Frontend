import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
// Component
import { NotfoundComponent } from '../notfound/notfound.component';
import { TLS21010CRUComponent } from './tls21010-cru/tls21010-cru.component';
import { TLS21010Component } from './tls21010/tls21010.component';
import { TLS21020CRUComponent } from './tls21020-cru/tls21020-cru.component';
import { TLS21020Component } from './tls21020/tls21020.component';
import { TLS21030CRUComponent } from './tls21030-cru/tls21030-cru.component';
import { TLS21030Component } from './tls21030/tls21030.component';
import { TLS21040CRUComponent } from './tls21040-cru/tls21040-cru.component';
import { TLS21040Component } from './tls21040/tls21040.component';
import { TLS21050CRUComponent } from './tls21050-cru/tls21050-cru.component';
import { TLS21050Component } from './tls21050/tls21050.component';
import { TLS22010CRUComponent } from './tls22010-cru/tls22010-cru.component';
import { TLS22010Component } from './tls22010/tls22010.component';
import { TLS22020CRUComponent } from './tls22020-cru/tls22020-cru.component';
import { TLS22020Component } from './tls22020/tls22020.component';
import { TLS22030Component } from './tls22030/tls22030.component';
import { TLS22040Component } from './tls22040/tls22040.component';
import { TLS23010Component } from './tls23010/tls23010.component';
import { TLS23020Component } from './tls23020/tls23020.component';
import { TLS23030Component } from './tls23030/tls23030.component';
import { TLS23040Component } from './tls23040/tls23040.component';
import { TLS23050Component } from './tls23050/tls23050.component';
import { TLS23060Component } from './tls23060/tls23060.component';
import { TLS23070Component } from './tls23070/tls23070.component';
import { TLS23080Component } from './tls23080/tls23080.component';
import { TLS23090Component } from './tls23090/tls23090.component';
import { TLS23100Component } from './tls23100/tls23100.component';
import { TLS23110Component } from './tls23110/tls23110.component';
import { TLS23120Component } from './tls23120/tls23120.component';
import { TLS23130Component } from './tls23130/tls23130.component';
import { TLS23140Component } from './tls23140/tls23140.component';
import { TLS24010CRUComponent } from './tls24010-cru/tls24010-cru.component';
import { TLS24010Component } from './tls24010/tls24010.component';
import { TLS24020CRUComponent } from './tls24020-cru/tls24020-cru.component';
import { TLS24020Component } from './tls24020/tls24020.component';
import { TLS24030CRUComponent } from './tls24030-cru/tls24030-cru.component';
import { TLS24030Component } from './tls24030/tls24030.component';
import { TLS24040CRUComponent } from './tls24040-cru/tls24040-cru.component';
import { TLS24040Component } from './tls24040/tls24040.component';
import { TLS24050CRUComponent } from './tls24050-cru/tls24050-cru.component';
import { TLS24050Component } from './tls24050/tls24050.component';
import { TLS24060CRUComponent } from './tls24060-cru/tls24060-cru.component';
import { TLS24060Component } from './tls24060/tls24060.component';
import { TLS24070CRUComponent } from './tls24070-cru/tls24070-cru.component';
import { TLS24070Component } from './tls24070/tls24070.component';
import { TLS24080CRUComponent } from './tls24080-cru/tls24080-cru.component';
import { TLS24080Component } from './tls24080/tls24080.component';
import { TLS25010CRUComponent } from './tls25010-cru/tls25010-cru.component';
import { TLS25010Component } from './tls25010/tls25010.component';
import { TLS25020CRUComponent } from './tls25020-cru/tls25020-cru.component';
import { TLS25020Component } from './tls25020/tls25020.component';
import { TLS25030CRUComponent } from './tls25030-cru/tls25030-cru.component';
import { TLS25030Component } from './tls25030/tls25030.component';
import { TLS26010CRUComponent } from './tls26010-cru/tls26010-cru.component';
import { TLS26010Component } from './tls26010/tls26010.component';
import { TLS26020CRUComponent } from './tls26020-cru/tls26020-cru.component';
import { TLS26020Component } from './tls26020/tls26020.component';
import { TLS26030CRUComponent } from './tls26030-cru/tls26030-cru.component';
import { TLS26030Component } from './tls26030/tls26030.component';
import { TLS26040CRUComponent } from './tls26040-cru/tls26040-cru.component';
import { TLS26040Component } from './tls26040/tls26040.component';
import { TLS27010CRUComponent } from './tls27010-cru/tls27010-cru.component';
import { TLS27010Component } from './tls27010/tls27010.component';
import { TLS27020CRUComponent } from './tls27020-cru/tls27020-cru.component';
import { TLS27020Component } from './tls27020/tls27020.component';
import { TLS27030CRUComponent } from './tls27030-cru/tls27030-cru.component';
import { TLS27030Component } from './tls27030/tls27030.component';
import { TLS27040CRUComponent } from './tls27040-cru/tls27040-cru.component';
import { TLS27040Component } from './tls27040/tls27040.component';
import { TLS27050CRUComponent } from './tls27050-cru/tls27050-cru.component';
import { TLS27050Component } from './tls27050/tls27050.component';
import { TLS28010CRUComponent } from './tls28010-cru/tls28010-cru.component';
import { TLS28010Component } from './tls28010/tls28010.component';
import { TLS28020CRUComponent } from './tls28020-cru/tls28020-cru.component';
import { TLS28020Component } from './tls28020/tls28020.component';
import { TLS28030CRUComponent } from './tls28030-cru/tls28030-cru.component';
import { TLS28030Component } from './tls28030/tls28030.component';
import { TLS28040CRUComponent } from './tls28040-cru/tls28040-cru.component';
import { TLS28040Component } from './tls28040/tls28040.component';
import { TLS28050CRUComponent } from './tls28050-cru/tls28050-cru.component';
import { TLS28050Component } from './tls28050/tls28050.component';
import { TLS29010CRUComponent } from './tls29010-cru/tls29010-cru.component';
import { TLS29010Component } from './tls29010/tls29010.component';
import { TLS2A010CRUComponent } from './tls2a010-cru/tls2a010-cru.component';
import { TLS2A010Component } from './tls2a010/tls2a010.component';
import { TLS2A020CRUComponent } from './tls2a020-cru/tls2a020-cru.component';
import { TLS2A020Component } from './tls2a020/tls2a020.component';
import { TLS2A030CRUComponent } from './tls2a030-cru/tls2a030-cru.component';
import { TLS2A030Component } from './tls2a030/tls2a030.component';
import { TLS2A040CRUComponent } from './tls2a040-cru/tls2a040-cru.component';
import { TLS2A040Component } from './tls2a040/tls2a040.component';
import { TLS2A050CRUComponent } from './tls2a050-cru/tls2a050-cru.component';
import { TLS2A050Component } from './tls2a050/tls2a050.component';
import { TLS2B010CRUComponent } from './tls2b010-cru/tls2b010-cru.component';
import { TLS2B010Component } from './tls2b010/tls2b010.component';
import { TLS2B020CRUComponent } from './tls2b020-cru/tls2b020-cru.component';
import { TLS2B020Component } from './tls2b020/tls2b020.component';
import { TLS2B030CRUComponent } from './tls2b030-cru/tls2b030-cru.component';
import { TLS2B030Component } from './tls2b030/tls2b030.component';
import { TLS2C010CRUComponent } from './tls2c010-cru/tls2c010-cru.component';
import { TLS2C010Component } from './tls2c010/tls2c010.component';
import { TLS2C020CRUComponent } from './tls2c020-cru/tls2c020-cru.component';
import { TLS2C020Component } from './tls2c020/tls2c020.component';
import { TLS2C030CRUComponent } from './tls2c030-cru/tls2c030-cru.component';
import { TLS2C030Component } from './tls2c030/tls2c030.component';
import { TLS2C040CRUComponent } from './tls2c040-cru/tls2c040-cru.component';
import { TLS2C040Component } from './tls2c040/tls2c040.component';
import { TLS2C050CRUComponent } from './tls2c050-cru/tls2c050-cru.component';
import { TLS2C050Component } from './tls2c050/tls2c050.component';
import { TLS2D010CRUComponent } from './tls2d010-cru/tls2d010-cru.component';
import { TLS2D010Component } from './tls2d010/tls2d010.component';
import { TLS2D020CRUComponent } from './tls2d020-cru/tls2d020-cru.component';
import { TLS2D020Component } from './tls2d020/tls2d020.component';
import { TLS2D030CRUComponent } from './tls2d030-cru/tls2d030-cru.component';
import { TLS2D030Component } from './tls2d030/tls2d030.component';
import { TLS2D040CRUComponent } from './tls2d040-cru/tls2d040-cru.component';
import { TLS2D040Component } from './tls2d040/tls2d040.component';
import { TLS2D050CRUComponent } from './tls2d050-cru/tls2d050-cru.component';
import { TLS2D050Component } from './tls2d050/tls2d050.component';
import { TLS2D060CRUComponent } from './tls2d060-cru/tls2d060-cru.component';
import { TLS2D060Component } from './tls2d060/tls2d060.component';
import { TLS2D070CRUComponent } from './tls2d070-cru/tls2d070-cru.component';
import { TLS2D070Component } from './tls2d070/tls2d070.component';
import { TLS2E010CRUComponent } from './tls2e010-cru/tls2e010-cru.component';
import { TLS2E010Component } from './tls2e010/tls2e010.component';
import { TLS2E020CRUComponent } from './tls2e020-cru/tls2e020-cru.component';
import { TLS2E020Component } from './tls2e020/tls2e020.component';
import { TLS2E030CRUComponent } from './tls2e030-cru/tls2e030-cru.component';
import { TLS2E030Component } from './tls2e030/tls2e030.component';
import { TLS2E040CRUComponent } from './tls2e040-cru/tls2e040-cru.component';
import { TLS2E040Component } from './tls2e040/tls2e040.component';
import { TLS2E050CRUComponent } from './tls2e050-cru/tls2e050-cru.component';
import { TLS2E050Component } from './tls2e050/tls2e050.component';
import { TLS2E060CRUComponent } from './tls2e060-cru/tls2e060-cru.component';
import { TLS2E060Component } from './tls2e060/tls2e060.component';
import { TLS2E070CRUComponent } from './tls2e070-cru/tls2e070-cru.component';
import { TLS2E070Component } from './tls2e070/tls2e070.component';
import { TLS2E080CRUComponent } from './tls2e080-cru/tls2e080-cru.component';
import { TLS2E080Component } from './tls2e080/tls2e080.component';
import { TLS2E090CRUComponent } from './tls2e090-cru/tls2e090-cru.component';
import { TLS2E090Component } from './tls2e090/tls2e090.component';
import { TLS2E100CRUComponent } from './tls2e100-cru/tls2e100-cru.component';
import { TLS2E100Component } from './tls2e100/tls2e100.component';
import { TLS2F010CRUComponent } from './tls2f010-cru/tls2f010-cru.component';
import { TLS2F010Component } from './tls2f010/tls2f010.component';
import { TLS2F020CRUComponent } from './tls2f020-cru/tls2f020-cru.component';
import { TLS2F020Component } from './tls2f020/tls2f020.component';
import { TLS2F030CRUComponent } from './tls2f030-cru/tls2f030-cru.component';
import { TLS2F030Component } from './tls2f030/tls2f030.component';
import { TLS2G010CRUComponent } from './tls2g010-cru/tls2g010-cru.component';
import { TLS2G010Component } from './tls2g010/tls2g010.component';
import { TLS2G020CRUComponent } from './tls2g020-cru/tls2g020-cru.component';
import { TLS2G020Component } from './tls2g020/tls2g020.component';
import { TLS2G030CRUComponent } from './tls2g030-cru/tls2g030-cru.component';
import { TLS2G030Component } from './tls2g030/tls2g030.component';
import { TLS2G040CRUComponent } from './tls2g040-cru/tls2g040-cru.component';
import { TLS2G040Component } from './tls2g040/tls2g040.component';
import { TLS2H010CRUComponent } from './tls2h010-cru/tls2h010-cru.component';
import { TLS2H010Component } from './tls2h010/tls2h010.component';
import { TLS2H020CRUComponent } from './tls2h020-cru/tls2h020-cru.component';
import { TLS2H020Component } from './tls2h020/tls2h020.component';
import { TLS2H030CRUComponent } from './tls2h030-cru/tls2h030-cru.component';
import { TLS2H030Component } from './tls2h030/tls2h030.component';
import { TLS2J010CRUComponent } from './tls2j010-cru/tls2j010-cru.component';
import { TLS2J010Component } from './tls2j010/tls2j010.component';
import { TLS2J020CRUComponent } from './tls2j020-cru/tls2j020-cru.component';
import { TLS2J020Component } from './tls2j020/tls2j020.component';
import { TLS2J030CRUComponent } from './tls2j030-cru/tls2j030-cru.component';
import { TLS2J030Component } from './tls2j030/tls2j030.component';
import { TLS2J040CRUComponent } from './tls2j040-cru/tls2j040-cru.component';
import { TLS2J040Component } from './tls2j040/tls2j040.component';
import { TLS2J050CRUComponent } from './tls2j050-cru/tls2j050-cru.component';
import { TLS2J050Component } from './tls2j050/tls2j050.component';
import { TLS2J060CRUComponent } from './tls2j060-cru/tls2j060-cru.component';
import { TLS2J060Component } from './tls2j060/tls2j060.component';
import { TLS2J070CRUComponent } from './tls2j070-cru/tls2j070-cru.component';
import { TLS2J070Component } from './tls2j070/tls2j070.component';
import { TLS2K010CRUComponent } from './tls2k010-cru/tls2k010-cru.component';
import { TLS2K010Component } from './tls2k010/tls2k010.component';
import { TLS2K020CRUComponent } from './tls2k020-cru/tls2k020-cru.component';
import { TLS2K020Component } from './tls2k020/tls2k020.component';
import { TLS2K030CRUComponent } from './tls2k030-cru/tls2k030-cru.component';
import { TLS2K030Component } from './tls2k030/tls2k030.component';
import { TLS2K040CRUComponent } from './tls2k040-cru/tls2k040-cru.component';
import { TLS2K040Component } from './tls2k040/tls2k040.component';
import { TLS2K050CRUComponent } from './tls2k050-cru/tls2k050-cru.component';
import { TLS2K050Component } from './tls2k050/tls2k050.component';
import { TLS2K060CRUComponent } from './tls2k060-cru/tls2k060-cru.component';
import { TLS2K060Component } from './tls2k060/tls2k060.component';
import { Tls21030ModComponent } from './tls21030-mod/tls21030-mod.component';
import { TLS21040ModComponent } from './tls21040-mod/tls21040-mod.component';
import { TLS24010ModComponent } from './tls24010-mod/tls24010-mod.component';
import { TLS25010ModComponent } from './tls25010-mod/tls25010-mod.component';
import { TLS25020ModComponent } from './tls25020-mod/tls25020-mod.component';
import { TLS25030ModComponent } from './tls25030-mod/tls25030-mod.component';
import { TLS26040ModComponent } from './tls26040-mod/tls26040-mod.component';

const routes: Routes = [
  { path: '', redirectTo: '404', pathMatch: 'full' },
  { path: 'TLS21010', component: TLS21010Component }, // 傳票項目之會計科目設定作業
  { path: 'TLS21020', component: TLS21020Component }, // 傳票項目之會計科目設定作業_NEW
  { path: 'TLS21030', component: TLS21030Component }, // 對帳單備註維護作業
  { path: 'TLS21040', component: TLS21040Component }, // 信用卡之卡種維護作業
  { path: 'TLS21050', component: TLS21050Component }, // 專櫃營運前參數設定作業
  { path: 'TLS22010', component: TLS22010Component }, // 收銀機對帳查詢作業
  { path: 'TLS22020', component: TLS22020Component }, // 系統監控報表
  { path: 'TLS22030', component: TLS22030Component }, // 序號報表
  { path: 'TLS22040', component: TLS22040Component }, // 電子發票上送筆數檢核表
  { path: 'TLS23010', component: TLS23010Component }, // 型態別報表
  { path: 'TLS23020', component: TLS23020Component }, // 折扣別報表
  { path: 'TLS23030', component: TLS23030Component }, // 付款別報表
  { path: 'TLS23040', component: TLS23040Component }, // 發票報表
  { path: 'TLS23050', component: TLS23050Component }, // 收銀機日報表
  { path: 'TLS23060', component: TLS23060Component }, // 收銀機區間報表
  { path: 'TLS23070', component: TLS23070Component }, // 專櫃收銀機月報表
  { path: 'TLS23080', component: TLS23080Component }, // 支付工具實收報表
  { path: 'TLS23090', component: TLS23090Component }, // 信用卡明細表
  { path: 'TLS23100', component: TLS23100Component }, // 付款別明細表
  { path: 'TLS23110', component: TLS23110Component }, // 折扣別月報表
  { path: 'TLS23120', component: TLS23120Component }, // 專櫃日對帳單
  { path: 'TLS23130', component: TLS23130Component }, // 信用卡銷貨月報表
  { path: 'TLS23140', component: TLS23140Component }, // 有價券查詢報表
  { path: 'TLS24010', component: TLS24010Component }, // 交易補登作業
  { path: 'TLS24020', component: TLS24020Component }, // 專櫃編號修正作業
  { path: 'TLS24030', component: TLS24030Component }, // 折扣別資料修正作業
  { path: 'TLS24040', component: TLS24040Component }, // 付款別資料修正作業
  { path: 'TLS24050', component: TLS24050Component }, // 商品類別資料修正作業
  { path: 'TLS24060', component: TLS24060Component }, // 交易資料作廢作業
  { path: 'TLS24070', component: TLS24070Component }, // 發票修正作業
  { path: 'TLS24080', component: TLS24080Component }, // 交易資料修正報表
  { path: 'TLS25010', component: TLS25010Component }, // 商場違規類別維護作業
  { path: 'TLS25020', component: TLS25020Component }, // 商場違規項目維護作業
  { path: 'TLS25030', component: TLS25030Component }, // 商場違規扣款維護作業
  { path: 'TLS26010', component: TLS26010Component }, // 預購活動檔期設定
  { path: 'TLS26020', component: TLS26020Component }, // 預售總表
  { path: 'TLS26030', component: TLS26030Component }, // 預售明細表
  { path: 'TLS26040', component: TLS26040Component }, // 預售管理作業
  { path: 'TLS27010', component: TLS27010Component }, // 保全現金資料轉入作業
  { path: 'TLS27020', component: TLS27020Component }, // 保全實收現金調整作業
  { path: 'TLS27030', component: TLS27030Component }, // 信用卡資料轉入作業
  { path: 'TLS27040', component: TLS27040Component }, // 實收信用卡調整作業
  { path: 'TLS27050', component: TLS27050Component }, // 查詢無系統帳資料報表
  { path: 'TLS28010', component: TLS28010Component }, // 總袋條碼分配作業
  { path: 'TLS28020', component: TLS28020Component }, // 總袋作業
  { path: 'TLS28030', component: TLS28030Component }, // 總袋狀況表
  { path: 'TLS28040', component: TLS28040Component }, // 清機未總袋狀況表
  { path: 'TLS28050', component: TLS28050Component }, // 收銀員領袋表
  { path: 'TLS29010', component: TLS29010Component }, // 折扣開放維護作業
  { path: 'TLS2A010', component: TLS2A010Component }, // 各支付工具審核作業
  { path: 'TLS2A020', component: TLS2A020Component }, // 未審核收銀機台報表
  { path: 'TLS2A030', component: TLS2A030Component }, // 溢欠彙總表
  { path: 'TLS2A040', component: TLS2A040Component }, // 缺單據/作廢發票報表
  { path: 'TLS2A050', component: TLS2A050Component }, // 第三方支付帳差報表
  { path: 'TLS2B010', component: TLS2B010Component }, // 收銀員溢欠表(日)
  { path: 'TLS2B020', component: TLS2B020Component }, // 收銀員溢欠表(月)
  { path: 'TLS2B030', component: TLS2B030Component }, // 專櫃收銀機台溢欠表
  { path: 'TLS2C010', component: TLS2C010Component }, // 專櫃日暫存傳票報表
  { path: 'TLS2C020', component: TLS2C020Component }, // 日結前檢查作業
  { path: 'TLS2C030', component: TLS2C030Component }, // 日結關帳作業
  { path: 'TLS2C040', component: TLS2C040Component }, // 專櫃暫存傳票查詢作業
  { path: 'TLS2C050', component: TLS2C050Component }, // 發票匯總作業
  { path: 'TLS2D010', component: TLS2D010Component }, // 代扣款補登作業
  { path: 'TLS2D020', component: TLS2D020Component }, // 專櫃代扣款試算作業
  { path: 'TLS2D030', component: TLS2D030Component }, // 專櫃代扣款結算作業
  { path: 'TLS2D040', component: TLS2D040Component }, // 專櫃代扣款明細表
  { path: 'TLS2D050', component: TLS2D050Component }, // 部門使用卷類設定作業
  { path: 'TLS2D060', component: TLS2D060Component }, // 專櫃活動設定暨審核作業
  { path: 'TLS2D070', component: TLS2D070Component }, // 專櫃活動合約設定作業
  { path: 'TLS2E010', component: TLS2E010Component }, // 專櫃租金結算作業
  { path: 'TLS2E020', component: TLS2E020Component }, // 專櫃抽成金額結算作業
  { path: 'TLS2E030', component: TLS2E030Component }, // 專櫃帳款試算作業
  { path: 'TLS2E040', component: TLS2E040Component }, // 專櫃帳款試算表
  { path: 'TLS2E050', component: TLS2E050Component }, // 專櫃帳款試算彙總表
  { path: 'TLS2E060', component: TLS2E060Component }, // 專櫃結帳前調整作業
  { path: 'TLS2E070', component: TLS2E070Component }, // 專櫃帳款結算作業
  { path: 'TLS2E080', component: TLS2E080Component }, // 專櫃對帳單
  { path: 'TLS2E090', component: TLS2E090Component }, // 專櫃帳款結算彙總表
  { path: 'TLS2E100', component: TLS2E100Component }, // 年度對帳單
  { path: 'TLS2F010', component: TLS2F010Component }, // 廠商發票請款登入暨維護作業
  { path: 'TLS2F020', component: TLS2F020Component }, // 專櫃暫存應付帳款產生作業
  { path: 'TLS2F030', component: TLS2F030Component }, // 專櫃進項發票未開立查詢作業
  { path: 'TLS2G010', component: TLS2G010Component }, // 專櫃預估業績轉入作業
  { path: 'TLS2G020', component: TLS2G020Component }, // 專櫃預估業績維護作業
  { path: 'TLS2G030', component: TLS2G030Component }, // 專櫃預估業績報表
  { path: 'TLS2G040', component: TLS2G040Component }, // 預算日報表
  { path: 'TLS2H010', component: TLS2H010Component }, // 租金發票套印作業
  { path: 'TLS2H020', component: TLS2H020Component }, // 專櫃代扣款發票套印作業
  { path: 'TLS2H030', component: TLS2H030Component }, // 專櫃抽成發票套印作業
  { path: 'TLS2J010', component: TLS2J010Component }, // 換開品項維護作業
  { path: 'TLS2J020', component: TLS2J020Component }, // 業種換開品項維護作業
  { path: 'TLS2J030', component: TLS2J030Component }, // 後台發票換開補登作業
  { path: 'TLS2J040', component: TLS2J040Component }, // 發票換開作業
  { path: 'TLS2J050', component: TLS2J050Component }, // 三聯式發票查詢列印
  { path: 'TLS2J060', component: TLS2J060Component }, // 發票換開查詢作業
  { path: 'TLS2J070', component: TLS2J070Component }, // 發票換開補登作業
  { path: 'TLS2K010', component: TLS2K010Component }, // 餘代卡產卡作業
  { path: 'TLS2K020', component: TLS2K020Component }, // 餘代卡領卡作業
  { path: 'TLS2K030', component: TLS2K030Component }, // 餘代卡資料維護作業
  { path: 'TLS2K040', component: TLS2K040Component }, // 餘代卡交易補登作業
  { path: 'TLS2K050', component: TLS2K050Component }, // 餘代卡換卡作業
  { path: 'TLS2K060', component: TLS2K060Component }, // 餘代卡查詢報表
  { path: 'TLS21010CRU', component: TLS21010CRUComponent }, // 傳票項目之會計科目設定作業 CRU
  { path: 'TLS21020CRU', component: TLS21020CRUComponent }, // 傳票項目之會計科目設定作業_NEW CRU
  { path: 'TLS21030CRU', component: TLS21030CRUComponent }, // 對帳單備註維護作業 CRU
  { path: 'TLS21040CRU', component: TLS21040CRUComponent }, // 信用卡之卡種維護作業 CRU
  { path: 'TLS21050CRU', component: TLS21050CRUComponent }, // 專櫃營運前參數設定作業 CRU
  { path: 'TLS22010CRU', component: TLS22010CRUComponent }, // 收銀機對帳查詢作業 CRU
  { path: 'TLS22020CRU', component: TLS22020CRUComponent }, // 系統監控報表 CRU
  { path: 'TLS24010CRU', component: TLS24010CRUComponent }, // 交易補登作業 CRU
  { path: 'TLS24020CRU', component: TLS24020CRUComponent }, // 專櫃編號修正作業 CRU
  { path: 'TLS24030CRU', component: TLS24030CRUComponent }, // 折扣別資料修正作業 CRU
  { path: 'TLS24040CRU', component: TLS24040CRUComponent }, // 付款別資料修正作業 CRU
  { path: 'TLS24050CRU', component: TLS24050CRUComponent }, // 商品類別資料修正作業 CRU
  { path: 'TLS24060CRU', component: TLS24060CRUComponent }, // 交易資料作廢作業 CRU
  { path: 'TLS24070CRU', component: TLS24070CRUComponent }, // 發票修正作業 CRU
  { path: 'TLS24080CRU', component: TLS24080CRUComponent }, // 交易資料修正報表 CRU
  { path: 'TLS25010CRU', component: TLS25010CRUComponent }, // 商場違規類別維護作業 CRU
  { path: 'TLS25020CRU', component: TLS25020CRUComponent }, // 商場違規項目維護作業 CRU
  { path: 'TLS25030CRU', component: TLS25030CRUComponent }, // 商場違規扣款維護作業 CRU
  { path: 'TLS26010CRU', component: TLS26010CRUComponent }, // 預購活動檔期設定 CRU
  { path: 'TLS26020CRU', component: TLS26020CRUComponent }, // 預售總表 CRU
  { path: 'TLS26030CRU', component: TLS26030CRUComponent }, // 預售明細表 CRU
  { path: 'TLS26040CRU', component: TLS26040CRUComponent }, // 預售管理作業 CRU
  { path: 'TLS27010CRU', component: TLS27010CRUComponent }, // 保全現金資料轉入作業 CRU
  { path: 'TLS27020CRU', component: TLS27020CRUComponent }, // 保全實收現金調整作業 CRU
  { path: 'TLS27030CRU', component: TLS27030CRUComponent }, // 信用卡資料轉入作業 CRU
  { path: 'TLS27040CRU', component: TLS27040CRUComponent }, // 實收信用卡調整作業 CRU
  { path: 'TLS27050CRU', component: TLS27050CRUComponent }, // 查詢無系統帳資料報表 CRU
  { path: 'TLS28010CRU', component: TLS28010CRUComponent }, // 總袋條碼分配作業 CRU
  { path: 'TLS28020CRU', component: TLS28020CRUComponent }, // 總袋作業 CRU
  { path: 'TLS28030CRU', component: TLS28030CRUComponent }, // 總袋狀況表 CRU
  { path: 'TLS28040CRU', component: TLS28040CRUComponent }, // 清機未總袋狀況表 CRU
  { path: 'TLS28050CRU', component: TLS28050CRUComponent }, // 收銀員領袋表 CRU
  { path: 'TLS29010CRU', component: TLS29010CRUComponent }, // 折扣開放維護作業 CRU
  { path: 'TLS2A010CRU', component: TLS2A010CRUComponent }, // 各支付工具審核作業 CRU
  { path: 'TLS2A020CRU', component: TLS2A020CRUComponent }, // 未審核收銀機台報表 CRU
  { path: 'TLS2A030CRU', component: TLS2A030CRUComponent }, // 溢欠彙總表 CRU
  { path: 'TLS2A040CRU', component: TLS2A040CRUComponent }, // 缺單據/作廢發票報表 CRU
  { path: 'TLS2A050CRU', component: TLS2A050CRUComponent }, // 第三方支付帳差報表 CRU
  { path: 'TLS2B010CRU', component: TLS2B010CRUComponent }, // 收銀員溢欠表(日) CRU
  { path: 'TLS2B020CRU', component: TLS2B020CRUComponent }, // 收銀員溢欠表(月) CRU
  { path: 'TLS2B030CRU', component: TLS2B030CRUComponent }, // 專櫃收銀機台溢欠表 CRU
  { path: 'TLS2C010CRU', component: TLS2C010CRUComponent }, // 專櫃日暫存傳票報表 CRU
  { path: 'TLS2C020CRU', component: TLS2C020CRUComponent }, // 日結前檢查作業 CRU
  { path: 'TLS2C030CRU', component: TLS2C030CRUComponent }, // 日結關帳作業 CRU
  { path: 'TLS2C040CRU', component: TLS2C040CRUComponent }, // 專櫃暫存傳票查詢作業 CRU
  { path: 'TLS2C050CRU', component: TLS2C050CRUComponent }, // 發票匯總作業 CRU
  { path: 'TLS2D010CRU', component: TLS2D010CRUComponent }, // 代扣款補登作業 CRU
  { path: 'TLS2D020CRU', component: TLS2D020CRUComponent }, // 專櫃代扣款試算作業 CRU
  { path: 'TLS2D030CRU', component: TLS2D030CRUComponent }, // 專櫃代扣款結算作業 CRU
  { path: 'TLS2D040CRU', component: TLS2D040CRUComponent }, // 專櫃代扣款明細表 CRU
  { path: 'TLS2D050CRU', component: TLS2D050CRUComponent }, // 部門使用卷類設定作業 CRU
  { path: 'TLS2D060CRU', component: TLS2D060CRUComponent }, // 專櫃活動設定暨審核作業 CRU
  { path: 'TLS2D070CRU', component: TLS2D070CRUComponent }, // 專櫃活動合約設定作業 CRU
  { path: 'TLS2E010CRU', component: TLS2E010CRUComponent }, // 專櫃租金結算作業 CRU
  { path: 'TLS2E020CRU', component: TLS2E020CRUComponent }, // 專櫃抽成金額結算作業 CRU
  { path: 'TLS2E030CRU', component: TLS2E030CRUComponent }, // 專櫃帳款試算作業 CRU
  { path: 'TLS2E040CRU', component: TLS2E040CRUComponent }, // 專櫃帳款試算表 CRU
  { path: 'TLS2E050CRU', component: TLS2E050CRUComponent }, // 專櫃帳款試算彙總表 CRU
  { path: 'TLS2E060CRU', component: TLS2E060CRUComponent }, // 專櫃結帳前調整作業 CRU
  { path: 'TLS2E070CRU', component: TLS2E070CRUComponent }, // 專櫃帳款結算作業 CRU
  { path: 'TLS2E080CRU', component: TLS2E080CRUComponent }, // 專櫃對帳單 CRU
  { path: 'TLS2E090CRU', component: TLS2E090CRUComponent }, // 專櫃帳款結算彙總表 CRU
  { path: 'TLS2E100CRU', component: TLS2E100CRUComponent }, // 年度對帳單 CRU
  { path: 'TLS2F010CRU', component: TLS2F010CRUComponent }, // 廠商發票請款登入暨維護作業 CRU
  { path: 'TLS2F020CRU', component: TLS2F020CRUComponent }, // 專櫃暫存應付帳款產生作業 CRU
  { path: 'TLS2F030CRU', component: TLS2F030CRUComponent }, // 專櫃進項發票未開立查詢作業 CRU
  { path: 'TLS2G010CRU', component: TLS2G010CRUComponent }, // 專櫃預估業績轉入作業 CRU
  { path: 'TLS2G020CRU', component: TLS2G020CRUComponent }, // 專櫃預估業績維護作業 CRU
  { path: 'TLS2G030CRU', component: TLS2G030CRUComponent }, // 專櫃預估業績報表 CRU
  { path: 'TLS2G040CRU', component: TLS2G040CRUComponent }, // 預算日報表 CRU
  { path: 'TLS2H010CRU', component: TLS2H010CRUComponent }, // 租金發票套印作業 CRU
  { path: 'TLS2H020CRU', component: TLS2H020CRUComponent }, // 專櫃代扣款發票套印作業 CRU
  { path: 'TLS2H030CRU', component: TLS2H030CRUComponent }, // 專櫃抽成發票套印作業 CRU
  { path: 'TLS2J010CRU', component: TLS2J010CRUComponent }, // 換開品項維護作業 CRU
  { path: 'TLS2J020CRU', component: TLS2J020CRUComponent }, // 業種換開品項維護作業 CRU
  { path: 'TLS2J030CRU', component: TLS2J030CRUComponent }, // 後台發票換開補登作業 CRU
  { path: 'TLS2J040CRU', component: TLS2J040CRUComponent }, // 發票換開作業 CRU
  { path: 'TLS2J050CRU', component: TLS2J050CRUComponent }, // 三聯式發票查詢列印 CRU
  { path: 'TLS2J060CRU', component: TLS2J060CRUComponent }, // 發票換開查詢作業 CRU
  { path: 'TLS2J070CRU', component: TLS2J070CRUComponent }, // 發票換開補登作業 CRU
  { path: 'TLS2K010CRU', component: TLS2K010CRUComponent }, // 餘代卡產卡作業 CRU
  { path: 'TLS2K020CRU', component: TLS2K020CRUComponent }, // 餘代卡領卡作業 CRU
  { path: 'TLS2K030CRU', component: TLS2K030CRUComponent }, // 餘代卡資料維護作業 CRU
  { path: 'TLS2K040CRU', component: TLS2K040CRUComponent }, // 餘代卡交易補登作業 CRU
  { path: 'TLS2K050CRU', component: TLS2K050CRUComponent }, // 餘代卡換卡作業 CRU
  { path: 'TLS2K060CRU', component: TLS2K060CRUComponent }, // 餘代卡查詢報表 CRU
  { path: 'TLS21030MOD', component: Tls21030ModComponent }, // 對帳單備註維護作業 MOD
  { path: 'TLS21040MOD', component: TLS21040ModComponent }, // 對帳單備註維護作業 MOD
  { path: 'TLS24010MOD', component: TLS24010ModComponent }, // 對帳單備註維護作業 MOD
  { path: 'TLS25010MOD', component: TLS25010ModComponent }, // 商場違規類別維護作業  MOD
  { path: 'TLS25020MOD', component: TLS25020ModComponent }, // 商場違規項目維護作業  MOD
  { path: 'TLS25030MOD', component: TLS25030ModComponent }, // 商場違規扣款維護作業 MOD
  { path: 'TLS26040MOD', component: TLS26040ModComponent }, // 預售管理作業 MOD




  
  { path: '404', component: NotfoundComponent },
  { path: '**', redirectTo: '404' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TLS2000RoutingModule { }
