import { Routes } from '@angular/router';

export const tlsRoutes: Routes = [
  // 整批新增合約扣款作業
  { path: 'tls13080', loadComponent: () => import('./tls13080/tls13080.component').then(m => m.TLS13080Component), data: { progNo: 'TLS13080' } },
  // 櫃位營運事項明細查詢作業
  { path: 'tls13060', loadComponent: () => import('./tls13060/tls13060.component').then(m => m.TLS13060Component), data: { progNo: 'TLS13060' } },
  // 調整櫃位合約一覽表
  { path: 'tls13070', loadComponent: () => import('./tls13070/tls13070.component').then(m => m.TLS13070Component), data: { progNo: 'TLS13070' } },
  // 對帳單備註維護作業
  { path: 'tls21030', loadComponent: () => import('./tls21030/tls21030.component').then(m => m.TLS21030Component), data: { progNo: 'TLS21030' } },
  // 對帳單備註維護作業 CRU
  { path: 'tls21030cru', loadComponent: () => import('./tls21030-cru/tls21030-cru.component').then(m => m.TLS21030CRUComponent), data: { progNo: 'TLS21030' } },
  // 信用卡之卡種維護作業
  { path: 'tls21040', loadComponent: () => import('./tls21040/tls21040.component').then(m => m.TLS21040Component), data: { progNo: 'TLS21040' } },
  // 信用卡之卡種維護作業 CRU
  { path: 'tls21040cru', loadComponent: () => import('./tls21040-cru/tls21040-cru.component').then(m => m.TLS21040CRUComponent), data: { progNo: 'TLS21040' } },
  // 交易補登作業
  { path: 'tls24010', loadComponent: () => import('./tls24010/tls24010.component').then(m => m.TLS24010Component), data: { progNo: 'TLS24010' } },
  // 交易補登作業 CRU
  { path: 'tls24010cru', loadComponent: () => import('./tls24010-cru/tls24010-cru.component').then(m => m.TLS24010CRUComponent), data: { progNo: 'TLS24010' } },
  // 交易明細查詢
  { path: 'tls24030', loadComponent: () => import('./tls24030/tls24030.component').then(m => m.TLS24030Component), data: { progNo: 'TLS24030' } },
  // 交易明細查詢 CRU
  { path: 'tls24030cru', loadComponent: () => import('./tls24030/tls24030-cru/tls24030-cru.component').then(m => m.TLS24030CRUComponent), data: { progNo: 'TLS24030' } },
  // 交易資料修正報表
  { path: 'tls24020', loadComponent: () => import('./tls24020/tls24020.component').then(m => m.TLS24020Component), data: { progNo: 'TLS24020' } },
  // 保全現金資料轉入作業
  { path: 'tls27010', loadComponent: () => import('./tls27010/tls27010.component').then(m => m.TLS27010Component), data: { progNo: 'TLS27010' } },
  // 保全實收現金調整作業
  { path: 'tls27020', loadComponent: () => import('./tls27020/tls27020.component').then(m => m.TLS27020Component), data: { progNo: 'TLS27020' } },
  // 保全實收現金調整作業 CRU
  { path: 'tls27020cru', loadComponent: () => import('./tls27020-cru/tls27020-cru.component').then(m => m.TLS27020CRUComponent), data: { progNo: 'TLS27020' } },
  // 信用卡資料轉入作業
  { path: 'tls27030', loadComponent: () => import('./tls27030/tls27030.component').then(m => m.TLS27030Component), data: { progNo: 'TLS27030' } },
  // 實收信用卡調整作業
  { path: 'tls27040', loadComponent: () => import('./tls27040/tls27040.component').then(m => m.TLS27040Component), data: { progNo: 'TLS27040' } },
  // 實收信用卡調整作業 CRU
  { path: 'tls27040cru', loadComponent: () => import('./tls27040-cru/tls27040-cru.component').then(m => m.TLS27040CRUComponent), data: { progNo: 'TLS27040' } },
  // 查詢無系統帳資料報表
  { path: 'tls27050', loadComponent: () => import('./tls27050/tls27050.component').then(m => m.TLS27050Component), data: { progNo: 'TLS27050' } },
  // 專櫃暫存傳票查詢作業
  { path: 'tls2c040', loadComponent: () => import('./tls2c040/tls2c040.component').then(m => m.TLS2C040Component), data: { progNo: 'TLS2C040' } },
  // 專櫃暫存傳票查詢作業 CRU
  { path: 'tls2c040cru', loadComponent: () => import('./tls2c040-cru/tls2c040-cru.component').then(m => m.TLS2C040CRUComponent), data: { progNo: 'TLS2C040' } },
  // 發票匯總作業
  { path: 'tls2c050', loadComponent: () => import('./tls2c050/tls2c050.component').then(m => m.TLS2C050Component), data: { progNo: 'TLS2C050' } },
  // 專櫃代扣款試算作業
  { path: 'tls2d020', loadComponent: () => import('./tls2d020/tls2d020.component').then(m => m.TLS2D020Component), data: { progNo: 'TLS2D020' } },
  // 專櫃代扣款結算作業
  { path: 'tls2d030', loadComponent: () => import('./tls2d030/tls2d030.component').then(m => m.TLS2D030Component), data: { progNo: 'TLS2D030' } },
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
  // 專櫃結帳前調整作業 CRU
  { path: 'tls2e060cru', loadComponent: () => import('./tls2e060-cru/tls2e060-cru.component').then(m => m.TLS2E060CRUComponent), data: { progNo: 'TLS2E060' } },
  // 專櫃帳款結算作業
  { path: 'tls2e070', loadComponent: () => import('./tls2e070/tls2e070.component').then(m => m.TLS2E070Component), data: { progNo: 'TLS2E070' } },
  // 專櫃對帳單
  { path: 'tls2e080', loadComponent: () => import('./tls2e080/tls2e080.component').then(m => m.TLS2E080Component), data: { progNo: 'TLS2E080' } },
  // 專櫃帳款結算彙總表
  { path: 'tls2e090', loadComponent: () => import('./tls2e090/tls2e090.component').then(m => m.TLS2E090Component), data: { progNo: 'TLS2E090' } },
  // 專櫃預估業績轉入作業
  { path: 'tls2g010', loadComponent: () => import('./tls2g010/tls2g010.component').then(m => m.TLS2G010Component), data: { progNo: 'TLS2G010' } },
  // 專櫃預估業績報表
  { path: 'tls2g030', loadComponent: () => import('./tls2g030/tls2g030.component').then(m => m.TLS2G030Component), data: { progNo: 'TLS2G030' } },
  // 預算日報表
  { path: 'tls2g040', loadComponent: () => import('./tls2g040/tls2g040.component').then(m => m.TLS2G040Component), data: { progNo: 'TLS2G040' } },
  // 即時業績查詢
  { path: 'tls31010', loadComponent: () => import('./tls31010/tls31010.component').then(m => m.TLS31010Component), data: { progNo: 'TLS31010' } },
  // 銷售排名分析報表
  { path: 'tls32010', loadComponent: () => import('./tls32010/tls32010.component').then(m => m.TLS32010Component), data: { progNo: 'TLS32010' } },
  // 期間業績分析報表
  { path: 'tls32020', loadComponent: () => import('./tls32020/tls32020.component').then(m => m.TLS32020Component), data: { progNo: 'TLS32020' } },
  // 成長率分析報表
  { path: 'tls32030', loadComponent: () => import('./tls32030/tls32030.component').then(m => m.TLS32030Component), data: { progNo: 'TLS32030' } },
  // 收銀機基本資料維護
  { path: 'tls41010', loadComponent: () => import('./tls41010/tls41010.component').then(m => m.TLS41010Component), data: { progNo: 'TLS41010' } },
  // 收銀機基本資料維護 CRU
  { path: 'tls41010cru', loadComponent: () => import('./tls41010-cru/tls41010-cru.component').then(m => m.TLS41010CRUComponent), data: { progNo: 'TLS41010' } },
  // 快速鍵維護作業
  { path: 'tls42010', loadComponent: () => import('./tls42010/tls42010.component').then(m => m.TLS42010Component), data: { progNo: 'TLS42010' } },
  // 快速鍵維護作業 CRU
  { path: 'tls42010cru', loadComponent: () => import('./tls42010-cru/tls42010-cru.component').then(m => m.TLS42010CRUComponent), data: { progNo: 'TLS42010' } },
  // 快速鍵名稱維護作業
  { path: 'tls42020', loadComponent: () => import('./tls42020/tls42020.component').then(m => m.TLS42020Component), data: { progNo: 'TLS42020' } },
  // 快速鍵名稱維護作業 CRU
  { path: 'tls42020cru', loadComponent: () => import('./tls42020-cru/tls42020-cru.component').then(m => m.TLS42020CRUComponent), data: { progNo: 'TLS42020' } },
  // 訊息登錄作業
  { path: 'tls43010', loadComponent: () => import('./tls43010/tls43010.component').then(m => m.TLS43010Component), data: { progNo: 'TLS43010' } },
  // 訊息登錄作業 CRU
  { path: 'tls43010cru', loadComponent: () => import('./tls43010-cru/tls43010-cru.component').then(m => m.TLS43010CRUComponent), data: { progNo: 'TLS43010' } },
  // 訊息審核作業
  { path: 'tls43020', loadComponent: () => import('./tls43020/tls43020.component').then(m => m.TLS43020Component), data: { progNo: 'TLS43020' } },
  // 訊息審核作業 CRU
  { path: 'tls43020cru', loadComponent: () => import('./tls43020-cru/tls43020-cru.component').then(m => m.TLS43020CRUComponent), data: { progNo: 'TLS43020' } },
  // 收銀機開關機時間表
  { path: 'tls45030', loadComponent: () => import('./tls45030/tls45030.component').then(m => m.TLS45030Component), data: { progNo: 'TLS45030' } },
  // POS環境變數維護作業
  { path: 'tls46020', loadComponent: () => import('./tls46020/tls46020.component').then(m => m.TLS46020Component), data: { progNo: 'TLS46020' } },
  // POS環境變數維護作業 CRU
  { path: 'tls46020cru', loadComponent: () => import('./tls46020-cru/tls46020-cru.component').then(m => m.TLS46020CRUComponent), data: { progNo: 'TLS46020' } },
  // TM監控報表
  { path: 'tls46050', loadComponent: () => import('./tls46050/tls46050.component').then(m => m.TLS46050Component), data: { progNo: 'TLS46050' } },
  // 自營專櫃收銀扣庫維護作業
  { path: 'tls51140', loadComponent: () => import('./tls51140/tls51140.component').then(m => m.Tls51140Component), data: { progNo: 'Tls51140' } },
  // 自營專櫃收銀扣庫維護作業 CRU
  { path: 'tls51140cru', loadComponent: () => import('./tls51140-cru/tls51140-cru.component').then(m => m.Tls51140CruComponent), data: { progNo: 'Tls51140' } },
  // 自營傳票項目設定作業
  { path: 'tls51150', loadComponent: () => import('./tls51150/tls51150.component').then(m => m.Tls51150Component), data: { progNo: 'Tls51150' } },
  // 採購單維護作業
  { path: 'tls52010', loadComponent: () => import('./tls52010/tls52010.component').then(m => m.TLS52010Component), data: { progNo: 'TLS52010' } },
  // 退貨單維護作業
  { path: 'tls52020', loadComponent: () => import('./tls52020/tls52020.component').then(m => m.TLS52020Component), data: { progNo: 'TLS52020' } },
  // 進貨驗收作業
  { path: 'tls52030', loadComponent: () => import('./tls52030/tls52030.component').then(m => m.TLS52030Component), data: { progNo: 'TLS52030' } },
  // 退貨驗收作業
  { path: 'tls52040', loadComponent: () => import('./tls52040/tls52040.component').then(m => m.TLS52040Component), data: { progNo: 'TLS52040' } },
  // 進價/售價變價作業
  { path: 'tls52050', loadComponent: () => import('./tls52050/tls52050.component').then(m => m.TLS52050Component), data: { progNo: 'TLS52050' } },
  // 採購單維護作業 CRU
  { path: 'tls52010cru', loadComponent: () => import('./tls52010-cru/tls52010-cru.component').then(m => m.TLS52010CRUComponent), data: { progNo: 'TLS52010' } },
  // 退貨單維護作業 CRU
  { path: 'tls52020cru', loadComponent: () => import('./tls52020-cru/tls52020-cru.component').then(m => m.TLS52020CRUComponent), data: { progNo: 'TLS52020' } },
  // 進貨驗收作業 CRU
  { path: 'tls52030cru', loadComponent: () => import('./tls52030-cru/tls52030-cru.component').then(m => m.TLS52030CRUComponent), data: { progNo: 'TLS52030' } },
  // 退貨驗收作業 CRU
  { path: 'tls52040cru', loadComponent: () => import('./tls52040-cru/tls52040-cru.component').then(m => m.TLS52040CRUComponent), data: { progNo: 'TLS52040' } },
  // 進價/售價變價作業 CRU
  { path: 'tls52050cru', loadComponent: () => import('./tls52050-cru/tls52050-cru.component').then(m => m.TLS52050CRUComponent), data: { progNo: 'TLS52050' } },
  // 進貨日結作業
  { path: 'tls55010', loadComponent: () => import('./tls55010/tls55010.component').then(m => m.TLS55010Component), data: { progNo: 'TLS55010' } },
  // 自營交易修正作業
  { path: 'tls55020', loadComponent: () => import('./tls55020/tls55020.component').then(m => m.TLS55020Component), data: { progNo: 'TLS55020' } },
  { path: 'tls55020cru', loadComponent: () => import('./tls55020/tls55020-cru/tls55020-cru.component').then(m => m.TLS55020CRUComponent), data: { progNo: 'TLS55020' } },
  // 廠商發票折讓作業
  { path: 'tls55030', loadComponent: () => import('./tls55030/tls55030.component').then(m => m.TLS55030Component), data: { progNo: 'TLS55030' } },
  // 廠商發票折讓作業 CRU
  { path: 'tls55030cru', loadComponent: () => import('./tls55030-cru/tls55030-cru.component').then(m => m.TLS55030CRUComponent), data: { progNo: 'TLS55030' } },
  // 廠商請款作業
  { path: 'tls55040', loadComponent: () => import('./tls55040/tls55040.component').then(m => m.TLS55040Component), data: { progNo: 'TLS55040' } },
  // 廠商請款作業 CRU
  { path: 'tls55040cru', loadComponent: () => import('./tls55040-cru/tls55040-cru.component').then(m => m.TLS55040CRUComponent), data: { progNo: 'TLS55040' } },
  // 月結帳作業
  { path: 'tls55050', loadComponent: () => import('./tls55050/tls55050.component').then(m => m.TLS55050Component), data: { progNo: 'TLS55050' } },
  // 月結帳作業 CRU
  { path: 'tls55050cru', loadComponent: () => import('./tls55050-cru/tls55050-cru.component').then(m => m.TLS55050CRUComponent), data: { progNo: 'TLS55050' } },
  // 自營暫存傳票查詢作業
  { path: 'tls55060', loadComponent: () => import('./tls55060/tls55060.component').then(m => m.TLS55060Component), data: { progNo: 'TLS55060' } },
  { path: 'tls55060cru', loadComponent: () => import('./tls55060-cru/tls55060-cru.component').then(m => m.TLS55060CRUComponent), data: { progNo: 'TLS55060' } },
  // 銷貨日報查詢列印
  { path: 'tls55070', loadComponent: () => import('./tls55070/tls55070.component').then(m => m.TLS55070Component), data: { progNo: 'TLS55070' } },
  // 倉別調撥申請維護
  { path: 'tls56040', loadComponent: () => import('./tls56040/tls56040.component').then(m => m.TLS56040Component), data: { progNo: 'TLS56040' } },
  // 倉別調撥發貨作業
  { path: 'tls56050', loadComponent: () => import('./tls56050/tls56050.component').then(m => m.TLS56050Component), data: { progNo: 'TLS56050' } },
  // 倉別調撥驗收作業
  { path: 'tls56060', loadComponent: () => import('./tls56060/tls56060.component').then(m => m.TLS56060Component), data: { progNo: 'TLS56060' } },
  // 商品報廢維護
  { path: 'tls56070', loadComponent: () => import('./tls56070/tls56070.component').then(m => m.TLS56070Component), data: { progNo: 'TLS56070' } },
  // 同業調撥作業
  { path: 'tls56080', loadComponent: () => import('./tls56080/tls56080.component').then(m => m.TLS56080Component), data: { progNo: 'TLS56080' } },
  // 倉別調撥申請維護 CRU
  { path: 'tls56040cru', loadComponent: () => import('./tls56040-cru/tls56040-cru.component').then(m => m.TLS56040CRUComponent), data: { progNo: 'TLS56040' } },
  // 倉別調撥發貨作業 CRU
  { path: 'tls56050cru', loadComponent: () => import('./tls56050-cru/tls56050-cru.component').then(m => m.TLS56050CRUComponent), data: { progNo: 'TLS56050' } },
  // 倉別調撥驗收作業 CRU
  { path: 'tls56060cru', loadComponent: () => import('./tls56060-cru/tls56060-cru.component').then(m => m.TLS56060CRUComponent), data: { progNo: 'TLS56060' } },
  // 商品報廢維護 CRU
  { path: 'tls56070cru', loadComponent: () => import('./tls56070-cru/tls56070-cru.component').then(m => m.TLS56070CRUComponent), data: { progNo: 'TLS56070' } },
  // 同業調撥作業 CRU
  { path: 'tls56080cru', loadComponent: () => import('./tls56080-cru/tls56080-cru.component').then(m => m.TLS56080CRUComponent), data: { progNo: 'TLS56080' } },
  // 採購統計表
  { path: 'tls57010', loadComponent: () => import('./tls57010/tls57010.component').then(m => m.TLS57010Component), data: { progNo: 'TLS57010' } },
  // 廠商應付帳款明細表
  { path: 'tls57020', loadComponent: () => import('./tls57020/tls57020.component').then(m => m.TLS57020Component), data: { progNo: 'TLS57020' } },
  // 商品庫存表
  { path: 'tls57030', loadComponent: () => import('./tls57030/tls57030.component').then(m => m.TLS57030Component), data: { progNo: 'TLS57030' } },
  // 商品目錄表
  { path: 'tls57040', loadComponent: () => import('./tls57040/tls57040.component').then(m => m.TLS57040Component), data: { progNo: 'TLS57040' } },
  // 收銀機發票商品統計表
  { path: 'tls57050', loadComponent: () => import('./tls57050/tls57050.component').then(m => m.TLS57050Component), data: { progNo: 'TLS57050' } },
  // EC銷售商品統計表
  { path: 'tls57060', loadComponent: () => import('./tls57060/tls57060.component').then(m => m.TLS57060Component), data: { progNo: 'TLS57060' } },
  // 存貨月結表
  { path: 'tls57070', loadComponent: () => import('./tls57070/tls57070.component').then(m => m.TLS57070Component), data: { progNo: 'TLS57070' } },
  // 庫存數量異動明細表
  { path: 'tls57080', loadComponent: () => import('./tls57080/tls57080.component').then(m => m.TLS57080Component), data: { progNo: 'TLS57080' } },
  // 進貨/進退單據統計表
  { path: 'tls57090', loadComponent: () => import('./tls57090/tls57090.component').then(m => m.TLS57090Component), data: { progNo: 'TLS57090' } },
  // 驗收/驗退單據統計表
  { path: 'tls57100', loadComponent: () => import('./tls57100/tls57100.component').then(m => m.TLS57100Component), data: { progNo: 'TLS57100' } },
  // 存貨月結庫存表
  { path: 'tls57110', loadComponent: () => import('./tls57110/tls57110.component').then(m => m.TLS57110Component), data: { progNo: 'TLS57110' } },
  { path: 'tls57110cru', loadComponent: () => import('./tls57110-cru/tls57110-cru.component').then(m => m.TLS57110CRUComponent), data: { progNo: 'TLS57110' } },
  // 滯銷商品統計表
  { path: 'tls57120', loadComponent: () => import('./tls57120/tls57120.component').then(m => m.TLS57120Component), data: { progNo: 'TLS57120' } },
  // 銷售排行報表
  { path: 'tls57130', loadComponent: () => import('./tls57130/tls57130.component').then(m => m.TLS57130Component), data: { progNo: 'TLS57130' } },
  // 商品迴轉率
  { path: 'tls57140', loadComponent: () => import('./tls57140/tls57140.component').then(m => m.TLS57140Component), data: { progNo: 'TLS57140' } },
  // 盤點統計表
  { path: 'tls57150', loadComponent: () => import('./tls57150/tls57150.component').then(m => m.TLS57150Component), data: { progNo: 'TLS57150' } },
  // 庫齡分析表
  { path: 'tls57160', loadComponent: () => import('./tls57160/tls57160.component').then(m => m.TLS57160Component), data: { progNo: 'TLS57160' } },
  // 存貨評價分析表
  { path: 'tls57170', loadComponent: () => import('./tls57170/tls57170.component').then(m => m.TLS57170Component), data: { progNo: 'TLS57170' } },
  // 存貨評價分析表
  { path: 'tls57190', loadComponent: () => import('./tls57190/tls57190.component').then(m => m.TLS57190Component), data: { progNo: 'TLS57190' } },

  // 專櫃暫存傳票查詢作業
  { path: 'tls2c040', loadComponent: () => import('./tls2c040/tls2c040.component').then(m => m.TLS2C040Component), data: { progNo: 'TLS2C040' } },
  // 專櫃暫存傳票查詢作業 CRU
  { path: 'tls2c040cru', loadComponent: () => import('./tls2c040-cru/tls2c040-cru.component').then(m => m.TLS2C040CRUComponent), data: { progNo: 'TLS2C040' } },

  // 廠商發票請款登入暨維護作業
  { path: 'tls2f010', loadComponent: () => import('./tls2f010/tls2f010.component').then(m => m.TLS2F010Component), data: { progNo: 'TLS2F010' } },
  // 廠商發票請款登入暨維護作業 CRU
  { path: 'tls2f010cru', loadComponent: () => import('./tls2f010-cru/tls2f010-cru.component').then(m => m.TLS2F010CRUComponent), data: { progNo: 'TLS2F010' } },

  // 傳票項目之會計科目設定作業_NEW
  { path: 'tls21020', loadComponent: () => import('./tls21020/tls21020.component').then(m => m.TLS21020Component), data: { progNo: 'TLS21020' } },









  // 大分類維護作業
  { path: 'tls51010', loadComponent: () => import('./tls51010/tls51010.component').then(m => m.TLS51010Component), data: { progNo: 'TLS51010' } },
  // 中分類維護作業
  { path: 'tls51020', loadComponent: () => import('./tls51020/tls51020.component').then(m => m.TLS51020Component), data: { progNo: 'TLS51020' } },
  // 小分類維護作業
  { path: 'tls51030', loadComponent: () => import('./tls51030/tls51030.component').then(m => m.TLS51030Component), data: { progNo: 'TLS51030' } },
  // 商品單位設定
  { path: 'tls51050', loadComponent: () => import('./tls51050/tls51050.component').then(m => m.TLS51050Component), data: { progNo: 'TLS51050' } },
  // 品牌設定作業
  { path: 'tls51060', loadComponent: () => import('./tls51060/tls51060.component').then(m => m.TLS51060Component), data: { progNo: 'TLS51060' } },
  // 商品基本資料
  { path: 'tls51070', loadComponent: () => import('./tls51070/tls51070.component').then(m => m.TLS51070Component), data: { progNo: 'TLS51070' } },
  // 分倉資料處理
  { path: 'tls51080', loadComponent: () => import('./tls51080/tls51080.component').then(m => m.TLS51080Component), data: { progNo: 'TLS51080' } },
  // 品牌每月可進貨限額維護作業
  { path: 'tls51110', loadComponent: () => import('./tls51110/tls51110.component').then(m => m.TLS51110Component), data: { progNo: 'TLS51110' } },
  // 品牌進貨折數設定作業
  { path: 'tls51130', loadComponent: () => import('./tls51130/tls51130.component').then(m => m.TLS51130Component), data: { progNo: 'TLS51130' } },
  // 自營專櫃收銀扣庫維護作業
  { path: 'tls51140', loadComponent: () => import('./tls51140/tls51140.component').then(m => m.Tls51140Component), data: { progNo: 'Tls51140' } },
  // 採購單維護作業
  { path: 'tls52010', loadComponent: () => import('./tls52010/tls52010.component').then(m => m.TLS52010Component), data: { progNo: 'TLS52010' } },
  // 退貨單維護作業
  { path: 'tls52020', loadComponent: () => import('./tls52020/tls52020.component').then(m => m.TLS52020Component), data: { progNo: 'TLS52020' } },
  // 進貨驗收作業
  { path: 'tls52030', loadComponent: () => import('./tls52030/tls52030.component').then(m => m.TLS52030Component), data: { progNo: 'TLS52030' } },
  // 退貨驗收作業
  { path: 'tls52040', loadComponent: () => import('./tls52040/tls52040.component').then(m => m.TLS52040Component), data: { progNo: 'TLS52040' } },
  // 進價/售價變價作業
  { path: 'tls52050', loadComponent: () => import('./tls52050/tls52050.component').then(m => m.TLS52050Component), data: { progNo: 'TLS52050' } },
  // 盤點單開立
  { path: 'tls53010', loadComponent: () => import('./tls53010/tls53010.component').then(m => m.TLS53010Component), data: { progNo: 'TLS53010' } },
  // 盤點資料匯入作業
  { path: 'tls53020', loadComponent: () => import('./tls53020/tls53020.component').then(m => m.TLS53020Component), data: { progNo: 'TLS53020' } },
  // 盤點資料維護作業
  { path: 'tls53030', loadComponent: () => import('./tls53030/tls53030.component').then(m => m.TLS53030Component), data: { progNo: 'TLS53030' } },
  // 進貨日結作業
  { path: 'tls55010', loadComponent: () => import('./tls55010/tls55010.component').then(m => m.TLS55010Component), data: { progNo: 'TLS55010' } },
  // 自營交易修正作業
  { path: 'tls55020', loadComponent: () => import('./tls55020/tls55020.component').then(m => m.TLS55020Component), data: { progNo: 'TLS55020' } },
  { path: 'tls55020cru', loadComponent: () => import('./tls55020/tls55020-cru/tls55020-cru.component').then(m => m.TLS55020CRUComponent), data: { progNo: 'TLS55020' } },
  // 廠商發票折讓作業
  { path: 'tls55030', loadComponent: () => import('./tls55030/tls55030.component').then(m => m.TLS55030Component), data: { progNo: 'TLS55030' } },
  // 廠商請款作業
  { path: 'tls55040', loadComponent: () => import('./tls55040/tls55040.component').then(m => m.TLS55040Component), data: { progNo: 'TLS55040' } },
  // 月結帳作業
  { path: 'tls55050', loadComponent: () => import('./tls55050/tls55050.component').then(m => m.TLS55050Component), data: { progNo: 'TLS55050' } },
  // 銷貨日報查詢列印
  { path: 'tls55070', loadComponent: () => import('./tls55070/tls55070.component').then(m => m.TLS55070Component), data: { progNo: 'TLS55070' } },
  // 商品庫存查詢作業
  { path: 'tls56010', loadComponent: () => import('./tls56010/tls56010.component').then(m => m.TLS56010Component), data: { progNo: 'TLS56010' } },
  // 商品領用(內部)作業
  { path: 'tls56020', loadComponent: () => import('./tls56020/tls56020.component').then(m => m.TLS56020Component), data: { progNo: 'TLS56020' } },
  // 商品退回(內部)作業
  { path: 'tls56030', loadComponent: () => import('./tls56030/tls56030.component').then(m => m.TLS56030Component), data: { progNo: 'TLS56030' } },
  // 倉別調撥申請維護
  // { path: 'tls56040', loadComponent: () => import('./tls56040/tls56040.component').then(m => m.TLS56040Component), data: { progNo: 'TLS56040' } },
  // // 倉別調撥發貨作業
  // { path: 'tls56050', loadComponent: () => import('./tls56050/tls56050.component').then(m => m.TLS56050Component), data: { progNo: 'TLS56050' } },
  // // 倉別調撥驗收作業
  // { path: 'tls56060', loadComponent: () => import('./tls56060/tls56060.component').then(m => m.TLS56060Component), data: { progNo: 'TLS56060' } },
  // // 商品報廢維護
  // { path: 'tls56070', loadComponent: () => import('./tls56070/tls56070.component').then(m => m.TLS56070Component), data: { progNo: 'TLS56070' } },
  // // 同業調撥作業
  // { path: 'tls56080', loadComponent: () => import('./tls56080/tls56080.component').then(m => m.TLS56080Component), data: { progNo: 'TLS56080' } },
  // // 採購統計表
  // { path: 'tls57010', loadComponent: () => import('./tls57010/tls57010.component').then(m => m.TLS57010Component), data: { progNo: 'TLS57010' } },
  // // 廠商應付帳款明細表
  // { path: 'tls57020', loadComponent: () => import('./tls57020/tls57020.component').then(m => m.TLS57020Component), data: { progNo: 'TLS57020' } },
  // // 商品庫存表
  // { path: 'tls57030', loadComponent: () => import('./tls57030/tls57030.component').then(m => m.TLS57030Component), data: { progNo: 'TLS57030' } },
  // // 商品目錄表
  // { path: 'tls57040', loadComponent: () => import('./tls57040/tls57040.component').then(m => m.TLS57040Component), data: { progNo: 'TLS57040' } },
  // // 收銀機發票商品統計表
  // { path: 'tls57050', loadComponent: () => import('./tls57050/tls57050.component').then(m => m.TLS57050Component), data: { progNo: 'TLS57050' } },
  // // EC銷售商品統計表
  // { path: 'tls57060', loadComponent: () => import('./tls57060/tls57060.component').then(m => m.TLS57060Component), data: { progNo: 'TLS57060' } },
  // // 存貨月結表
  // { path: 'tls57070', loadComponent: () => import('./tls57070/tls57070.component').then(m => m.TLS57070Component), data: { progNo: 'TLS57070' } },
  // // 庫存數量異動明細表
  // { path: 'tls57080', loadComponent: () => import('./tls57080/tls57080.component').then(m => m.TLS57080Component), data: { progNo: 'TLS57080' } },
  // // 進貨/進退單據統計表
  // { path: 'tls57090', loadComponent: () => import('./tls57090/tls57090.component').then(m => m.TLS57090Component), data: { progNo: 'TLS57090' } },
  // // 驗收/驗退單據統計表
  // { path: 'tls57100', loadComponent: () => import('./tls57100/tls57100.component').then(m => m.TLS57100Component), data: { progNo: 'TLS57100' } },
  // // 存貨月結庫存表
  // { path: 'tls57110', loadComponent: () => import('./tls57110/tls57110.component').then(m => m.TLS57110Component), data: { progNo: 'TLS57110' } },
  // { path: 'tls57110cru', loadComponent: () => import('./tls57110-cru/tls57110-cru.component').then(m => m.TLS57110CRUComponent), data: { progNo: 'TLS57110' } },
  // // 滯銷商品統計表
  // { path: 'tls57120', loadComponent: () => import('./tls57120/tls57120.component').then(m => m.TLS57120Component), data: { progNo: 'TLS57120' } },
  // // 銷售排行報表
  // { path: 'tls57130', loadComponent: () => import('./tls57130/tls57130.component').then(m => m.TLS57130Component), data: { progNo: 'TLS57130' } },
  // // 商品迴轉率
  // { path: 'tls57140', loadComponent: () => import('./tls57140/tls57140.component').then(m => m.TLS57140Component), data: { progNo: 'TLS57140' } },
  // // 盤點統計表
  // { path: 'tls57150', loadComponent: () => import('./tls57150/tls57150.component').then(m => m.TLS57150Component), data: { progNo: 'TLS57150' } },
  // // 庫齡分析表
  // { path: 'tls57160', loadComponent: () => import('./tls57160/tls57160.component').then(m => m.TLS57160Component), data: { progNo: 'TLS57160' } },
  // // 存貨評價分析表
  // { path: 'tls57170', loadComponent: () => import('./tls57170/tls57170.component').then(m => m.TLS57170Component), data: { progNo: 'TLS57170' } },
  // // 存貨評價分析表
  // { path: 'tls57190', loadComponent: () => import('./tls57190/tls57190.component').then(m => m.TLS57190Component), data: { progNo: 'TLS57190' } },
  // // 大分類維護作業 CRU
  // { path: 'tls51010cru', loadComponent: () => import('./tls51010-cru/tls51010-cru.component').then(m => m.TLS51010CRUComponent), data: { progNo: 'TLS51010' } },
  // // 中分類維護作業 CRU
  // { path: 'tls51020cru', loadComponent: () => import('./tls51020-cru/tls51020-cru.component').then(m => m.TLS51020CRUComponent), data: { progNo: 'TLS51020' } },
  // // 小分類維護作業 CRU
  // { path: 'tls51030cru', loadComponent: () => import('./tls51030-cru/tls51030-cru.component').then(m => m.TLS51030CRUComponent), data: { progNo: 'TLS51030' } },
  // // 商品單位設定 CRU
  // { path: 'tls51050cru', loadComponent: () => import('./tls51050-cru/tls51050-cru.component').then(m => m.TLS51050CRUComponent), data: { progNo: 'TLS51050' } },
  // // 品牌設定作業 CRU
  // { path: 'tls51060cru', loadComponent: () => import('./tls51060-cru/tls51060-cru.component').then(m => m.TLS51060CRUComponent), data: { progNo: 'TLS51060' } },
  // 商品基本資料 CRU
  { path: 'tls51070cru', loadComponent: () => import('./tls51070-cru/tls51070-cru.component').then(m => m.TLS51070CRUComponent), data: { progNo: 'TLS51070' } },
  // 商品基本資料 OS
  { path: 'tls51070os', loadComponent: () => import('./tls51070-os/tls51070-os.component').then(m => m.Tls51070OsComponent), data: { progNo: 'tls51070' } },
  // // 分倉資料處理 CRU
  // { path: 'tls51080cru', loadComponent: () => import('./tls51080-cru/tls51080-cru.component').then(m => m.TLS51080CRUComponent), data: { progNo: 'TLS51080' } },
  // 品牌每月可進貨限額維護作業 CRU
  { path: 'tls51110cru', loadComponent: () => import('./tls51110-cru/tls51110-cru.component').then(m => m.TLS51110CRUComponent), data: { progNo: 'TLS51110' } },
  // // 品牌進貨折數設定作業 CRU
  // { path: 'tls51130cru', loadComponent: () => import('./tls51130-cru/tls51130-cru.component').then(m => m.TLS51130CRUComponent), data: { progNo: 'TLS51130' } },
  // // 自營專櫃收銀扣庫維護作業 CRU
  // { path: 'tls51140cru', loadComponent: () => import('./tls51140-cru/tls51140-cru.component').then(m => m.Tls51140CruComponent), data: { progNo: 'Tls51140' } },
  // // 採購單維護作業 CRU
  // { path: 'tls52010cru', loadComponent: () => import('./tls52010-cru/tls52010-cru.component').then(m => m.TLS52010CRUComponent), data: { progNo: 'TLS52010' } },
  // // 退貨單維護作業 CRU
  // { path: 'tls52020cru', loadComponent: () => import('./tls52020-cru/tls52020-cru.component').then(m => m.TLS52020CRUComponent), data: { progNo: 'TLS52020' } },
  // // 進貨驗收作業 CRU
  // { path: 'tls52030cru', loadComponent: () => import('./tls52030-cru/tls52030-cru.component').then(m => m.TLS52030CRUComponent), data: { progNo: 'TLS52030' } },
  // // 退貨驗收作業 CRU
  // { path: 'tls52040cru', loadComponent: () => import('./tls52040-cru/tls52040-cru.component').then(m => m.TLS52040CRUComponent), data: { progNo: 'TLS52040' } },
  // // 進價/售價變價作業 CRU
  // { path: 'tls52050cru', loadComponent: () => import('./tls52050-cru/tls52050-cru.component').then(m => m.TLS52050CRUComponent), data: { progNo: 'TLS52050' } },
  // // 盤點單開立 CRU
  // { path: 'tls53010cru', loadComponent: () => import('./tls53010-cru/tls53010-cru.component').then(m => m.TLS53010CRUComponent), data: { progNo: 'TLS53010' } },
  // // 盤點資料維護作業 CRU
  // { path: 'tls53030cru', loadComponent: () => import('./tls53030-cru/tls53030-cru.component').then(m => m.TLS53030CRUComponent), data: { progNo: 'TLS53030' } },
  // // 廠商發票折讓作業 CRU
  // { path: 'tls55030cru', loadComponent: () => import('./tls55030-cru/tls55030-cru.component').then(m => m.TLS55030CRUComponent), data: { progNo: 'TLS55030' } },
  // // 廠商請款作業 CRU
  // { path: 'tls55040cru', loadComponent: () => import('./tls55040-cru/tls55040-cru.component').then(m => m.TLS55040CRUComponent), data: { progNo: 'TLS55040' } },
  // // 月結帳作業 CRU
  // { path: 'tls55050cru', loadComponent: () => import('./tls55050-cru/tls55050-cru.component').then(m => m.TLS55050CRUComponent), data: { progNo: 'TLS55050' } },
  // // 商品領用(內部)作業 CRU
  // { path: 'tls56020cru', loadComponent: () => import('./tls56020-cru/tls56020-cru.component').then(m => m.TLS56020CRUComponent), data: { progNo: 'TLS56020' } },
  // // 商品退回(內部)作業 CRU
  // { path: 'tls56030cru', loadComponent: () => import('./tls56030-cru/tls56030-cru.component').then(m => m.TLS56030CRUComponent), data: { progNo: 'TLS56030' } },
  // // 倉別調撥申請維護 CRU
  // { path: 'tls56040cru', loadComponent: () => import('./tls56040-cru/tls56040-cru.component').then(m => m.TLS56040CRUComponent), data: { progNo: 'TLS56040' } },
  // // 倉別調撥發貨作業 CRU
  // { path: 'tls56050cru', loadComponent: () => import('./tls56050-cru/tls56050-cru.component').then(m => m.TLS56050CRUComponent), data: { progNo: 'TLS56050' } },
  // // 倉別調撥驗收作業 CRU
  // { path: 'tls56060cru', loadComponent: () => import('./tls56060-cru/tls56060-cru.component').then(m => m.TLS56060CRUComponent), data: { progNo: 'TLS56060' } },
  // // 商品報廢維護 CRU
  // { path: 'tls56070cru', loadComponent: () => import('./tls56070-cru/tls56070-cru.component').then(m => m.TLS56070CRUComponent), data: { progNo: 'TLS56070' } },
  // // 同業調撥作業 CRU
  // { path: 'tls56080cru', loadComponent: () => import('./tls56080-cru/tls56080-cru.component').then(m => m.TLS56080CRUComponent), data: { progNo: 'TLS56080' } },

];
