import { ApiRequest, ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { EditColumnExtend } from '@shared/components/table-edit/table-edit.model';
export interface TLS26080Data {
  id: number;                  // 主鍵，自動編號
  mid: number;                 // 主檔關聯 ID
  str_no: string;              // 店鋪編號
  pod_no: string;              // 活動申請編號 (yyyyMMddsss)
  pod_type: '1' | '2' | '8';   // 活動類型 (1=預售, 2=滿千送百, 8=期間開放折扣)
  org_id: string;              // 組織部門 (SYS3100)
  act_no: string;              // 活動編號 (群組)
  pod_desc: string;            // 活動名稱
  pod_sdate: Date;             // 活動起始日期
  pod_edate: Date;             // 活動終止日期
  pod_busdate: Date;           // 活動正檔日期
  pod_back_sdate: Date;        // 兌回起始日期
  pod_back_edate: Date;        // 兌回結束日期
  cap_item: string;            // 扣款代碼
  pod_status: '0' | '1' | '9'; // 活動狀態 (0=未核準, 1=已核準, 9=刪除)
  approved_userno: string;     // 核准人員編號
  approved_usr_name: string;   // 核准人員姓名
  approved_date: Date;         // 核准日期
  crt_usr_no: string;          // 建立人員編號
  crt_usr_name: string;        // 建立人員姓名
  crt_date: Date;              // 建立日期
  upd_usr_no: string;          // 變更人員編號
  upd_usr_name: string;        // 變更人員姓名
  upd_date: Date;              // 變更日期
  CanEdit: boolean;            // 是否可編輯
}

export type TLS26080EditTable = Partial<EditColumnExtend> & TLS26080DetailTable & { _err?: boolean; _rowKey?: string; };
export type TLS26080KeyInTable = Omit<TLS26080DetailTable, 'tpy_rate_D16' | 'tpy_rate_D17'> & { tpy_rate_D16: string; tpy_rate_D17: string; };

export interface TLS26080DetailTable {
  id?: number;                 // 主鍵
  talent_id: number;           // 專櫃 ID
  tlt_id: string;              // 抽成類別
  tlt_id_desc?: string;        // 抽成類別名稱
  tlt_no: string;              // 專櫃編號
  tlt_name: string;            // 櫃位名稱
  calc_date_type: 'Y' | 'N';   // 正檔起日計算 ('Y'=活動起始日至截止日, 'N'=正檔日至截止日)
  cap_item_D16: string;        // D16
  tpy_rate_D16: number;        // D16 費用比率 (不含'%')
  cap_item_D17: string;        // D17
  tpy_rate_D17: number;        // D17 費用比率 (不含'%')
  fare_rate_d16?: number;      // 合約入攤 D16 費用比率
  fare_rate_d17?: number;      // 合約入攤 D16 費用比率
  cap_item_3?: string;         // 合約建檔 D16
  tpy_rate_3?: number;         // 合約建檔 D16 費用比率
  cap_item_4?: string;         // 合約建檔 D17
  tpy_rate_4?: number;         // 合約建檔 D17 費用比率
  pod_no: string;              // 活動編號
  pod_status: '0' | '1' | '9'; // 活動狀態 (0=未核準, 1=已核準, 9=刪除)
}

export interface TLS26080DetailResult {
  id: number;                        // 主鍵
  talent_id: number;                 // 專櫃 ID
  tlt_id: string;                    // 抽成類別
  tlt_id_desc: string;               // 抽成類別名稱
  tlt_no: string;                    // 專櫃編號
  tlt_name: string;                  // 櫃位名稱
  calc_date_type: 'Y' | 'N';         // 正檔起日計算 ('Y'=活動起始日至截止日, 'N'=正檔日至截止日)
  cap_item_D16: string;              // D16
  tpy_rate_D16: string;              // D16 費用比率 (含'%')
  cap_item_D17: string;              // D17
  tpy_rate_D17: string;              // D17 費用比率 (含'%')
  pod_no?: string;                   // 活動編號
  pod_status: '0' | '1' | '9';       // 活動狀態 (0=未核準, 1=已核準, 9=刪除)

  pod_type?: string;                 // 活動類型
}

/** Request for queryTLS26080TLTTALENT_D16_D17 */
export interface QueryTLS26080TLTTALENT_D16_D17Request {
  tlt_no: string;
  tlt_id: string;
}

/** Single row from queryTLS26080TLTTALENT_D16_D17 Data[] (API returns string rates) */
export interface TLS26080TLTTALENT_D16_D17Row {
  tlt_id: string;
  tlt_no: string;
  cap_item_D16: string;
  tpy_rate_D16: string;
  cap_item_D17: string;
  tpy_rate_D17: string;
}

export interface TLS26080InsertPayload {
  pod_no: string;             // 活動申請編號
  pod_type: string;           // 活動類型
  pod_desc: string;           // 活動名稱
  pod_sdate: Date;            // 活動起始日期
  pod_edate: Date;            // 活動終止日期
  pod_busdate: Date;          // 活動正檔日期
  pod_back_sdate: Date;       // 兌回起始日期
  pod_back_edate: Date;       // 兌回結束日期
  TALPORDERD_VOUCHERDetails: TLS26080DetailTable[]; // 活動專櫃資料
}

export type TLS26080UpdatePayload = TLS26080InsertPayload;
export interface TLS26080Query extends ApiRequest {
  POD_No?: string;
  POD_Desc?: string;
  POD_SDate_start?: string;
  POD_SDate_end?: string;
  POD_BusDate?: string;
  CAP_ItemList?: string[];
  TLT_NoList?: string[];
}
/** POST /TLS0000/TLS2000/exportTLS26080PDF 請求 */
export interface ExportTLS26080PDFRequest extends ApiRequest {
  POD_No?: string;
  POD_Desc?: string;
  POD_SDate_start?: string;
  POD_SDate_end?: string;
  POD_BusDate?: string;
  CAP_ItemList?: string[];
}

export interface TLS26080UploadResult {
  Success: boolean;
  SuccessCount: number;
  ErrorCount: number;
  ErrorFilePath: string;
  Errors: string[];
  queryTLS26080_DetailResponses: TLS26080DetailResult[];
}

export type TLS26080UploadResponse = Omit<ApiResponse<unknown[]>, 'Data'> & { Data: TLS26080UploadResult; };

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

export interface QueryCampaignRequest {
}

export interface CampaignData {
  AccountingType: string;
  CampaignId: string;
  CampaignName: string;
  EndTime: Date;
  Remark: string;
  StartTime: Date;
  DiscountStartTime: Date | null;
  DiscountEndTime: Date | null;
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
