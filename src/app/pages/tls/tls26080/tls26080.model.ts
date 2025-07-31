export interface TLS26080Data {
  CanDelete: '0' | '1';     // 是否可刪除 (0=否, 1=是)
  CanEdit: '0' | '1';       // 是否可編輯 (0=否, 1=是)
  CRT_Date: Date;            // 建立日期
  CRT_USR_Name?: string;     // 建立人員姓名
  CRT_USR_No?: string;       // 建立人員編號
  UPD_Date?: Date;           // 變更日期
  UPD_USR_Name?: string;     // 變更人員姓名
  UPD_USR_No?: string;       // 變更人員編號
  act_no?: string;           // 活動編號
  approved_date?: Date;      // 核准日期
  approved_userno?: string;  // 核准人員編號
  approved_usr_name?: string;// 核准人員姓名
  cap_item?: string;         // 扣款代碼 (APS1003.cap_type='E')
  id: number;                // 主鍵，自動編號
  mid: number;               // 主檔關聯 ID
  org_id?: string;           // 組織部門 (SYS3100)
  pod_busdate?: Date;        // 活動正檔日期
  pod_desc?: string;         // 活動名稱
  pod_edate: Date;           // 活動終止日期
  pod_no: string;            // 活動申請編號
  pod_sdate: Date;           // 活動起始日期
  pod_status: string;        // 活動狀態 (0=未核準,1=已核準,9=刪除)
  pod_type: string;          // 活動類型 (1=預售, 2=滿千送百, ...)
  str_no: string;            // 店鋪編號
}

export interface TLS26080Query {
  pod_no?: string;            // 活動申請編號
  pod_desc?: string;          // 活動名稱
  pod_sdate?: Date;           // 活動日期 (起)
  pod_edate?: Date;           // 活動日期 (迄)
  pod_busdate?: Date;         // 活動正檔日期
  cap_item?: string[];        // 扣款代碼
}

/** 活動類型 */
export enum CampaignAccountingTypes {
  '預售' = 1,
  '滿千送百發行' = 2,
  '滿千送百兌回' = 3,
  '會員卡集點-銷售' = 4,
  '會員卡集點-點數' = 5,
  '全館消費滿額集點-銷售' = 6,
  '全館消費滿額集點-點數' = 7,
  '期間開放折扣' = 8,
}

export const CampaignAccountingType = new Map<string, { No: string; Name: string; }>([
  ['預售', { No: '1', Name: CampaignAccountingTypes[1] }],
  ['滿千送百發行', { No: '2', Name: CampaignAccountingTypes[2] }],
  ['滿千送百兌回', { No: '3', Name: CampaignAccountingTypes[3] }],
  ['會員卡集點銷售', { No: '4', Name: CampaignAccountingTypes[4] }],
  ['會員卡集點點數', { No: '5', Name: CampaignAccountingTypes[5] }],
  ['全館消費滿額集點銷售', { No: '6', Name: CampaignAccountingTypes[6] }],
  ['全館消費滿額集點點數', { No: '7', Name: CampaignAccountingTypes[7] }],
  ['期間開放折扣', { No: '8', Name: CampaignAccountingTypes[8] }],
]);
