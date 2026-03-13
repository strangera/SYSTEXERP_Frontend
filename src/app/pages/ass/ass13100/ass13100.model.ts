import { BaseQueryRequest } from '@shared/models/api/base-api.interface';

/**
 * ASS13100 資產清點作業 - 查詢 Request
 *
 * 後端正式規格尚未定稿，欄位名稱先依業務語意與畫面命名，之後可再調整對應。
 */
export interface QueryASS13100Request extends BaseQueryRequest {
  /** 清點單號(起) */
  InventoryNoFrom?: string | null;
  /** 清點單號(迄) */
  InventoryNoTo?: string | null;
  /** 清點日期(起)，ISO 字串 */
  InventoryDateFrom?: string | null;
  /** 清點日期(迄)，ISO 字串 */
  InventoryDateTo?: string | null;
  /** 清點人代碼 */
  InventoryPersonCode?: string | null;
  /** 位置代碼 */
  LocationCode?: string | null;
  /** 清點單狀態 */
  InventoryStatus?: string | null;
  /** 清點狀態(資料) */
  InventoryDataStatus?: string | null;
  /** 說明 */
  Remark?: string | null;
}

/**
 * ASS13100 查詢結果列
 */
export interface ASS13100QueryRow {
  /** 清點單號 */
  InventoryNo?: string;
  /** 清點日期 */
  InventoryDate?: string | Date;
  /** 清點人代碼 */
  InventoryPersonCode?: string;
  /** 清點單狀態代碼 */
  InventoryStatus?: string;
  /** 清點單狀態名稱 */
  InventoryStatusName?: string;
  [key: string]: unknown;
}

/**
 * 新增頁：單位/人員清點設定明細列
 */
export type InventoryGenerateMode = 'KEEPER_ORG' | 'USER_ORG' | 'KEEPER_EMP' | 'USER_EMP';

export interface ASS13100GenerateUnitRow {
  /** 部門代碼（單位清點時必填） */
  Org_ID?: string | null;
  /** 部門名稱（顯示用） */
  Org_Name?: string | null;
  /** 員工代碼（人員清點時必填） */
  Emp_ID?: string | null;
  /** 員工姓名（顯示用） */
  Emp_Name?: string | null;
  /** 清點員工代碼1（必填） */
  InventoryEmp_ID_1?: string | null;
  /** 清點員工代碼2（必填） */
  InventoryEmp_ID_2?: string | null;
}

/**
 * 新增清點單 Request
 */
export interface ASS13100GenerateRequest {
  /** 清點產生方式 */
  Mode: InventoryGenerateMode;
  /** 是否直接帶入全部部門（僅單位清點時使用） */
  IncludeAllOrg?: boolean;
  /** 所屬部門（人員清點時必填，用來篩選員工清單） */
  ParentOrg_ID?: string | null;
  /** 單位/人員清點設定明細 */
  Units: ASS13100GenerateUnitRow[];
}

/**
 * 新增清點單 Response
 */
export interface ASS13100GenerateResponse {
  /** 產生的清點單號 */
  InventoryNo: string;
}

/**
 * 編輯/明細頁：清點單明細列
 */
export interface ASS13100DetailRow {
  /** 財產編號（唯讀） */
  AssetNo: string;
  /** 資產代號（唯讀） */
  AssetCode: string;
  /** 品項編號（唯讀） */
  ItemNo: string;
  /** 資產狀態(清點後) */
  InventoryAssetStatus?: string | null;
  /** 位置代碼 */
  LocationCode?: string | null;
  /** 註記 */
  Remark?: string | null;
  [key: string]: unknown;
}

/**
 * 單筆清點單主檔 + 明細
 */
export interface ASS13100DetailResponse {
  /** 清點單號 */
  InventoryNo: string;
  /** 其他主檔欄位可依後端規格再補充 */
  Details: ASS13100DetailRow[];
}

/**
 * 更新清點單 Request（確認按鈕）
 */
export interface ASS13100UpdateRequest {
  InventoryNo: string;
  Details: ASS13100DetailRow[];
}

/**
 * 刪除清點單 Request（查詢頁多筆刪除）
 */
export interface ASS13100DeleteRequest {
  InventoryNoList: string[];
}

/**
 * 結案 Request（結案按鈕）
 */
export interface ASS13100CloseRequest {
  InventoryNo: string;
}

/**
 * 列印盤點表 Request
 */
export interface ASS13100PrintRequest {
  /** 清點單號(起) */
  InventoryNoFrom: string;
  /** 清點單號(迄) */
  InventoryNoTo: string;
}

