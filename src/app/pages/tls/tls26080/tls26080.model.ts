export interface TLS26080Data {
  act_no: string;              // 活動編號
  approved_date: Date;         // 核准日期
  approved_userno: string;     // 核准人員編號
  approved_usr_name: string;   // 核准人員姓名
  crt_date: Date;              // 建立日期
  crt_usr_name: string;        // 建立人員姓名
  crt_usr_no: string;          // 建立人員編號
  id: number;                  // 主鍵，自動編號
  mid: number;                 // 主檔關聯 ID
  org_id: string;              // 組織部門 (SYS3100)
  pod_busdate: Date;           // 活動正檔日期
  pod_desc: string;            // 活動名稱
  pod_edate: Date;             // 活動終止日期
  pod_no: string;              // 活動申請編號
  pod_sdate: Date;             // 活動起始日期
  pod_status: '0' | '1' | '9'; // 活動狀態 (0=未核準, 1=已核準, 9=刪除)
  pod_type: '1' | '2' | '8';   // 活動類型 (1=預售, 2=滿千送百, 8=期間開放折扣)
  str_no: string;              // 店鋪編號
  upd_date: Date;              // 變更日期
  upd_usr_name: string;        // 變更人員姓名
  upd_usr_no: string;          // 變更人員編號
}

export interface TLS26080Detail {
  calc_date_type: 'Y' | 'N';  // 預購起日計算 ('Y'=活動起始日至截止日, 'N'=正檔日至截止日)
  id?: number;                // 主鍵
  pod_no?: string;            // 活動申請編號
  pod_type?: string;          // 活動類型
  talent_id: number;          // 專櫃 ID
  tlt_id: string;             // 專櫃關聯 ID
  tlt_name: string;           // 專櫃名稱
  tlt_no: string;             // 專櫃編號
  tpy_rate: number;           // 費用計算的比率
}

export interface TLS2608InsertPayload {
  pod_no: string;             // 活動申請編號
  pod_type: string;           // 活動類型
  pod_desc: string;           // 活動名稱
  pod_sdate: Date;            // 活動起始日期
  pod_edate: Date;            // 活動終止日期
  pod_busdate: Date;          // 活動正檔日期
  TALPORDERD_VOUCHERDetails: TLS26080Detail[]; // 活動專櫃資料
}

export interface TLS26080Query {
  pod_no?: string;            // 活動申請編號
  pod_desc?: string;          // 活動名稱
  pod_sdate_start?: Date;     // 活動日期 (起)
  pod_sdate_end?: Date;       // 活動日期 (迄)
  pod_busdate?: Date;         // 活動正檔日期
  cap_itemList?: string[];    // 活動項目列表
}

// 活動資料模型
export interface ActivityData {
  id: number;
  activityType: string;
  department: string;
  activityGroup: string;
  activityName: string;
  activityStartDate: string;
  activityEndDate: string;
  activityOfficialDate: string;
}

// 專櫃資料模型
export interface CounterData {
  id: number;
  counterCode: string;
  counterName: string;
  itemCode: string;
  commissionTypeCode: string;
  commissionTypeName: string;
  presaleStartCalculation: string;
  contractStartDate: string;
  contractEndDate: string;
  operationStartDate: string;
  operationEndDate: string;
  deductionItems: string;
  selected?: boolean;
}

// 扣款項目模型
export interface DeductionItem {
  id: number;
  counterCode: string;
  counterName: string;
  itemCode: string;
  itemName: string;
  amountOrRate: number;
  isRate: boolean; // true: 比率, false: 金額
  displayAmount?: string; // 用於顯示格式化後的金額/比率
}

export interface CampaignData {
  AccountingType: string;
  CampaignId: string;
  CampaignName: string;
  EndTime: Date;
  Remark: string;
  StartTime: Date;
}

// /** 活動類型 */
// export enum CampaignAccountingTypes {
//   '預售' = 1,
//   '滿千送百發行' = 2,
//   '滿千送百兌回' = 3,
//   '會員卡集點-銷售' = 4,
//   '會員卡集點-點數' = 5,
//   '全館消費滿額集點-銷售' = 6,
//   '全館消費滿額集點-點數' = 7,
//   '期間開放折扣' = 8,
// }

// export const CampaignAccountingType = new Map<string, { No: string; Name: string; }>([
//   ['預售', { No: '1', Name: CampaignAccountingTypes[1] }],
//   ['滿千送百發行', { No: '2', Name: CampaignAccountingTypes[2] }],
//   ['滿千送百兌回', { No: '3', Name: CampaignAccountingTypes[3] }],
//   ['會員卡集點銷售', { No: '4', Name: CampaignAccountingTypes[4] }],
//   ['會員卡集點點數', { No: '5', Name: CampaignAccountingTypes[5] }],
//   ['全館消費滿額集點銷售', { No: '6', Name: CampaignAccountingTypes[6] }],
//   ['全館消費滿額集點點數', { No: '7', Name: CampaignAccountingTypes[7] }],
//   ['期間開放折扣', { No: '8', Name: CampaignAccountingTypes[8] }],
// ]);
