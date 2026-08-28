import { ApiRequest } from '@shared/utils/rxjs-operators/validate-api-response';
/**
 * ASS12050 採購單驗收作業 - 資料模型
 */

// ==================== 查詢 Request ====================

/** 採購單驗收查詢條件 */
export interface QueryASS12050Request extends ApiRequest {
  /** 採購單號 */
  SUBPOENA_ID?: string | null;
  /** 品項編號 */
  GOODS_ID?: string | null;
  /** 申請人編號 */
  EMP_ID?: string | null;
  /** 部門代號 */
  ORG_ID?: string | null;
  /** 申請日期 起 */
  APPLY_DATE_S?: string | null;
  /** 申請日期 訖 */
  APPLY_DATE_E?: string | null;
  /** 供應商編號 */
  SUPPLIER_ID?: string | null;
  /** 稅額 起 */
  TAX_AMT_S?: number | null;
  /** 稅額 訖 */
  TAX_AMT_E?: number | null;
  /** 未稅總金額 起 */
  NTAX_AMT_S?: number | null;
  /** 未稅總金額 訖 */
  NTAX_AMT_E?: number | null;
  /** 含稅總金額 起 */
  AMT_S?: number | null;
  /** 含稅總金額 訖 */
  AMT_E?: number | null;
  /** 狀態 */
  STATUS?: string | null;
  /** 審核人編號 */
  APRV_EMP_ID?: string | null;
  /** 審核日期 起 */
  APRV_DATE_S?: string | null;
  /** 審核日期 訖 */
  APRV_DATE_E?: string | null;
  /** 驗收日期 起 */
  CHECK_DATE_S?: string | null;
  /** 驗收日期 訖 */
  CHECK_DATE_E?: string | null;
  /** 倉別 */
  WH_ID?: string | null;
}

// ==================== 查詢 Response ====================

/** 查詢回應資料結構（巢狀 Data） */
export interface ASS12050QueryDataWrapper {
  TotalRows: number;
  TotalPages: number;
  QueryData: ASS12050QueryRow[];
}

/** 採購單驗收查詢結果一筆 */
export interface ASS12050QueryRow {
  /** 採購單號 */
  SUBPOENA_ID?: string | null;
  /** 驗收單號 */
  SUBCHECK_ID?: string | null;
  /** 申請人編號 */
  EMP_ID?: string | null;
  /** 申請人名稱 */
  EMP_Name?: string | null;
  /** 結案人員編號 */
  CLOSE_EMP_ID?: string | null;
  /** 結案人員名稱 */
  CLOSE_EMP_NAME?: string | null;
  /** 部門代號 */
  ORG_ID?: string | null;
  /** 部門名稱 */
  ORG_NAME?: string | null;
  /** 申請日期 */
  APPLY_DATE?: string | null;
  /** 稅額 */
  TAX_AMT?: number | null;
  /** 含稅總金額 */
  AMT?: number | null;
  /** 狀態 */
  STATUS?: string | null;
  /** 審核人代碼 */
  APRV_EMP_ID?: string | null;
  /** 審核人名稱 */
  APRV_EMP_NAME?: string | null;
  /** 審核日期 */
  APRV_DATE?: string | null;
  /** 驗收日期 */
  CHECK_DATE?: string | null;
  /** 明細筆數 */
  DETAIL_COUNT?: number | null;
  /** 驗收筆數 */
  CHECK_COUNT?: number | null;
  /** 行號 */
  RowNum?: number | null;
}

// ==================== 新增 Request ====================

/** 採購單驗收新增 Request（單筆明細 flat 結構） */
export interface ASS12050InsertRequest {
  EMP_ID?: string | null;
  M_ORG_ID?: string | null;
  SUPPLIER_ID?: string | null;
  APPLY_DATE?: string | null;
  SUBPOENA_ID?: string | null;
  M_NTAX_AMT?: number | null;
  M_TAX_AMT?: number | null;
  M_AMT?: number | null;
  GOODS_ID?: string | null;
  GOODS_UNIT?: string | null;
  QTY?: number | null;
  SHIP_QTY?: number | null;
  CHECK_QTY?: number | null;
  GOODS_PRICE?: number | null;
  DIS_PRICE?: number | null;
  D_TAX_AMT?: number | null;
  D_NTAX_AMT?: number | null;
  D_AMT?: number | null;
  SITE_ID?: string | null;
  WH_ID?: string | null;
  D_ORG_ID?: string | null;
  NOTES?: string | null;
}

/** 新增回應 */
export interface ASS12050InsertResult {
  O_SUBPOENA_ID?: string | null;
  O_SUBCHECK_ID?: string | null;
  O_MESSAGE?: string | null;
}

// ==================== 主檔 getMasterASS12050 ====================

/** 取得主檔 Request */
export interface ASS12050GetMasterRequest {
  SUBPOENA_ID: string;
}

/** 主檔回應資料結構（巢狀 Data） */
export interface ASS12050MasterDataWrapper {
  Details: ASS12050MasterRow[];
  TotalRows: number;
}

/** 主檔一筆（採購單下的驗收單清單） */
export interface ASS12050MasterRow {
  ROW_NO?: number | null;

  /** 驗收單號 */
  SUBCHECK_ID?: string | null;

  /** 驗收人員編號 */
  CLOSE_EMP_ID?: string | null;

  /** 驗收人員名稱 */
  CLOSEName?: string | null;

  /** 驗收日期 */
  CHECK_DATE?: string | null;

  /** 部門名稱 */
  Org_Name?: string | null;

  /** 申請人名稱 */
  APPLYName?: string | null;

  /** 申請日期 */
  APPLY_DATE?: string | null;

  /** 供應商名稱 */
  VEN_Name?: string | null;

  /** 驗收狀態 */
  STATUS?: string | null;

  /** 明細筆數 */
  DETAIL_COUNT?: number | null;

  /** 行號 */
  RowNum?: number | null;
}

// ==================== 明細 getDetailASS12050 ====================

/** 取得明細 Request */
export interface ASS12050GetDetailRequest {
  SUBCHECK_ID: string;
}

/** 採購單驗收明細（編輯頁載入用） */
export interface ASS12050Detail {
  ROW_NO?: number | null;

  /** 驗收單號 */
  SUBCHECK_ID?: string | null;

  /** 申請人編號 */
  EMP_ID?: string | null;

  /** 申請人名稱 */
  EMP_Name?: string | null;

  /** 部門代號 */
  ORG_ID?: string | null;

  /** 部門名稱 */
  Org_Name?: string | null;

  /** 申請日期 */
  APPLY_DATE?: string | null;

  /** 驗收人員編號 */
  CLOSE_EMP_ID?: string | null;

  /** 驗收人員名稱 */
  CLOSE_EMP_NAME?: string | null;

  /** 驗收日期 */
  CHECK_DATE?: string | null;

  /** 供應商代號 */
  SUPPLIER_ID?: string | null;

  /** 供應商名稱 */
  VEN_Name?: string | null;

  /** 未稅總金額 */
  NTAX_AMT?: number | null;

  /** 稅額 */
  TAX_AMT?: number | null;

  /** 含稅總金額 */
  AMT?: number | null;

  /** 驗收狀態 */
  CHK_Status?: string | null;

  /** 明細列 */
  Details?: ASS12050DetailItem[];
}

// ==================== 明細項目 ====================

/** 驗收明細一筆 */
export interface ASS12050DetailItem {
  /** 品項代號 */
  GOODS_ID?: string | null;
  /** 驗收明細ID */
  DETAIL_ID?: string | null;
  /** 品項名稱 */
  GOODS_NAME?: string | null;
  /** 單位 */
  GOODS_UNIT?: string | null;
  /** 申請數量 */
  APPLY_QTY?: number | null;
  /** 出貨數量 */
  SHIP_QTY?: number | null;
  /** 驗收數量 */
  CHECK_QTY?: number | null;
  /** 單價(未稅) */
  GOODS_PRICE: number | 0;
  /** 折讓單價 */
  DIS_PRICE: number | 0;
  /** 總金額 */
  AMT: number | 0;
  /** 分店 */
  SITE_ID?: string | null;
  /** 倉別 */
  WH_ID?: string | null;
  /** 說明 */
  NOTES?: string | null;
  /** 異動筆數 */
  LIST_COUNT?: number | null;
}

// ==================== 驗收確認 ====================
/** 驗收確認 Request */
export interface ASS12050ConfirmRequest {
  SUBCHECK_ID: string;
  USR_NO?: string | null;
  USR_NAME?: string | null;
  /** 驗收確認明細 */
  DETAILS: ASS12050ConfirmDetail[];
}

// ==================== 明細項目 ====================
/** 驗收確認明細 */
export interface ASS12050ConfirmDetail {
  /** 驗收明細 ID */
  DETAIL_ID: string;

  /** 本次驗收數量 */
  CHECK_QTY: number;

  /** 折讓單價 */
  DIS_PRICE: number;

  /** 未稅金額 */
  NTAX_AMT: number;

  /** 說明 */
  NOTES: string | null;
}

// ==================== 編輯 ====================

/** 編輯 Request（明細級） */
export interface ASS12050UpdateRequest {
  DETAIL_ID: string;
  CHECK_QTY?: number | null;
  DIS_PRICE?: number | null;
  AMT?: number | null;
  NOTES?: string | null;
  NTAX_AMT?: number | null;
}

// ==================== 審核 ====================

/** 作廢 Request */
export interface ASS12050ApproveRequest {
  SUBCHECK_ID: string;
}
// ==================== 強制結案 ====================

/** 強制結案明細項目 */
export interface ASS12050ForceCloseItem {
  /** 驗收明細或單據識別碼（由後端解讀 DETAIL_ID） */
  DETAIL_ID: string;
}

/** 強制結案 Request */
export interface ASS12050ForceCloseRequest {
  Items: ASS12050ForceCloseItem[];
}

// ==================== 作廢 ====================

/** 作廢 Request */
export interface ASS12050VoidRequest {
  DETAIL_ID: string;
}

// ==================== 共用 Request ====================

/** 以驗收單號識別的共用 Request（exportPDF 等） */
export interface ASS12050SubcheckRequest {
  SUBPOENA_ID: string;
}

// ==================== 轉入採購單清單 ====================

/** 轉入採購單清單回應包裝器 */
export interface ASS12050TransferListDataWrapper {
  TotalRows: number;
  ListData: ASS12050TransferRow[];
}

/** 轉入採購單清單一筆 */
export interface ASS12050TransferRow {
  /** 採購單號 */
  SUBPOENA_ID?: string | null;
  /** 申請人代號 */
  EMP_ID?: string | null;
  /** 申請人名稱 */
  EMP_NAME?: string | null;
  /** 部門代號 */
  ORG_ID?: string | null;
  /** 部門名稱 */
  ORG_NAME?: string | null;
  /** 申請日期 */
  APPLY_DATE?: string | null;
  /** 供應商代號 */
  SUPPLIER_ID?: string | null;
  /** 供應商名稱 */
  SUPPLIER_NAME?: string | null;
  /** 未稅總金額 */
  NTAX_AMT?: number | null;
  /** 稅額 */
  TAX_AMT?: number | null;
  /** 含稅總金額 */
  AMT?: number | null;
  /** 申請數量 */
  APPLY_QTY?: number | null;
  /** 已驗數量 */
  CHECKED_QTY?: number | null;
  /** 剩餘數量 */
  REMAIN_QTY?: number | null;
  /** 行號 */
  RN?: number | null;
}

// ==================== 轉入採購單 ====================

/** 轉入採購單 Request */
export interface ASS12050TransferRequest {
  SUBPOENA_ID: string;
}
