import { Routes } from '@angular/router';

export const finRoutes: Routes = [
  // 營業人申報設定
  { path: 'fin11010', loadComponent: () => import('./fin11010/fin11010.component').then(m => m.FIN11010Component) },
  { path: 'fin11010cru', loadComponent: () => import('./fin11010-cru/fin11010-cru.component').then(m => m.FIN11010CRUComponent) },
  // 發票基本資料維護
  { path: 'fin11020', loadComponent: () => import('./fin11020/fin11020.component').then(m => m.FIN11020Component) },
  { path: 'fin11020cru', loadComponent: () => import('./fin11020-cru/fin11020-cru.component').then(m => m.FIN11020CRUComponent) },
  // 銷項品項資料設定
  { path: 'fin11030', loadComponent: () => import('./fin11030/fin11030.component').then(m => m.FIN11030Component) },
  { path: 'fin11030cru', loadComponent: () => import('./fin11030-cru/fin11030-cru.component').then(m => m.FIN11030CRUComponent) },
  // 發票格式代號維護
  { path: 'fin11040', loadComponent: () => import('./fin11040/fin11040.component').then(m => m.FIN11040Component) },
  { path: 'fin11040cru', loadComponent: () => import('./fin11040-cru/fin11040-cru.component').then(m => m.FIN11040CRUComponent) },
  // 二聯式電子發票上送狀況表
  { path: 'fin11050', loadComponent: () => import('./fin11050/fin11050.component').then(m => m.FIN11050Component) },
  { path: 'fin11050cru', loadComponent: () => import('./fin11050-cru/fin11050-cru.component').then(m => m.FIN11050CRUComponent) },
  // 產生二聯式電子未使用空白發票檔案
  { path: 'fin11060', loadComponent: () => import('./fin11060/fin11060.component').then(m => m.FIN11060Component) },
  // 二聯式電子發票筆數核對表
  { path: 'fin11070', loadComponent: () => import('./fin11070/fin11070.component').then(m => m.FIN11070Component) },
  // 二電退貨發票號碼清空重新上送作業
  { path: 'fin11080', loadComponent: () => import('./fin11080/fin11080.component').then(m => m.FIN11080Component) },
  { path: 'fin11080cru', loadComponent: () => import('./fin11080-cru/fin11080-cru.component').then(m => m.FIN11080CRUComponent) },
  // 非業主收銀機二聯式電子發票配號作業
  { path: 'fin11090', loadComponent: () => import('./fin11090/fin11090.component').then(m => m.FIN11090Component) },
  // 電子發票配號作業
  { path: 'fin11200', loadComponent: () => import('./fin11200/fin11200.component').then(m => m.FIN11200Component) },
  { path: 'fin11200cru', loadComponent: () => import('./fin11200-cru/fin11200-cru.component').then(m => m.FIN11200CRUComponent) },
  // 電子發票參數維護作業
  { path: 'fin11210', loadComponent: () => import('./fin11210/fin11210.component').then(m => m.FIN11210Component) },
  { path: 'fin11210cru', loadComponent: () => import('./fin11210-cru/fin11210-cru.component').then(m => m.FIN11210CRUComponent) },
  // 電子式發票各系統配號維護
  { path: 'fin12010', loadComponent: () => import('./fin12010/fin12010.component').then(m => m.FIN12010Component) },
  { path: 'fin12010cru', loadComponent: () => import('./fin12010-cru/fin12010-cru.component').then(m => m.FIN12010CRUComponent) },
  // 使用完/空白發票繳回作業
  { path: 'fin12020', loadComponent: () => import('./fin12020/fin12020.component').then(m => m.FIN12020Component) },
  // 專櫃發票轉媒體作業
  { path: 'fin13010', loadComponent: () => import('./fin13010/fin13010.component').then(m => m.FIN13010Component) },
  { path: 'fin13010cru', loadComponent: () => import('./fin13010-cru/fin13010-cru.component').then(m => m.FIN13010CRUComponent) },
  // 二聯發票核對作業
  { path: 'fin13020', loadComponent: () => import('./fin13020/fin13020.component').then(m => m.FIN13020Component) },
  { path: 'fin13020cru', loadComponent: () => import('./fin13020-cru/fin13020-cru.component').then(m => m.FIN13020CRUComponent) },
  // 二收及二電發票表
  { path: 'fin13030', loadComponent: () => import('./fin13030/fin13030.component').then(m => m.FIN13030Component) },
  { path: 'fin13030cru', loadComponent: () => import('./fin13030-cru/fin13030-cru.component').then(m => m.FIN13030CRUComponent) },
  //非二聯式收銀機發票調整作業
  { path: 'fin13040', loadComponent: () => import('./fin13040/fin13040.component').then(m => m.FIN13040Component) },
  { path: 'fin13040cru', loadComponent: () => import('./fin13040-cru/fin13040-cru.component').then(m => m.FIN13040CRUComponent) },
  // 進項發票調整
  { path: 'fin13050', loadComponent: () => import('./fin13050/fin13050.component').then(m => m.FIN13050Component) },
  { path: 'fin13050cru', loadComponent: () => import('./fin13050-cru/fin13050-cru.component').then(m => m.FIN13050CRUComponent) },
  // 銷項發票調整
  { path: 'fin13060', loadComponent: () => import('./fin13060/fin13060.component').then(m => m.FIN13060Component) },
  { path: 'fin13060cru', loadComponent: () => import('./fin13060-cru/fin13060-cru.component').then(m => m.FIN13060CRUComponent) },
  // 取消作廢作業
  { path: 'fin13070', loadComponent: () => import('./fin13070/fin13070.component').then(m => m.FIN13070Component) },
  //折讓資料刪除作業
  { path: 'fin13080', loadComponent: () => import('./fin13080/fin13080.component').then(m => m.FIN13080Component) },
  // 補登進項稅額
  { path: 'fin14010', loadComponent: () => import('./fin14010/fin14010.component').then(m => m.FIN14010Component) },
  { path: 'fin14010cru', loadComponent: () => import('./fin14010-cru/fin14010-cru.component').then(m => m.FIN14010CRUComponent) },
  // 進貨退出或折讓資料維護
  { path: 'fin14020', loadComponent: () => import('./fin14020/fin14020.component').then(m => m.FIN14020Component) },
  { path: 'fin14020cru', loadComponent: () => import('./fin14020-cru/fin14020-cru.component').then(m => m.FIN14020CRUComponent) },
  // 補登銷項稅額
  { path: 'fin14030', loadComponent: () => import('./fin14030/fin14030.component').then(m => m.FIN14030Component) },
  { path: 'fin14030cru', loadComponent: () => import('./fin14030-cru/fin14030-cru.component').then(m => m.FIN14030CRUComponent) },
  // 銷貨退回或折讓資料維護
  { path: 'fin14040', loadComponent: () => import('./fin14040/fin14040.component').then(m => m.FIN14040Component) },
  { path: 'fin14040cru', loadComponent: () => import('./fin14040-cru/fin14040-cru.component').then(m => m.FIN14040CRUComponent) },
  // 申報書維護
  { path: 'fin15010', loadComponent: () => import('./fin15010/fin15010.component').then(m => m.FIN15010Component) },
  { path: 'fin15010cru', loadComponent: () => import('./fin15010-cru/fin15010-cru.component').then(m => m.FIN15010CRUComponent) },
  // 資料結轉
  { path: 'fin15020', loadComponent: () => import('./fin15020/fin15020.component').then(m => m.FIN15020Component) },
  { path: 'fin15020cru', loadComponent: () => import('./fin15020-cru/fin15020-cru.component').then(m => m.FIN15020CRUComponent) },
  // 形成申報書
  { path: 'fin15030', loadComponent: () => import('./fin15030/fin15030.component').then(m => m.FIN15030Component) },
  { path: 'fin15030cru', loadComponent: () => import('./fin15030-cru/fin15030-cru.component').then(m => m.FIN15030CRUComponent) },
  // 形成媒體申報檔
  { path: 'fin15040', loadComponent: () => import('./fin15040/fin15040.component').then(m => m.FIN15040Component) },
  { path: 'fin15040cru', loadComponent: () => import('./fin15040-cru/fin15040-cru.component').then(m => m.FIN15040CRUComponent) },
  { path: 'fin15050', loadComponent: () => import('./fin15050/fin15050.component').then(m => m.FIN15050Component) },
  { path: 'fin15060', loadComponent: () => import('./fin15060/fin15060.component').then(m => m.FIN15060Component) },
  // 媒申核對報表
  { path: 'fin15070', loadComponent: () => import('./fin15070/fin15070.component').then(m => m.FIN15070Component) },
  // 營業人媒體檔案申報表
  { path: 'fin15080', loadComponent: () => import('./fin15080/fin15080.component').then(m => m.FIN15080Component) },
  // 營業人媒體檔案遞送單
  { path: 'fin15090', loadComponent: () => import('./fin15090/fin15090.component').then(m => m.FIN15090Component) },
  // 銷貨退回或折讓單列印
  { path: 'fin15100', loadComponent: () => import('./fin15100/fin15100.component').then(m => m.FIN15100Component) },
  // 二電發票表
  { path: 'fin15110', loadComponent: () => import('./fin15110/fin15110.component').then(m => m.FIN15110Component) },
  // 公司銀行資料維護
  { path: 'fin21010', loadComponent: () => import('./fin21010/fin21010.component').then(m => m.FIN21010Component) },
  { path: 'fin21010cru', loadComponent: () => import('./fin21010-cru/fin21010-cru.component').then(m => m.FIN21010CRUComponent) },
  // 費率對照維護
  { path: 'fin21020', loadComponent: () => import('./fin21020/fin21020.component').then(m => m.FIN21020Component) },
  { path: 'fin21020cru', loadComponent: () => import('./fin21020-cru/fin21020-cru.component').then(m => m.FIN21020CRUComponent) },
  // 廠客資料維護
  { path: 'fin21030', loadComponent: () => import('./fin21030/fin21030.component').then(m => m.FIN21030Component) },
  { path: 'fin21030cru', loadComponent: () => import('./fin21030-cru/fin21030-cru.component').then(m => m.FIN21030CRUComponent) },
  // 暫付款申請作業
  { path: 'fin23010', loadComponent: () => import('./fin23010/fin23010.component').then(m => m.FIN23010Component) },
  { path: 'fin23010cru', loadComponent: () => import('./fin23010-cru/fin23010-cru.component').then(m => m.FIN23010CRUComponent) },
  // 暫付款申請傳票拋轉作業
  { path: 'fin23020', loadComponent: () => import('./fin23020/fin23020.component').then(m => m.FIN23020Component) },
  { path: 'fin23020cru', loadComponent: () => import('./fin23020-cru/fin23020-cru.component').then(m => m.FIN23020CRUComponent) },
  // 暫付款申請單列印
  { path: 'fin23030', loadComponent: () => import('./fin23030/fin23030.component').then(m => m.FIN23030Component) },
  { path: 'fin23030cru', loadComponent: () => import('./fin23030-cru/fin23030-cru.component').then(m => m.FIN23030CRUComponent) },
  // 暫付款核銷作業
  { path: 'fin23040', loadComponent: () => import('./fin23040/fin23040.component').then(m => m.FIN23040Component) },
  { path: 'fin23040cru', loadComponent: () => import('./fin23040-cru/fin23040-cru.component').then(m => m.FIN23040CRUComponent) },
  // 暫付款核銷傳票拋轉作業
  { path: 'fin23050', loadComponent: () => import('./fin23050/fin23050.component').then(m => m.FIN23050Component) },
  { path: 'fin23050cru', loadComponent: () => import('./fin23050-cru/fin23050-cru.component').then(m => m.FIN23050CRUComponent) },
  // 暫付款核銷報表
  { path: 'fin23070', loadComponent: () => import('./fin23070/fin23070.component').then(m => m.FIN23070Component) },
  // 應付帳款維護
  { path: 'fin24010', loadComponent: () => import('./fin24010/fin24010.component').then(m => m.FIN24010Component) },
  { path: 'fin24010cru', loadComponent: () => import('./fin24010-cru/fin24010-cru.component').then(m => m.FIN24010CRUComponent) },
  // 保留款沖款維護
  { path: 'fin24020', loadComponent: () => import('./fin24020/fin24020.component').then(m => m.FIN24020Component) },
  { path: 'fin24020cru', loadComponent: () => import('./fin24020-cru/fin24020-cru.component').then(m => m.FIN24020CRUComponent) },
  // 帳款貼現沖帳維護
  { path: 'fin24030', loadComponent: () => import('./fin24030/fin24030.component').then(m => m.FIN24030Component) },
  { path: 'fin24030cru', loadComponent: () => import('./fin24030-cru/fin24030-cru.component').then(m => m.FIN24030CRUComponent) },
  // 產生電匯付款資料
  { path: 'fin25010', loadComponent: () => import('./fin25010/fin25010.component').then(m => m.FIN25010Component) },
  { path: 'fin25010cru', loadComponent: () => import('./fin25010-cru/fin25010-cru.component').then(m => m.FIN25010CRUComponent) },
  // 形成電匯明細資料
  { path: 'fin25020', loadComponent: () => import('./fin25020/fin25020.component').then(m => m.FIN25020Component) },
  { path: 'fin25020cru', loadComponent: () => import('./fin25020-cru/fin25020-cru.component').then(m => m.FIN25020CRUComponent) },
  // 匯款銀行
  { path: 'fin26010', loadComponent: () => import('./fin26010/fin26010.component').then(m => m.FIN26010Component) },
  { path: 'fin26010cru', loadComponent: () => import('./fin26010-cru/fin26010-cru.component').then(m => m.FIN26010CRUComponent) },
  // 產生開票付款資料
  { path: 'fin27010', loadComponent: () => import('./fin27010/fin27010.component').then(m => m.FIN27010Component) },
  { path: 'fin27010cru', loadComponent: () => import('./fin27010-cru/fin27010-cru.component').then(m => m.FIN27010CRUComponent) },
  // 形成開票明細資料
  { path: 'fin27020', loadComponent: () => import('./fin27020/fin27020.component').then(m => m.FIN27020Component) },
  { path: 'fin27020cru', loadComponent: () => import('./fin27020-cru/fin27020-cru.component').then(m => m.FIN27020CRUComponent) },
  // 形成電匯付款傳票
  { path: 'fin28010', loadComponent: () => import('./fin28010/fin28010.component').then(m => m.FIN28010Component) },
  { path: 'fin28010cru', loadComponent: () => import('./fin28010-cru/fin28010-cru.component').then(m => m.FIN28010CRUComponent) },
  // 形成開票付款傳票
  { path: 'fin28020', loadComponent: () => import('./fin28020/fin28020.component').then(m => m.FIN28020Component) },
  { path: 'fin28020cru', loadComponent: () => import('./fin28020-cru/fin28020-cru.component').then(m => m.FIN28020CRUComponent) },
  // 保留款彙總表
  { path: 'fin29010', loadComponent: () => import('./fin29010/fin29010.component').then(m => m.FIN29010Component) },
  { path: 'fin29010cru', loadComponent: () => import('./fin29010-cru/fin29010-cru.component').then(m => m.FIN29010CRUComponent) },
  // 匯款明細表
  { path: 'fin29020', loadComponent: () => import('./fin29020/fin29020.component').then(m => m.FIN29020Component) },
  { path: 'fin29020cru', loadComponent: () => import('./fin29020-cru/fin29020-cru.component').then(m => m.FIN29020CRUComponent) },
  // 開票明細表
  { path: 'fin29030', loadComponent: () => import('./fin29030/fin29030.component').then(m => m.FIN29030Component) },
  { path: 'fin29030cru', loadComponent: () => import('./fin29030-cru/fin29030-cru.component').then(m => m.FIN29030CRUComponent) },
  // AP及ARNET之報表
  { path: 'fin29040', loadComponent: () => import('./fin29040/fin29040.component').then(m => m.FIN29040Component) },
  { path: 'fin29040cru', loadComponent: () => import('./fin29040-cru/fin29040-cru.component').then(m => m.FIN29040CRUComponent) },
  // 應付帳款明細表
  { path: 'fin29050', loadComponent: () => import('./fin29050/fin29050.component').then(m => m.FIN29050Component) },
  { path: 'fin29050cru', loadComponent: () => import('./fin29050-cru/fin29050-cru.component').then(m => m.FIN29050CRUComponent) },
  // 廠商付款明細表
  { path: 'fin29060', loadComponent: () => import('./fin29060/fin29060.component').then(m => m.FIN29060Component) },
  { path: 'fin29060cru', loadComponent: () => import('./fin29060-cru/fin29060-cru.component').then(m => m.FIN29060CRUComponent) },
  // 廠商應付對科目明細表
  { path: 'fin29070', loadComponent: () => import('./fin29070/fin29070.component').then(m => m.FIN29070Component) },
  { path: 'fin29070cru', loadComponent: () => import('./fin29070-cru/fin29070-cru.component').then(m => m.FIN29070CRUComponent) },
  // 應付帳款預估表
  { path: 'fin29080', loadComponent: () => import('./fin29080/fin29080.component').then(m => m.FIN29080Component) },
  { path: 'fin29080cru', loadComponent: () => import('./fin29080-cru/fin29080-cru.component').then(m => m.FIN29080CRUComponent) },
  // 貼現三聯式發票列印
  { path: 'fin29090', loadComponent: () => import('./fin29090/fin29090.component').then(m => m.FIN29090Component) },
  { path: 'fin29090cru', loadComponent: () => import('./fin29090-cru/fin29090-cru.component').then(m => m.FIN29090CRUComponent) },
  // 支出憑單明細表
  { path: 'fin29100', loadComponent: () => import('./fin29100/fin29100.component').then(m => m.FIN29100Component) },
  { path: 'fin29100cru', loadComponent: () => import('./fin29100-cru/fin29100-cru.component').then(m => m.FIN29100CRUComponent) },
  // 應付帳款帳齡分析表
  { path: 'fin29110', loadComponent: () => import('./fin29110/fin29110.component').then(m => m.FIN29110Component) },
  { path: 'fin29110cru', loadComponent: () => import('./fin29110-cru/fin29110-cru.component').then(m => m.FIN29110CRUComponent) },
  // 應付帳款進項發票對應表
  { path: 'fin29120', loadComponent: () => import('./fin29120/fin29120.component').then(m => m.FIN29120Component) },
  { path: 'fin29120cru', loadComponent: () => import('./fin29120-cru/fin29120-cru.component').then(m => m.FIN29120CRUComponent) },
  // 收款項目對照會計科目維護
  { path: 'fin31010', loadComponent: () => import('./fin31010/fin31010.component').then(m => m.FIN31010Component) },
  { path: 'fin31010cru', loadComponent: () => import('./fin31010-cru/fin31010-cru.component').then(m => m.FIN31010CRUComponent) },
  // 應收調整科目設定維護
  { path: 'fin31020', loadComponent: () => import('./fin31020/fin31020.component').then(m => m.FIN31020Component) },
  { path: 'fin31020cru', loadComponent: () => import('./fin31020-cru/fin31020-cru.component').then(m => m.FIN31020CRUComponent) },
  // 應收帳款維護
  { path: 'fin32010', loadComponent: () => import('./fin32010/fin32010.component').then(m => m.FIN32010Component) },
  { path: 'fin32010cru', loadComponent: () => import('./fin32010-cru/fin32010-cru.component').then(m => m.FIN32010CRUComponent) },
  // 應收帳款調整作業
  { path: 'fin32020', loadComponent: () => import('./fin32020/fin32020.component').then(m => m.FIN32020Component) },
  { path: 'fin32020cru', loadComponent: () => import('./fin32020-cru/fin32020-cru.component').then(m => m.FIN32020CRUComponent) },
  // 收款沖帳維護
  { path: 'fin32030', loadComponent: () => import('./fin32030/fin32030.component').then(m => m.FIN32030Component) },
  { path: 'fin32030cru', loadComponent: () => import('./fin32030-cru/fin32030-cru.component').then(m => m.FIN32030CRUComponent) },
  // 拋轉收款沖帳傳票
  { path: 'fin33010', loadComponent: () => import('./fin33010/fin33010.component').then(m => m.FIN33010Component) },
  { path: 'fin33010cru', loadComponent: () => import('./fin33010-cru/fin33010-cru.component').then(m => m.FIN33010CRUComponent) },
  // 應收帳款明細表
  { path: 'fin34010', loadComponent: () => import('./fin34010/fin34010.component').then(m => m.FIN34010Component) },
  // 客戶收款明細表
  { path: 'fin34020', loadComponent: () => import('./fin34020/fin34020.component').then(m => m.FIN34020Component) },
  // 廠客收/付款彙總表
  { path: 'fin34030', loadComponent: () => import('./fin34030/fin34030.component').then(m => m.FIN34030Component) },
  { path: 'fin34030cru', loadComponent: () => import('./fin34030-cru/fin34030-cru.component').then(m => m.FIN34030CRUComponent) },
  // 應收帳款帳齡分析表
  { path: 'fin34040', loadComponent: () => import('./fin34040/fin34040.component').then(m => m.FIN34040Component) },
  { path: 'fin34040cru', loadComponent: () => import('./fin34040-cru/fin34040-cru.component').then(m => m.FIN34040CRUComponent) },
  // 存入保證金維護作業
  { path: 'fin35010', loadComponent: () => import('./fin35010/fin35010.component').then(m => m.FIN35010Component) },
  { path: 'fin35010cru', loadComponent: () => import('./fin35010-cru/fin35010-cru.component').then(m => m.FIN35010CRUComponent) },
  // 部門預算匯出轉入作業
  { path: 'fin41010', loadComponent: () => import('./fin41010/fin41010.component').then(m => m.FIN41010Component) },
  { path: 'fin41010cru', loadComponent: () => import('./fin41010-cru/fin41010-cru.component').then(m => m.FIN41010CRUComponent) },
  // 部門預算編制維護
  { path: 'fin41020', loadComponent: () => import('./fin41020/fin41020.component').then(m => m.FIN41020Component) },
  { path: 'fin41020cru', loadComponent: () => import('./fin41020-cru/fin41020-cru.component').then(m => m.FIN41020CRUComponent) },
  // 預算審核作業
  { path: 'fin41030', loadComponent: () => import('./fin41030/fin41030.component').then(m => m.FIN41030Component) },
  { path: 'fin41030cru', loadComponent: () => import('./fin41030-cru/fin41030-cru.component').then(m => m.FIN41030CRUComponent) },
  // 產生年中版本作業
  { path: 'fin41040', loadComponent: () => import('./fin41040/fin41040.component').then(m => m.FIN41040Component) },
  { path: 'fin41040cru', loadComponent: () => import('./fin41040-cru/fin41040-cru.component').then(m => m.FIN41040CRUComponent) },
  // 預計損益表
  { path: 'fin42010', loadComponent: () => import('./fin42010/fin42010.component').then(m => m.FIN42010Component) },
  { path: 'fin42010cru', loadComponent: () => import('./fin42010-cru/fin42010-cru.component').then(m => m.FIN42010CRUComponent) },
  // 預算、實績比較表
  { path: 'fin42020', loadComponent: () => import('./fin42020/fin42020.component').then(m => m.FIN42020Component) },
  { path: 'fin42020cru', loadComponent: () => import('./fin42020-cru/fin42020-cru.component').then(m => m.FIN42020CRUComponent) },
  // 預算同期比較表
  { path: 'fin42030', loadComponent: () => import('./fin42030/fin42030.component').then(m => m.FIN42030Component) },
  { path: 'fin42030cru', loadComponent: () => import('./fin42030-cru/fin42030-cru.component').then(m => m.FIN42030CRUComponent) },
  // 去年同期比較表
  { path: 'fin42040', loadComponent: () => import('./fin42040/fin42040.component').then(m => m.FIN42040Component) },
  { path: 'fin42040cru', loadComponent: () => import('./fin42040-cru/fin42040-cru.component').then(m => m.FIN42040CRUComponent) },
  // 預算版本比較表
  { path: 'fin42050', loadComponent: () => import('./fin42050/fin42050.component').then(m => m.FIN42050Component) },
  { path: 'fin42050cru', loadComponent: () => import('./fin42050-cru/fin42050-cru.component').then(m => m.FIN42050CRUComponent) },
  // 資材系統
  { path: 'fin51010', loadComponent: () => import('./fin51010/fin51010.component').then(m => m.FIN51010Component) },
  { path: 'fin51010cru', loadComponent: () => import('./fin51010-cru/fin51010-cru.component').then(m => m.FIN51010CRUComponent) },
  // 基本資料作業-總帳參數維護
  { path: 'fin52010', loadComponent: () => import('./fin52010/fin52010.component').then(m => m.FIN52010Component) },
  { path: 'fin52010cru', loadComponent: () => import('./fin52010-cru/fin52010-cru.component').then(m => m.FIN52010CRUComponent) },
  // 基本資料作業-傳票型態設定維護
  { path: 'fin52020', loadComponent: () => import('./fin52020/fin52020.component').then(m => m.FIN52020Component) },
  { path: 'fin52020cru', loadComponent: () => import('./fin52020-cru/fin52020-cru.component').then(m => m.FIN52020CRUComponent) },
  // 基本資料作業-常用傳票維護
  { path: 'fin52030', loadComponent: () => import('./fin52030/fin52030.component').then(m => m.FIN52030Component) },
  { path: 'fin52030cru', loadComponent: () => import('./fin52030-cru/fin52030-cru.component').then(m => m.FIN52030CRUComponent) },
  // 基本資料作業-對象及對帳維護作業
  { path: 'fin52040', loadComponent: () => import('./fin52040/fin52040.component').then(m => m.FIN52040Component) },
  { path: 'fin52040cru', loadComponent: () => import('./fin52040-cru/fin52040-cru.component').then(m => m.FIN52040CRUComponent) },
  // 會計科目作業-科目大分類代號維護
  { path: 'fin52050', loadComponent: () => import('./fin52050/fin52050.component').then(m => m.FIN52050Component) },
  { path: 'fin52050cru', loadComponent: () => import('./fin52050-cru/fin52050-cru.component').then(m => m.FIN52050CRUComponent) },
  // 會計科目作業-科目中分類代號維護
  { path: 'fin52060', loadComponent: () => import('./fin52060/fin52060.component').then(m => m.FIN52060Component) },
  { path: 'fin52060cru', loadComponent: () => import('./fin52060-cru/fin52060-cru.component').then(m => m.FIN52060CRUComponent) },
  // 會計科目作業-科目三碼代號維護
  { path: 'fin52070', loadComponent: () => import('./fin52070/fin52070.component').then(m => m.FIN52070Component) },
  { path: 'fin52070cru', loadComponent: () => import('./fin52070-cru/fin52070-cru.component').then(m => m.FIN52070CRUComponent) },
  // 會計科目作業-會計科目代號維護
  { path: 'fin52080', loadComponent: () => import('./fin52080/fin52080.component').then(m => m.FIN52080Component) },
  { path: 'fin52080cru', loadComponent: () => import('./fin52080-cru/fin52080-cru.component').then(m => m.FIN52080CRUComponent) },
  // 會計科目作業-會計科目摘要維護
  { path: 'fin52090', loadComponent: () => import('./fin52090/fin52090.component').then(m => m.FIN52090Component) },
  { path: 'fin52090cru', loadComponent: () => import('./fin52090-cru/fin52090-cru.component').then(m => m.FIN52090CRUComponent) },
  // 傳票登入作業-傳票資料維護
  { path: 'fin53010', loadComponent: () => import('./fin53010/fin53010.component').then(m => m.FIN53010Component) },
  { path: 'fin53010cru', loadComponent: () => import('./fin53010-cru/fin53010-cru.component').then(m => m.FIN53010CRUComponent) },
  // 傳票過帳作業-傳票過帳
  { path: 'fin54020', loadComponent: () => import('./fin54020/fin54020.component').then(m => m.FIN54020Component) },
  { path: 'fin54020cru', loadComponent: () => import('./fin54020-cru/fin54020-cru.component').then(m => m.FIN54020CRUComponent) },
  // 傳票過帳作業-傳票反過帳
  { path: 'fin54025', loadComponent: () => import('./fin54025/fin54025.component').then(m => m.FIN54025Component) },
  { path: 'fin54025CRU', loadComponent: () => import('./fin54025-cru/fin54025-cru.component').then(m => m.FIN54025CRUComponent) },
  // 傳票關帳作業-關帳作業
  { path: 'fin54030', loadComponent: () => import('./fin54030/fin54030.component').then(m => m.FIN54030Component) },
  { path: 'fin54030cru', loadComponent: () => import('./fin54030-cru/fin54030-cru.component').then(m => m.FIN54030CRUComponent) },
  // 傳票關帳作業-反關帳作業
  { path: 'fin54035', loadComponent: () => import('./fin54035/fin54035.component').then(m => m.FIN54035Component) },
  { path: 'fin54035CRU', loadComponent: () => import('./fin54035-cru/fin54035-cru.component').then(m => m.FIN54035CRUComponent) },
  // 年結作業-過帳資料年結處理作業
  { path: 'fin54040', loadComponent: () => import('./fin54040/fin54040.component').then(m => m.FIN54040Component) },
  { path: 'fin54040cru', loadComponent: () => import('./fin54040-cru/fin54040-cru.component').then(m => m.FIN54040CRUComponent) },
  // 年結作業-反年結作業
  { path: 'fin54045', loadComponent: () => import('./fin54045/fin54045.component').then(m => m.FIN54045Component) },
  { path: 'fin54045CRU', loadComponent: () => import('./fin54045-cru/fin54045-cru.component').then(m => m.FIN54045CRUComponent) },
  // 總帳報表-傳票列印
  { path: 'fin55010', loadComponent: () => import('./fin55010/fin55010.component').then(m => m.FIN55010Component) },
  { path: 'fin55010cru', loadComponent: () => import('./fin55010-cru/fin55010-cru.component').then(m => m.FIN55010CRUComponent) },
  // 總帳報表-日記帳表
  { path: 'fin55020', loadComponent: () => import('./fin55020/fin55020.component').then(m => m.FIN55020Component) },
  { path: 'fin55020cru', loadComponent: () => import('./fin55020-cru/fin55020-cru.component').then(m => m.FIN55020CRUComponent) },
  // 總帳報表-立沖科目餘額表
  { path: 'fin55030', loadComponent: () => import('./fin55030/fin55030.component').then(m => m.FIN55030Component) },
  { path: 'fin55030cru', loadComponent: () => import('./fin55030-cru/fin55030-cru.component').then(m => m.FIN55030CRUComponent) },
  // 總帳報表-立沖科目明細表
  { path: 'fin55040', loadComponent: () => import('./fin55040/fin55040.component').then(m => m.FIN55040Component) },
  { path: 'fin55040cru', loadComponent: () => import('./fin55040-cru/fin55040-cru.component').then(m => m.FIN55040CRUComponent) },
  // 總帳報表-分類帳
  { path: 'fin55050', loadComponent: () => import('./fin55050/fin55050.component').then(m => m.FIN55050Component) },
  { path: 'fin55050cru', loadComponent: () => import('./fin55050-cru/fin55050-cru.component').then(m => m.FIN55050CRUComponent) },
  // 總帳報表-分類帳彙總報表
  { path: 'fin55060', loadComponent: () => import('./fin55060/fin55060.component').then(m => m.FIN55060Component) },
  { path: 'fin55060cru', loadComponent: () => import('./fin55060-cru/fin55060-cru.component').then(m => m.FIN55060CRUComponent) },
  // 總帳報表-試算表
  { path: 'fin55070', loadComponent: () => import('./fin55070/fin55070.component').then(m => m.FIN55070Component) },
  { path: 'fin55070cru', loadComponent: () => import('./fin55070-cru/fin55070-cru.component').then(m => m.FIN55070CRUComponent) },
  // 總帳報表-損益表
  { path: 'fin55080', loadComponent: () => import('./fin55080/fin55080.component').then(m => m.FIN55080Component) },
  { path: 'fin55080cru', loadComponent: () => import('./fin55080-cru/fin55080-cru.component').then(m => m.FIN55080CRUComponent) },
  // 總帳報表-當期/累計損益表
  { path: 'fin55090', loadComponent: () => import('./fin55090/fin55090.component').then(m => m.FIN55090Component) },
  { path: 'fin55090cru', loadComponent: () => import('./fin55090-cru/fin55090-cru.component').then(m => m.FIN55090CRUComponent) },
  // 總帳報表-損益比較表
  { path: 'fin55100', loadComponent: () => import('./fin55100/fin55100.component').then(m => m.FIN55100Component) },
  { path: 'fin55100cru', loadComponent: () => import('./fin55100-cru/fin55100-cru.component').then(m => m.FIN55100CRUComponent) },
  // 總帳報表-部門科目明細表
  { path: 'fin55110', loadComponent: () => import('./fin55110/fin55110.component').then(m => m.FIN55110Component) },
  { path: 'fin55110cru', loadComponent: () => import('./fin55110-cru/fin55110-cru.component').then(m => m.FIN55110CRUComponent) },
  // 總帳報表-資產負債表
  { path: 'fin55120', loadComponent: () => import('./fin55120/fin55120.component').then(m => m.FIN55120Component) },
  { path: 'fin55120cru', loadComponent: () => import('./fin55120-cru/fin55120-cru.component').then(m => m.FIN55120CRUComponent) },
  // 總帳報表-資產負債比較表
  { path: 'fin55130', loadComponent: () => import('./fin55130/fin55130.component').then(m => m.FIN55130Component) },
  { path: 'fin55130cru', loadComponent: () => import('./fin55130-cru/fin55130-cru.component').then(m => m.FIN55130CRUComponent) },
  // 支票號碼維護
  { path: 'fin61010', loadComponent: () => import('./fin61010/fin61010.component').then(m => m.FIN61010Component) },
  { path: 'fin61010cru', loadComponent: () => import('./fin61010-cru/fin61010-cru.component').then(m => m.FIN61010CRUComponent) },
  // 業務員資料維護
  { path: 'fin61020', loadComponent: () => import('./fin61020/fin61020.component').then(m => m.FIN61020Component) },
  { path: 'fin61020cru', loadComponent: () => import('./fin61020-cru/fin61020-cru.component').then(m => m.FIN61020CRUComponent) },
  // 銀行調撥作業
  { path: 'fin62010', loadComponent: () => import('./fin62010/fin62010.component').then(m => m.FIN62010Component) },
  { path: 'fin62010cru', loadComponent: () => import('./fin62010-cru/fin62010-cru.component').then(m => m.FIN62010CRUComponent) },
  // 銀行資金調撥單
  { path: 'fin62020', loadComponent: () => import('./fin62020/fin62020.component').then(m => m.FIN62020Component) },
  { path: 'fin62020cru', loadComponent: () => import('./fin62020-cru/fin62020-cru.component').then(m => m.FIN62020CRUComponent) },
  // 銀行調撥傳票拋轉作業
  { path: 'fin62030', loadComponent: () => import('./fin62030/fin62030.component').then(m => m.FIN62030Component) },
  { path: 'fin62030cru', loadComponent: () => import('./fin62030-cru/fin62030-cru.component').then(m => m.FIN62030CRUComponent) },
  // 出納區間報表
  { path: 'fin62040', loadComponent: () => import('./fin62040/fin62040.component').then(m => m.FIN62040Component) },
  { path: 'fin62040cru', loadComponent: () => import('./fin62040-cru/fin62040-cru.component').then(m => m.FIN62040CRUComponent) },
  // 銀行往來調節表
  { path: 'fin62050', loadComponent: () => import('./fin62050/fin62050.component').then(m => m.FIN62050Component) },
  { path: 'fin62050cru', loadComponent: () => import('./fin62050-cru/fin62050-cru.component').then(m => m.FIN62050CRUComponent) },
  // 套印支票 - 票據套印
  { path: 'fin63010', loadComponent: () => import('./fin63010/fin63010.component').then(m => m.FIN63010Component) },
  { path: 'fin63010cru', loadComponent: () => import('./fin63010-cru/fin63010-cru.component').then(m => m.FIN63010CRUComponent) },
  // 應付票據維護作業
  { path: 'fin63020', loadComponent: () => import('./fin63020/fin63020.component').then(m => m.FIN63020Component) },
  { path: 'fin63020cru', loadComponent: () => import('./fin63020-cru/fin63020-cru.component').then(m => m.FIN63020CRUComponent) },
  // 應付票據兌現作業
  { path: 'fin63040', loadComponent: () => import('./fin63040/fin63040.component').then(m => m.FIN63040Component) },
  { path: 'fin63040cru', loadComponent: () => import('./fin63040-cru/fin63040-cru.component').then(m => m.FIN63040CRUComponent) },
  // 應付票據撤票作業
  { path: 'fin63050', loadComponent: () => import('./fin63050/fin63050.component').then(m => m.FIN63050Component) },
  { path: 'fin63050cru', loadComponent: () => import('./fin63050-cru/fin63050-cru.component').then(m => m.FIN63050CRUComponent) },
  // 應付票據退票作業
  { path: 'fin63060', loadComponent: () => import('./fin63060/fin63060.component').then(m => m.FIN63060Component) },
  { path: 'fin63060cru', loadComponent: () => import('./fin63060-cru/fin63060-cru.component').then(m => m.FIN63060CRUComponent) },
  // 應收票據維護作業
  { path: 'fin64010', loadComponent: () => import('./fin64010/fin64010.component').then(m => m.FIN64010Component) },
  { path: 'fin64010cru', loadComponent: () => import('./fin64010-cru/fin64010-cru.component').then(m => m.FIN64010CRUComponent) },
  // 應收票據託收作業
  { path: 'fin64020', loadComponent: () => import('./fin64020/fin64020.component').then(m => m.FIN64020Component) },
  { path: 'fin64020cru', loadComponent: () => import('./fin64020-cru/fin64020-cru.component').then(m => m.FIN64020CRUComponent) },
  // 應收票據兌現作業
  { path: 'fin64030', loadComponent: () => import('./fin64030/fin64030.component').then(m => m.FIN64030Component) },
  { path: 'fin64030cru', loadComponent: () => import('./fin64030-cru/fin64030-cru.component').then(m => m.FIN64030CRUComponent) },
  // 應收票據退票作業
  { path: 'fin64050', loadComponent: () => import('./fin64050/fin64050.component').then(m => m.FIN64050Component) },
  { path: 'fin64050cru', loadComponent: () => import('./fin64050-cru/fin64050-cru.component').then(m => m.FIN64050CRUComponent) },
  // 應付票據簽回單
  { path: 'fin65010', loadComponent: () => import('./fin65010/fin65010.component').then(m => m.FIN65010Component) },
  { path: 'fin65010cru', loadComponent: () => import('./fin65010-cru/fin65010-cru.component').then(m => m.FIN65010CRUComponent) },
  // 零用金參數維護
  { path: 'fin71010', loadComponent: () => import('./fin71010/fin71010.component').then(m => m.FIN71010Component) },
  { path: 'fin71010cru', loadComponent: () => import('./fin71010-cru/fin71010-cru.component').then(m => m.FIN71010CRUComponent) },
  // 保管人及額度設定作業
  { path: 'fin71020', loadComponent: () => import('./fin71020/fin71020.component').then(m => m.FIN71020Component) },
  { path: 'fin71020cru', loadComponent: () => import('./fin71020-cru/fin71020-cru.component').then(m => m.FIN71020CRUComponent) },
  // 零用金維護作業
  { path: 'fin72010', loadComponent: () => import('./fin72010/fin72010.component').then(m => m.FIN72010Component) },
  { path: 'fin72010cru', loadComponent: () => import('./fin72010-cru/fin72010-cru.component').then(m => m.FIN72010CRUComponent) },
  // 零用金請款作業
  { path: 'fin72020', loadComponent: () => import('./fin72020/fin72020.component').then(m => m.FIN72020Component) },
  { path: 'fin72020cru', loadComponent: () => import('./fin72020-cru/fin72020-cru.component').then(m => m.FIN72020CRUComponent) },
  // 零用金拋轉作業
  { path: 'fin72030', loadComponent: () => import('./fin72030/fin72030.component').then(m => m.FIN72030Component) },
  { path: 'fin72030cru', loadComponent: () => import('./fin72030-cru/fin72030-cru.component').then(m => m.FIN72030CRUComponent) },
  // 零用金撥補作業
  { path: 'fin72040', loadComponent: () => import('./fin72040/fin72040.component').then(m => m.FIN72040Component) },
  { path: 'fin72040cru', loadComponent: () => import('./fin72040-cru/fin72040-cru.component').then(m => m.FIN72040CRUComponent) },
  // 零用金盤點作業
  { path: 'fin72050', loadComponent: () => import('./fin72050/fin72050.component').then(m => m.FIN72050Component) },
  { path: 'fin72050cru', loadComponent: () => import('./fin72050-cru/fin72050-cru.component').then(m => m.FIN72050CRUComponent) },
  // 零用金支付表
  { path: 'fin73010', loadComponent: () => import('./fin73010/fin73010.component').then(m => m.FIN73010Component) },
  // 支出請款單表
  { path: 'fin73020', loadComponent: () => import('./fin73020/fin73020.component').then(m => m.FIN73020Component) },
  { path: 'fin73020cru', loadComponent: () => import('./fin73020-cru/fin73020-cru.component').then(m => m.FIN73020CRUComponent) },
  // 支付申請單
  { path: 'fin73030', loadComponent: () => import('./fin73030/fin73030.component').then(m => m.FIN73030Component) },
  // 零用金撥補明細表
  { path: 'fin73040', loadComponent: () => import('./fin73040/fin73040.component').then(m => m.FIN73040Component) },
];
