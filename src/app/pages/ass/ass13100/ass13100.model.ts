import { ApiRequest } from '@shared/utils/rxjs-operators/validate-api-response';
/**
 * ASS13100 資產清點作業 - 查詢 Request（API 規格）
 */
export interface QueryASS13100Request extends ApiRequest {
  /** 清點單號(起) */
  CHK_ID_S?: string | null;
  /** 清點單號(迄) */
  CHK_ID_E?: string | null;
  /** 清點日期(起)，ISO 字串 */
  CHK_DATE_S?: string | null;
  /** 清點日期(迄)，ISO 字串 */
  CHK_DATE_E?: string | null;
  /** 清點人代碼 */
  CHK_EMP_ID?: string | null;
  /** 位置代碼 */
  LOCATION_ID?: string | null;
  /** 清點單狀態 */
  STATUS?: string | null;
  /** 清點狀態(資料) */
  CHK_STATUS?: string | null;
  /** 說明 */
  NOTES?: string | null;
}

/**
 * ASS13100 查詢結果列（API 規格）
 */
export interface ASS13100QueryRow {
  /** 序號 */
  SeqNo?: number;
  /** 主檔 ID */
  ID?: number;
  /** 清點單號 */
  CHK_ID?: string;
  /** 清點日期 */
  CHK_DATE?: string;
  /** 清點人代碼 */
  FIRST_CHK_EMP_ID?: string;
  /** 清點單狀態代碼 */
  STATUS?: string;
  /** 清點單狀態名稱 */
  STATUS_NAME?: string;
  [key: string]: unknown;
}

/**
 * 新增 API - GenList 單筆
 */
export interface InsertASS13100GenListItem {
  ORG_ID?: string | null;
  EMP_ID?: string | null;
  CHK_EMP_ID?: string | null;
  CHK_EMP_ID2?: string | null;
}

/**
 * 新增清點單 Request（API 規格）
 */
export interface InsertASS13100Request {
  /** 清點單產生方式 1=保管單位, 2=使用單位, 3=保管人, 4=使用人 */
  COL_NOTES?: string | null;
  /** 清點日期，ISO 字串 */
  CHK_DATE?: string | null;
  /** 是否直接帶入全部部門*/
  AllOrg: boolean;
  /** 單位/人員清點設定明細 */
  GenList: InsertASS13100GenListItem[];
}

/**
 * 新增清點單 Response Data（API 規格）
 */
export interface InsertASS13100ResponseData {
  /** 產生的清點單號 */
  CHK_ID: string;
  FAASSCHECKM_ID: number;
  ErrCode: number;
  ErrMsg: string;
}

/**
 * 新增頁：單位/人員清點設定明細列（前端表單用，送出時對應為 GenList）
 */
export type InventoryGenerateMode = 'KEEPER_ORG' | 'USER_ORG' | 'KEEPER_EMP' | 'USER_EMP';

/** 清點單產生方式對應 COL_NOTES */
export enum InventoryGenerateModeColNotes {
  /** 保管單位 */
  KEEPER_ORG = '1',
  /** 使用單位 */
  USER_ORG = '2',
  /** 保管人 */
  KEEPER_EMP = '3',
  /** 使用人 */
  USER_EMP = '4',
}

export interface ASS13100GenerateUnitRow {
  /** 部門代碼（單位清點時必填）→ ORG_ID */
  Org_ID?: string | null;
  /** 部門名稱（顯示用） */
  Org_Name?: string | null;
  /** 員工代碼（人員清點時必填）→ EMP_ID */
  Emp_ID?: string | null;
  /** 員工姓名（顯示用） */
  Emp_Name?: string | null;
  /** 清點員工代碼1（必填）→ CHK_EMP_ID */
  InventoryEmp_ID_1?: string | null;
  /** 清點員工代碼2（必填）→ CHK_EMP_ID2 */
  InventoryEmp_ID_2?: string | null;
}

/**
 * 查詢明細 Request（queryDetailASS13100）
 */
export interface QueryDetailASS13100Request extends ApiRequest {
  ID: number;

  /** 頁碼，預設 1 */
  PageIndex?: number;

  /** 每頁筆數，預設 30 */
  PageSize?: number;
}
/**
 * 查詢明細回傳主檔（queryDetailASS13100）
 */
export interface ASS13100DetailMaster {
  ID: number;
  MID: number;
  STO_NO: string;
  CHK_ID: string;
  CHK_DATE: string;
  STATUS: string;
  STATUS_NAME: string;
  CLOSE_DATE: string;
}

/**
 * 查詢明細回傳明細列（queryDetailASS13100）
 */
export interface ASS13100DetailItem {
  SeqNo: number;
  ID: number;
  FAASSCHECKM_ID: number;
  ASSET_ID: string;
  GOODS_NAME: string;
  ASSET_STATUS: string;
  ASSET_STATUS_NAME: string;
  CHK_STATUS: string | null;
  CHK_STATUS_NAME: string;
  LOCATION_ID: string | null;
  HOLD_ORG_ID: string;
  HOLD_ORG_NAME: string;
  HOLD_EMP_ID: string;
  HOLD_EMP_NAME: string;
  USE_ORG_ID: string;
  USE_ORG_NAME: string;
  USE_EMP_ID: string;
  USE_EMP_NAME: string;
  CHK_EMP_ID: string;
  CHK_EMP_NAME: string;
  CHK_EMP_ID2: string;
  CHK_EMP2_NAME: string;
  NOTES: string | null;
}

/**
 * 編輯/明細頁：清點單明細列（UI 編輯使用，與更新 API Items 對齊）
 */
export interface ASS13100DetailRow extends ASS13100DetailItem {
  /** 明細 ID（必填，更新時使用） */
  ID: number;
  /** 清點狀態(資料) */
  CHK_STATUS: string | null;
  /** 位置代碼 */
  LOCATION_ID: string | null;
  /** 註記 */
  NOTES: string | null;
}

/**
 * 查詢明細回傳 Data（queryDetailASS13100）
 */
export interface QueryDetailASS13100ResponseData {
  Master: ASS13100DetailMaster;
  Details: ASS13100DetailItem[];

  /** 明細總筆數 */
  TotalCount: number;

  /** 明細總頁數 */
  TotalPage: number;
}
/**
 * 上傳盤點檔回傳 Data（uploadASS13100）
 */
export interface UploadASS13100ResponseData {
  ErrCode: number;
  ErrMsg: string;
}

/**
 * 更新清點單 Request - Items 單筆（API 規格）
 */
export interface ASS13100UpdateItem {
  ID: number;
  CHK_STATUS?: string | null;
  LOCATION_ID?: string | null;
  NOTES?: string | null;
}

/**
 * 更新清點單 Request（API 規格）
 */
export interface ASS13100UpdateRequest {
  /** 主檔 ID */
  ID: number;
  /** 清點日期，ISO 字串 */
  CHK_DATE: string;
  /** 清點單狀態 */
  STATUS: string;
  /** 明細列 */
  Items: ASS13100UpdateItem[];
}

/**
 * 刪除清點單 Request（API 規格）
 */
export interface ASS13100DeleteRequest {
  /** 主檔 ID 陣列 */
  Ids: number[];
}

/**
 * 結案 Request（API 規格 approveASS13100）
 */
export interface ASS13100ApproveRequest {
  /** 主檔 ID */
  ID: number;
}

/**
 * 匯出資產清點作業 PDF Request（API 規格 exportPDFASS13100）
 */
export interface ASS13100ExportPDFRequest {
  /** 清點單號(起) */
  CHK_ID_S: string;
  /** 清點單號(迄) */
  CHK_ID_E: string;
}

/** 清點單狀態 */
export enum Status {
  /** 清點中 */
  Progress = '1',
  /** 已結案 */
  Completed = '2',
}