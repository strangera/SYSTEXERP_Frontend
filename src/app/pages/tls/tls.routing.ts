import { Routes } from '@angular/router';

export const tlsRoutes: Routes = [
  // 專櫃位置資料維護
  { path: 'tls11010', loadComponent: () => import('./tls11010/tls11010.component').then(m => m.TLS11010Component), data: { progNo: 'TLS11010' } },
  // 扣款項目維護作業
  { path: 'tls11020', loadComponent: () => import('./tls11020/tls11020.component').then(m => m.TLS11020Component), data: { progNo: 'TLS11020' } },
  // 潛在客戶資料維護
  { path: 'tls12010', loadComponent: () => import('./tls12010/tls12010.component').then(m => m.TLS12010Component), data: { progNo: 'TLS12010' } },
  // 專櫃訪談記錄維護
  { path: 'tls12020', loadComponent: () => import('./tls12020/tls12020.component').then(m => m.TLS12020Component), data: { progNo: 'TLS12020' } },
  // 專櫃位置圖
  { path: 'tls12050', loadComponent: () => import('./tls12050/tls12050.component').then(m => m.TLS12050Component), data: { progNo: 'TLS12050' } },
  // 招商進度監控
  { path: 'tls12060', loadComponent: () => import('./tls12060/tls12060.component').then(m => m.TLS12060Component), data: { progNo: 'TLS12060' } },
  // 專櫃訪談紀錄追蹤表
  { path: 'tls12070', loadComponent: () => import('./tls12070/tls12070.component').then(m => m.TLS12070Component), data: { progNo: 'TLS12070' } },
  // 專櫃契約代扣款報表
  { path: 'tls13030', loadComponent: () => import('./tls13030/tls13030.component').then(m => m.TLS13030Component), data: { progNo: 'TLS13030' } },
  // 專櫃契約抽成報表
  { path: 'tls13040', loadComponent: () => import('./tls13040/tls13040.component').then(m => m.TLS13040Component), data: { progNo: 'TLS13040' } },
  // 年度目標營業額管制報表
  { path: 'tls13050', loadComponent: () => import('./tls13050/tls13050.component').then(m => m.TLS13050Component), data: { progNo: 'TLS13050' } },
  // 櫃位營運事項明細查詢作業
  { path: 'tls13060', loadComponent: () => import('./tls13060/tls13060.component').then(m => m.TLS13060Component), data: { progNo: 'TLS13060' } },
  // 調整櫃位合約一覽表
  { path: 'tls13070', loadComponent: () => import('./tls13070/tls13070.component').then(m => m.TLS13070Component), data: { progNo: 'TLS13070' } },
  // 整批新增合約扣款作業
  { path: 'tls13080', loadComponent: () => import('./tls13080/tls13080.component').then(m => m.TLS13080Component), data: { progNo: 'TLS13080' } },
  // 合約組織調整作業
  { path: 'tls13090', loadComponent: () => import('./tls13090/tls13090.component').then(m => m.TLS13090Component), data: { progNo: 'TLS13090' } },
  // 合約狀態清單
  { path: 'tls14010', loadComponent: () => import('./tls14010/tls14010.component').then(m => m.TLS14010Component), data: { progNo: 'TLS14010' } },
  // 專櫃契約書列印
  { path: 'tls14020', loadComponent: () => import('./tls14020/tls14020.component').then(m => m.TLS14020Component), data: { progNo: 'TLS14020' } },
  // 保證票維護作業
  { path: 'tls14030', loadComponent: () => import('./tls14030/tls14030.component').then(m => m.Tls14030Component), data: { progNo: 'Tls14030' } },
  // 保證票彙總表
  { path: 'tls14040', loadComponent: () => import('./tls14040/tls14040.component').then(m => m.Tls14040Component), data: { progNo: 'Tls14040' } },
  // 專櫃位置資料維護 CRU
  { path: 'tls11010cru', loadComponent: () => import('./tls11010-cru/tls11010-cru.component').then(m => m.TLS11010CRUComponent), data: { progNo: 'TLS11010' } },
  // 扣款項目維護作業 CRU
  { path: 'tls11020cru', loadComponent: () => import('./tls11020-cru/tls11020-cru.component').then(m => m.TLS11020CRUComponent), data: { progNo: 'TLS11020' } },
  // 潛在客戶資料維護 CRU
  { path: 'tls12010cru', loadComponent: () => import('./tls12010-cru/tls12010-cru.component').then(m => m.TLS12010CRUComponent), data: { progNo: 'TLS12010' } },
  // 專櫃訪談記錄維護 CRU
  { path: 'tls12020cru', loadComponent: () => import('./tls12020-cru/tls12020-cru.component').then(m => m.TLS12020CRUComponent), data: { progNo: 'TLS12020' } },
  // 專櫃訪談紀錄追蹤表 CRU
  { path: 'tls12070cru', loadComponent: () => import('./tls12070-cru/tls12070-cru.component').then(m => m.Tls12070CRUComponent), data: { progNo: 'Tls12070' } },
  // 保證票維護作業 CRU
  { path: 'tls14030cru', loadComponent: () => import('./tls14030-cru/tls14030-cru.component').then(m => m.Tls14030CRUComponent), data: { progNo: 'Tls14030' } },

  // ========== TLS13010 專櫃契約書維護 ==========
  // 查詢頁面
  { path: 'tls13010', loadComponent: () => import('./tls13010-v2/components/query/query.component').then(m => m.QueryComponent), data: { progNo: 'TLS13010' } },
  // 合約精靈 (單頁面包含所有步驟)
  { path: 'tls13010cru', loadComponent: () => import('./tls13010-v2/components/contract-wizard/contract-wizard.component').then(m => m.ContractWizardComponent), data: { progNo: 'TLS13010' } },

  // ========== TLS13020 專櫃契約書續約維護作業 ==========
  // 查詢頁面
  { path: 'tls13020', loadComponent: () => import('./tls13020/components/query/query.component').then(m => m.QueryComponent), data: { progNo: 'TLS13020' } },
  // 合約精靈 (單頁面包含所有步驟)
  { path: 'tls13020cru', loadComponent: () => import('./tls13020/components/contract-wizard/contract-wizard.component').then(m => m.ContractWizardComponent), data: { progNo: 'TLS13020' } },

  // ========== TLS12040 專櫃要約書維護 ==========
  // 查詢頁面
  { path: 'tls12040', loadComponent: () => import('./tls12040-v2/components/query/query.component').then(m => m.QueryComponent), data: { progNo: 'TLS12040' } },
  // 合約精靈 (單頁面包含所有步驟)
  { path: 'tls12040cru', loadComponent: () => import('./tls12040-v2/components/contract-wizard/contract-wizard.component').then(m => m.ContractWizardComponent), data: { progNo: 'TLS12040' } },

  // ========== TLS12080 專櫃意向書維護 ==========
  // 查詢頁面
  { path: 'tls12080', loadComponent: () => import('./tls12080/components/query/query.component').then(m => m.QueryComponent), data: { progNo: 'TLS12080' } },
  // 合約精靈 (單頁面包含所有步驟)
  { path: 'tls12080cru', loadComponent: () => import('./tls12080/components/contract-wizard/contract-wizard.component').then(m => m.ContractWizardComponent), data: { progNo: 'TLS12080' } },

  // 傳票項目之會計科目設定作業_NEW
  { path: 'tls21020', loadComponent: () => import('./tls21020/tls21020.component').then(m => m.TLS21020Component), data: { progNo: 'TLS21020' } },
  // 對帳單備註維護作業
  { path: 'tls21030', loadComponent: () => import('./tls21030/tls21030.component').then(m => m.TLS21030Component), data: { progNo: 'TLS21030' } },
  // 信用卡之卡種維護作業
  { path: 'tls21040', loadComponent: () => import('./tls21040/tls21040.component').then(m => m.TLS21040Component), data: { progNo: 'TLS21040' } },
  // 收銀機對帳查詢作業
  { path: 'tls22010', loadComponent: () => import('./tls22010/tls22010.component').then(m => m.TLS22010Component), data: { progNo: 'TLS22010' } },
  // 系統監控報表
  { path: 'tls22020', loadComponent: () => import('./tls22020/tls22020.component').then(m => m.TLS22020Component), data: { progNo: 'TLS22020' } },
  // 序號報表
  { path: 'tls22030', loadComponent: () => import('./tls22030/tls22030.component').then(m => m.TLS22030Component), data: { progNo: 'TLS22030' } },
  // 電子發票上送筆數檢核表
  { path: 'tls22040', loadComponent: () => import('./tls22040/tls22040.component').then(m => m.TLS22040Component), data: { progNo: 'TLS22040' } },
  // 型態別報表
  { path: 'tls23010', loadComponent: () => import('./tls23010/tls23010.component').then(m => m.TLS23010Component), data: { progNo: 'TLS23010' } },
  // 折扣別報表
  { path: 'tls23020', loadComponent: () => import('./tls23020/tls23020.component').then(m => m.TLS23020Component), data: { progNo: 'TLS23020' } },
  // 付款別報表
  { path: 'tls23030', loadComponent: () => import('./tls23030/tls23030.component').then(m => m.TLS23030Component), data: { progNo: 'TLS23030' } },
  // 發票報表
  { path: 'tls23040', loadComponent: () => import('./tls23040/tls23040.component').then(m => m.TLS23040Component), data: { progNo: 'TLS23040' } },
  // 收銀機日報表
  { path: 'tls23050', loadComponent: () => import('./tls23050/tls23050.component').then(m => m.TLS23050Component), data: { progNo: 'TLS23050' } },
  // 收銀機區間報表
  { path: 'tls23060', loadComponent: () => import('./tls23060/tls23060.component').then(m => m.TLS23060Component), data: { progNo: 'TLS23060' } },
  // 專櫃收銀機月報表
  { path: 'tls23070', loadComponent: () => import('./tls23070/tls23070.component').then(m => m.TLS23070Component), data: { progNo: 'TLS23070' } },
  // 支付工具實收報表
  { path: 'tls23080', loadComponent: () => import('./tls23080/tls23080.component').then(m => m.TLS23080Component), data: { progNo: 'TLS23080' } },
  // 信用卡明細表
  { path: 'tls23090', loadComponent: () => import('./tls23090/tls23090.component').then(m => m.TLS23090Component), data: { progNo: 'TLS23090' } },
  // 付款別明細表
  { path: 'tls23100', loadComponent: () => import('./tls23100/tls23100.component').then(m => m.TLS23100Component), data: { progNo: 'TLS23100' } },
  // 折扣別月報表
  { path: 'tls23110', loadComponent: () => import('./tls23110/tls23110.component').then(m => m.TLS23110Component), data: { progNo: 'TLS23110' } },
  // 專櫃日對帳單
  { path: 'tls23120', loadComponent: () => import('./tls23120/tls23120.component').then(m => m.TLS23120Component), data: { progNo: 'TLS23120' } },
  // 信用卡銷貨月報表
  { path: 'tls23130', loadComponent: () => import('./tls23130/tls23130.component').then(m => m.TLS23130Component), data: { progNo: 'TLS23130' } },
  // 交易補登作業
  { path: 'tls24010', loadComponent: () => import('./tls24010/tls24010.component').then(m => m.TLS24010Component), data: { progNo: 'TLS24010' } },
  // 交易明細查詢
  { path: 'tls24030', loadComponent: () => import('./tls24030/tls24030.component').then(m => m.TLS24030Component), data: { progNo: 'TLS24030' } },
  // 交易明細查詢 CRU
  { path: 'tls24030cru', loadComponent: () => import('./tls24030/tls24030-cru/tls24030-cru.component').then(m => m.TLS24030CRUComponent), data: { progNo: 'TLS24030' } },
  // 交易資料修正報表
  { path: 'tls24020', loadComponent: () => import('./tls24020/tls24020.component').then(m => m.TLS24020Component), data: { progNo: 'TLS24020' } },
  // 商場違規扣款維護作業
  { path: 'tls25030', loadComponent: () => import('./tls25030/tls25030.component').then(m => m.TLS25030Component), data: { progNo: 'TLS25030' } },
  // 預購活動檔期設定
  { path: 'tls26010', loadComponent: () => import('./tls26010/tls26010.component').then(m => m.TLS26010Component), data: { progNo: 'TLS26010' } },
  // 預售總表
  { path: 'tls26020', loadComponent: () => import('./tls26020/tls26020.component').then(m => m.TLS26020Component), data: { progNo: 'TLS26020' } },
  // 預售明細表
  { path: 'tls26030', loadComponent: () => import('./tls26030/tls26030.component').then(m => m.TLS26030Component), data: { progNo: 'TLS26030' } },
  // 預售管理作業
  { path: 'tls26040', loadComponent: () => import('./tls26040/tls26040.component').then(m => m.TLS26040Component), data: { progNo: 'TLS26040' } },
  // 專櫃活動設定作業
  { path: 'tls26080', loadComponent: () => import('./tls26080/tls26080.component').then(m => m.TLS26080Component), data: { progNo: 'TLS26080' } },
  // 保全現金資料轉入作業
  { path: 'tls27010', loadComponent: () => import('./tls27010/tls27010.component').then(m => m.TLS27010Component), data: { progNo: 'TLS27010' } },
  // 保全實收現金調整作業
  { path: 'tls27020', loadComponent: () => import('./tls27020/tls27020.component').then(m => m.TLS27020Component), data: { progNo: 'TLS27020' } },
  // 信用卡資料轉入作業
  { path: 'tls27030', loadComponent: () => import('./tls27030/tls27030.component').then(m => m.TLS27030Component), data: { progNo: 'TLS27030' } },
  // 實收信用卡調整作業
  { path: 'tls27040', loadComponent: () => import('./tls27040/tls27040.component').then(m => m.TLS27040Component), data: { progNo: 'TLS27040' } },
  // 查詢無系統帳資料報表
  { path: 'tls27050', loadComponent: () => import('./tls27050/tls27050.component').then(m => m.TLS27050Component), data: { progNo: 'TLS27050' } },
  // 環友系統日結檔轉入
  { path: 'tls27060', loadComponent: () => import('./tls27060/tls27060.component').then(m => m.TLS27060Component), data: { progNo: 'TLS27060' } },
  // 總袋作業
  { path: 'tls28020', loadComponent: () => import('./tls28020/tls28020.component').then(m => m.TLS28020Component), data: { progNo: 'TLS28020' } },
  // 總袋狀況表
  { path: 'tls28030', loadComponent: () => import('./tls28030/tls28030.component').then(m => m.TLS28030Component), data: { progNo: 'TLS28030' } },
  // 收銀員領袋表
  { path: 'tls28050', loadComponent: () => import('./tls28050/tls28050.component').then(m => m.TLS28050Component), data: { progNo: 'TLS28050' } },
  // 折扣開放維護作業
  { path: 'tls29010', loadComponent: () => import('./tls29010/tls29010.component').then(m => m.TLS29010Component), data: { progNo: 'TLS29010' } },
  // 各支付工具審核作業
  { path: 'tls2a010', loadComponent: () => import('./tls2a010/tls2a010.component').then(m => m.TLS2A010Component), data: { progNo: 'TLS2A010' } },
  // 未審核收銀機台報表
  { path: 'tls2a020', loadComponent: () => import('./tls2a020/tls2a020.component').then(m => m.TLS2A020Component), data: { progNo: 'TLS2A020' } },
  // 溢欠彙總表
  { path: 'tls2a030', loadComponent: () => import('./tls2a030/tls2a030.component').then(m => m.TLS2A030Component), data: { progNo: 'TLS2A030' } },
  // 缺單據/作廢發票報表
  { path: 'tls2a040', loadComponent: () => import('./tls2a040/tls2a040.component').then(m => m.TLS2A040Component), data: { progNo: 'TLS2A040' } },
  // 第三方支付帳差報表
  { path: 'tls2a050', loadComponent: () => import('./tls2a050/tls2a050.component').then(m => m.TLS2A050Component), data: { progNo: 'TLS2A050' } },
  // 作廢發票審核作業
  { path: 'tls2a060', loadComponent: () => import('./tls2a060/tls2a060.component').then(m => m.TLS2A060Component), data: { progNo: 'TLS2A060' } },
  // 收銀員溢欠表(日)
  { path: 'tls2b010', loadComponent: () => import('./tls2b010/tls2b010.component').then(m => m.TLS2B010Component), data: { progNo: 'TLS2B010' } },
  // 收銀員溢欠表(月)
  { path: 'tls2b020', loadComponent: () => import('./tls2b020/tls2b020.component').then(m => m.TLS2B020Component), data: { progNo: 'TLS2B020' } },
  // 專櫃收銀機台溢欠表
  { path: 'tls2b030', loadComponent: () => import('./tls2b030/tls2b030.component').then(m => m.TLS2B030Component), data: { progNo: 'TLS2B030' } },
  // 專櫃日暫存傳票報表
  { path: 'tls2c010', loadComponent: () => import('./tls2c010/tls2c010.component').then(m => m.TLS2C010Component), data: { progNo: 'TLS2C010' } },
  // 日結前檢查作業
  { path: 'tls2c020', loadComponent: () => import('./tls2c020/tls2c020.component').then(m => m.TLS2C020Component), data: { progNo: 'TLS2C020' } },
  // 日結關帳作業
  { path: 'tls2c030', loadComponent: () => import('./tls2c030/tls2c030.component').then(m => m.TLS2C030Component), data: { progNo: 'TLS2C030' } },
  // 專櫃暫存傳票查詢作業
  { path: 'tls2c040', loadComponent: () => import('./tls2c040/tls2c040.component').then(m => m.TLS2C040Component), data: { progNo: 'TLS2C040' } },
  // 專櫃暫存傳票查詢作業 CRU
  { path: 'tls2c040cru', loadComponent: () => import('./tls2c040-cru/tls2c040-cru.component').then(m => m.TLS2C040CRUComponent), data: { progNo: 'TLS2C040' } },
  // 發票匯總作業
  { path: 'tls2c050', loadComponent: () => import('./tls2c050/tls2c050.component').then(m => m.TLS2C050Component), data: { progNo: 'TLS2C050' } },
  // 代扣款補登作業
  { path: 'tls2d010', loadComponent: () => import('./tls2d010/tls2d010.component').then(m => m.TLS2D010Component), data: { progNo: 'TLS2D010' } },
  // 專櫃代扣款試算作業
  { path: 'tls2d020', loadComponent: () => import('./tls2d020/tls2d020.component').then(m => m.TLS2D020Component), data: { progNo: 'TLS2D020' } },
  // 專櫃代扣款結算作業
  { path: 'tls2d030', loadComponent: () => import('./tls2d030/tls2d030.component').then(m => m.TLS2D030Component), data: { progNo: 'TLS2D030' } },
  // 專櫃代扣款明細表
  { path: 'tls2d040', loadComponent: () => import('./tls2d040/tls2d040.component').then(m => m.TLS2D040Component), data: { progNo: 'TLS2D040' } },
  // 專櫃租金結算作業
  { path: 'tls2e010', loadComponent: () => import('./tls2e010/tls2e010.component').then(m => m.TLS2E010Component), data: { progNo: 'TLS2E010' } },
  // 專櫃抽成金額結算作業
  { path: 'tls2e020', loadComponent: () => import('./tls2e020/tls2e020.component').then(m => m.TLS2E020Component), data: { progNo: 'TLS2E020' } },
  // 專櫃帳款試算作業
  { path: 'tls2e030', loadComponent: () => import('./tls2e030/tls2e030.component').then(m => m.TLS2E030Component), data: { progNo: 'TLS2E030' } },
  // 專櫃帳款試算彙總表
  { path: 'tls2e050', loadComponent: () => import('./tls2e050/tls2e050.component').then(m => m.TLS2E050Component), data: { progNo: 'TLS2E050' } },
  // 專櫃結帳前調整作業
  { path: 'tls2e060', loadComponent: () => import('./tls2e060/tls2e060.component').then(m => m.TLS2E060Component), data: { progNo: 'TLS2E060' } },
  // 專櫃帳款結算作業
  { path: 'tls2e070', loadComponent: () => import('./tls2e070/tls2e070.component').then(m => m.TLS2E070Component), data: { progNo: 'TLS2E070' } },
  // 專櫃對帳單
  { path: 'tls2e080', loadComponent: () => import('./tls2e080/tls2e080.component').then(m => m.TLS2E080Component), data: { progNo: 'TLS2E080' } },
  // 專櫃帳款結算彙總表
  { path: 'tls2e090', loadComponent: () => import('./tls2e090/tls2e090.component').then(m => m.TLS2E090Component), data: { progNo: 'TLS2E090' } },
  // 年度對帳單
  { path: 'tls2e100', loadComponent: () => import('./tls2e100/tls2e100.component').then(m => m.TLS2E100Component), data: { progNo: 'TLS2E100' } },
  // 廠商發票請款登入暨維護作業
  { path: 'tls2f010', loadComponent: () => import('./tls2f010/tls2f010.component').then(m => m.TLS2F010Component), data: { progNo: 'TLS2F010' } },
  // 專櫃暫存應付帳款產生作業
  { path: 'tls2f020', loadComponent: () => import('./tls2f020/tls2f020.component').then(m => m.TLS2F020Component), data: { progNo: 'TLS2F020' } },
  // 專櫃進項發票未開立查詢作業
  { path: 'tls2f030', loadComponent: () => import('./tls2f030/tls2f030.component').then(m => m.TLS2F030Component), data: { progNo: 'TLS2F030' } },
  // 專櫃預估業績轉入作業
  { path: 'tls2g010', loadComponent: () => import('./tls2g010/tls2g010.component').then(m => m.TLS2G010Component), data: { progNo: 'TLS2G010' } },
  // 專櫃預估業績維護作業
  { path: 'tls2g020', loadComponent: () => import('./tls2g020/tls2g020.component').then(m => m.TLS2G020Component), data: { progNo: 'TLS2G020' } },
  // 專櫃預估業績報表
  { path: 'tls2g030', loadComponent: () => import('./tls2g030/tls2g030.component').then(m => m.TLS2G030Component), data: { progNo: 'TLS2G030' } },
  // 預算日報表
  { path: 'tls2g040', loadComponent: () => import('./tls2g040/tls2g040.component').then(m => m.TLS2G040Component), data: { progNo: 'TLS2G040' } },
  // 租金發票套印作業
  { path: 'tls2h010', loadComponent: () => import('./tls2h010/tls2h010.component').then(m => m.TLS2H010Component), data: { progNo: 'TLS2H010' } },
  // 專櫃代扣款發票套印作業
  { path: 'tls2h020', loadComponent: () => import('./tls2h020/tls2h020.component').then(m => m.TLS2H020Component), data: { progNo: 'TLS2H020' } },
  // 專櫃抽成發票套印作業
  { path: 'tls2h030', loadComponent: () => import('./tls2h030/tls2h030.component').then(m => m.TLS2H030Component), data: { progNo: 'TLS2H030' } },
  // 換開品項維護作業
  { path: 'tls2j010', loadComponent: () => import('./tls2j010/tls2j010.component').then(m => m.TLS2J010Component), data: { progNo: 'TLS2J010' } },
  // 大分類換開品項維護作業
  { path: 'tls2j020', loadComponent: () => import('./tls2j020/tls2j020.component').then(m => m.TLS2J020Component), data: { progNo: 'TLS2J020' } },
  // 後台發票換開補登作業
  { path: 'tls2j030', loadComponent: () => import('./tls2j030/tls2j030.component').then(m => m.TLS2J030Component), data: { progNo: 'TLS2J030' } },
  // 發票換開作業
  { path: 'tls2j040', loadComponent: () => import('./tls2j040/tls2j040.component').then(m => m.TLS2J040Component), data: { progNo: 'TLS2J040' } },
  // 傳票項目之會計科目設定作業_NEW CRU
  { path: 'tls21020cru', loadComponent: () => import('./tls21020-cru/tls21020-cru.component').then(m => m.TLS21020CRUComponent), data: { progNo: 'TLS21020' } },
  // 對帳單備註維護作業 CRU
  { path: 'tls21030cru', loadComponent: () => import('./tls21030-cru/tls21030-cru.component').then(m => m.TLS21030CRUComponent), data: { progNo: 'TLS21030' } },
  // 信用卡之卡種維護作業 CRU
  { path: 'tls21040cru', loadComponent: () => import('./tls21040-cru/tls21040-cru.component').then(m => m.TLS21040CRUComponent), data: { progNo: 'TLS21040' } },
  //電子發票上送筆數檢核表 CRU
  { path: 'tls22040cru', loadComponent: () => import('./tls22040-cru/tls22040-cru.component').then(m => m.TLS22040CRUComponent), data: { progNo: 'TLS22040' } },
  // 專櫃日對帳單
  { path: 'tls23120cru', loadComponent: () => import('./tls23120-cru/tls23120-cru.component').then(m => m.TLS23120CRUComponent), data: { progNo: 'TLS23120' } },
  // 交易補登作業 CRU
  { path: 'tls24010cru', loadComponent: () => import('./tls24010-cru/tls24010-cru.component').then(m => m.TLS24010CRUComponent), data: { progNo: 'TLS24010' } },
  // 商場違規扣款維護作業 CRU
  { path: 'tls25030cru', loadComponent: () => import('./tls25030-cru/tls25030-cru.component').then(m => m.TLS25030CRUComponent), data: { progNo: 'TLS25030' } },
  // 預購活動檔期設定 CRU
  { path: 'tls26010cru', loadComponent: () => import('./tls26010-cru/tls26010-cru.component').then(m => m.TLS26010CRUComponent), data: { progNo: 'TLS26010' } },
  // 預售管理作業 CRU
  { path: 'tls26040cru', loadComponent: () => import('./tls26040-cru/tls26040-cru.component').then(m => m.TLS26040CRUComponent), data: { progNo: 'TLS26040' } },
  // 專櫃活動作業 CRU
  { path: 'tls26080cru', loadComponent: () => import('./tls26080-cru/tls26080-cru.component').then(m => m.TLS26080CRUComponent), data: { progNo: 'TLS26080' } },
  // 保全實收現金調整作業 CRU
  { path: 'tls27020cru', loadComponent: () => import('./tls27020-cru/tls27020-cru.component').then(m => m.TLS27020CRUComponent), data: { progNo: 'TLS27020' } },
  // 實收信用卡調整作業 CRU
  { path: 'tls27040cru', loadComponent: () => import('./tls27040-cru/tls27040-cru.component').then(m => m.TLS27040CRUComponent), data: { progNo: 'TLS27040' } },
  // 折扣開放維護作業 CRU
  { path: 'tls29010cru', loadComponent: () => import('./tls29010-cru/tls29010-cru.component').then(m => m.TLS29010CRUComponent), data: { progNo: 'TLS29010' } },
  // 各支付工具審核作業 CRU
  { path: 'tls2a010cru', loadComponent: () => import('./tls2a010-cru/tls2a010-cru.component').then(m => m.TLS2A010CRUComponent), data: { progNo: 'TLS2A010' } },
  // 第三方支付帳差報表 CRU
  { path: 'tls2a050cru', loadComponent: () => import('./tls2a050-cru/tls2a050-cru.component').then(m => m.TLS2A050CRUComponent), data: { progNo: 'TLS2A050' } },
  // 代扣款補登作業 CRU
  { path: 'tls2d010cru', loadComponent: () => import('./tls2d010-cru/tls2d010-cru.component').then(m => m.TLS2D010CRUComponent), data: { progNo: 'TLS2D010' } },
  // 專櫃結帳前調整作業 CRU
  { path: 'tls2e060cru', loadComponent: () => import('./tls2e060-cru/tls2e060-cru.component').then(m => m.TLS2E060CRUComponent), data: { progNo: 'TLS2E060' } },
  // 廠商發票請款登入暨維護作業 CRU
  { path: 'tls2f010cru', loadComponent: () => import('./tls2f010-cru/tls2f010-cru.component').then(m => m.TLS2F010CRUComponent), data: { progNo: 'TLS2F010' } },
  // 專櫃預估業績維護作業 CRU
  { path: 'tls2g020cru', loadComponent: () => import('./tls2g020-cru/tls2g020-cru.component').then(m => m.TLS2G020CRUComponent), data: { progNo: 'TLS2G020' } },
  // 換開品項維護作業 CRU
  { path: 'tls2j010cru', loadComponent: () => import('./tls2j010-cru/tls2j010-cru.component').then(m => m.TLS2J010CRUComponent), data: { progNo: 'TLS2J010' } },
  // 大分類換開品項維護作業 CRU
  { path: 'tls2j020cru', loadComponent: () => import('./tls2j020-cru/tls2j020-cru.component').then(m => m.TLS2J020CRUComponent), data: { progNo: 'TLS2J020' } },
  // 後台發票換開補登作業 CRU
  { path: 'tls2j030cru', loadComponent: () => import('./tls2j030-cru/tls2j030-cru.component').then(m => m.TLS2J030CRUComponent), data: { progNo: 'TLS2J030' } },
  // 即時業績查詢
  { path: 'tls31010', loadComponent: () => import('./tls31010/tls31010.component').then(m => m.TLS31010Component), data: { progNo: 'TLS31010' } },
  // 各樓層之營業報表
  { path: 'tls31020', loadComponent: () => import('./tls31020/tls31020.component').then(m => m.TLS31020Component), data: { progNo: 'TLS31020' } },
  // 各大分類之營業報表
  { path: 'tls31030', loadComponent: () => import('./tls31030/tls31030.component').then(m => m.TLS31030Component), data: { progNo: 'TLS31030' } },
  // 各櫃別之營業報表
  { path: 'tls31040', loadComponent: () => import('./tls31040/tls31040.component').then(m => m.TLS31040Component), data: { progNo: 'TLS31040' } },
  // 各抽成別之營業報表
  { path: 'tls31050', loadComponent: () => import('./tls31050/tls31050.component').then(m => m.TLS31050Component), data: { progNo: 'TLS31050' } },
  // 各組織之營業報表
  { path: 'tls31060', loadComponent: () => import('./tls31060/tls31060.component').then(m => m.TLS31060Component), data: { progNo: 'TLS31060' } },
  // 各營業型態之營業報表
  { path: 'tls31070', loadComponent: () => import('./tls31070/tls31070.component').then(m => m.TLS31070Component), data: { progNo: 'TLS31070' } },
  // 各時段之樓層營業報表
  { path: 'tls31080', loadComponent: () => import('./tls31080/tls31080.component').then(m => m.TLS31080Component), data: { progNo: 'TLS31080' } },
  // 各時段之大分類營業報表
  { path: 'tls31090', loadComponent: () => import('./tls31090/tls31090.component').then(m => m.TLS31090Component), data: { progNo: 'TLS31090' } },
  // 銷售排名分析報表
  { path: 'tls32010', loadComponent: () => import('./tls32010/tls32010.component').then(m => m.TLS32010Component), data: { progNo: 'TLS32010' } },
  // 期間業績分析報表
  { path: 'tls32020', loadComponent: () => import('./tls32020/tls32020.component').then(m => m.TLS32020Component), data: { progNo: 'TLS32020' } },
  // 成長率分析報表
  { path: 'tls32030', loadComponent: () => import('./tls32030/tls32030.component').then(m => m.TLS32030Component), data: { progNo: 'TLS32030' } },
  // 組織業績總表
  { path: 'tls32040', loadComponent: () => import('./tls32040/tls32040.component').then(m => m.TLS32040Component), data: { progNo: 'TLS32040' } },
  // 中分類業績報表
  { path: 'tls32050', loadComponent: () => import('./tls32050/tls32050.component').then(m => m.TLS32050Component), data: { progNo: 'TLS32050' } },
  // 中分類業績報表 CRU
  { path: 'tls32050cru', loadComponent: () => import('./tls32050-cru/tls32050-cru.component').then(m => m.Tls32050CRUComponent), data: { progNo: 'Tls32050' } },
  // 各櫃業績報表
  { path: 'tls32060', loadComponent: () => import('./tls32060/tls32060.component').then(m => m.TLS32060Component), data: { progNo: 'TLS32060' } },
  // 抽成類別分析報表
  { path: 'tls32070', loadComponent: () => import('./tls32070/tls32070.component').then(m => m.TLS32070Component), data: { progNo: 'TLS32070' } },
  // 抽成類別條件分析報表
  { path: 'tls32080', loadComponent: () => import('./tls32080/tls32080.component').then(m => m.TLS32080Component), data: { progNo: 'TLS32080' } },
  // 收銀機基本資料維護
  { path: 'tls41010', loadComponent: () => import('./tls41010/tls41010.component').then(m => m.TLS41010Component), data: { progNo: 'TLS41010' } },
  // 收銀機EDC資料維護
  { path: 'tls41020', loadComponent: () => import('./tls41020/tls41020.component').then(m => m.TLS41020Component), data: { progNo: 'TLS41020' } },
  // 收銀專櫃人員資料維護作業
  { path: 'tls41030', loadComponent: () => import('./tls41030/tls41030.component').then(m => m.TLS41030Component), data: { progNo: 'TLS41030' } },
  // POS清機時間設定
  { path: 'tls41040', loadComponent: () => import('./tls41040/tls41040.component').then(m => m.TLS41040Component), data: { progNo: 'TLS41040' } },
  // 發票訊息維護作業
  { path: 'tls41050', loadComponent: () => import('./tls41050/tls41050.component').then(m => m.TLS41050Component), data: { progNo: 'TLS41050' } },
  // 快速鍵維護作業
  { path: 'tls42010', loadComponent: () => import('./tls42010/tls42010.component').then(m => m.TLS42010Component), data: { progNo: 'TLS42010' } },
  // 快速鍵名稱維護作業
  { path: 'tls42020', loadComponent: () => import('./tls42020/tls42020.component').then(m => m.TLS42020Component), data: { progNo: 'TLS42020' } },
  // 訊息登錄作業
  { path: 'tls43010', loadComponent: () => import('./tls43010/tls43010.component').then(m => m.TLS43010Component), data: { progNo: 'TLS43010' } },
  // 訊息審核作業
  { path: 'tls43020', loadComponent: () => import('./tls43020/tls43020.component').then(m => m.TLS43020Component), data: { progNo: 'TLS43020' } },
  // 訊息群組維護作業
  { path: 'tls43040', loadComponent: () => import('./tls43040/tls43040.component').then(m => m.TLS43040Component), data: { progNo: 'TLS43040' } },
  // POS即時連線監看
  { path: 'tls44010', loadComponent: () => import('./tls44010/tls44010.component').then(m => m.TLS44010Component), data: { progNo: 'TLS44010' } },
  // EDC即時連線監看
  { path: 'tls44020', loadComponent: () => import('./tls44020/tls44020.component').then(m => m.TLS44020Component), data: { progNo: 'TLS44020' } },
  // 收銀機開關機時間表
  { path: 'tls45030', loadComponent: () => import('./tls45030/tls45030.component').then(m => m.TLS45030Component), data: { progNo: 'TLS45030' } },
  // 網路位置設定
  { path: 'tls46010', loadComponent: () => import('./tls46010/tls46010.component').then(m => m.TLS46010Component), data: { progNo: 'TLS46010' } },
  // POS環境變數維護作業
  { path: 'tls46020', loadComponent: () => import('./tls46020/tls46020.component').then(m => m.TLS46020Component), data: { progNo: 'TLS46020' } },
  // 收銀機異動排程維護
  { path: 'tls46030', loadComponent: () => import('./tls46030/tls46030.component').then(m => m.TLS46030Component), data: { progNo: 'TLS46030' } },
  // 設定檔群組維護
  { path: 'tls46040', loadComponent: () => import('./tls46040/tls46040.component').then(m => m.TLS46040Component), data: { progNo: 'TLS46040' } },
  // TM監控報表
  { path: 'tls46050', loadComponent: () => import('./tls46050/tls46050.component').then(m => m.TLS46050Component), data: { progNo: 'TLS46050' } },
  // 整檔下傳作業
  { path: 'tls47010', loadComponent: () => import('./tls47010/tls47010.component').then(m => m.TLS47010Component), data: { progNo: 'TLS47010' } },
  // 收銀機基本資料維護 CRU
  { path: 'tls41010cru', loadComponent: () => import('./tls41010-cru/tls41010-cru.component').then(m => m.TLS41010CRUComponent), data: { progNo: 'TLS41010' } },
  // 收銀機EDC資料維護 CRU
  { path: 'tls41020cru', loadComponent: () => import('./tls41020-cru/tls41020-cru.component').then(m => m.TLS41020CRUComponent), data: { progNo: 'TLS41020' } },
  // 收銀專櫃人員資料維護作業 CRU
  { path: 'tls41030cru', loadComponent: () => import('./tls41030-cru/tls41030-cru.component').then(m => m.TLS41030CRUComponent), data: { progNo: 'TLS41030' } },
  // POS清機時間設定 CRU
  { path: 'tls41040cru', loadComponent: () => import('./tls41040-cru/tls41040-cru.component').then(m => m.TLS41040CRUComponent), data: { progNo: 'TLS41040' } },
  // 發票訊息維護作業 CRU
  { path: 'tls41050cru', loadComponent: () => import('./tls41050-cru/tls41050-cru.component').then(m => m.TLS41050CRUComponent), data: { progNo: 'TLS41050' } },
  // 快速鍵維護作業 CRU
  { path: 'tls42010cru', loadComponent: () => import('./tls42010-cru/tls42010-cru.component').then(m => m.TLS42010CRUComponent), data: { progNo: 'TLS42010' } },
  // 快速鍵名稱維護作業 CRU
  { path: 'tls42020cru', loadComponent: () => import('./tls42020-cru/tls42020-cru.component').then(m => m.TLS42020CRUComponent), data: { progNo: 'TLS42020' } },
  // 訊息登錄作業 CRU
  { path: 'tls43010cru', loadComponent: () => import('./tls43010-cru/tls43010-cru.component').then(m => m.TLS43010CRUComponent), data: { progNo: 'TLS43010' } },
  // 訊息審核作業 CRU
  { path: 'tls43020cru', loadComponent: () => import('./tls43020-cru/tls43020-cru.component').then(m => m.TLS43020CRUComponent), data: { progNo: 'TLS43020' } },
  // 訊息群組維護作業 CRU
  { path: 'tls43040cru', loadComponent: () => import('./tls43040-cru/tls43040-cru.component').then(m => m.TLS43040CRUComponent), data: { progNo: 'TLS43040' } },
  // 網路位置設定 CRU
  { path: 'tls46010cru', loadComponent: () => import('./tls46010-cru/tls46010-cru.component').then(m => m.TLS46010CRUComponent), data: { progNo: 'TLS46010' } },
  // POS環境變數維護作業 CRU
  { path: 'tls46020cru', loadComponent: () => import('./tls46020-cru/tls46020-cru.component').then(m => m.TLS46020CRUComponent), data: { progNo: 'TLS46020' } },
  // 收銀機異動排程維護
  { path: 'tls46030cru', loadComponent: () => import('./tls46030-cru/tls46030-cru.component').then(m => m.TLS46030CRUComponent), data: { progNo: 'TLS46030' } },
  // 設定檔群組維護 CRU
  { path: 'tls46040cru', loadComponent: () => import('./tls46040-cru/tls46040-cru.component').then(m => m.TLS46040CRUComponent), data: { progNo: 'TLS46040' } },
  // 組織預售業績總表
  { path: 'tls26050', loadComponent: () => import('./tls26050/tls26050.component').then(m => m.TLS26050Component), data: { progNo: 'TLS26050' } },
  // 中分類預售業績總表
  { path: 'tls26060', loadComponent: () => import('./tls26060/tls26060.component').then(m => m.TLS26060Component), data: { progNo: 'TLS26060' } },
  // 各櫃預售業績總表
  { path: 'tls26070', loadComponent: () => import('./tls26070/tls26070.component').then(m => m.TLS26070Component), data: { progNo: 'TLS26070' } },


  // 大分類維護作業
  { path: 'tls51010', loadComponent: () => import('./TLS50000/tls51010/tls51010.component').then(m => m.TLS51010Component), data: { progNo: 'TLS51010' } },
  // 中分類維護作業
  { path: 'tls51020', loadComponent: () => import('./TLS50000/tls51020/tls51020.component').then(m => m.TLS51020Component), data: { progNo: 'TLS51020' } },
  // 小分類維護作業
  { path: 'tls51030', loadComponent: () => import('./TLS50000/tls51030/tls51030.component').then(m => m.TLS51030Component), data: { progNo: 'TLS51030' } },
  // 商品單位設定
  { path: 'tls51050', loadComponent: () => import('./TLS50000/tls51050/tls51050.component').then(m => m.TLS51050Component), data: { progNo: 'TLS51050' } },
  // 品牌設定作業
  { path: 'tls51060', loadComponent: () => import('./TLS50000/tls51060/tls51060.component').then(m => m.TLS51060Component), data: { progNo: 'TLS51060' } },
  // 商品基本資料
  { path: 'tls51070', loadComponent: () => import('./TLS50000/tls51070/tls51070.component').then(m => m.TLS51070Component), data: { progNo: 'TLS51070' } },
  // 分倉資料處理
  { path: 'tls51080', loadComponent: () => import('./TLS50000/tls51080/tls51080.component').then(m => m.TLS51080Component), data: { progNo: 'TLS51080' } },
  // 品牌每月可進貨限額維護作業
  { path: 'tls51110', loadComponent: () => import('./TLS50000/tls51110/tls51110.component').then(m => m.TLS51110Component), data: { progNo: 'TLS51110' } },
  // 品牌進貨折數設定作業
  { path: 'tls51130', loadComponent: () => import('./TLS50000/tls51130/tls51130.component').then(m => m.TLS51130Component), data: { progNo: 'TLS51130' } },
  // 自營專櫃收銀扣庫維護作業
  { path: 'tls51140', loadComponent: () => import('./TLS50000/tls51140/tls51140.component').then(m => m.Tls51140Component), data: { progNo: 'Tls51140' } },
  { path: 'tls51150', loadComponent: () => import('./TLS50000/tls51150/tls51150.component').then(m => m.Tls51150Component), data: { progNo: 'Tls51150' } },
  // 採購單維護作業
  { path: 'tls52010', loadComponent: () => import('./TLS50000/tls52010/tls52010.component').then(m => m.TLS52010Component), data: { progNo: 'TLS52010' } },
  // 退貨單維護作業
  { path: 'tls52020', loadComponent: () => import('./TLS50000/tls52020/tls52020.component').then(m => m.TLS52020Component), data: { progNo: 'TLS52020' } },
  // 進貨驗收作業
  { path: 'tls52030', loadComponent: () => import('./TLS50000/tls52030/tls52030.component').then(m => m.TLS52030Component), data: { progNo: 'TLS52030' } },
  // 退貨驗收作業
  { path: 'tls52040', loadComponent: () => import('./TLS50000/tls52040/tls52040.component').then(m => m.TLS52040Component), data: { progNo: 'TLS52040' } },
  // 進價/售價變價作業
  { path: 'tls52050', loadComponent: () => import('./TLS50000/tls52050/tls52050.component').then(m => m.TLS52050Component), data: { progNo: 'TLS52050' } },
  // 盤點單開立
  { path: 'tls53010', loadComponent: () => import('./TLS50000/tls53010/tls53010.component').then(m => m.TLS53010Component), data: { progNo: 'TLS53010' } },
  // 盤點資料匯入作業
  { path: 'tls53020', loadComponent: () => import('./TLS50000/tls53020/tls53020.component').then(m => m.TLS53020Component), data: { progNo: 'TLS53020' } },
  // 盤點資料維護作業
  { path: 'tls53030', loadComponent: () => import('./TLS50000/tls53030/tls53030.component').then(m => m.TLS53030Component), data: { progNo: 'TLS53030' } },
  // 進貨日結作業
  { path: 'tls55010', loadComponent: () => import('./TLS50000/tls55010/tls55010.component').then(m => m.TLS55010Component), data: { progNo: 'TLS55010' } },
  // 自營交易修正作業
  { path: 'tls55020', loadComponent: () => import('./TLS50000/tls55020/tls55020.component').then(m => m.TLS55020Component), data: { progNo: 'TLS55020' } },
  { path: 'tls55020cru', loadComponent: () => import('./TLS50000/tls55020/tls55020-cru/tls55020-cru.component').then(m => m.TLS55020CRUComponent), data: { progNo: 'TLS55020' } },
  // 廠商發票折讓作業
  { path: 'tls55030', loadComponent: () => import('./TLS50000/tls55030/tls55030.component').then(m => m.TLS55030Component), data: { progNo: 'TLS55030' } },
  // 廠商請款作業
  { path: 'tls55040', loadComponent: () => import('./TLS50000/tls55040/tls55040.component').then(m => m.TLS55040Component), data: { progNo: 'TLS55040' } },
  // 月結帳作業
  { path: 'tls55050', loadComponent: () => import('./TLS50000/tls55050/tls55050.component').then(m => m.TLS55050Component), data: { progNo: 'TLS55050' } },
  // 自營暫存傳票查詢作業
  { path: 'tls55060', loadComponent: () => import('./TLS50000/tls55060/tls55060.component').then(m => m.TLS55060Component), data: { progNo: 'TLS55060' } },
  { path: 'tls55060cru', loadComponent: () => import('./TLS50000/tls55060/tls55060-cru/tls55060-cru.component').then(m => m.TLS55060CRUComponent), data: { progNo: 'TLS55060' } },
  // 銷貨日報查詢列印
  { path: 'tls55070', loadComponent: () => import('./TLS50000/tls55070/tls55070.component').then(m => m.TLS55070Component), data: { progNo: 'TLS55070' } },
  // 商品庫存查詢作業
  { path: 'tls56010', loadComponent: () => import('./TLS50000/tls56010/tls56010.component').then(m => m.TLS56010Component), data: { progNo: 'TLS56010' } },
  // 商品領用(內部)作業
  { path: 'tls56020', loadComponent: () => import('./TLS50000/tls56020/tls56020.component').then(m => m.TLS56020Component), data: { progNo: 'TLS56020' } },
  // 商品退回(內部)作業
  { path: 'tls56030', loadComponent: () => import('./TLS50000/tls56030/tls56030.component').then(m => m.TLS56030Component), data: { progNo: 'TLS56030' } },
  // 倉別調撥申請維護
  { path: 'tls56040', loadComponent: () => import('./TLS50000/tls56040/tls56040.component').then(m => m.TLS56040Component), data: { progNo: 'TLS56040' } },
  // 倉別調撥發貨作業
  { path: 'tls56050', loadComponent: () => import('./TLS50000/tls56050/tls56050.component').then(m => m.TLS56050Component), data: { progNo: 'TLS56050' } },
  // 倉別調撥驗收作業
  { path: 'tls56060', loadComponent: () => import('./TLS50000/tls56060/tls56060.component').then(m => m.TLS56060Component), data: { progNo: 'TLS56060' } },
  // 商品報廢維護
  { path: 'tls56070', loadComponent: () => import('./TLS50000/tls56070/tls56070.component').then(m => m.TLS56070Component), data: { progNo: 'TLS56070' } },
  // 同業調撥作業
  { path: 'tls56080', loadComponent: () => import('./TLS50000/tls56080/tls56080.component').then(m => m.TLS56080Component), data: { progNo: 'TLS56080' } },
  // 同業調撥作業 CRU
  { path: 'tls56080cru', loadComponent: () => import('./TLS50000/tls56080/tls56080-cru/tls56080-cru.component').then(m => m.TLS56080CRUComponent), data: { progNo: 'TLS56080' } },
  // 採購統計表
  { path: 'tls57010', loadComponent: () => import('./TLS50000/tls57010/tls57010.component').then(m => m.TLS57010Component), data: { progNo: 'TLS57010' } },
  // 廠商應付帳款明細表
  { path: 'tls57020', loadComponent: () => import('./TLS50000/tls57020/tls57020.component').then(m => m.TLS57020Component), data: { progNo: 'TLS57020' } },
  // 商品庫存表
  { path: 'tls57030', loadComponent: () => import('./TLS50000/tls57030/tls57030.component').then(m => m.TLS57030Component), data: { progNo: 'TLS57030' } },
  // 商品目錄表
  { path: 'tls57040', loadComponent: () => import('./TLS50000/tls57040/tls57040.component').then(m => m.TLS57040Component), data: { progNo: 'TLS57040' } },
  // 收銀機發票商品統計表
  { path: 'tls57050', loadComponent: () => import('./TLS50000/tls57050/tls57050.component').then(m => m.TLS57050Component), data: { progNo: 'TLS57050' } },
  // EC銷售商品統計表
  { path: 'tls57060', loadComponent: () => import('./TLS50000/tls57060/tls57060.component').then(m => m.TLS57060Component), data: { progNo: 'TLS57060' } },
  // 存貨月結表
  { path: 'tls57070', loadComponent: () => import('./TLS50000/tls57070/tls57070.component').then(m => m.TLS57070Component), data: { progNo: 'TLS57070' } },
  // 庫存數量異動明細表
  { path: 'tls57080', loadComponent: () => import('./TLS50000/tls57080/tls57080.component').then(m => m.TLS57080Component), data: { progNo: 'TLS57080' } },
  // 進貨/進退單據統計表
  { path: 'tls57090', loadComponent: () => import('./TLS50000/tls57090/tls57090.component').then(m => m.TLS57090Component), data: { progNo: 'TLS57090' } },
  // 驗收/驗退單據統計表
  { path: 'tls57100', loadComponent: () => import('./TLS50000/tls57100/tls57100.component').then(m => m.TLS57100Component), data: { progNo: 'TLS57100' } },
  // 存貨月結庫存表
  { path: 'tls57110', loadComponent: () => import('./TLS50000/tls57110/tls57110.component').then(m => m.TLS57110Component), data: { progNo: 'TLS57110' } },
  // 滯銷商品統計表
  { path: 'tls57120', loadComponent: () => import('./TLS50000/tls57120/tls57120.component').then(m => m.TLS57120Component), data: { progNo: 'TLS57120' } },
  // 銷售排行報表
  { path: 'tls57130', loadComponent: () => import('./TLS50000/tls57130/tls57130.component').then(m => m.TLS57130Component), data: { progNo: 'TLS57130' } },
  // 商品迴轉率
  { path: 'tls57140', loadComponent: () => import('./TLS50000/tls57140/tls57140.component').then(m => m.TLS57140Component), data: { progNo: 'TLS57140' } },
  // 盤點統計表
  { path: 'tls57150', loadComponent: () => import('./TLS50000/tls57150/tls57150.component').then(m => m.TLS57150Component), data: { progNo: 'TLS57150' } },
  // 庫齡分析表
  { path: 'tls57160', loadComponent: () => import('./TLS50000/tls57160/tls57160.component').then(m => m.TLS57160Component), data: { progNo: 'TLS57160' } },
  // 存貨評價分析表
  { path: 'tls57170', loadComponent: () => import('./TLS50000/tls57170/tls57170.component').then(m => m.TLS57170Component), data: { progNo: 'TLS57170' } },
  // 自營廠商綜合對帳單
  { path: 'tls57180', loadComponent: () => import('./TLS50000/tls57180/tls57180.component').then(m => m.TLS57180Component), data: { progNo: 'TLS57180' } },
  // 存貨評價分析表
  { path: 'tls57190', loadComponent: () => import('./TLS50000/tls57190/tls57190.component').then(m => m.TLS57190Component), data: { progNo: 'TLS57190' } },
  // 大分類維護作業 CRU
  { path: 'tls51010cru', loadComponent: () => import('./TLS50000/tls51010/tls51010-cru/tls51010-cru.component').then(m => m.TLS51010CRUComponent), data: { progNo: 'TLS51010' } },
  // 中分類維護作業 CRU
  { path: 'tls51020cru', loadComponent: () => import('./TLS50000/tls51020/tls51020-cru/tls51020-cru.component').then(m => m.TLS51020CRUComponent), data: { progNo: 'TLS51020' } },
  // 小分類維護作業 CRU
  { path: 'tls51030cru', loadComponent: () => import('./TLS50000/tls51030/tls51030-cru/tls51030-cru.component').then(m => m.TLS51030CRUComponent), data: { progNo: 'TLS51030' } },
  // 商品單位設定 CRU
  { path: 'tls51050cru', loadComponent: () => import('./TLS50000/tls51050/tls51050-cru/tls51050-cru.component').then(m => m.TLS51050CRUComponent), data: { progNo: 'TLS51050' } },
  // 品牌設定作業 CRU
  { path: 'tls51060cru', loadComponent: () => import('./TLS50000/tls51060/tls51060-cru/tls51060-cru.component').then(m => m.TLS51060CRUComponent), data: { progNo: 'TLS51060' } },
  // 商品基本資料 CRU
  { path: 'tls51070cru', loadComponent: () => import('./TLS50000/tls51070/tls51070-cru/tls51070-cru.component').then(m => m.TLS51070CRUComponent), data: { progNo: 'TLS51070' } },
  // 商品基本資料 OS
  { path: 'tls51070os', loadComponent: () => import('./TLS50000/tls51070/tls51070-os/tls51070-os.component').then(m => m.Tls51070OsComponent), data: { progNo: 'tls51070' } },
  // 分倉資料處理 CRU
  { path: 'tls51080cru', loadComponent: () => import('./TLS50000/tls51080/tls51080-cru/tls51080-cru.component').then(m => m.TLS51080CRUComponent), data: { progNo: 'TLS51080' } },
  // 品牌每月可進貨限額維護作業 CRU
  { path: 'tls51110cru', loadComponent: () => import('./TLS50000/tls51110/tls51110-cru/tls51110-cru.component').then(m => m.TLS51110CRUComponent), data: { progNo: 'TLS51110' } },
  // 品牌進貨折數設定作業 CRU
  { path: 'tls51130cru', loadComponent: () => import('./TLS50000/tls51130/tls51130-cru/tls51130-cru.component').then(m => m.TLS51130CRUComponent), data: { progNo: 'TLS51130' } },
  // 自營專櫃收銀扣庫維護作業 CRU
  { path: 'tls51140cru', loadComponent: () => import('./TLS50000/tls51140/tls51140-cru/tls51140-cru.component').then(m => m.Tls51140CruComponent), data: { progNo: 'Tls51140' } },
  // 採購單維護作業 CRU
  { path: 'tls52010cru', loadComponent: () => import('./TLS50000/tls52010/tls52010-cru/tls52010-cru.component').then(m => m.TLS52010CRUComponent), data: { progNo: 'TLS52010' } },
  // 退貨單維護作業 CRU
  { path: 'tls52020cru', loadComponent: () => import('./TLS50000/tls52020/tls52020-cru/tls52020-cru.component').then(m => m.TLS52020CRUComponent), data: { progNo: 'TLS52020' } },
  // 進貨驗收作業 CRU
  { path: 'tls52030cru', loadComponent: () => import('./TLS50000/tls52030/tls52030-cru/tls52030-cru.component').then(m => m.TLS52030CRUComponent), data: { progNo: 'TLS52030' } },
  // 退貨驗收作業 CRU
  { path: 'tls52040cru', loadComponent: () => import('./TLS50000/tls52040/tls52040-cru/tls52040-cru.component').then(m => m.TLS52040CRUComponent), data: { progNo: 'TLS52040' } },
  // 進價/售價變價作業 CRU
  { path: 'tls52050cru', loadComponent: () => import('./TLS50000/tls52050/tls52050-cru/tls52050-cru.component').then(m => m.TLS52050CRUComponent), data: { progNo: 'TLS52050' } },
  // 盤點單開立 CRU
  { path: 'tls53010cru', loadComponent: () => import('./TLS50000/tls53010/tls53010-cru/tls53010-cru.component').then(m => m.TLS53010CRUComponent), data: { progNo: 'TLS53010' } },
  // 盤點資料維護作業 CRU
  { path: 'tls53030cru', loadComponent: () => import('./TLS50000/tls53030/tls53030-cru/tls53030-cru.component').then(m => m.TLS53030CRUComponent), data: { progNo: 'TLS53030' } },
  // 廠商發票折讓作業 CRU
  { path: 'tls55030cru', loadComponent: () => import('./TLS50000/tls55030/tls55030-cru/tls55030-cru.component').then(m => m.TLS55030CRUComponent), data: { progNo: 'TLS55030' } },
  // 廠商請款作業 CRU
  { path: 'tls55040cru', loadComponent: () => import('./TLS50000/tls55040/tls55040-cru/tls55040-cru.component').then(m => m.TLS55040CRUComponent), data: { progNo: 'TLS55040' } },
  // 月結帳作業 CRU
  { path: 'tls55050cru', loadComponent: () => import('./TLS50000/tls55050/tls55050-cru/tls55050-cru.component').then(m => m.TLS55050CRUComponent), data: { progNo: 'TLS55050' } },
  // 商品領用(內部)作業 CRU
  { path: 'tls56020cru', loadComponent: () => import('./TLS50000/tls56020/tls56020-cru/tls56020-cru.component').then(m => m.TLS56020CRUComponent), data: { progNo: 'TLS56020' } },
  // 商品退回(內部)作業 CRU
  { path: 'tls56030cru', loadComponent: () => import('./TLS50000/tls56030/tls56030-cru/tls56030-cru.component').then(m => m.TLS56030CRUComponent), data: { progNo: 'TLS56030' } },
  // 倉別調撥申請維護 CRU
  { path: 'tls56040cru', loadComponent: () => import('./TLS50000/tls56040/tls56040-cru/tls56040-cru.component').then(m => m.TLS56040CRUComponent), data: { progNo: 'TLS56040' } },
  // 倉別調撥發貨作業 CRU
  { path: 'tls56050cru', loadComponent: () => import('./TLS50000/tls56050/tls56050-cru/tls56050-cru.component').then(m => m.TLS56050CRUComponent), data: { progNo: 'TLS56050' } },
  // 倉別調撥驗收作業 CRU
  { path: 'tls56060cru', loadComponent: () => import('./TLS50000/tls56060/tls56060-cru/tls56060-cru.component').then(m => m.TLS56060CRUComponent), data: { progNo: 'TLS56060' } },
  // 商品報廢維護 CRU
  { path: 'tls56070cru', loadComponent: () => import('./TLS50000/tls56070/tls56070-cru/tls56070-cru.component').then(m => m.TLS56070CRUComponent), data: { progNo: 'TLS56070' } },
];
