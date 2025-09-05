import { Routes } from '@angular/router';

export const tlsRoutes: Routes = [
  // 專櫃位置資料維護
  { path: 'tls11010', loadComponent: () => import('./tls11010/tls11010.component').then(m => m.TLS11010Component) },
  // 扣款項目維護作業
  { path: 'tls11020', loadComponent: () => import('./tls11020/tls11020.component').then(m => m.TLS11020Component) },
  // 潛在客戶資料維護
  { path: 'tls12010', loadComponent: () => import('./tls12010/tls12010.component').then(m => m.TLS12010Component) },
  // 專櫃訪談記錄維護
  { path: 'tls12020', loadComponent: () => import('./tls12020/tls12020.component').then(m => m.TLS12020Component) },
  // 專櫃要約書維護
  { path: 'tls12040', loadComponent: () => import('./tls12040/tls12040.component').then(m => m.TLS12040Component) },
  // 專櫃位置圖
  { path: 'tls12050', loadComponent: () => import('./tls12050/tls12050.component').then(m => m.TLS12050Component) },
  // 招商進度監控
  { path: 'tls12060', loadComponent: () => import('./tls12060/tls12060.component').then(m => m.TLS12060Component) },
  // 專櫃訪談紀錄追蹤表
  { path: 'tls12070', loadComponent: () => import('./tls12070/tls12070.component').then(m => m.TLS12070Component) },
  // 專櫃契約書維護
  { path: 'tls13010', loadComponent: () => import('./tls13010/tls13010.component').then(m => m.TLS13010Component) },
  // 專櫃契約書續約維護作業
  { path: 'tls13020', loadComponent: () => import('./tls13020/tls13020.component').then(m => m.TLS13020Component) },
  // 專櫃契約代扣款報表
  { path: 'tls13030', loadComponent: () => import('./tls13030/tls13030.component').then(m => m.TLS13030Component) },
  // 專櫃契約抽成報表
  { path: 'tls13040', loadComponent: () => import('./tls13040/tls13040.component').then(m => m.TLS13040Component) },
  // 年度目標營業額管制報表
  { path: 'tls13050', loadComponent: () => import('./tls13050/tls13050.component').then(m => m.TLS13050Component) },
  // 櫃位營運事項明細查詢作業
  { path: 'tls13060', loadComponent: () => import('./tls13060/tls13060.component').then(m => m.TLS13060Component) },
  // 調整櫃位合約一覽表
  { path: 'tls13070', loadComponent: () => import('./tls13070/tls13070.component').then(m => m.TLS13070Component) },
  // 合約狀態清單
  { path: 'tls14010', loadComponent: () => import('./tls14010/tls14010.component').then(m => m.TLS14010Component) },
  // 專櫃契約書列印
  { path: 'tls14020', loadComponent: () => import('./tls14020/tls14020.component').then(m => m.TLS14020Component) },
  // 保證票維護作業
  { path: 'tls14030', loadComponent: () => import('./tls14030/tls14030.component').then(m => m.Tls14030Component) },
  // 保證票彙總表
  { path: 'tls14040', loadComponent: () => import('./tls14040/tls14040.component').then(m => m.Tls14040Component) },
  // 專櫃位置資料維護 CRU
  { path: 'tls11010cru', loadComponent: () => import('./tls11010-cru/tls11010-cru.component').then(m => m.TLS11010CRUComponent) },
  // 扣款項目維護作業 CRU
  { path: 'tls11020cru', loadComponent: () => import('./tls11020-cru/tls11020-cru.component').then(m => m.TLS11020CRUComponent) },
  // 潛在客戶資料維護 CRU
  { path: 'tls12010cru', loadComponent: () => import('./tls12010-cru/tls12010-cru.component').then(m => m.TLS12010CRUComponent) },
  // 專櫃訪談記錄維護 CRU
  { path: 'tls12020cru', loadComponent: () => import('./tls12020-cru/tls12020-cru.component').then(m => m.TLS12020CRUComponent) },
  // 專櫃要約書維護 CRU
  { path: 'tls12040cru', loadComponent: () => import('./tls12040-cru/tls12040-cru.component').then(m => m.TLS12040CRUComponent) },
  // 專櫃要約書維護 next1
  { path: 'tls12040next1', loadComponent: () => import('./tls12040-next1/tls12040-next1.component').then(m => m.TLS12040Next1Component) },
  // 專櫃位置圖 CRU
  { path: 'tls12050cru', loadComponent: () => import('./tls12050-cru/tls12050-cru.component').then(m => m.TLS12050CRUComponent) },
  // 專櫃契約書維護 CRU
  { path: 'tls13010cru', loadComponent: () => import('./tls13010-cru/tls13010-cru.component').then(m => m.TLS13010CRUComponent) },
  // 專櫃契約書續約維護作業 CRU
  { path: 'tls13020cru', loadComponent: () => import('./tls13020-cru/tls13020-cru.component').then(m => m.TLS13020CRUComponent) },
  // 專櫃契約代扣款報表 CRU
  { path: 'tls13030cru', loadComponent: () => import('./tls13030-cru/tls13030-cru.component').then(m => m.TLS13030CRUComponent) },
  // 專櫃契約抽成報表
  { path: 'tls13040cru', loadComponent: () => import('./tls13040-cru/tls13040-cru.component').then(m => m.TLS13040CRUComponent) },
  // 年度目標營業額管制報表 CRU
  { path: 'tls13050cru', loadComponent: () => import('./tls13050-cru/tls13050-cru.component').then(m => m.TLS13050CRUComponent) },
  // 櫃位營運事項明細查詢作業 CRU
  { path: 'tls13060cru', loadComponent: () => import('./tls13060-cru/tls13060-cru.component').then(m => m.TLS13060CRUComponent) },
  // 調整櫃位合約一覽表 CRU
  { path: 'tls13070cru', loadComponent: () => import('./tls13070-cru/tls13070-cru.component').then(m => m.TLS13070CRUComponent) },
  // 合約狀態清單 CRU
  { path: 'tls14010cru', loadComponent: () => import('./tls14010-cru/tls14010-cru.component').then(m => m.TLS14010CRUComponent) },
  // 專櫃契約書列印 CRU
  { path: 'tls14020cru', loadComponent: () => import('./tls14020-cru/tls14020-cru.component').then(m => m.TLS14020CRUComponent) },
  // 保證票維護作業 CRU
  { path: 'tls14030cru', loadComponent: () => import('./tls14030-cru/tls14030-cru.component').then(m => m.Tls14030CRUComponent) },
  // 保證票彙總表 CRU
  { path: 'tls14040cru', loadComponent: () => import('./tls14040-cru/tls14040-cru.component').then(m => m.Tls14040CRUComponent) },
  // 專櫃契約書維護 NEXT1
  { path: 'tls13010next1', loadComponent: () => import('./tls13010-next1/tls13010-next1.component').then(m => m.TLS13010Next1Component) },
  // 專櫃契約書維護 NEXT2
  { path: 'tls13010next2', loadComponent: () => import('./tls13010-next2/tls13010-next2.component').then(m => m.TLS13010Next2Component) },
  // 專櫃契約書維護 NEXT3
  { path: 'tls13010next3', loadComponent: () => import('./tls13010-next3/tls13010-next3.component').then(m => m.Tls13010Next3Component) },
  // 傳票項目之會計科目設定作業
  // { path: 'tls21010', loadComponent: () => import('./tls21010/tls21010.component').then(m => m.TLS21010Component) },
  // 傳票項目之會計科目設定作業_NEW
  { path: 'tls21020', loadComponent: () => import('./tls21020/tls21020.component').then(m => m.TLS21020Component) },
  // 對帳單備註維護作業
  { path: 'tls21030', loadComponent: () => import('./tls21030/tls21030.component').then(m => m.TLS21030Component) },
  // 信用卡之卡種維護作業
  { path: 'tls21040', loadComponent: () => import('./tls21040/tls21040.component').then(m => m.TLS21040Component) },
  // 專櫃營運前參數設定作業
  { path: 'tls21050', loadComponent: () => import('./tls21050/tls21050.component').then(m => m.TLS21050Component) },
  // 收銀機對帳查詢作業
  { path: 'tls22010', loadComponent: () => import('./tls22010/tls22010.component').then(m => m.TLS22010Component) },
  // 系統監控報表
  { path: 'tls22020', loadComponent: () => import('./tls22020/tls22020.component').then(m => m.TLS22020Component) },
  // 序號報表
  { path: 'tls22030', loadComponent: () => import('./tls22030/tls22030.component').then(m => m.TLS22030Component) },
  // 電子發票上送筆數檢核表
  { path: 'tls22040', loadComponent: () => import('./tls22040/tls22040.component').then(m => m.TLS22040Component) },
  // 第三方支付帳差報表
  { path: 'tls22050', loadComponent: () => import('./tls22050/tls22050.component').then(m => m.TLS22050Component) },
  // 型態別報表
  { path: 'tls23010', loadComponent: () => import('./tls23010/tls23010.component').then(m => m.TLS23010Component) },
  // 折扣別報表
  { path: 'tls23020', loadComponent: () => import('./tls23020/tls23020.component').then(m => m.TLS23020Component) },
  // 付款別報表
  { path: 'tls23030', loadComponent: () => import('./tls23030/tls23030.component').then(m => m.TLS23030Component) },
  // 發票報表
  { path: 'tls23040', loadComponent: () => import('./tls23040/tls23040.component').then(m => m.TLS23040Component) },
  // 收銀機日報表
  { path: 'tls23050', loadComponent: () => import('./tls23050/tls23050.component').then(m => m.TLS23050Component) },
  // 收銀機區間報表
  { path: 'tls23060', loadComponent: () => import('./tls23060/tls23060.component').then(m => m.TLS23060Component) },
  // 專櫃收銀機月報表
  { path: 'tls23070', loadComponent: () => import('./tls23070/tls23070.component').then(m => m.TLS23070Component) },
  // 支付工具實收報表
  { path: 'tls23080', loadComponent: () => import('./tls23080/tls23080.component').then(m => m.TLS23080Component) },
  // 信用卡明細表
  { path: 'tls23090', loadComponent: () => import('./tls23090/tls23090.component').then(m => m.TLS23090Component) },
  // 付款別明細表
  { path: 'tls23100', loadComponent: () => import('./tls23100/tls23100.component').then(m => m.TLS23100Component) },
  // 折扣別月報表
  { path: 'tls23110', loadComponent: () => import('./tls23110/tls23110.component').then(m => m.TLS23110Component) },
  // 專櫃日對帳單
  { path: 'tls23120', loadComponent: () => import('./tls23120/tls23120.component').then(m => m.TLS23120Component) },
  // 信用卡銷貨月報表
  { path: 'tls23130', loadComponent: () => import('./tls23130/tls23130.component').then(m => m.TLS23130Component) },
  // !!!如果沒這隻的話記得刪 有價券查詢報表
  { path: 'tls23140', loadComponent: () => import('./tls23140/tls23140.component').then(m => m.TLS23140Component) },
  // 交易補登作業
  { path: 'tls24010', loadComponent: () => import('./tls24010/tls24010.component').then(m => m.TLS24010Component) },
  // 交易資料修正報表
  { path: 'tls24080', loadComponent: () => import('./tls24080/tls24080.component').then(m => m.TLS24080Component) },
  // 商場違規扣款維護作業
  { path: 'tls25030', loadComponent: () => import('./tls25030/tls25030.component').then(m => m.TLS25030Component) },
  // 預購活動檔期設定
  { path: 'tls26010', loadComponent: () => import('./tls26010/tls26010.component').then(m => m.TLS26010Component) },
  // 預售總表
  { path: 'tls26020', loadComponent: () => import('./tls26020/tls26020.component').then(m => m.TLS26020Component) },
  // 預售明細表
  { path: 'tls26030', loadComponent: () => import('./tls26030/tls26030.component').then(m => m.TLS26030Component) },
  // 預售管理作業
  { path: 'tls26040', loadComponent: () => import('./tls26040/tls26040.component').then(m => m.TLS26040Component) },
  // 專櫃活動設定作業
  { path: 'tls26080', loadComponent: () => import('./tls26080/tls26080.component').then(m => m.TLS26080Component) },
  // 保全現金資料轉入作業
  { path: 'tls27010', loadComponent: () => import('./tls27010/tls27010.component').then(m => m.TLS27010Component) },
  // 保全實收現金調整作業
  { path: 'tls27020', loadComponent: () => import('./tls27020/tls27020.component').then(m => m.TLS27020Component) },
  // 信用卡資料轉入作業
  { path: 'tls27030', loadComponent: () => import('./tls27030/tls27030.component').then(m => m.TLS27030Component) },
  // 實收信用卡調整作業
  { path: 'tls27040', loadComponent: () => import('./tls27040/tls27040.component').then(m => m.TLS27040Component) },
  // 查詢無系統帳資料報表
  { path: 'tls27050', loadComponent: () => import('./tls27050/tls27050.component').then(m => m.TLS27050Component) },
  // 總袋作業
  { path: 'tls28020', loadComponent: () => import('./tls28020/tls28020.component').then(m => m.TLS28020Component) },
  // 總袋狀況表
  { path: 'tls28030', loadComponent: () => import('./tls28030/tls28030.component').then(m => m.TLS28030Component) },
  // 收銀員領袋表
  { path: 'tls28050', loadComponent: () => import('./tls28050/tls28050.component').then(m => m.TLS28050Component) },
  // 折扣開放維護作業
  { path: 'tls29010', loadComponent: () => import('./tls29010/tls29010.component').then(m => m.TLS29010Component) },
  // 各支付工具審核作業
  { path: 'tls2a010', loadComponent: () => import('./tls2a010/tls2a010.component').then(m => m.TLS2A010Component) },
  // 未審核收銀機台報表
  { path: 'tls2a020', loadComponent: () => import('./tls2a020/tls2a020.component').then(m => m.TLS2A020Component) },
  // 溢欠彙總表
  { path: 'tls2a030', loadComponent: () => import('./tls2a030/tls2a030.component').then(m => m.TLS2A030Component) },
  // 缺單據/作廢發票報表
  { path: 'tls2a040', loadComponent: () => import('./tls2a040/tls2a040.component').then(m => m.TLS2A040Component) },
  // 第三方支付帳差報表
  { path: 'tls2a050', loadComponent: () => import('./tls2a050/tls2a050.component').then(m => m.TLS2A050Component) },
  // 收銀員溢欠表(日)
  { path: 'tls2b010', loadComponent: () => import('./tls2b010/tls2b010.component').then(m => m.TLS2B010Component) },
  // 收銀員溢欠表(月)
  { path: 'tls2b020', loadComponent: () => import('./tls2b020/tls2b020.component').then(m => m.TLS2B020Component) },
  // 專櫃收銀機台溢欠表
  { path: 'tls2b030', loadComponent: () => import('./tls2b030/tls2b030.component').then(m => m.TLS2B030Component) },
  // 專櫃日暫存傳票報表
  { path: 'tls2c010', loadComponent: () => import('./tls2c010/tls2c010.component').then(m => m.TLS2C010Component) },
  // 日結前檢查作業
  { path: 'tls2c020', loadComponent: () => import('./tls2c020/tls2c020.component').then(m => m.TLS2C020Component) },
  // 日結關帳作業
  { path: 'tls2c030', loadComponent: () => import('./tls2c030/tls2c030.component').then(m => m.TLS2C030Component) },
  // 專櫃暫存傳票查詢作業
  { path: 'tls2c040', loadComponent: () => import('./tls2c040/tls2c040.component').then(m => m.TLS2C040Component) },
  // 發票匯總作業
  { path: 'tls2c050', loadComponent: () => import('./tls2c050/tls2c050.component').then(m => m.TLS2C050Component) },
  // 代扣款補登作業
  { path: 'tls2d010', loadComponent: () => import('./tls2d010/tls2d010.component').then(m => m.TLS2D010Component) },
  // 專櫃代扣款試算作業
  { path: 'tls2d020', loadComponent: () => import('./tls2d020/tls2d020.component').then(m => m.TLS2D020Component) },
  // 專櫃代扣款結算作業
  { path: 'tls2d030', loadComponent: () => import('./tls2d030/tls2d030.component').then(m => m.TLS2D030Component) },
  // 專櫃代扣款明細表
  { path: 'tls2d040', loadComponent: () => import('./tls2d040/tls2d040.component').then(m => m.TLS2D040Component) },
  // 部門使用券類設定作業
  { path: 'tls2d050', loadComponent: () => import('./tls2d050/tls2d050.component').then(m => m.TLS2D050Component) },
  // 專櫃租金結算作業
  { path: 'tls2e010', loadComponent: () => import('./tls2e010/tls2e010.component').then(m => m.TLS2E010Component) },
  // 專櫃抽成金額結算作業
  { path: 'tls2e020', loadComponent: () => import('./tls2e020/tls2e020.component').then(m => m.TLS2E020Component) },
  // 專櫃帳款試算作業
  { path: 'tls2e030', loadComponent: () => import('./tls2e030/tls2e030.component').then(m => m.TLS2E030Component) },
  // 專櫃帳款試算彙總表
  { path: 'tls2e050', loadComponent: () => import('./tls2e050/tls2e050.component').then(m => m.TLS2E050Component) },
  // 專櫃結帳前調整作業
  { path: 'tls2e060', loadComponent: () => import('./tls2e060/tls2e060.component').then(m => m.TLS2E060Component) },
  // 專櫃帳款結算作業
  { path: 'tls2e070', loadComponent: () => import('./tls2e070/tls2e070.component').then(m => m.TLS2E070Component) },
  // 專櫃對帳單
  { path: 'tls2e080', loadComponent: () => import('./tls2e080/tls2e080.component').then(m => m.TLS2E080Component) },
  // 專櫃帳款結算彙總表
  { path: 'tls2e090', loadComponent: () => import('./tls2e090/tls2e090.component').then(m => m.TLS2E090Component) },
  // 年度對帳單
  { path: 'tls2e100', loadComponent: () => import('./tls2e100/tls2e100.component').then(m => m.TLS2E100Component) },
  // 廠商發票請款登入暨維護作業
  { path: 'tls2F010', loadComponent: () => import('./tls2f010/tls2f010.component').then(m => m.TLS2F010Component) },
  // 專櫃暫存應付帳款產生作業
  { path: 'tls2F020', loadComponent: () => import('./tls2f020/tls2f020.component').then(m => m.TLS2F020Component) },
  // 專櫃進項發票未開立查詢作業
  { path: 'tls2f030', loadComponent: () => import('./tls2f030/tls2f030.component').then(m => m.TLS2F030Component) },
  // 專櫃預估業績轉入作業
  { path: 'tls2g010', loadComponent: () => import('./tls2g010/tls2g010.component').then(m => m.TLS2G010Component) },
  // 專櫃預估業績維護作業
  { path: 'tls2g020', loadComponent: () => import('./tls2g020/tls2g020.component').then(m => m.TLS2G020Component) },
  // 專櫃預估業績報表
  { path: 'tls2g030', loadComponent: () => import('./tls2g030/tls2g030.component').then(m => m.TLS2G030Component) },
  // 預算日報表
  { path: 'tls2g040', loadComponent: () => import('./tls2g040/tls2g040.component').then(m => m.TLS2G040Component) },
  // 租金發票套印作業
  { path: 'tls2h010', loadComponent: () => import('./tls2h010/tls2h010.component').then(m => m.TLS2H010Component) },
  // 專櫃代扣款發票套印作業
  { path: 'tls2h020', loadComponent: () => import('./tls2h020/tls2h020.component').then(m => m.TLS2H020Component) },
  // 專櫃抽成發票套印作業
  { path: 'tls2h030', loadComponent: () => import('./tls2h030/tls2h030.component').then(m => m.TLS2H030Component) },
  // 換開品項維護作業
  { path: 'tls2j010', loadComponent: () => import('./tls2j010/tls2j010.component').then(m => m.TLS2J010Component) },
  // 大分類換開品項維護作業
  { path: 'tls2j020', loadComponent: () => import('./tls2j020/tls2j020.component').then(m => m.TLS2J020Component) },
  // 後台發票換開補登作業
  { path: 'tls2j030', loadComponent: () => import('./tls2j030/tls2j030.component').then(m => m.TLS2J030Component) },
  // 發票換開作業
  { path: 'tls2j040', loadComponent: () => import('./tls2j040/tls2j040.component').then(m => m.TLS2J040Component) },
  // 餘代卡產卡作業
  { path: 'tls2k010', loadComponent: () => import('./tls2k010/tls2k010.component').then(m => m.TLS2K010Component) },
  // 餘代卡領卡作業
  { path: 'tls2k020', loadComponent: () => import('./tls2k020/tls2k020.component').then(m => m.TLS2K020Component) },
  // 餘代卡資料維護作業
  { path: 'tls2k030', loadComponent: () => import('./tls2k030/tls2k030.component').then(m => m.TLS2K030Component) },
  // 餘代卡交易補登作業
  { path: 'tls2k040', loadComponent: () => import('./tls2k040/tls2k040.component').then(m => m.TLS2K040Component) },
  // 餘代卡換卡作業
  { path: 'tls2k050', loadComponent: () => import('./tls2k050/tls2k050.component').then(m => m.TLS2K050Component) },
  // 餘代卡查詢報表
  { path: 'tls2k060', loadComponent: () => import('./tls2k060/tls2k060.component').then(m => m.TLS2K060Component) },
  // 傳票項目之會計科目設定作業 CRU
  // { path: 'tls21010cru', loadComponent: () => import('./tls21010-cru/tls21010-cru.component').then(m => m.TLS21010CRUComponent) },
  // 傳票項目之會計科目設定作業_NEW CRU
  { path: 'tls21020cru', loadComponent: () => import('./tls21020-cru/tls21020-cru.component').then(m => m.TLS21020CRUComponent) },
  // 對帳單備註維護作業 CRU
  { path: 'tls21030cru', loadComponent: () => import('./tls21030-cru/tls21030-cru.component').then(m => m.TLS21030CRUComponent) },
  // 信用卡之卡種維護作業 CRU
  { path: 'tls21040cru', loadComponent: () => import('./tls21040-cru/tls21040-cru.component').then(m => m.TLS21040CRUComponent) },
  // 專櫃營運前參數設定作業 CRU
  { path: 'tls21050cru', loadComponent: () => import('./tls21050-cru/tls21050-cru.component').then(m => m.TLS21050CRUComponent) },
  // 收銀機對帳查詢作業 CRU
  { path: 'tls22010cru', loadComponent: () => import('./tls22010-cru/tls22010-cru.component').then(m => m.TLS22010CRUComponent) },
  // 系統監控報表 CRU
  { path: 'tls22020cru', loadComponent: () => import('./tls22020-cru/tls22020-cru.component').then(m => m.TLS22020CRUComponent) },
  //電子發票上送筆數檢核表 CRU
  { path: 'tls22040cru', loadComponent: () => import('./tls22040-cru/tls22040-cru.component').then(m => m.TLS22040CRUComponent) },
  // 型態別報表 CRU
  { path: 'tls23010cru', loadComponent: () => import('./tls23010-cru/tls23010-cru.component').then(m => m.TLS23010CRUComponent) },
  // 型態別明細報表
  { path: 'tls23010cru', loadComponent: () => import('./tls23010-cru/tls23010-cru.component').then(m => m.TLS23010CRUComponent) },
  // 折扣別報表
  { path: 'tls23020cru', loadComponent: () => import('./tls23020-cru/tls23020-cru.component').then(m => m.TLS23020CRUComponent) },
  // 付款別報表
  { path: 'tls23030cru', loadComponent: () => import('./tls23030-cru/tls23030-cru.component').then(m => m.TLS23030CRUComponent) },
  // 發票報表
  { path: 'tls23040cru', loadComponent: () => import('./tls23040-cru/tls23040-cru.component').then(m => m.TLS23040CRUComponent) },
  // 收銀機日報表
  { path: 'tls23050cru', loadComponent: () => import('./tls23050-cru/tls23050-cru.component').then(m => m.TLS23050CRUComponent) },
  // 收銀機區間報表
  { path: 'tls23060cru', loadComponent: () => import('./tls23060-cru/tls23060-cru.component').then(m => m.TLS23060CRUComponent) },
  // 專櫃收銀機日報表
  { path: 'tls23070cru', loadComponent: () => import('./tls23070-cru/tls23070-cru.component').then(m => m.TLS23070CRUComponent) },
  // 支付工具資料收報表
  { path: 'tls23080cru', loadComponent: () => import('./tls23080-cru/tls23080-cru.component').then(m => m.TLS23080CRUComponent) },
  // 信用卡明細報表
  { path: 'tls23090cru', loadComponent: () => import('./tls23090-cru/tls23090-cru.component').then(m => m.TLS23090CRUComponent) },
  // 付款別明細報表
  { path: 'tls23100cru', loadComponent: () => import('./tls23100-cru/tls23100-cru.component').then(m => m.TLS23100CRUComponent) },
  // 折扣別明細報表
  { path: 'tls23110cru', loadComponent: () => import('./tls23110-cru/tls23110-cru.component').then(m => m.TLS23110CRUComponent) },
  // 專櫃日對帳單
  { path: 'tls23120cru', loadComponent: () => import('./tls23120-cru/tls23120-cru.component').then(m => m.TLS23120CRUComponent) },
  // 信用卡銷退日報表
  { path: 'tls23130cru', loadComponent: () => import('./tls23130-cru/tls23130-cru.component').then(m => m.TLS23130CRUComponent) },
  // 有價券查詢報表
  { path: 'tls23140cru', loadComponent: () => import('./tls23140-cru/tls23140-cru.component').then(m => m.TLS23140CRUComponent) },
  // 交易補登作業 CRU
  { path: 'tls24010cru', loadComponent: () => import('./tls24010-cru/tls24010-cru.component').then(m => m.TLS24010CRUComponent) },
  // 交易資料修正報表 CRU
  { path: 'tls24080cru', loadComponent: () => import('./tls24080-cru/tls24080-cru.component').then(m => m.TLS24080CRUComponent) },
  // 商場違規扣款維護作業 CRU
  { path: 'tls25030cru', loadComponent: () => import('./tls25030-cru/tls25030-cru.component').then(m => m.TLS25030CRUComponent) },
  // 預購活動檔期設定 CRU
  { path: 'tls26010cru', loadComponent: () => import('./tls26010-cru/tls26010-cru.component').then(m => m.TLS26010CRUComponent) },
  // 預售總表 CRU
  { path: 'tls26020cru', loadComponent: () => import('./tls26020-cru/tls26020-cru.component').then(m => m.TLS26020CRUComponent) },
  // 預售明細表 CRU
  { path: 'tls26030cru', loadComponent: () => import('./tls26030-cru/tls26030-cru.component').then(m => m.TLS26030CRUComponent) },
  // 預售管理作業 CRU
  { path: 'tls26040cru', loadComponent: () => import('./tls26040-cru/tls26040-cru.component').then(m => m.TLS26040CRUComponent) },
  // 專櫃活動作業 CRU
  { path: 'tls26080cru', loadComponent: () => import('./tls26080-cru/tls26080-cru.component').then(m => m.TLS26080CRUComponent) },
  // 保全實收現金調整作業 CRU
  { path: 'tls27020cru', loadComponent: () => import('./tls27020-cru/tls27020-cru.component').then(m => m.TLS27020CRUComponent) },
  // 實收信用卡調整作業 CRU
  { path: 'tls27040cru', loadComponent: () => import('./tls27040-cru/tls27040-cru.component').then(m => m.TLS27040CRUComponent) },
  // 總袋作業 CRU
  { path: 'tls28020cru', loadComponent: () => import('./tls28020-cru/tls28020-cru.component').then(m => m.TLS28020CRUComponent) },
  // 總袋狀況表 CRU
  { path: 'tls28030cru', loadComponent: () => import('./tls28030-cru/tls28030-cru.component').then(m => m.TLS28030CRUComponent) },
  // 收銀員領袋表 CRU
  { path: 'tls28050cru', loadComponent: () => import('./tls28050-cru/tls28050-cru.component').then(m => m.TLS28050CRUComponent) },
  // 折扣開放維護作業 CRU
  { path: 'tls29010cru', loadComponent: () => import('./tls29010-cru/tls29010-cru.component').then(m => m.TLS29010CRUComponent) },
  // 各支付工具審核作業 CRU
  { path: 'tls2a010cru', loadComponent: () => import('./tls2a010-cru/tls2a010-cru.component').then(m => m.TLS2A010CRUComponent) },
  // 溢欠彙總表 CRU
  { path: 'tls2a030cru', loadComponent: () => import('./tls2a030-cru/tls2a030-cru.component').then(m => m.TLS2A030CRUComponent) },
  // 缺單據/作廢發票報表 CRU
  { path: 'tls2a040cru', loadComponent: () => import('./tls2a040-cru/tls2a040-cru.component').then(m => m.TLS2A040CRUComponent) },
  // 第三方支付帳差報表 CRU
  { path: 'tls2a050cru', loadComponent: () => import('./tls2a050-cru/tls2a050-cru.component').then(m => m.TLS2A050CRUComponent) },
  // 收銀員溢欠表(日) CRU
  { path: 'tls2b010cru', loadComponent: () => import('./tls2b010-cru/tls2b010-cru.component').then(m => m.TLS2B010CRUComponent) },
  // 收銀員溢欠表(月) CRU
  { path: 'tls2b020cru', loadComponent: () => import('./tls2b020-cru/tls2b020-cru.component').then(m => m.TLS2B020CRUComponent) },
  // 專櫃收銀機台溢欠表 CRU
  { path: 'tls2b030cru', loadComponent: () => import('./tls2b030-cru/tls2b030-cru.component').then(m => m.TLS2B030CRUComponent) },
  // 專櫃日暫存傳票報表 CRU
  { path: 'tls2c010cru', loadComponent: () => import('./tls2c010-cru/tls2c010-cru.component').then(m => m.TLS2C010CRUComponent) },
  // 日結前檢查作業 CRU
  { path: 'tls2c020cru', loadComponent: () => import('./tls2c020-cru/tls2c020-cru.component').then(m => m.TLS2C020CRUComponent) },
  // 日結關帳作業 CRU
  { path: 'tls2c030cru', loadComponent: () => import('./tls2c030-cru/tls2c030-cru.component').then(m => m.TLS2C030CRUComponent) },
  // 專櫃暫存傳票查詢作業 CRU
  { path: 'tls2c040cru', loadComponent: () => import('./tls2c040-cru/tls2c040-cru.component').then(m => m.TLS2C040CRUComponent) },
  // 發票匯總作業 CRU
  { path: 'tls2c050cru', loadComponent: () => import('./tls2c050-cru/tls2c050-cru.component').then(m => m.TLS2C050CRUComponent) },
  // 代扣款補登作業 CRU
  { path: 'tls2d010cru', loadComponent: () => import('./tls2d010-cru/tls2d010-cru.component').then(m => m.TLS2D010CRUComponent) },
  // 專櫃代扣款試算作業 CRU
  { path: 'tls2d020cru', loadComponent: () => import('./tls2d020-cru/tls2d020-cru.component').then(m => m.TLS2D020CRUComponent) },
  // 專櫃代扣款結算作業 CRU
  { path: 'tls2d030cru', loadComponent: () => import('./tls2d030-cru/tls2d030-cru.component').then(m => m.TLS2D030CRUComponent) },
  // 專櫃代扣款明細表 CRU
  { path: 'tls2d040cru', loadComponent: () => import('./tls2d040-cru/tls2d040-cru.component').then(m => m.TLS2D040CRUComponent) },
  // 部門使用券類設定作業 CRU
  { path: 'tls2d050cru', loadComponent: () => import('./tls2d050-cru/tls2d050-cru.component').then(m => m.TLS2D050CRUComponent) },
  // 專櫃租金結算作業 CRU
  { path: 'tls2e010cru', loadComponent: () => import('./tls2e010-cru/tls2e010-cru.component').then(m => m.TLS2E010CRUComponent) },
  // 專櫃抽成金額結算作業 CRU
  { path: 'tls2e020cru', loadComponent: () => import('./tls2e020-cru/tls2e020-cru.component').then(m => m.TLS2E020CRUComponent) },
  // 專櫃帳款試算作業 CRU
  { path: 'tls2e030cru', loadComponent: () => import('./tls2e030-cru/tls2e030-cru.component').then(m => m.TLS2E030CRUComponent) },
  // 專櫃帳款試算彙總表 CRU
  { path: 'tls2e050cru', loadComponent: () => import('./tls2e050-cru/tls2e050-cru.component').then(m => m.TLS2E050CRUComponent) },
  // 專櫃結帳前調整作業 CRU
  { path: 'tls2e060cru', loadComponent: () => import('./tls2e060-cru/tls2e060-cru.component').then(m => m.TLS2E060CRUComponent) },
  // 專櫃帳款結算作業 CRU
  { path: 'tls2e070cru', loadComponent: () => import('./tls2e070-cru/tls2e070-cru.component').then(m => m.TLS2E070CRUComponent) },
  // 專櫃對帳單 CRU
  { path: 'tls2e080cru', loadComponent: () => import('./tls2e080-cru/tls2e080-cru.component').then(m => m.TLS2E080CRUComponent) },
  // 專櫃帳款結算彙總表 CRU
  { path: 'tls2e090cru', loadComponent: () => import('./tls2e090-cru/tls2e090-cru.component').then(m => m.TLS2E090CRUComponent) },
  // 年度對帳單 CRU
  { path: 'tls2e100cru', loadComponent: () => import('./tls2e100-cru/tls2e100-cru.component').then(m => m.TLS2E100CRUComponent) },
  // 廠商發票請款登入暨維護作業 CRU
  { path: 'tls2f010cru', loadComponent: () => import('./tls2f010-cru/tls2f010-cru.component').then(m => m.TLS2F010CRUComponent) },
  // 專櫃暫存應付帳款產生作業 CRU
  { path: 'tls2f020cru', loadComponent: () => import('./tls2f020-cru/tls2f020-cru.component').then(m => m.TLS2F020CRUComponent) },
  // 專櫃進項發票未開立查詢作業 CRU
  { path: 'tls2f030cru', loadComponent: () => import('./tls2f030-cru/tls2f030-cru.component').then(m => m.TLS2F030CRUComponent) },
  // 專櫃預估業績轉入作業 CRU
  { path: 'tls2g010cru', loadComponent: () => import('./tls2g010-cru/tls2g010-cru.component').then(m => m.TLS2G010CRUComponent) },
  // 專櫃預估業績維護作業 CRU
  { path: 'tls2g020cru', loadComponent: () => import('./tls2g020-cru/tls2g020-cru.component').then(m => m.TLS2G020CRUComponent) },
  // 專櫃預估業績報表 CRU
  { path: 'tls2g030cru', loadComponent: () => import('./tls2g030-cru/tls2g030-cru.component').then(m => m.TLS2G030CRUComponent) },
  // 預算日報表 CRU
  { path: 'tls2g040cru', loadComponent: () => import('./tls2g040-cru/tls2g040-cru.component').then(m => m.TLS2G040CRUComponent) },
  // 租金發票套印作業 CRU
  { path: 'tls2h010cru', loadComponent: () => import('./tls2h010-cru/tls2h010-cru.component').then(m => m.TLS2H010CRUComponent) },
  // 專櫃代扣款發票套印作業 CRU
  { path: 'tls2h020cru', loadComponent: () => import('./tls2h020-cru/tls2h020-cru.component').then(m => m.TLS2H020CRUComponent) },
  // 專櫃抽成發票套印作業 CRU
  { path: 'tls2h030cru', loadComponent: () => import('./tls2h030-cru/tls2h030-cru.component').then(m => m.TLS2H030CRUComponent) },
  // 換開品項維護作業 CRU
  { path: 'tls2j010cru', loadComponent: () => import('./tls2j010-cru/tls2j010-cru.component').then(m => m.TLS2J010CRUComponent) },
  // 大分類換開品項維護作業 CRU
  { path: 'tls2j020cru', loadComponent: () => import('./tls2j020-cru/tls2j020-cru.component').then(m => m.TLS2J020CRUComponent) },
  // 後台發票換開補登作業 CRU
  { path: 'tls2j030cru', loadComponent: () => import('./tls2j030-cru/tls2j030-cru.component').then(m => m.TLS2J030CRUComponent) },
  // 發票換開作業 CRU
  { path: 'tls2j040cru', loadComponent: () => import('./tls2j040-cru/tls2j040-cru.component').then(m => m.TLS2J040CRUComponent) },
  // 餘代卡產卡作業 CRU
  { path: 'tls2k010cru', loadComponent: () => import('./tls2k010-cru/tls2k010-cru.component').then(m => m.TLS2K010CRUComponent) },
  // 餘代卡領卡作業 CRU
  { path: 'tls2k020cru', loadComponent: () => import('./tls2k020-cru/tls2k020-cru.component').then(m => m.TLS2K020CRUComponent) },
  // 餘代卡資料維護作業 CRU
  { path: 'tls2k030cru', loadComponent: () => import('./tls2k030-cru/tls2k030-cru.component').then(m => m.TLS2K030CRUComponent) },
  // 餘代卡交易補登作業 CRU
  { path: 'tls2k040cru', loadComponent: () => import('./tls2k040-cru/tls2k040-cru.component').then(m => m.TLS2K040CRUComponent) },
  // 餘代卡換卡作業 CRU
  { path: 'tls2k050cru', loadComponent: () => import('./tls2k050-cru/tls2k050-cru.component').then(m => m.TLS2K050CRUComponent) },
  // 餘代卡查詢報表 CRU
  { path: 'tls2k060cru', loadComponent: () => import('./tls2k060-cru/tls2k060-cru.component').then(m => m.TLS2K060CRUComponent) },
  // 即時業績查詢
  { path: 'tls31010', loadComponent: () => import('./tls31010/tls31010.component').then(m => m.TLS31010Component) },
  // 各樓層之營業報表
  { path: 'tls31020', loadComponent: () => import('./tls31020/tls31020.component').then(m => m.TLS31020Component) },
  // 各樓層之營業報表 CRU
  { path: 'tls31020cru', loadComponent: () => import('./tls31020cru/tls31020cru.component').then(m => m.Tls31020cruComponent) },
  // 各大分類之營業報表
  { path: 'tls31030', loadComponent: () => import('./tls31030/tls31030.component').then(m => m.TLS31030Component) },
  // 各大分類之營業報表 CRU
  { path: 'tls31030cru', loadComponent: () => import('./tls31030-cru/tls31030-cru.component').then(m => m.Tls31030CruComponent) },
  // 各櫃別之營業報表
  { path: 'tls31040', loadComponent: () => import('./tls31040/tls31040.component').then(m => m.TLS31040Component) },
  // 各抽成別之營業報表
  { path: 'tls31050', loadComponent: () => import('./tls31050/tls31050.component').then(m => m.TLS31050Component) },
  // 各組織之營業報表
  { path: 'tls31060', loadComponent: () => import('./tls31060/tls31060.component').then(m => m.TLS31060Component) },
  // 各營業型態之營業報表
  { path: 'tls31070', loadComponent: () => import('./tls31070/tls31070.component').then(m => m.TLS31070Component) },
  // 各時段之樓層營業報表
  { path: 'tls31080', loadComponent: () => import('./tls31080/tls31080.component').then(m => m.TLS31080Component) },
  // 各時段之大分類營業報表
  { path: 'tls31090', loadComponent: () => import('./tls31090/tls31090.component').then(m => m.TLS31090Component) },
  // 銷售排名分析報表
  { path: 'tls32010', loadComponent: () => import('./tls32010/tls32010.component').then(m => m.TLS32010Component) },
  // 期間業績分析報表
  { path: 'tls32020', loadComponent: () => import('./tls32020/tls32020.component').then(m => m.TLS32020Component) },
  // 成長率分析報表
  { path: 'tls32030', loadComponent: () => import('./tls32030/tls32030.component').then(m => m.TLS32030Component) },
  // 成長率分析報表
  { path: 'tls32040', loadComponent: () => import('./tls32040/tls32040.component').then(m => m.TLS32040Component) },
  // 成長率分析報表
  { path: 'tls32050', loadComponent: () => import('./tls32050/tls32050.component').then(m => m.TLS32050Component) },
  // 成長率分析報表
  { path: 'tls32060', loadComponent: () => import('./tls32060/tls32060.component').then(m => m.TLS32060Component) },
  // 收銀機基本資料維護
  { path: 'tls41010', loadComponent: () => import('./tls41010/tls41010.component').then(m => m.TLS41010Component) },
  // 收銀機EDC資料維護
  { path: 'tls41020', loadComponent: () => import('./tls41020/tls41020.component').then(m => m.TLS41020Component) },
  // 收銀專櫃人員資料維護作業
  { path: 'tls41030', loadComponent: () => import('./tls41030/tls41030.component').then(m => m.TLS41030Component) },
  // POS清機時間設定
  { path: 'tls41040', loadComponent: () => import('./tls41040/tls41040.component').then(m => m.TLS41040Component) },
  // 發票訊息維護作業
  { path: 'tls41050', loadComponent: () => import('./tls41050/tls41050.component').then(m => m.TLS41050Component) },
  // 快速鍵維護作業
  { path: 'tls42010', loadComponent: () => import('./tls42010/tls42010.component').then(m => m.TLS42010Component) },
  // 快速鍵名稱維護作業
  { path: 'tls42020', loadComponent: () => import('./tls42020/tls42020.component').then(m => m.TLS42020Component) },
  // 訊息登錄作業
  { path: 'tls43010', loadComponent: () => import('./tls43010/tls43010.component').then(m => m.TLS43010Component) },
  // 訊息審核作業
  { path: 'tls43020', loadComponent: () => import('./tls43020/tls43020.component').then(m => m.TLS43020Component) },
  // 訊息群組維護作業
  { path: 'tls43040', loadComponent: () => import('./tls43040/tls43040.component').then(m => m.TLS43040Component) },
  // 訊息狀態查詢作業
  { path: 'tls43050', loadComponent: () => import('./tls43050/tls43050.component').then(m => m.TLS43050Component) },
  // POS即時連線監看
  { path: 'tls44010', loadComponent: () => import('./tls44010/tls44010.component').then(m => m.TLS44010Component) },
  // EDC即時連線監看
  { path: 'tls44020', loadComponent: () => import('./tls44020/tls44020.component').then(m => m.TLS44020Component) },
  // 訊息群組報表
  { path: 'tls45010', loadComponent: () => import('./tls45010/tls45010.component').then(m => m.TLS45010Component) },
  // 收銀機主檔異動查詢
  { path: 'tls45020', loadComponent: () => import('./tls45020/tls45020.component').then(m => m.TLS45020Component) },
  // 收銀機開關機時間表
  { path: 'tls45030', loadComponent: () => import('./tls45030/tls45030.component').then(m => m.TLS45030Component) },
  // 網路位置設定
  { path: 'tls46010', loadComponent: () => import('./tls46010/tls46010.component').then(m => m.TLS46010Component) },
  // POS環境變數維護作業
  { path: 'tls46020', loadComponent: () => import('./tls46020/tls46020.component').then(m => m.TLS46020Component) },
  // 設定檔群組維護
  { path: 'tls46040', loadComponent: () => import('./tls46040/tls46040.component').then(m => m.TLS46040Component) },
  // TM監控報表
  { path: 'tls46050', loadComponent: () => import('./tls46050/tls46050.component').then(m => m.TLS46050Component) },
  // 資料下傳收銀機作業
  { path: 'tls47010', loadComponent: () => import('./tls47010/tls47010.component').then(m => m.TLS47010Component) },
  // 收銀機基本資料維護 CRU
  { path: 'tls41010cru', loadComponent: () => import('./tls41010-cru/tls41010-cru.component').then(m => m.TLS41010CRUComponent) },
  // 收銀機EDC資料維護 CRU
  { path: 'tls41020cru', loadComponent: () => import('./tls41020-cru/tls41020-cru.component').then(m => m.TLS41020CRUComponent) },
  // 收銀專櫃人員資料維護作業 CRU
  { path: 'tls41030cru', loadComponent: () => import('./tls41030-cru/tls41030-cru.component').then(m => m.TLS41030CRUComponent) },
  // POS清機時間設定 CRU
  { path: 'tls41040cru', loadComponent: () => import('./tls41040-cru/tls41040-cru.component').then(m => m.TLS41040CRUComponent) },
  // 發票訊息維護作業 CRU
  { path: 'tls41050cru', loadComponent: () => import('./tls41050-cru/tls41050-cru.component').then(m => m.TLS41050CRUComponent) },
  // 快速鍵維護作業 CRU
  { path: 'tls42010cru', loadComponent: () => import('./tls42010-cru/tls42010-cru.component').then(m => m.TLS42010CRUComponent) },
  // 快速鍵名稱維護作業 CRU
  { path: 'tls42020cru', loadComponent: () => import('./tls42020-cru/tls42020-cru.component').then(m => m.TLS42020CRUComponent) },
  // 訊息登錄作業 CRU
  { path: 'tls43010cru', loadComponent: () => import('./tls43010-cru/tls43010-cru.component').then(m => m.TLS43010CRUComponent) },
  // 訊息審核作業 CRU
  { path: 'tls43020cru', loadComponent: () => import('./tls43020-cru/tls43020-cru.component').then(m => m.TLS43020CRUComponent) },
  // 訊息群組維護作業 CRU
  { path: 'tls43040cru', loadComponent: () => import('./tls43040-cru/tls43040-cru.component').then(m => m.TLS43040CRUComponent) },
  // 訊息狀態查詢作業 CRU
  { path: 'tls43050cru', loadComponent: () => import('./tls43050-cru/tls43050-cru.component').then(m => m.TLS43050CRUComponent) },
  // POS即時連線監看 CRU
  { path: 'tls44010cru', loadComponent: () => import('./tls44010-cru/tls44010-cru.component').then(m => m.TLS44010CRUComponent) },
  // EDC即時連線監看 CRU
  { path: 'tls44020cru', loadComponent: () => import('./tls44020-cru/tls44020-cru.component').then(m => m.TLS44020CRUComponent) },
  // 訊息群組報表 CRU
  { path: 'tls45010cru', loadComponent: () => import('./tls45010-cru/tls45010-cru.component').then(m => m.TLS45010CRUComponent) },
  // 收銀機主檔異動查詢 CRU
  { path: 'tls45020cru', loadComponent: () => import('./tls45020-cru/tls45020-cru.component').then(m => m.TLS45020CRUComponent) },
  // 網路位置設定 CRU
  { path: 'tls46010cru', loadComponent: () => import('./tls46010-cru/tls46010-cru.component').then(m => m.TLS46010CRUComponent) },
  // POS環境變數維護作業 CRU
  { path: 'tls46020cru', loadComponent: () => import('./tls46020-cru/tls46020-cru.component').then(m => m.TLS46020CRUComponent) },
  // 設定檔群組維護 CRU
  { path: 'tls46040cru', loadComponent: () => import('./tls46040-cru/tls46040-cru.component').then(m => m.TLS46040CRUComponent) },
  // TM監控報表 CRU
  { path: 'tls46050cru', loadComponent: () => import('./tls46050-cru/tls46050-cru.component').then(m => m.TLS46050CRUComponent) },
  // 資料下傳收銀機作業 CRU
  { path: 'tls47010cru', loadComponent: () => import('./tls47010-cru/tls47010-cru.component').then(m => m.TLS47010CRUComponent) },
  // 大分類維護作業
  { path: 'tls51010', loadComponent: () => import('./tls51010/tls51010.component').then(m => m.TLS51010Component) },
  // 中分類維護作業
  { path: 'tls51020', loadComponent: () => import('./tls51020/tls51020.component').then(m => m.TLS51020Component) },
  // 小分類維護作業
  { path: 'tls51030', loadComponent: () => import('./tls51030/tls51030.component').then(m => m.TLS51030Component) },
  // 傳票項目設定作業
  { path: 'tls51040', loadComponent: () => import('./tls51040/tls51040.component').then(m => m.TLS51040Component) },
  // 商品單位設定
  { path: 'tls51050', loadComponent: () => import('./tls51050/tls51050.component').then(m => m.TLS51050Component) },
  // 品牌設定作業
  { path: 'tls51060', loadComponent: () => import('./tls51060/tls51060.component').then(m => m.TLS51060Component) },
  // 商品基本資料
  { path: 'tls51070', loadComponent: () => import('./tls51070/tls51070.component').then(m => m.TLS51070Component) },
  // 分倉資料處理
  { path: 'tls51080', loadComponent: () => import('./tls51080/tls51080.component').then(m => m.TLS51080Component) },
  // 品牌每月可進貨限額維護作業
  { path: 'tls51110', loadComponent: () => import('./tls51110/tls51110.component').then(m => m.TLS51110Component) },
  // 品牌進貨折數設定作業
  { path: 'tls51130', loadComponent: () => import('./tls51130/tls51130.component').then(m => m.TLS51130Component) },
  // 自營專櫃收銀扣庫維護作業
  { path: 'tls51140', loadComponent: () => import('./tls51140/tls51140.component').then(m => m.Tls51140Component) },
  // 採購單維護作業
  { path: 'tls52010', loadComponent: () => import('./tls52010/tls52010.component').then(m => m.TLS52010Component) },
  // 退貨單維護作業
  { path: 'tls52020', loadComponent: () => import('./tls52020/tls52020.component').then(m => m.TLS52020Component) },
  // 進貨驗收作業
  { path: 'tls52030', loadComponent: () => import('./tls52030/tls52030.component').then(m => m.TLS52030Component) },
  // 退貨驗收作業
  { path: 'tls52040', loadComponent: () => import('./tls52040/tls52040.component').then(m => m.TLS52040Component) },
  // 進價/售價變價作業
  { path: 'tls52050', loadComponent: () => import('./tls52050/tls52050.component').then(m => m.TLS52050Component) },
  // 盤點單開立
  { path: 'tls53010', loadComponent: () => import('./tls53010/tls53010.component').then(m => m.TLS53010Component) },
  // 盤點資料匯入作業
  { path: 'tls53020', loadComponent: () => import('./tls53020/tls53020.component').then(m => m.TLS53020Component) },
  // 盤點資料維護作業
  { path: 'tls53030', loadComponent: () => import('./tls53030/tls53030.component').then(m => m.TLS53030Component) },
  // 進貨日結作業
  { path: 'tls55010', loadComponent: () => import('./tls55010/tls55010.component').then(m => m.TLS55010Component) },
  // 廠商發票折讓作業
  { path: 'tls55030', loadComponent: () => import('./tls55030/tls55030.component').then(m => m.TLS55030Component) },
  // 廠商請款作業
  { path: 'tls55040', loadComponent: () => import('./tls55040/tls55040.component').then(m => m.TLS55040Component) },
  // 月結帳作業
  { path: 'tls55050', loadComponent: () => import('./tls55050/tls55050.component').then(m => m.TLS55050Component) },
  // 暫存傳票審核管理作業
  { path: 'tls55060', loadComponent: () => import('./tls55060/tls55060.component').then(m => m.TLS55060Component) },
  // 商品庫存查詢作業
  { path: 'tls56010', loadComponent: () => import('./tls56010/tls56010.component').then(m => m.TLS56010Component) },
  // 商品領用(內部)作業
  { path: 'tls56020', loadComponent: () => import('./tls56020/tls56020.component').then(m => m.TLS56020Component) },
  // 商品退回(內部)作業
  { path: 'tls56030', loadComponent: () => import('./tls56030/tls56030.component').then(m => m.TLS56030Component) },
  // 倉別調撥申請維護
  { path: 'tls56040', loadComponent: () => import('./tls56040/tls56040.component').then(m => m.TLS56040Component) },
  // 倉別調撥發貨作業
  { path: 'tls56050', loadComponent: () => import('./tls56050/tls56050.component').then(m => m.TLS56050Component) },
  // 倉別調撥驗收作業
  { path: 'tls56060', loadComponent: () => import('./tls56060/tls56060.component').then(m => m.TLS56060Component) },
  // 商品報廢維護
  { path: 'tls56070', loadComponent: () => import('./tls56070/tls56070.component').then(m => m.TLS56070Component) },
  // 同業調撥作業
  { path: 'tls56080', loadComponent: () => import('./tls56080/tls56080.component').then(m => m.TLS56080Component) },
  // 採購統計表
  { path: 'tls57010', loadComponent: () => import('./tls57010/tls57010.component').then(m => m.TLS57010Component) },
  // 廠商應付帳款明細表
  { path: 'tls57020', loadComponent: () => import('./tls57020/tls57020.component').then(m => m.TLS57020Component) },
  // 商品庫存表
  { path: 'tls57030', loadComponent: () => import('./tls57030/tls57030.component').then(m => m.TLS57030Component) },
  // 商品目錄表
  { path: 'tls57040', loadComponent: () => import('./tls57040/tls57040.component').then(m => m.TLS57040Component) },
  // 收銀機發票商品統計表
  { path: 'tls57050', loadComponent: () => import('./tls57050/tls57050.component').then(m => m.TLS57050Component) },
  // EC銷售商品統計表
  { path: 'tls57060', loadComponent: () => import('./tls57060/tls57060.component').then(m => m.TLS57060Component) },
  // 存貨月結表
  { path: 'tls57070', loadComponent: () => import('./tls57070/tls57070.component').then(m => m.TLS57070Component) },
  // 庫存數量異動明細表
  { path: 'tls57080', loadComponent: () => import('./tls57080/tls57080.component').then(m => m.TLS57080Component) },
  // 進貨/進退單據統計表
  { path: 'tls57090', loadComponent: () => import('./tls57090/tls57090.component').then(m => m.TLS57090Component) },
  // 驗收/驗退單據統計表
  { path: 'tls57100', loadComponent: () => import('./tls57100/tls57100.component').then(m => m.TLS57100Component) },
  // 存貨月結庫存表
  { path: 'tls57110', loadComponent: () => import('./tls57110/tls57110.component').then(m => m.TLS57110Component) },
  // 滯銷商品統計表
  { path: 'tls57120', loadComponent: () => import('./tls57120/tls57120.component').then(m => m.TLS57120Component) },
  // 銷售排行報表
  { path: 'tls57130', loadComponent: () => import('./tls57130/tls57130.component').then(m => m.TLS57130Component) },
  // 商品迴轉率
  { path: 'tls57140', loadComponent: () => import('./tls57140/tls57140.component').then(m => m.TLS57140Component) },
  // 盤點統計表
  { path: 'tls57150', loadComponent: () => import('./tls57150/tls57150.component').then(m => m.TLS57150Component) },
  // 庫齡分析表
  { path: 'tls57160', loadComponent: () => import('./tls57160/tls57160.component').then(m => m.TLS57160Component) },
  // 存貨評價分析表
  { path: 'tls57170', loadComponent: () => import('./tls57170/tls57170.component').then(m => m.TLS57170Component) },
  // 大分類維護作業 CRU
  { path: 'tls51010cru', loadComponent: () => import('./tls51010-cru/tls51010-cru.component').then(m => m.TLS51010CRUComponent) },
  // 中分類維護作業 CRU
  { path: 'tls51020cru', loadComponent: () => import('./tls51020-cru/tls51020-cru.component').then(m => m.TLS51020CRUComponent) },
  // 小分類維護作業 CRU
  { path: 'tls51030cru', loadComponent: () => import('./tls51030-cru/tls51030-cru.component').then(m => m.TLS51030CRUComponent) },
  // 傳票項目設定作業 CRU
  { path: 'tls51040cru', loadComponent: () => import('./tls51040-cru/tls51040-cru.component').then(m => m.TLS51040CRUComponent) },
  // 商品單位設定 CRU
  { path: 'tls51050cru', loadComponent: () => import('./tls51050-cru/tls51050-cru.component').then(m => m.TLS51050CRUComponent) },
  // 品牌設定作業 CRU
  { path: 'tls51060cru', loadComponent: () => import('./tls51060-cru/tls51060-cru.component').then(m => m.TLS51060CRUComponent) },
  // 商品基本資料 CRU
  { path: 'tls51070cru', loadComponent: () => import('./tls51070-cru/tls51070-cru.component').then(m => m.TLS51070CRUComponent) },
  // 商品基本資料 OS
  { path: 'tls51070os', loadComponent: () => import('./tls51070-os/tls51070-os.component').then(m => m.Tls51070OsComponent) },
  // 分倉資料處理 CRU
  { path: 'tls51080cru', loadComponent: () => import('./tls51080-cru/tls51080-cru.component').then(m => m.TLS51080CRUComponent) },
  // 品牌每月可進貨限額維護作業 CRU
  { path: 'tls51110cru', loadComponent: () => import('./tls51110-cru/tls51110-cru.component').then(m => m.TLS51110CRUComponent) },
  // 品牌進貨折數設定作業 CRU
  { path: 'tls51130cru', loadComponent: () => import('./tls51130-cru/tls51130-cru.component').then(m => m.TLS51130CRUComponent) },
  // 自營專櫃收銀扣庫維護作業 CRU
  { path: 'tls51140cru', loadComponent: () => import('./tls51140-cru/tls51140-cru.component').then(m => m.Tls51140CruComponent) },
  // 採購單維護作業 CRU
  { path: 'tls52010cru', loadComponent: () => import('./tls52010-cru/tls52010-cru.component').then(m => m.TLS52010CRUComponent) },
  // 退貨單維護作業 CRU
  { path: 'tls52020cru', loadComponent: () => import('./tls52020-cru/tls52020-cru.component').then(m => m.TLS52020CRUComponent) },
  // 進貨驗收作業 CRU
  { path: 'tls52030cru', loadComponent: () => import('./tls52030-cru/tls52030-cru.component').then(m => m.TLS52030CRUComponent) },
  // 退貨驗收作業 CRU
  { path: 'tls52040cru', loadComponent: () => import('./tls52040-cru/tls52040-cru.component').then(m => m.TLS52040CRUComponent) },
  // 進價/售價變價作業 CRU
  { path: 'tls52050cru', loadComponent: () => import('./tls52050-cru/tls52050-cru.component').then(m => m.TLS52050CRUComponent) },
  // 盤點單開立 CRU
  { path: 'tls53010cru', loadComponent: () => import('./tls53010-cru/tls53010-cru.component').then(m => m.TLS53010CRUComponent) },
  // 盤點資料匯入作業 CRU
  { path: 'tls53020cru', loadComponent: () => import('./tls53020-cru/tls53020-cru.component').then(m => m.TLS53020CRUComponent) },
  // 盤點資料維護作業 CRU
  { path: 'tls53030cru', loadComponent: () => import('./tls53030-cru/tls53030-cru.component').then(m => m.TLS53030CRUComponent) },
  // 進貨日結作業 CRU
  { path: 'tls55010cru', loadComponent: () => import('./tls55010-cru/tls55010-cru.component').then(m => m.TLS55010CRUComponent) },
  // 廠商發票折讓作業 CRU
  { path: 'tls55030cru', loadComponent: () => import('./tls55030-cru/tls55030-cru.component').then(m => m.TLS55030CRUComponent) },
  // 廠商請款作業 CRU
  { path: 'tls55040cru', loadComponent: () => import('./tls55040-cru/tls55040-cru.component').then(m => m.TLS55040CRUComponent) },
  // 月結帳作業 CRU
  { path: 'tls55050cru', loadComponent: () => import('./tls55050-cru/tls55050-cru.component').then(m => m.TLS55050CRUComponent) },
  // 暫存傳票審核管理作業 CRU
  { path: 'tls55060cru', loadComponent: () => import('./tls55060-cru/tls55060-cru.component').then(m => m.TLS55060CRUComponent) },
  // 商品庫存查詢作業 CRU
  { path: 'tls56010cru', loadComponent: () => import('./tls56010-cru/tls56010-cru.component').then(m => m.TLS56010CRUComponent) },
  // 商品領用(內部)作業 CRU
  { path: 'tls56020cru', loadComponent: () => import('./tls56020-cru/tls56020-cru.component').then(m => m.TLS56020CRUComponent) },
  // 商品退回(內部)作業 CRU
  { path: 'tls56030cru', loadComponent: () => import('./tls56030-cru/tls56030-cru.component').then(m => m.TLS56030CRUComponent) },
  // 倉別調撥申請維護 CRU
  { path: 'tls56040cru', loadComponent: () => import('./tls56040-cru/tls56040-cru.component').then(m => m.TLS56040CRUComponent) },
  // 倉別調撥發貨作業 CRU
  { path: 'tls56050cru', loadComponent: () => import('./tls56050-cru/tls56050-cru.component').then(m => m.TLS56050CRUComponent) },
  // 倉別調撥驗收作業 CRU
  { path: 'tls56060cru', loadComponent: () => import('./tls56060-cru/tls56060-cru.component').then(m => m.TLS56060CRUComponent) },
  // 商品報廢維護 CRU
  { path: 'tls56070cru', loadComponent: () => import('./tls56070-cru/tls56070-cru.component').then(m => m.TLS56070CRUComponent) },
  // 同業調撥作業 CRU
  { path: 'tls56080cru', loadComponent: () => import('./tls56080-cru/tls56080-cru.component').then(m => m.TLS56080CRUComponent) },
  // 組織預售業績總表
  { path: 'tls26050', loadComponent: () => import('./tls26050/tls26050.component').then(m => m.TLS26050Component) },
  // 中分類預售業績總表
  { path: 'tls26060', loadComponent: () => import('./tls26060/tls26060.component').then(m => m.TLS26060Component) },
  // 各櫃預售業績總表
  { path: 'tls26070', loadComponent: () => import('./tls26070/tls26070.component').then(m => m.TLS26070Component) },

];
