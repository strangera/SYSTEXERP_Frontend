import { Routes } from '@angular/router';

export const assRoutes: Routes = [
  { path: 'ass11010', loadComponent: () => import('./ass11010/ass11010.component').then(m => m.ASS11010Component), data: { progNo: 'ASS11010' } }, // 資產列管品及耗材分類管理作業-大分類維護作業
  { path: 'ass11010cru', loadComponent: () => import('./ass11010-cru/ass11010-cru.component').then(m => m.ASS11010CRUComponent), data: { progNo: 'ASS11010' } },
  { path: 'ass11020', loadComponent: () => import('./ass11020/ass11020.component').then(m => m.ASS11020Component), data: { progNo: 'ASS11020' } }, // 資產列管品及耗材分類管理作業-中分類維護作業
  { path: 'ass11020cru', loadComponent: () => import('./ass11020-cru/ass11020-cru.component').then(m => m.ASS11020CRUComponent), data: { progNo: 'ASS11020' } },
  { path: 'ass11030', loadComponent: () => import('./ass11030/ass11030.component').then(m => m.ASS11030Component), data: { progNo: 'ASS11030' } }, // 資產列管品及耗材分類管理作業-小分類維護作業
  { path: 'ass11030cru', loadComponent: () => import('./ass11030-cru/ass11030-cru.component').then(m => m.ASS11030CRUComponent), data: { progNo: 'ASS11030' } },
  { path: 'ass11040', loadComponent: () => import('./ass11040/ass11040.component').then(m => m.ASS11040Component), data: { progNo: 'ASS11040' } }, // 資產列管品及耗材分類管理作業-品項資料維護作業
  { path: 'ass11040cru', loadComponent: () => import('./ass11040-cru/ass11040-cru.component').then(m => m.ASS11040CRUComponent), data: { progNo: 'ASS11040' } },
  { path: 'ass11050', loadComponent: () => import('./ass11050/ass11050.component').then(m => m.ASS11050Component), data: { progNo: 'ASS11050' } }, // 資材分類樹狀圖
  { path: 'ass11060', loadComponent: () => import('./ass11060/ass11060.component').then(m => m.ASS11060Component), data: { progNo: 'ASS11060' } }, // 供應商資料維護作業
  { path: 'ass11060cru', loadComponent: () => import('./ass11060-cru/ass11060-cru.component').then(m => m.ASS11060CRUComponent), data: { progNo: 'ASS11060' } },
  // { path: 'ass11060', loadComponent: () => import('./ass11060/ass11060.component').then(m => m.ASS11060Component),data: {progNo:'ASS11060'} }, // 供應商資料維護作業
  // { path: 'ass11060cru', loadComponent: () => import('./ass11060-cru/ass11060-cru.component').then(m => m.ASS11060CRUComponent),data: {progNo:'ASS11060'} },
  { path: 'ass11070', loadComponent: () => import('./ass11070/ass11070.component').then(m => m.ASS11070Component), data: { progNo: 'ASS11070' } }, // 備用供應商資料維護作業
  { path: 'ass11070cru', loadComponent: () => import('./ass11070-cru/ass11070-cru.component').then(m => m.ASS11070CRUComponent), data: { progNo: 'ASS11070' } },
  { path: 'ass11080', loadComponent: () => import('./ass11080/ass11080.component').then(m => m.ASS11080Component), data: { progNo: 'ASS11080' } }, // 處分資產基本設定
  { path: 'ass11090', loadComponent: () => import('./ass11090/ass11090.component').then(m => m.ASS11090Component), data: { progNo: 'ASS11090' } }, // 資材中分類會計科目維護作業
  { path: 'ass11090cru', loadComponent: () => import('./ass11090-cru/ass11090-cru.component').then(m => m.ASS11090CRUComponent), data: { progNo: 'ASS11090' } },
  { path: 'ass11100', loadComponent: () => import('./ass11100/ass11100.component').then(m => m.ASS11100Component), data: { progNo: 'ASS11100' } }, // 倉別設定作業
  { path: 'ass11100cru', loadComponent: () => import('./ass11100-cru/ass11100-cru.component').then(m => m.ASS11100CRUComponent), data: { progNo: 'ASS11100' } },
  { path: 'ass12010', loadComponent: () => import('./ass12010/ass12010.component').then(m => m.ASS12010Component), data: { progNo: 'ASS12010' } }, // 請購申請作業
  { path: 'ass12010cru', loadComponent: () => import('./ass12010-cru/ass12010-cru.component').then(m => m.ASS12010CRUComponent), data: { progNo: 'ASS12010' } },
  { path: 'ass12020', loadComponent: () => import('./ass12020/ass12020.component').then(m => m.ASS12020Component), data: { progNo: 'ASS12020' } }, // 詢價登錄作業
  { path: 'ass12020cru', loadComponent: () => import('./ass12020-cru/ass12020-cru.component').then(m => m.ASS12020CRUComponent), data: { progNo: 'ASS12020' } },
  { path: 'ass12030', loadComponent: () => import('./ass12030/ass12030.component').then(m => m.ASS12030Component), data: { progNo: 'ASS12030' } }, // 採購申請作業
  { path: 'ass12030cru', loadComponent: () => import('./ass12030-cru/ass12030-cru.component').then(m => m.ASS12030CRUComponent), data: { progNo: 'ASS12030' } },
  { path: 'ass12040', loadComponent: () => import('./ass12040/ass12040.component').then(m => m.ASS12040Component), data: { progNo: 'ASS12040' } }, // 採購單審核作業
  { path: 'ass12040cru', loadComponent: () => import('./ass12040-cru/ass12040-cru.component').then(m => m.ASS12040CRUComponent), data: { progNo: 'ASS12040' } },
  { path: 'ass12050', loadComponent: () => import('./ass12050/ass12050.component').then(m => m.ASS12050Component), data: { progNo: 'ASS12050' } }, // 採購單驗收作業
  { path: 'ass12050master', loadComponent: () => import('./ass12050-master/ass12050-master.component').then(m => m.ASS12050MasterComponent), data: { progNo: 'ASS12050' } },
  { path: 'ass12050cru', loadComponent: () => import('./ass12050-cru/ass12050-cru.component').then(m => m.ASS12050CRUComponent), data: { progNo: 'ASS12050' } },
  { path: 'ass13010', loadComponent: () => import('./ass13010/ass13010.component').then(m => m.ASS13010Component), data: { progNo: 'ASS13010' } }, // 資產維護作業
  { path: 'ass13010cru', loadComponent: () => import('./ass13010-cru/ass13010-cru.component').then(m => m.ASS13010CRUComponent), data: { progNo: 'ASS13010' } },
  { path: 'ass13020', loadComponent: () => import('./ass13020/ass13020.component').then(m => m.ASS13020Component), data: { progNo: 'ASS13020' } }, // 資產轉入
  // { path: 'ass13020cru', loadComponent: () => import('./ass13020-cru/ass13020-cru.component').then(m => m.ASS13020CRUComponent),data: {progNo:'ASS13020'} },
  { path: 'ass13040', loadComponent: () => import('./ass13040/ass13040.component').then(m => m.ASS13040Component), data: { progNo: 'ASS13040' } }, // 批次報廢作業
  { path: 'ass13040cru', loadComponent: () => import('./ass13040-cru/ass13040-cru.component').then(m => m.ASS13040CRUComponent), data: { progNo: 'ASS13040' } },
  { path: 'ass13050', loadComponent: () => import('./ass13050/ass13050.component').then(m => m.ASS13050Component), data: { progNo: 'ASS13050' } }, // 移轉交接表
  { path: 'ass13060', loadComponent: () => import('./ass13060/ass13060.component').then(m => m.ASS13060Component), data: { progNo: 'ASS13060' } }, // 固定資產重估作業
  { path: 'ass13060cru', loadComponent: () => import('./ass13060-cru/ass13060-cru.component').then(m => m.ASS13060CRUComponent), data: { progNo: 'ASS13060' } },
  { path: 'ass13070', loadComponent: () => import('./ass13070/ass13070.component').then(m => m.ASS13070Component), data: { progNo: 'ASS13070' } }, // 財產保管單位設定／移轉作業
  { path: 'ass13070cru', loadComponent: () => import('./ass13070-cru/ass13070-cru.component').then(m => m.ASS13070CRUComponent), data: { progNo: 'ASS13070' } },
  { path: 'ass13080', loadComponent: () => import('./ass13080/ass13080.component').then(m => m.ASS13080Component), data: { progNo: 'ASS13080' } }, // 資產變賣作業
  { path: 'ass13080cru', loadComponent: () => import('./ass13080-cru/ass13080-cru.component').then(m => m.ASS13080CRUComponent), data: { progNo: 'ASS13080' } },
  { path: 'ass13090', loadComponent: () => import('./ass13090/ass13090.component').then(m => m.ASS13090Component), data: { progNo: 'ASS13090' } }, // 資產攤提作業
  { path: 'ass13090cru', loadComponent: () => import('./ass13090-cru/ass13090-cru.component').then(m => m.ASS13090CRUComponent), data: { progNo: 'ASS13090' } },
  { path: 'ass13100', loadComponent: () => import('./ass13100/ass13100.component').then(m => m.ASS13100Component), data: { progNo: 'ASS13100' } }, // 資產清點作業
  { path: 'ass13100cru', loadComponent: () => import('./ass13100-cru/ass13100-cru.component').then(m => m.ASS13100CRUComponent), data: { progNo: 'ASS13100' } },
  { path: 'ass13110', loadComponent: () => import('./ass13110/ass13110.component').then(m => m.ASS13110Component), data: { progNo: 'ASS13110' } }, // 資產差異表
  { path: 'ass13120', loadComponent: () => import('./ass13120/ass13120.component').then(m => m.ASS13120Component), data: { progNo: 'ASS13120' } }, // 折舊攤提作業
  { path: 'ass14010', loadComponent: () => import('./ass14010/ass14010.component').then(m => m.ASS14010Component), data: { progNo: 'ASS14010' } }, // 進貨發票建檔作業
  { path: 'ass14010cru', loadComponent: () => import('./ass14010-cru/ass14010-cru.component').then(m => m.ASS14010CRUComponent), data: { progNo: 'ASS14010' } },
  { path: 'ass14020', loadComponent: () => import('./ass14020/ass14020.component').then(m => m.ASS14020Component), data: { progNo: 'ASS14020' } }, // 請款關帳作業
  { path: 'ass14030', loadComponent: () => import('./ass14030/ass14030.component').then(m => m.ASS14030Component), data: { progNo: 'ASS14030' } }, // 傳票審核傳送作業
  { path: 'ass14030cru', loadComponent: () => import('./ass14030-cru/ass14030-cru.component').then(m => m.ASS14030CRUComponent), data: { progNo: 'ASS14030' } },
  { path: 'ass14030paydetail', loadComponent: () => import('./ass14030-paydetail/ass14030-paydetail.component').then(m => m.ASS14030PayDetailComponent), data: { progNo: 'ASS14030' } },
  { path: 'ass14040', loadComponent: () => import('./ass14040/ass14040.component').then(m => m.ASS14040Component), data: { progNo: 'ASS14040' } }, // 庫存成本月結作業
  { path: 'ass15010', loadComponent: () => import('./ass15010/ass15010.component').then(m => m.ASS15010Component), data: { progNo: 'ASS15010' } }, // 財產標籤列印作業
  { path: 'ass15020', loadComponent: () => import('./ass15020/ass15020.component').then(m => m.ASS15020Component), data: { progNo: 'ASS15020' } }, // 財產保管清冊
  { path: 'ass15030', loadComponent: () => import('./ass15030/ass15030.component').then(m => m.ASS15030Component), data: { progNo: 'ASS15030' } }, // 財產目錄
  { path: 'ass15040', loadComponent: () => import('./ass15040/ass15040.component').then(m => m.ASS15040Component), data: { progNo: 'ASS15040' } }, // 財產目錄之會計科目報表
  { path: 'ass15070', loadComponent: () => import('./ass15070/ass15070.component').then(m => m.ASS15070Component), data: { progNo: 'ASS15070' } }, // 財產進貨清單
  { path: 'ass15050', loadComponent: () => import('./ass15050/ass15050.component').then(m => m.ASS15050Component), data: { progNo: 'ASS15050' } }, // 折舊攤提表
  { path: 'ass15060', loadComponent: () => import('./ass15060/ass15060.component').then(m => m.ASS15060Component), data: { progNo: 'ASS15060' } }, // 財產異動記錄查詢
  { path: 'ass15080', loadComponent: () => import('./ass15080/ass15080.component').then(m => m.ASS15080Component), data: { progNo: 'ASS15080' } }, // 資產重估查詢
  { path: 'ass16010', loadComponent: () => import('./ass16010/ass16010.component').then(m => m.ASS16010Component), data: { progNo: 'ASS16010' } }, // 盤點設定
  { path: 'ass16010cru', loadComponent: () => import('./ass16010-cru/ass16010-cru.component').then(m => m.ASS16010CRUComponent), data: { progNo: 'ASS16010' } },
  { path: 'ass16020', loadComponent: () => import('./ass16020/ass16020.component').then(m => m.ASS16020Component), data: { progNo: 'ASS16020' } }, // 盤點維護
  { path: 'ass16020cru', loadComponent: () => import('./ass16020-cru/ass16020-cru.component').then(m => m.ASS16020CRUComponent), data: { progNo: 'ASS16020' } },
  { path: 'ass16030', loadComponent: () => import('./ass16030/ass16030.component').then(m => m.ASS16030Component), data: { progNo: 'ASS16030' } }, // 領用申請作業
  { path: 'ass16030cru', loadComponent: () => import('./ass16030-cru/ass16030-cru.component').then(m => m.ASS16030CRUComponent), data: { progNo: 'ASS16030' } },
  { path: 'ass16040', loadComponent: () => import('./ass16040/ass16040.component').then(m => m.ASS16040Component), data: { progNo: 'ASS16040' } }, // 領用審核作業
  { path: 'ass16040cru', loadComponent: () => import('./ass16040-cru/ass16040-cru.component').then(m => m.ASS16040CRUComponent), data: { progNo: 'ASS16040' } },
  { path: 'ass16050', loadComponent: () => import('./ass16050/ass16050.component').then(m => m.ASS16050Component), data: { progNo: 'ASS16050' } }, // 領用發料作業
  { path: 'ass16050cru', loadComponent: () => import('./ass16050-cru/ass16050-cru.component').then(m => m.ASS16050CRUComponent), data: { progNo: 'ASS16050' } },
  { path: 'ass16060', loadComponent: () => import('./ass16060/ass16060.component').then(m => m.ASS16060Component), data: { progNo: 'ASS16060' } }, // 領用退料作業
  { path: 'ass16060cru', loadComponent: () => import('./ass16060-cru/ass16060-cru.component').then(m => m.ASS16060CRUComponent), data: { progNo: 'ASS16060' } },
  { path: 'ass16070', loadComponent: () => import('./ass16070/ass16070.component').then(m => m.ASS16070Component), data: { progNo: 'ASS16070' } }, // 調撥申請作業
  { path: 'ass16070cru', loadComponent: () => import('./ass16070-cru/ass16070-cru.component').then(m => m.ASS16070CRUComponent), data: { progNo: 'ASS16070' } },
  { path: 'ass16080', loadComponent: () => import('./ass16080/ass16080.component').then(m => m.ASS16080Component), data: { progNo: 'ASS16080' } }, // 調撥出庫作業
  { path: 'ass16080cru', loadComponent: () => import('./ass16080-cru/ass16080-cru.component').then(m => m.ASS16080CRUComponent), data: { progNo: 'ASS16080' } },
  { path: 'ass16090', loadComponent: () => import('./ass16090/ass16090.component').then(m => m.ASS16090Component), data: { progNo: 'ASS16090' } }, // 耗材報廢維護作業
  { path: 'ass16090cru', loadComponent: () => import('./ass16090-cru/ass16090-cru.component').then(m => m.ASS16090CRUComponent), data: { progNo: 'ASS16090' } },
  { path: 'ass17010', loadComponent: () => import('./ass17010/ass17010.component').then(m => m.ASS17010Component), data: { progNo: 'ASS17010' } }, // 領用明細表
  { path: 'ass17020', loadComponent: () => import('./ass17020/ass17020.component').then(m => m.ASS17020Component), data: { progNo: 'ASS17020' } }, // 領用統計表
  { path: 'ass17030', loadComponent: () => import('./ass17030/ass17030.component').then(m => m.ASS17030Component), data: { progNo: 'ASS17030' } }, // 領用發料統計表
  { path: 'ass17040', loadComponent: () => import('./ass17040/ass17040.component').then(m => m.ASS17040Component), data: { progNo: 'ASS17040' } }, // 領用退料統計表
  { path: 'ass17050', loadComponent: () => import('./ass17050/ass17050.component').then(m => m.ASS17050Component), data: { progNo: 'ASS17050' } }, // 使用統計月報表
  { path: 'ass17060', loadComponent: () => import('./ass17060/ass17060.component').then(m => m.ASS17060Component), data: { progNo: 'ASS17060' } }, // 調撥明細表
  { path: 'ass17070', loadComponent: () => import('./ass17070/ass17070.component').then(m => m.ASS17070Component), data: { progNo: 'ASS17070' } }, // 報廢明細表
  { path: 'ass17080', loadComponent: () => import('./ass17080/ass17080.component').then(m => m.ASS17080Component), data: { progNo: 'ASS17080' } }, // 耗材庫存查詢作業(含金額)
  { path: 'ass17090', loadComponent: () => import('./ass17090/ass17090.component').then(m => m.ASS17090Component), data: { progNo: 'ASS17090' } }, // 耗材庫存查詢作業
  { path: 'ass17100', loadComponent: () => import('./ass17100/ass17100.component').then(m => m.ASS17100Component), data: { progNo: 'ASS17100' } }, // 耗材進耗存報表
  { path: 'ass17110', loadComponent: () => import('./ass17110/ass17110.component').then(m => m.ASS17110Component), data: { progNo: 'ASS17110' } }, // 耗材進耗存之會計科目報表
  { path: 'ass21010', loadComponent: () => import('./ass21010/ass21010.component').then(m => m.ASS21010Component), data: { progNo: 'ASS21010' } }, // 基本資料設定-能源錶號基本維護
  { path: 'ass21010cru', loadComponent: () => import('./ass21010-cru/ass21010-cru.component').then(m => m.ASS21010CRUComponent), data: { progNo: 'ASS21010' } },
  { path: 'ass21020', loadComponent: () => import('./ass21020/ass21020.component').then(m => m.ASS21020Component), data: { progNo: 'ASS21020' } }, // 基本資料設定-能元攤提設定
  { path: 'ass21020cru', loadComponent: () => import('./ass21020-cru/ass21020-cru.component').then(m => m.ASS21020CRUComponent), data: { progNo: 'ASS21020' } },
  { path: 'ass21030', loadComponent: () => import('./ass21030/ass21030.component').then(m => m.ASS21030Component), data: { progNo: 'ASS21030' } }, // 能源使用狀況作業-能源抄表作業
  { path: 'ass21030cru', loadComponent: () => import('./ass21030-cru/ass21030-cru.component').then(m => m.ASS21030CRUComponent), data: { progNo: 'ASS21030' } },
  { path: 'ass21040', loadComponent: () => import('./ass21040/ass21040.component').then(m => m.ASS21040Component), data: { progNo: 'ASS21040' } }, // 基本資料設定-電錶攤提設定
  { path: 'ass21050', loadComponent: () => import('./ass21050/ass21050.component').then(m => m.ASS21050Component), data: { progNo: 'ASS21050' } }, // 基本資料設定-瓦斯錶攤提設定
  { path: 'ass21050cru', loadComponent: () => import('./ass21050-cru/ass21050-cru.component').then(m => m.ASS21050CRUComponent), data: { progNo: 'ASS21050' } },
  { path: 'ass21060', loadComponent: () => import('./ass21060/ass21060.component').then(m => m.ASS21060Component), data: { progNo: 'ASS21060' } }, // 基本資料設定-能源單價設定
  // { path: 'ass21060cru', loadComponent: () => import('./ass21060-cru/ass21060-cru.component').then(m => m.ASS21060CRUComponent),data: {progNo:'ASS21060'} },
  // { path: 'ass22010', loadComponent: () => import('./ass22010/ass22010.component').then(m => m.ASS22010Component),data: {progNo:'ASS22010'} }, // 能源使用狀況作業-水錶抄錶作業
  // { path: 'ass22010cru', loadComponent: () => import('./ass22010-cru/ass22010-cru.component').then(m => m.ASS22010CRUComponent),data: {progNo:'ASS22010'} },
  // { path: 'ass22020', loadComponent: () => import('./ass22020/ass22020.component').then(m => m.ASS22020Component),data: {progNo:'ASS22020'} }, // 能源使用狀況作業-電錶抄錶作業
  // { path: 'ass22020cru', loadComponent: () => import('./ass22020-cru/ass22020-cru.component').then(m => m.ASS22020CRUComponent),data: {progNo:'ASS22020'} },
  // { path: 'ass22030', loadComponent: () => import('./ass22030/ass22030.component').then(m => m.ASS22030Component),data: {progNo:'ASS22030'} }, // 能源使用狀況作業-瓦斯錶抄錶作業
  // { path: 'ass22030cru', loadComponent: () => import('./ass22030-cru/ass22030-cru.component').then(m => m.ASS22030CRUComponent),data: {progNo:'ASS22030'} },
  // { path: 'ass22040', loadComponent: () => import('./ass22040/ass22040.component').then(m => m.ASS22040Component),data: {progNo:'ASS22040'} }, // 能源使用狀況作業-電子錶匯入作業
  // { path: 'ass22040cru', loadComponent: () => import('./ass22040-cru/ass22040-cru.component').then(m => m.ASS22040CRUComponent),data: {progNo:'ASS22040'} },
  // { path: 'ass23010', loadComponent: () => import('./ass23010/ass23010.component').then(m => m.ASS23010Component),data: {progNo:'ASS23010'} }, // 能源計費攤提作業-水錶攤提計算作業
  // { path: 'ass23020', loadComponent: () => import('./ass23020/ass23020.component').then(m => m.ASS23020Component),data: {progNo:'ASS23020'} }, // 能源計費攤提作業-電錶攤提計算作業
  // { path: 'ass23030', loadComponent: () => import('./ass23030/ass23030.component').then(m => m.ASS23030Component),data: {progNo:'ASS23030'} }, // 能源計費攤提作業-瓦斯攤提計算作業
];
