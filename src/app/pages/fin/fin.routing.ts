import { Routes } from '@angular/router';

export const finRoutes: Routes = [
  // 營業人申報設定
  { path: 'fin11010', loadComponent: () => import('./fin11010/fin11010.component').then(m => m.FIN11010Component), data: { progNo: 'FIN11010' } },
  { path: 'fin11010cru', loadComponent: () => import('./fin11010-cru/fin11010-cru.component').then(m => m.FIN11010CRUComponent), data: { progNo: 'FIN11010' } },
  // 發票基本資料維護
  { path: 'fin11020', loadComponent: () => import('./fin11020/fin11020.component').then(m => m.FIN11020Component), data: { progNo: 'FIN11020' } },
  { path: 'fin11020cru', loadComponent: () => import('./fin11020-cru/fin11020-cru.component').then(m => m.FIN11020CRUComponent), data: { progNo: 'FIN11020' } },
  // 銷項品項資料設定
  { path: 'fin11030', loadComponent: () => import('./fin11030/fin11030.component').then(m => m.FIN11030Component), data: { progNo: 'FIN11030' } },
  { path: 'fin11030cru', loadComponent: () => import('./fin11030-cru/fin11030-cru.component').then(m => m.FIN11030CRUComponent), data: { progNo: 'FIN11030' } },
  // 發票格式代號維護
  { path: 'fin11040', loadComponent: () => import('./fin11040/fin11040.component').then(m => m.FIN11040Component), data: { progNo: 'FIN11040' } },
  { path: 'fin11040cru', loadComponent: () => import('./fin11040-cru/fin11040-cru.component').then(m => m.FIN11040CRUComponent), data: { progNo: 'FIN11040' } },
  // 二聯式電子發票上送狀況表
  { path: 'fin11050', loadComponent: () => import('./fin11050/fin11050.component').then(m => m.FIN11050Component), data: { progNo: 'FIN11050' } },
  { path: 'fin11050cru', loadComponent: () => import('./fin11050-cru/fin11050-cru.component').then(m => m.FIN11050CRUComponent), data: { progNo: 'FIN11050' } },
  // 產生二聯式電子未使用空白發票檔案
  { path: 'fin11060', loadComponent: () => import('./fin11060/fin11060.component').then(m => m.FIN11060Component), data: { progNo: 'FIN11060' } },
  // 二聯式電子發票筆數核對表
  { path: 'fin11070', loadComponent: () => import('./fin11070/fin11070.component').then(m => m.FIN11070Component), data: { progNo: 'FIN11070' } },
  // 二電退貨發票號碼清空重新上送作業
  { path: 'fin11080', loadComponent: () => import('./fin11080/fin11080.component').then(m => m.FIN11080Component), data: { progNo: 'FIN11080' } },
  // 非業主收銀機二聯式電子發票配號作業
  { path: 'fin11090', loadComponent: () => import('./fin11090/fin11090.component').then(m => m.FIN11090Component), data: { progNo: 'FIN11090' } },
  // 電子發票配號作業
  { path: 'fin11200', loadComponent: () => import('./fin11200/fin11200.component').then(m => m.FIN11200Component), data: { progNo: 'FIN11200' } },
  { path: 'fin11200cru', loadComponent: () => import('./fin11200-cru/fin11200-cru.component').then(m => m.FIN11200CRUComponent), data: { progNo: 'FIN11200' } },
  // 電子發票參數維護作業
  { path: 'fin11210', loadComponent: () => import('./fin11210/fin11210.component').then(m => m.FIN11210Component), data: { progNo: 'FIN11210' } },
  { path: 'fin11210cru', loadComponent: () => import('./fin11210-cru/fin11210-cru.component').then(m => m.FIN11210CRUComponent), data: { progNo: 'FIN11210' } },
  // 電子式發票各系統配號維護
  { path: 'fin12010', loadComponent: () => import('./fin12010/fin12010.component').then(m => m.FIN12010Component), data: { progNo: 'FIN12010' } },
  { path: 'fin12010cru', loadComponent: () => import('./fin12010-cru/fin12010-cru.component').then(m => m.FIN12010CRUComponent), data: { progNo: 'FIN12010' } },
  // 使用完/空白發票繳回作業
  { path: 'fin12020', loadComponent: () => import('./fin12020/fin12020.component').then(m => m.FIN12020Component), data: { progNo: 'FIN12020' } },
  // 專櫃發票轉媒體作業
  { path: 'fin13010', loadComponent: () => import('./fin13010/fin13010.component').then(m => m.FIN13010Component), data: { progNo: 'FIN13010' } },
  { path: 'fin13010cru', loadComponent: () => import('./fin13010-cru/fin13010-cru.component').then(m => m.FIN13010CRUComponent), data: { progNo: 'FIN13010' } },
  // 二聯發票核對作業
  { path: 'fin13020', loadComponent: () => import('./fin13020/fin13020.component').then(m => m.FIN13020Component), data: { progNo: 'FIN13020' } },
  { path: 'fin13020cru', loadComponent: () => import('./fin13020-cru/fin13020-cru.component').then(m => m.FIN13020CRUComponent), data: { progNo: 'FIN13020' } },
  // 二收及二電發票表
  { path: 'fin13030', loadComponent: () => import('./fin13030/fin13030.component').then(m => m.FIN13030Component), data: { progNo: 'FIN13030' } },
  { path: 'fin13030cru', loadComponent: () => import('./fin13030-cru/fin13030-cru.component').then(m => m.FIN13030CRUComponent), data: { progNo: 'FIN13030' } },
  //非二聯式收銀機發票調整作業
  { path: 'fin13040', loadComponent: () => import('./fin13040/fin13040.component').then(m => m.FIN13040Component), data: { progNo: 'FIN13040' } },
  { path: 'fin13040cru', loadComponent: () => import('./fin13040-cru/fin13040-cru.component').then(m => m.FIN13040CRUComponent), data: { progNo: 'FIN13040' } },
  // 進項發票調整
  { path: 'fin13050', loadComponent: () => import('./fin13050/fin13050.component').then(m => m.FIN13050Component), data: { progNo: 'FIN13050' } },
  { path: 'fin13050cru', loadComponent: () => import('./fin13050-cru/fin13050-cru.component').then(m => m.FIN13050CRUComponent), data: { progNo: 'FIN13050' } },
  // 銷項發票調整
  { path: 'fin13060', loadComponent: () => import('./fin13060/fin13060.component').then(m => m.FIN13060Component), data: { progNo: 'FIN13060' } },
  { path: 'fin13060cru', loadComponent: () => import('./fin13060-cru/fin13060-cru.component').then(m => m.FIN13060CRUComponent), data: { progNo: 'FIN13060' } },
  // 取消作廢作業
  { path: 'fin13070', loadComponent: () => import('./fin13070/fin13070.component').then(m => m.FIN13070Component), data: { progNo: 'FIN13070' } },
  //折讓資料刪除作業
  { path: 'fin13080', loadComponent: () => import('./fin13080/fin13080.component').then(m => m.FIN13080Component), data: { progNo: 'FIN13080' } },
  // 申報書維護
  { path: 'fin14010', loadComponent: () => import('./fin14010/fin14010.component').then(m => m.FIN14010Component), data: { progNo: 'FIN14010' } },
  { path: 'fin14010cru', loadComponent: () => import('./fin14010-cru/fin14010-cru.component').then(m => m.FIN14010CRUComponent), data: { progNo: 'FIN14010' } },
  // 資料結轉
  { path: 'fin14020', loadComponent: () => import('./fin14020/fin14020.component').then(m => m.FIN14020Component), data: { progNo: 'FIN14020' } },
  // 形成申報書
  { path: 'fin14030', loadComponent: () => import('./fin14030/fin14030.component').then(m => m.FIN14030Component), data: { progNo: 'FIN14030' } },
  // 形成媒體申報檔
  { path: 'fin14040', loadComponent: () => import('./fin14040/fin14040.component').then(m => m.FIN14040Component), data: { progNo: 'FIN14040' } },
  // 申報書維護
  { path: 'fin15010', loadComponent: () => import('./fin15010/fin15010.component').then(m => m.FIN15010Component), data: { progNo: 'FIN15010' } },
  // 資料結轉
  { path: 'fin15020', loadComponent: () => import('./fin15020/fin15020.component').then(m => m.FIN15020Component), data: { progNo: 'FIN15020' } },
  // 形成申報書
  { path: 'fin15030', loadComponent: () => import('./fin15030/fin15030.component').then(m => m.FIN15030Component), data: { progNo: 'FIN15030' } },
  // 形成媒體申報檔
  { path: 'fin15040', loadComponent: () => import('./fin15040/fin15040.component').then(m => m.FIN15040Component), data: { progNo: 'FIN15040' } },
  { path: 'fin15050', loadComponent: () => import('./fin15050/fin15050.component').then(m => m.FIN15050Component), data: { progNo: 'FIN15050' } },
  { path: 'fin15060', loadComponent: () => import('./fin15060/fin15060.component').then(m => m.FIN15060Component), data: { progNo: 'FIN15060' } },
  // 媒申核對報表
  { path: 'fin15070', loadComponent: () => import('./fin15070/fin15070.component').then(m => m.FIN15070Component), data: { progNo: 'FIN15070' } },
  // 營業人媒體檔案申報表
  { path: 'fin15080', loadComponent: () => import('./fin15080/fin15080.component').then(m => m.FIN15080Component), data: { progNo: 'FIN15080' } },
  // 營業人媒體檔案遞送單
  { path: 'fin15090', loadComponent: () => import('./fin15090/fin15090.component').then(m => m.FIN15090Component), data: { progNo: 'FIN15090' } },
  // 銷貨退回或折讓單列印
  { path: 'fin15100', loadComponent: () => import('./fin15100/fin15100.component').then(m => m.FIN15100Component), data: { progNo: 'FIN15100' } },
  // 二電發票表
  { path: 'fin15110', loadComponent: () => import('./fin15110/fin15110.component').then(m => m.FIN15110Component), data: { progNo: 'FIN15110' } },
  // 公司銀行資料維護
  { path: 'fin21010', loadComponent: () => import('./fin21010/fin21010.component').then(m => m.FIN21010Component), data: { progNo: 'FIN21010' } },
  { path: 'fin21010cru', loadComponent: () => import('./fin21010-cru/fin21010-cru.component').then(m => m.FIN21010CRUComponent), data: { progNo: 'FIN21010' } },
  // 費率對照維護
  { path: 'fin21020', loadComponent: () => import('./fin21020/fin21020.component').then(m => m.FIN21020Component), data: { progNo: 'FIN21020' } },
  { path: 'fin21020cru', loadComponent: () => import('./fin21020-cru/fin21020-cru.component').then(m => m.FIN21020CRUComponent), data: { progNo: 'FIN21020' } },
  // 廠客資料維護
  { path: 'fin21030', loadComponent: () => import('./fin21030/fin21030.component').then(m => m.FIN21030Component), data: { progNo: 'FIN21030' } },
  { path: 'fin21030cru', loadComponent: () => import('./fin21030-cru/fin21030-cru.component').then(m => m.FIN21030CRUComponent), data: { progNo: 'FIN21030' } },
  // 暫付款申請作業
  // { path: 'fin23010', loadComponent: () => import('./fin23010/fin23010.component').then(m => m.FIN23010Component),data:{progNo:'FIN23010'} },
  // { path: 'fin23010cru', loadComponent: () => import('./fin23010-cru/fin23010-cru.component').then(m => m.FIN23010CRUComponent),data: { progNo: 'FIN23010'} },
  // 暫付款申請傳票拋轉作業
  // { path: 'fin23020', loadComponent: () => import('./fin23020/fin23020.component').then(m => m.FIN23020Component),data:{progNo:'FIN23020'} },
  // { path: 'fin23020cru', loadComponent: () => import('./fin23020-cru/fin23020-cru.component').then(m => m.FIN23020CRUComponent),data: { progNo: 'FIN23020'} },
  // 暫付款申請單列印
  // { path: 'fin23030', loadComponent: () => import('./fin23030/fin23030.component').then(m => m.FIN23030Component),data:{progNo:'FIN23030'} },
  // { path: 'fin23030cru', loadComponent: () => import('./fin23030-cru/fin23030-cru.component').then(m => m.FIN23030CRUComponent),data: { progNo: 'FIN23030'} },
  // 暫付款核銷作業
  // { path: 'fin23040', loadComponent: () => import('./fin23040/fin23040.component').then(m => m.FIN23040Component),data:{progNo:'FIN23040'} },
  // { path: 'fin23040cru', loadComponent: () => import('./fin23040-cru/fin23040-cru.component').then(m => m.FIN23040CRUComponent),data: { progNo: 'FIN23040'} },
  // 暫付款核銷傳票拋轉作業
  // { path: 'fin23050', loadComponent: () => import('./fin23050/fin23050.component').then(m => m.FIN23050Component),data:{progNo:'FIN23050'} },
  // { path: 'fin23050cru', loadComponent: () => import('./fin23050-cru/fin23050-cru.component').then(m => m.FIN23050CRUComponent),data: { progNo: 'FIN23050'} },
  // 暫付款核銷報表
  // { path: 'fin23070', loadComponent: () => import('./fin23070/fin23070.component').then(m => m.FIN23070Component),data:{progNo:'FIN23070'} },
  // 應付帳款維護
  { path: 'fin24010', loadComponent: () => import('./fin24010/fin24010.component').then(m => m.FIN24010Component), data: { progNo: 'FIN24010' } },
  { path: 'fin24010cru', loadComponent: () => import('./fin24010-cru/fin24010-cru.component').then(m => m.FIN24010CRUComponent), data: { progNo: 'FIN24010' } },
  // 保留款沖款維護
  { path: 'fin24020', loadComponent: () => import('./fin24020/fin24020.component').then(m => m.FIN24020Component) },
  { path: 'fin24020cru', loadComponent: () => import('./fin24020-cru/fin24020-cru.component').then(m => m.FIN24020CRUComponent) },
  // 產生電匯付款資料
  { path: 'fin25010', loadComponent: () => import('./fin25010/fin25010.component').then(m => m.FIN25010Component), data: { progNo: 'FIN25010' } },
  { path: 'fin25010cru', loadComponent: () => import('./fin25010-cru/fin25010-cru.component').then(m => m.FIN25010CRUComponent), data: { progNo: 'FIN25010' } },
  // 形成電匯明細資料
  { path: 'fin25020', loadComponent: () => import('./fin25020/fin25020.component').then(m => m.FIN25020Component), data: { progNo: 'FIN25020' } },
  { path: 'fin25020cru', loadComponent: () => import('./fin25020-cru/fin25020-cru.component').then(m => m.FIN25020CRUComponent), data: { progNo: 'FIN25020' } },
  // 匯款銀行
  { path: 'fin26010', loadComponent: () => import('./fin26010/fin26010.component').then(m => m.FIN26010Component), data: { progNo: 'FIN26010' } },
  // 產生開票付款資料
  // { path: 'fin27010', loadComponent: () => import('./fin27010/fin27010.component').then(m => m.FIN27010Component),data:{progNo:'FIN27010'} },
  // { path: 'fin27010cru', loadComponent: () => import('./fin27010-cru/fin27010-cru.component').then(m => m.FIN27010CRUComponent),data: { progNo: 'FIN27010'} },
  // 形成開票明細資料
  // { path: 'fin27020', loadComponent: () => import('./fin27020/fin27020.component').then(m => m.FIN27020Component),data:{progNo:'FIN27020'} },
  // { path: 'fin27020cru', loadComponent: () => import('./fin27020-cru/fin27020-cru.component').then(m => m.FIN27020CRUComponent),data: { progNo: 'FIN27020'} },
  // 形成電匯付款傳票
  { path: 'fin28010', loadComponent: () => import('./fin28010/fin28010.component').then(m => m.FIN28010Component), data: { progNo: 'FIN28010' } },
  { path: 'fin28010cru', loadComponent: () => import('./fin28010-cru/fin28010-cru.component').then(m => m.FIN28010CRUComponent), data: { progNo: 'FIN28010' } },
  // 形成開票付款傳票
  // { path: 'fin28020', loadComponent: () => import('./fin28020/fin28020.component').then(m => m.FIN28020Component),data:{progNo:'FIN28020'} },
  // { path: 'fin28020cru', loadComponent: () => import('./fin28020-cru/fin28020-cru.component').then(m => m.FIN28020CRUComponent),data: { progNo: 'FIN28020'} },
  // 保留款彙總表
  { path: 'fin29010', loadComponent: () => import('./fin29010/fin29010.component').then(m => m.FIN29010Component), data: { progNo: 'FIN29010' } },
  // 匯款明細表
  { path: 'fin29020', loadComponent: () => import('./fin29020/fin29020.component').then(m => m.FIN29020Component), data: { progNo: 'FIN29020' } },
  // 開票明細表
  { path: 'fin29030', loadComponent: () => import('./fin29030/fin29030.component').then(m => m.FIN29030Component), data: { progNo: 'FIN29030' } },
  // AP及ARNET之報表
  { path: 'fin29040', loadComponent: () => import('./fin29040/fin29040.component').then(m => m.FIN29040Component) },
  // 應付帳款明細表
  { path: 'fin29050', loadComponent: () => import('./fin29050/fin29050.component').then(m => m.FIN29050Component), data: { progNo: 'FIN29050' } },
  { path: 'fin29050cru', loadComponent: () => import('./fin29050-cru/fin29050-cru.component').then(m => m.FIN29050CRUComponent), data: { progNo: 'FIN29050' } },
  // 廠商付款明細表
  { path: 'fin29060', loadComponent: () => import('./fin29060/fin29060.component').then(m => m.FIN29060Component), data: { progNo: 'FIN29060' } },
  { path: 'fin29060cru', loadComponent: () => import('./fin29060-cru/fin29060-cru.component').then(m => m.FIN29060CRUComponent), data: { progNo: 'FIN29060' } },
  // 廠商應付對科目明細表
  { path: 'fin29070', loadComponent: () => import('./fin29070/fin29070.component').then(m => m.FIN29070Component), data: { progNo: 'FIN29070' } },
  // 應付帳款預估表
  { path: 'fin29080', loadComponent: () => import('./fin29080/fin29080.component').then(m => m.FIN29080Component), data: { progNo: 'FIN29080' } },
  // 貼現三聯式發票列印
  // { path: 'fin29090', loadComponent: () => import('./fin29090/fin29090.component').then(m => m.FIN29090Component),data:{progNo:'FIN29090'} },
  // 支出憑單明細表
  { path: 'fin29100', loadComponent: () => import('./fin29100/fin29100.component').then(m => m.FIN29100Component), data: { progNo: 'FIN29100' } },
  // 應付帳款帳齡分析表
  { path: 'fin29110', loadComponent: () => import('./fin29110/fin29110.component').then(m => m.FIN29110Component), data: { progNo: 'FIN29110' } },
  // 應付帳款進項發票對應表
  { path: 'fin29120', loadComponent: () => import('./fin29120/fin29120.component').then(m => m.FIN29120Component) },
  // 收款項目對照會計科目維護
  { path: 'fin31010', loadComponent: () => import('./fin31010/fin31010.component').then(m => m.FIN31010Component), data: { progNo: 'FIN31010' } },
  { path: 'fin31010cru', loadComponent: () => import('./fin31010-cru/fin31010-cru.component').then(m => m.FIN31010CRUComponent), data: { progNo: 'FIN31010' } },
  // 應收調整科目設定維護
  { path: 'fin31020', loadComponent: () => import('./fin31020/fin31020.component').then(m => m.FIN31020Component), data: { progNo: 'FIN31020' } },
  { path: 'fin31020cru', loadComponent: () => import('./fin31020-cru/fin31020-cru.component').then(m => m.FIN31020CRUComponent), data: { progNo: 'FIN31020' } },
  // 應收帳款維護
  { path: 'fin32010', loadComponent: () => import('./fin32010/fin32010.component').then(m => m.FIN32010Component), data: { progNo: 'FIN32010' } },
  { path: 'fin32010cru', loadComponent: () => import('./fin32010-cru/fin32010-cru.component').then(m => m.FIN32010CRUComponent), data: { progNo: 'FIN32010' } },
  // 應收帳款調整作業
  { path: 'fin32020', loadComponent: () => import('./fin32020/fin32020.component').then(m => m.FIN32020Component), data: { progNo: 'FIN32020' } },
  { path: 'fin32020cru', loadComponent: () => import('./fin32020-cru/fin32020-cru.component').then(m => m.FIN32020CRUComponent), data: { progNo: 'FIN32020' } },
  // 收款沖帳維護
  { path: 'fin32030', loadComponent: () => import('./fin32030/fin32030.component').then(m => m.FIN32030Component), data: { progNo: 'FIN32030' } },
  { path: 'fin32030cru', loadComponent: () => import('./fin32030-cru/fin32030-cru.component').then(m => m.FIN32030CRUComponent), data: { progNo: 'FIN32030' } },
  //拋轉收款沖帳傳票
  { path: 'fin33010', loadComponent: () => import('./fin33010/fin33010.component').then(m => m.FIN33010Component), data: { progNo: 'FIN33010' } },
  { path: 'fin33010cru', loadComponent: () => import('./fin33010-cru/fin33010-cru.component').then(m => m.FIN33010CRUComponent), data: { progNo: 'FIN33010' } },
  // 應收帳款明細表
  { path: 'fin34010', loadComponent: () => import('./fin34010/fin34010.component').then(m => m.FIN34010Component), data: { progNo: 'FIN34010' } },
  // 客戶收款明細表
  { path: 'fin34020', loadComponent: () => import('./fin34020/fin34020.component').then(m => m.FIN34020Component), data: { progNo: 'FIN34020' } },
  // 廠客收/付款彙總表
  { path: 'fin34030', loadComponent: () => import('./fin34030/fin34030.component').then(m => m.FIN34030Component), data: { progNo: 'FIN34030' } },
  // 應收帳款帳齡分析表
  { path: 'fin34040', loadComponent: () => import('./fin34040/fin34040.component').then(m => m.FIN34040Component), data: { progNo: 'FIN34040' } },
  // 存入保證金維護作業
  { path: 'fin35010', loadComponent: () => import('./fin35010/fin35010.component').then(m => m.FIN35010Component), data: { progNo: 'FIN35010' } },
  { path: 'fin35010cru', loadComponent: () => import('./fin35010-cru/fin35010-cru.component').then(m => m.FIN35010CRUComponent), data: { progNo: 'FIN35010' } },
  // 部門預算匯出轉入作業
  { path: 'fin41010', loadComponent: () => import('./fin41010/fin41010.component').then(m => m.FIN41010Component), data: { progNo: 'FIN41010' } },
  // 部門預算編制維護
  { path: 'fin41020', loadComponent: () => import('./fin41020/fin41020.component').then(m => m.FIN41020Component), data: { progNo: 'FIN41020' } },
  { path: 'fin41020cru', loadComponent: () => import('./fin41020-cru/fin41020-cru.component').then(m => m.FIN41020CRUComponent), data: { progNo: 'FIN41020' } },
  // 預算審核作業
  { path: 'fin41030', loadComponent: () => import('./fin41030/fin41030.component').then(m => m.FIN41030Component), data: { progNo: 'FIN41030' } },
  { path: 'fin41030cru', loadComponent: () => import('./fin41030-cru/fin41030-cru.component').then(m => m.FIN41030CRUComponent), data: { progNo: 'FIN41030' } },
  // 產生年中版本作業
  { path: 'fin41040', loadComponent: () => import('./fin41040/fin41040.component').then(m => m.FIN41040Component), data: { progNo: 'FIN41040' } },
  // { path: 'fin41040cru', loadComponent: () => import('./fin41040-cru/fin41040-cru.component').then(m => m.FIN41040CRUComponent),data: { progNo: 'FIN41040'} },
  // 部門預算編制明細維護
  { path: 'fin41050', loadComponent: () => import('./fin41050/fin41050.component').then(m => m.Fin41050Component), data: { progNo: 'Fin41050' } },
  { path: 'fin41050cru', loadComponent: () => import('./fin41050-cru/fin41050-cru.component').then(m => m.FIN41050CRUComponent), data: { progNo: 'FIN41050' } },

  // 部門預算審核作業
  { path: 'fin41060', loadComponent: () => import('./fin41060/fin41060.component').then(m => m.FIN41060Component), data: { progNo: 'FIN41060' } },
  { path: 'fin41060cru', loadComponent: () => import('./fin41060-cru/fin41060-cru.component').then(m => m.FIN41060CRUComponent), data: { progNo: 'FIN41060' } },
  // 預計損益表
  { path: 'fin42010', loadComponent: () => import('./fin42010/fin42010.component').then(m => m.FIN42010Component), data: { progNo: 'FIN42010' } },
  // 預算、實績比較表
  { path: 'fin42020', loadComponent: () => import('./fin42020/fin42020.component').then(m => m.FIN42020Component), data: { progNo: 'FIN42020' } },
  // 預算同期比較表
  { path: 'fin42030', loadComponent: () => import('./fin42030/fin42030.component').then(m => m.FIN42030Component), data: { progNo: 'FIN42030' } },
  // 去年同期比較表
  { path: 'fin42040', loadComponent: () => import('./fin42040/fin42040.component').then(m => m.FIN42040Component), data: { progNo: 'FIN42040' } },
  // 預算版本比較表
  // { path: 'fin42050', loadComponent: () => import('./fin42050/fin42050.component').then(m => m.FIN42050Component),data:{progNo:'FIN42050'} },
  // 部門科目明細表(由總帳管理系統移至預算管理系統)
  // { path: 'fin42060', loadComponent: () => import('./fin42060/fin42060.component').then(m => m.Fin42060Component),data:{progNo:'Fin42060'} },
  // 資材系統
  { path: 'fin51010', loadComponent: () => import('./fin51010/fin51010.component').then(m => m.FIN51010Component), data: { progNo: 'FIN51010' } },
  { path: 'fin51010cru', loadComponent: () => import('./fin51010-cru/fin51010-cru.component').then(m => m.FIN51010CRUComponent), data: { progNo: 'FIN51010' } },
  { path: 'fin51011', loadComponent: () => import('./fin51011/fin51011.component').then(m => m.FIN51011Component), data: { progNo: 'FIN51011' } },

  // 基本資料作業-總帳參數維護
  { path: 'fin52010', loadComponent: () => import('./fin52010/fin52010.component').then(m => m.FIN52010Component), data: { progNo: 'FIN52010' } },
  // 基本資料作業-傳票型態設定維護
  { path: 'fin52020', loadComponent: () => import('./fin52020/fin52020.component').then(m => m.FIN52020Component), data: { progNo: 'FIN52020' } },
  { path: 'fin52020cru', loadComponent: () => import('./fin52020-cru/fin52020-cru.component').then(m => m.FIN52020CRUComponent), data: { progNo: 'FIN52020' } },
  // 基本資料作業-常用傳票維護
  { path: 'fin52030', loadComponent: () => import('./fin52030/fin52030.component').then(m => m.FIN52030Component), data: { progNo: 'FIN52030' } },
  { path: 'fin52030cru', loadComponent: () => import('./fin52030-cru/fin52030-cru.component').then(m => m.FIN52030CRUComponent), data: { progNo: 'FIN52030' } },
  // 基本資料作業-對象及對帳維護作業
  { path: 'fin52040', loadComponent: () => import('./fin52040/fin52040.component').then(m => m.FIN52040Component), data: { progNo: 'FIN52040' } },
  { path: 'fin52040cru', loadComponent: () => import('./fin52040-cru/fin52040-cru.component').then(m => m.FIN52040CRUComponent), data: { progNo: 'FIN52040' } },
  // 會計科目作業-科目大分類代號維護
  { path: 'fin52050', loadComponent: () => import('./fin52050/fin52050.component').then(m => m.FIN52050Component), data: { progNo: 'FIN52050' } },
  { path: 'fin52050cru', loadComponent: () => import('./fin52050-cru/fin52050-cru.component').then(m => m.FIN52050CRUComponent), data: { progNo: 'FIN52050' } },
  // 會計科目作業-科目中分類代號維護
  { path: 'fin52060', loadComponent: () => import('./fin52060/fin52060.component').then(m => m.FIN52060Component), data: { progNo: 'FIN52060' } },
  { path: 'fin52060cru', loadComponent: () => import('./fin52060-cru/fin52060-cru.component').then(m => m.FIN52060CRUComponent), data: { progNo: 'FIN52060' } },
  // 會計科目作業-科目三碼代號維護
  { path: 'fin52070', loadComponent: () => import('./fin52070/fin52070.component').then(m => m.FIN52070Component), data: { progNo: 'FIN52070' } },
  { path: 'fin52070cru', loadComponent: () => import('./fin52070-cru/fin52070-cru.component').then(m => m.FIN52070CRUComponent), data: { progNo: 'FIN52070' } },
  // 會計科目作業-會計科目代號維護
  { path: 'fin52080', loadComponent: () => import('./fin52080/fin52080.component').then(m => m.FIN52080Component), data: { progNo: 'FIN52080' } },
  { path: 'fin52080cru', loadComponent: () => import('./fin52080-cru/fin52080-cru.component').then(m => m.FIN52080CRUComponent), data: { progNo: 'FIN52080' } },
  // 會計科目作業-會計科目摘要維護
  { path: 'fin52090', loadComponent: () => import('./fin52090/fin52090.component').then(m => m.FIN52090Component), data: { progNo: 'FIN52090' } },
  { path: 'fin52090cru', loadComponent: () => import('./fin52090-cru/fin52090-cru.component').then(m => m.FIN52090CRUComponent), data: { progNo: 'FIN52090' } },
  // 傳票登入作業-傳票資料維護
  { path: 'fin53010', loadComponent: () => import('./fin53010/fin53010.component').then(m => m.FIN53010Component), data: { progNo: 'FIN53010' } },
  { path: 'fin53010cru', loadComponent: () => import('./fin53010-cru/fin53010-cru.component').then(m => m.FIN53010CRUComponent), data: { progNo: 'FIN53010' } },
  // 傳票過帳作業-傳票過帳
  { path: 'fin54020', loadComponent: () => import('./fin54020/fin54020.component').then(m => m.FIN54020Component), data: { progNo: 'FIN54020' } },
  // 傳票過帳作業-傳票反過帳
  { path: 'fin54025', loadComponent: () => import('./fin54025/fin54025.component').then(m => m.FIN54025Component) },
  // 傳票關帳作業-關帳作業
  { path: 'fin54030', loadComponent: () => import('./fin54030/fin54030.component').then(m => m.FIN54030Component), data: { progNo: 'FIN54030' } },
  // 傳票關帳作業-反關帳作業
  { path: 'fin54035', loadComponent: () => import('./fin54035/fin54035.component').then(m => m.FIN54035Component), data: { progNo: 'FIN54035' } },
  // 年結作業-過帳資料年結處理作業
  { path: 'fin54040', loadComponent: () => import('./fin54040/fin54040.component').then(m => m.FIN54040Component), data: { progNo: 'FIN54040' } },
  // { path: 'fin54040cru', loadComponent: () => import('./fin54040-cru/fin54040-cru.component').then(m => m.FIN54040CRUComponent),data: { progNo: 'FIN54040'} },
  // 年結作業-反年結作業
  { path: 'fin54045', loadComponent: () => import('./fin54045/fin54045.component').then(m => m.FIN54045Component) },
  // { path: 'fin54045CRU', loadComponent: () => import('./fin54045-cru/fin54045-cru.component').then(m => m.FIN54045CRUComponent),data: { progNo: 'FIN54045'} },
  // 總帳報表-傳票列印
  { path: 'fin55010', loadComponent: () => import('./fin55010/fin55010.component').then(m => m.FIN55010Component), data: { progNo: 'FIN55010' } },
  { path: 'fin55010cru', loadComponent: () => import('./fin55010-cru/fin55010-cru.component').then(m => m.FIN55010CRUComponent), data: { progNo: 'FIN55010' } },
  // 總帳報表-日記帳表
  { path: 'fin55020', loadComponent: () => import('./fin55020/fin55020.component').then(m => m.FIN55020Component), data: { progNo: 'FIN55020' } },
  // 總帳報表-立沖科目餘額表
  { path: 'fin55030', loadComponent: () => import('./fin55030/fin55030.component').then(m => m.FIN55030Component), data: { progNo: 'FIN55030' } },
  // 總帳報表-立沖科目明細表
  { path: 'fin55040', loadComponent: () => import('./fin55040/fin55040.component').then(m => m.FIN55040Component), data: { progNo: 'FIN55040' } },
  // 總帳報表-分類帳
  { path: 'fin55050', loadComponent: () => import('./fin55050/fin55050.component').then(m => m.FIN55050Component), data: { progNo: 'FIN55050' } },
  { path: 'fin55050cru', loadComponent: () => import('./fin55050-cru/fin55050-cru.component').then(m => m.FIN55050CRUComponent), data: { progNo: 'FIN55050' } },
  // 總帳報表-分類帳彙總報表
  { path: 'fin55060', loadComponent: () => import('./fin55060/fin55060.component').then(m => m.FIN55060Component), data: { progNo: 'FIN55060' } },
  // 總帳報表-試算表
  { path: 'fin55070', loadComponent: () => import('./fin55070/fin55070.component').then(m => m.FIN55070Component), data: { progNo: 'FIN55070' } },
  // 總帳報表-損益表
  { path: 'fin55080', loadComponent: () => import('./fin55080/fin55080.component').then(m => m.FIN55080Component), data: { progNo: 'FIN55080' } },
  // 總帳報表-當期/累計損益表
  { path: 'fin55090', loadComponent: () => import('./fin55090/fin55090.component').then(m => m.FIN55090Component), data: { progNo: 'FIN55090' } },
  // 總帳報表-損益比較表
  { path: 'fin55100', loadComponent: () => import('./fin55100/fin55100.component').then(m => m.FIN55100Component), data: { progNo: 'FIN55100' } },
  // 總帳報表-部門科目明細表
  { path: 'fin55110', loadComponent: () => import('./fin55110/fin55110.component').then(m => m.FIN55110Component), data: { progNo: 'FIN55110' } },
  // 總帳報表-資產負債表
  { path: 'fin55120', loadComponent: () => import('./fin55120/fin55120.component').then(m => m.FIN55120Component), data: { progNo: 'FIN55120' } },
  { path: 'fin55120cru', loadComponent: () => import('./fin55120/fin55120cru/fin55120cru.component').then(m => m.Fin55120cruComponent), data: { progNo: 'FIN55120' } },
  { path: 'fin55120detail', loadComponent: () => import('./fin55120/fin55120-detail/fin55120-detail.component').then(m => m.Fin55120DetailComponent), data: { progNo: 'FIN55120' } },
  // 總帳報表-資產負債比較表
  { path: 'fin55130', loadComponent: () => import('./fin55130/fin55130.component').then(m => m.FIN55130Component), data: { progNo: 'FIN55130' } },
  { path: 'fin55130cru', loadComponent: () => import('./fin55130/fin55130cru/fin55130cru.component').then(m => m.Fin55130cruComponent), data: { progNo: 'FIN55130' } },
  { path: 'fin55130detail', loadComponent: () => import('./fin55130/fin55130-detail/fin55130-detail.component').then(m => m.Fin55130DetailComponent), data: { progNo: 'FIN55130' } },
  // 支票號碼維護
  { path: 'fin61010', loadComponent: () => import('./fin61010/fin61010.component').then(m => m.FIN61010Component), data: { progNo: 'FIN61010' } },
  { path: 'fin61010cru', loadComponent: () => import('./fin61010-cru/fin61010-cru.component').then(m => m.FIN61010CRUComponent), data: { progNo: 'FIN61010' } },
  // 業務員資料維護
  { path: 'fin61020', loadComponent: () => import('./fin61020/fin61020.component').then(m => m.FIN61020Component), data: { progNo: 'FIN61020' } },
  { path: 'fin61020cru', loadComponent: () => import('./fin61020-cru/fin61020-cru.component').then(m => m.FIN61020CRUComponent), data: { progNo: 'FIN61020' } },
  // 銀行調撥作業
  { path: 'fin62010', loadComponent: () => import('./fin62010/fin62010.component').then(m => m.FIN62010Component), data: { progNo: 'FIN62010' } },
  { path: 'fin62010cru', loadComponent: () => import('./fin62010-cru/fin62010-cru.component').then(m => m.FIN62010CRUComponent), data: { progNo: 'FIN62010' } },
  // 銀行資金調撥單
  { path: 'fin62020', loadComponent: () => import('./fin62020/fin62020.component').then(m => m.FIN62020Component), data: { progNo: 'FIN62020' } },
  // 銀行調撥傳票拋轉作業
  { path: 'fin62030', loadComponent: () => import('./fin62030/fin62030.component').then(m => m.FIN62030Component), data: { progNo: 'FIN62030' } },
  { path: 'fin62030cru', loadComponent: () => import('./fin62030-cru/fin62030-cru.component').then(m => m.FIN62030CRUComponent), data: { progNo: 'FIN62030' } },
  // 出納區間報表
  // { path: 'fin62040', loadComponent: () => import('./fin62040/fin62040.component').then(m => m.FIN62040Component),data:{progNo:'FIN62040'} },
  // { path: 'fin62040cru', loadComponent: () => import('./fin62040-cru/fin62040-cru.component').then(m => m.FIN62040CRUComponent),data: { progNo: 'FIN62040'} },
  // 銀行往來調節表
  // { path: 'fin62050', loadComponent: () => import('./fin62050/fin62050.component').then(m => m.FIN62050Component),data:{progNo:'FIN62050'} },
  // { path: 'fin62050cru', loadComponent: () => import('./fin62050-cru/fin62050-cru.component').then(m => m.FIN62050CRUComponent),data: { progNo: 'FIN62050'} },
  // 套印支票 - 票據套印
  // { path: 'fin63010', loadComponent: () => import('./fin63010/fin63010.component').then(m => m.FIN63010Component),data:{progNo:'FIN63010'} },
  // { path: 'fin63010cru', loadComponent: () => import('./fin63010-cru/fin63010-cru.component').then(m => m.FIN63010CRUComponent),data: { progNo: 'FIN63010'} },
  // 應付票據維護作業
  { path: 'fin63020', loadComponent: () => import('./fin63020/fin63020.component').then(m => m.FIN63020Component), data: { progNo: 'FIN63020' } },
  { path: 'fin63020cru', loadComponent: () => import('./fin63020-cru/fin63020-cru.component').then(m => m.FIN63020CRUComponent), data: { progNo: 'FIN63020' } },
  // 應付票據到期作業
  { path: 'fin63030', loadComponent: () => import('./fin63030/fin63030.component').then(m => m.FIN63030Component), data: { progNo: 'FIN63030' } },

  // 應付票據兌現作業
  { path: 'fin63040', loadComponent: () => import('./fin63040/fin63040.component').then(m => m.FIN63040Component), data: { progNo: 'FIN63040' } },
  { path: 'fin63040cru', loadComponent: () => import('./fin63040-cru/fin63040-cru.component').then(m => m.FIN63040CRUComponent), data: { progNo: 'FIN63040' } },
  // 應付票據撤票作業
  { path: 'fin63050', loadComponent: () => import('./fin63050/fin63050.component').then(m => m.FIN63050Component), data: { progNo: 'FIN63050' } },
  { path: 'fin63050cru', loadComponent: () => import('./fin63050-cru/fin63050-cru.component').then(m => m.FIN63050CRUComponent), data: { progNo: 'FIN63050' } },
  // 應付票據退票作業
  // { path: 'fin63060', loadComponent: () => import('./fin63060/fin63060.component').then(m => m.FIN63060Component),data:{progNo:'FIN63060'} },
  // { path: 'fin63060cru', loadComponent: () => import('./fin63060-cru/fin63060-cru.component').then(m => m.FIN63060CRUComponent),data: { progNo: 'FIN63060'} },
  // 應收票據維護作業
  { path: 'fin64010', loadComponent: () => import('./fin64010/fin64010.component').then(m => m.FIN64010Component), data: { progNo: 'FIN64010' } },
  { path: 'fin64010cru', loadComponent: () => import('./fin64010-cru/fin64010-cru.component').then(m => m.FIN64010CRUComponent), data: { progNo: 'FIN64010' } },
  // 應收票據託收作業
  { path: 'fin64020', loadComponent: () => import('./fin64020/fin64020.component').then(m => m.FIN64020Component), data: { progNo: 'FIN64020' } },
  // 應收票據兌現作業
  { path: 'fin64030', loadComponent: () => import('./fin64030/fin64030.component').then(m => m.FIN64030Component), data: { progNo: 'FIN64030' } },
  // 應收票據退票作業
  { path: 'fin64050', loadComponent: () => import('./fin64050/fin64050.component').then(m => m.FIN64050Component), data: { progNo: 'FIN64050' } },
  { path: 'fin64050cru', loadComponent: () => import('./fin64050-cru/fin64050-cru.component').then(m => m.FIN64050CRUComponent), data: { progNo: 'FIN64050' } },
  // 應付票據簽回單
  // { path: 'fin65010', loadComponent: () => import('./fin65010/fin65010.component').then(m => m.FIN65010Component),data:{progNo:'FIN65010'} },
  // { path: 'fin65010cru', loadComponent: () => import('./fin65010-cru/fin65010-cru.component').then(m => m.FIN65010CRUComponent),data: { progNo: 'FIN65010'} },
  // 零用金參數維護
  { path: 'fin71010', loadComponent: () => import('./fin71010/fin71010.component').then(m => m.FIN71010Component), data: { progNo: 'FIN71010' } },
  { path: 'fin71010cru', loadComponent: () => import('./fin71010-cru/fin71010-cru.component').then(m => m.FIN71010CRUComponent), data: { progNo: 'FIN71010' } },
  // 保管人及額度設定作業
  { path: 'fin71020', loadComponent: () => import('./fin71020/fin71020.component').then(m => m.FIN71020Component), data: { progNo: 'FIN71020' } },
  { path: 'fin71020cru', loadComponent: () => import('./fin71020-cru/fin71020-cru.component').then(m => m.FIN71020CRUComponent), data: { progNo: 'FIN71020' } },
  // 零用金維護作業
  { path: 'fin72010', loadComponent: () => import('./fin72010/fin72010.component').then(m => m.FIN72010Component), data: { progNo: 'FIN72010' } },
  { path: 'fin72010cru', loadComponent: () => import('./fin72010-cru/fin72010-cru.component').then(m => m.FIN72010CRUComponent), data: { progNo: 'FIN72010' } },
  // 零用金請款作業
  { path: 'fin72020', loadComponent: () => import('./fin72020/fin72020.component').then(m => m.FIN72020Component), data: { progNo: 'FIN72020' } },
  { path: 'fin72020cru', loadComponent: () => import('./fin72020-cru/fin72020-cru.component').then(m => m.FIN72020CRUComponent), data: { progNo: 'FIN72020' } },
  // 零用金拋轉作業
  { path: 'fin72030', loadComponent: () => import('./fin72030/fin72030.component').then(m => m.FIN72030Component), data: { progNo: 'FIN72030' } },
  // { path: 'fin72030cru', loadComponent: () => import('./fin72030-cru/fin72030-cru.component').then(m => m.FIN72030CRUComponent),data: { progNo: 'FIN72030'} },
  // 零用金撥補作業
  { path: 'fin72040', loadComponent: () => import('./fin72040/fin72040.component').then(m => m.FIN72040Component), data: { progNo: 'FIN72040' } },
  // { path: 'fin72040cru', loadComponent: () => import('./fin72040-cru/fin72040-cru.component').then(m => m.FIN72040CRUComponent),data: { progNo: 'FIN72040'} },
  // 零用金盤點作業
  { path: 'fin72050', loadComponent: () => import('./fin72050/fin72050.component').then(m => m.FIN72050Component), data: { progNo: 'FIN72050' } },
  { path: 'fin72050cru', loadComponent: () => import('./fin72050-cru/fin72050-cru.component').then(m => m.FIN72050CRUComponent), data: { progNo: 'FIN72050' } },
  // 零用金支付表
  { path: 'fin73010', loadComponent: () => import('./fin73010/fin73010.component').then(m => m.FIN73010Component), data: { progNo: 'FIN73010' } },
  // 支出請款單表
  { path: 'fin73020', loadComponent: () => import('./fin73020/fin73020.component').then(m => m.FIN73020Component), data: { progNo: 'FIN73020' } },
  // { path: 'fin73020cru', loadComponent: () => import('./fin73020-cru/fin73020-cru.component').then(m => m.FIN73020CRUComponent),data: { progNo: 'FIN73020'} },
  // 支付申請單
  { path: 'fin73030', loadComponent: () => import('./fin73030/fin73030.component').then(m => m.FIN73030Component), data: { progNo: 'FIN73030' } },
  // 零用金撥補明細表
  { path: 'fin73040', loadComponent: () => import('./fin73040/fin73040.component').then(m => m.FIN73040Component),data:{progNo:'FIN73040'} },
];
