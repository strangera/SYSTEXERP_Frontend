import { ApiRequest } from '@shared/utils/rxjs-operators/validate-api-response';
/**
 * ASS11090 資材中分類會計科目維護作業 - 資料模型
 * 欄位對應 API 規格
 */
export interface ASS11090Data {
  /** 大分類代號 */
  B_CLASS_ID?: string;
  /** 大分類名稱 */
  B_CLASS_NAME?: string;
  /** 中分類代號 */
  M_CLASS_ID?: string;
  /** 中分類名稱 */
  M_CLASS_NAME?: string;
  /** 所屬會計科目(借)代碼 */
  STYPE_ACCNO?: string;
  /** 所屬會計科目(借)名稱 */
  STYPE_ACCNO_NAME?: string;
  /** 所屬會計科目(貸)代碼 */
  STYPE_ACCNO2?: string;
  /** 所屬會計科目(貸)名稱 */
  STYPE_ACCNO2_NAME?: string;
  /** 進項稅額科目(借)代碼 */
  STYPE_TAX_ACCNO?: string;
  /** 進項稅額科目(借)名稱 */
  STYPE_TAX_ACCNO_NAME?: string;
  /** 費用科目代碼 (費用結轉區塊) */
  FEES_STYPE_ID_ACCNO?: string;
  /** 費用科目名稱 (費用結轉區塊) */
  FEES_STYPE_ACCNO_NAME?: string;
  /** 折舊科目(借)代碼 (折舊攤提區塊) */
  DEPRE_STYPE_ACCNO?: string;
  /** 折舊科目(借)名稱 (折舊攤提區塊) */
  DEPRE_STYPE_ACCNO_NAME?: string;
  /** 累計折舊科目(貸)代碼 (折舊攤提區塊) */
  DEPRE_STYPE_ACCNO2?: string;
  /** 累計折舊科目(貸)名稱 (折舊攤提區塊) */
  DEPRE_STYPE_ACCNO2_NAME?: string;
  /** 折舊年限 */
  EXP_YEAR?: number;
  /** 備註 */
  NOTES?: string;
  /** 明細資料 */
  VouAccDetails?: VouAccDetail[];
  /** 前端合成鍵：B_CLASS_ID-M_CLASS_ID，供 app-table-report dataKey 用（B_CLASS_ID 本身非唯一） */
  _rowKey?: string;
}

/** API 回傳的明細項目 */
export interface VouAccDetail {
  /** 科目類型 (STYPE: 採買入帳, FEES: 費用結轉, DEPRE: 折舊攤提) */
  AccKind?: string;
  /** 組織代號 */
  ORG_ID?: string;
  /** 會計科目代號 */
  AccNo?: string;
  /** 會計科目名稱 */
  AccName?: string;
}

/**
 * ASS11090 查詢請求參數
 */
export interface ASS11090QueryRequest extends ApiRequest {
  /** 庫別代號 */
  STO_NO?: string;
  /** 大分類代號 */
  B_CLASS_ID?: string;
  /** 大分類名稱 */
  B_CLASS_NAME?: string;
  /** 中分類代號 */
  M_CLASS_ID?: string;
  /** 中分類名稱 */
  M_CLASS_NAME?: string;
  /** 所屬會計科目(借) */
  STYPE_ACCNO?: string;
  /** 所屬會計科目(貸) */
  STYPE_ACCNO2?: string;
  /** 進項稅額科目(借) */
  STYPE_TAX_ACCNO?: string;
  /** 費用科目 */
  FEES_ACCNO?: string;
  /** 折舊科目(借) */
  DEPRE_ACCNO?: string;
  /** 累計折舊科目(貸) */
  DEPRE_ACCNO2?: string;
  /** 會計科目名稱關鍵字 */
  ACC_NAME_KW?: string;
  /** 折舊年限 */
  EXP_YEAR?: number;
  /** 備註關鍵字 */
  NOTES_KW?: string;
}

/**
 * ASS11090 明細資料請求參數
 */
export interface ASS11090DetailRequest {
  /** 庫別代號 */
  STO_NO?: string;
  /** 大分類代號 */
  B_CLASS_ID?: string;
  /** 中分類代號 */
  M_CLASS_ID?: string;
}

/**
 * ASS11090 更新請求參數
 */
export interface ASS11090UpdateRequest {
  /** 庫別代號 */
  STO_NO?: string;
  /** 大分類代號 */
  B_CLASS_ID?: string;
  /** 大分類名稱 */
  B_CLASS_NAME?: string;
  /** 中分類代號 */
  M_CLASS_ID?: string;
  /** 中分類名稱 */
  M_CLASS_NAME?: string;
  /** 所屬會計科目(借) */
  STYPE_ACCNO?: string;
  /** 所屬會計科目(貸) */
  STYPE_ACCNO2?: string;
  /** 進項稅額科目(借) */
  STYPE_TAX_ACCNO?: string;
  /** 費用科目 */
  FEES_STYPE_ID_ACCNO?: string;
  /** 折舊科目(借) */
  DEPRE_STYPE_ACCNO?: string;
  /** 累計折舊科目(貸) */
  DEPRE_STYPE_ACCNO2?: string;
  /** 折舊年限 */
  EXP_YEAR?: number;
  /** 備註 */
  NOTES?: string;
  /** 明細資料 */
  DETAILS?: ASS11090DetailItem[];
  /** 使用者代號 */
  USR_NO?: string;
  /** 使用者名稱 */
  USR_NAME?: string;
}

/**
 * ASS11090 更新明細項目
 */
export interface ASS11090DetailItem {
  /** 科目類型 */
  AccKind?: string;
  /** 原組織代號 */
  OLD_ORG_ID?: string;
  /** 原會計科目代號 */
  OLD_AccNo?: string;
  /** 新組織代號 */
  NEW_ORG_ID?: string;
  /** 新會計科目代號 */
  NEW_AccNo?: string;
}

/** 查詢回應資料結構 (用於 pipe map) */
export interface ASS11090QueryDataWrapper {
  TotalRows: number;    // API 回傳的欄位名稱
  TotalPages: number;   // API 回傳的欄位名稱
  QueryData: ASS11090Data[];
}

/** 採買入帳科目明細 */
export interface PurchaseAccountDetail {
  SerialNo?: number;
  AccountingCode?: string;
  AccountingName?: string;
  OrganizationCode?: string;
  OrganizationName?: string;
}

/** 費用結轉科目明細 */
export interface ExpenseTransferDetail {
  SerialNo?: number;
  ExpenseCode?: string;
  ExpenseName?: string;
  OrganizationCode?: string;
  OrganizationName?: string;
}

/** 折舊攤提科目明細 */
export interface DepreciationDetail {
  SerialNo?: number;
  ExpenseCode?: string;
  ExpenseName?: string;
  OrganizationCode?: string;
  OrganizationName?: string;
}
