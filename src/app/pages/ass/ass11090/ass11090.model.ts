import { BaseQueryRequest } from '@shared/models/api/base-api.interface';

/**
 * ASS11090 資材中分類會計科目維護作業 - 資料模型
 */
export interface ASS11090Data {
  id?: number; // 用於表格識別
  /** 序號 */
  SerialNo?: number;
  /** 大分類代碼 */
  BigCategoryCode?: string;
  /** 大分類名稱 */
  BigCategoryName?: string;
  /** 中分類代碼 */
  MidCategoryCode?: string;
  /** 中分類名稱 */
  MidCategoryName?: string;
  /** 會計科目(借)代碼 */
  AccountingDebitCode?: string;
  /** 會計科目(借)名稱 */
  AccountingDebitName?: string;
  /** 所屬會計科目(貸)代碼 */
  AccountingCreditCode?: string;
  /** 所屬會計科目(貸)名稱 */
  AccountingCreditName?: string;
  /** 進項稅額科目(借)代碼 */
  InputTaxDebitCode?: string;
  /** 進項稅額科目(借)名稱 */
  InputTaxDebitName?: string;
  /** 費用科目代碼 */
  ExpenseAccountCode?: string;
  /** 費用科目名稱 */
  ExpenseAccountName?: string;
  /** 累計折舊科目(貸)代碼 */
  AccumulatedDepreciationCreditCode?: string;
  /** 累計折舊科目(貸)名稱 */
  AccumulatedDepreciationCreditName?: string;
  /** 折舊科目(借)代碼 */
  DepreciationDebitCode?: string;
  /** 折舊科目(借)名稱 */
  DepreciationDebitName?: string;
  /** 折舊年限 */
  DepreciationLife?: number;
  /** 說明 */
  Description?: string;
}

/**
 * ASS11090 查詢請求參數
 */
export interface ASS11090QueryRequest extends BaseQueryRequest {
  /** 大分類代碼 */
  BigCategoryCode?: string;
  /** 大分類名稱 */
  BigCategoryName?: string;
  /** 中分類代碼 */
  MidCategoryCode?: string;
  /** 中分類名稱 */
  MidCategoryName?: string;
  /** 所屬會計科目(借) - 僅傳入代碼 */
  AccountingDebitCode?: string;
  /** 所屬會計科目(貸) - 僅傳入代碼 */
  AccountingCreditCode?: string;
  /** 進項稅額科目(借) - 僅傳入代碼 */
  InputTaxDebitCode?: string;
  /** 費用科目 - 僅傳入代碼 */
  ExpenseAccountCode?: string;
  /** 累計折舊科目(貸) - 僅傳入代碼 */
  AccumulatedDepreciationCreditCode?: string;
  /** 折舊科目(借) - 僅傳入代碼 */
  DepreciationDebitCode?: string;
  /** 折舊年限 */
  DepreciationLife?: string;
}

/**
 * ASS11090 明細資料請求參數
 */
export interface ASS11090DetailRequest {
  /** 記錄 ID */
  id?: number;
  /** 大分類代碼 */
  BigCategoryCode?: string;
  /** 中分類代碼 */
  MidCategoryCode?: string;
}

/**
 * 大分類下拉選單項目
 * 注意：API 尚未開發完畢，目前僅定義 Class
 */
export interface BigCategoryOption {
  /** 大分類代碼 */
  No: string;
  /** 大分類名稱 */
  Name: string;
}

/**
 * 中分類下拉選單項目
 * 注意：API 尚未開發完畢，目前僅定義 Class
 */
export interface MidCategoryOption {
  /** 中分類代碼 */
  No: string;
  /** 中分類名稱 */
  Name: string;
}
