/**
 * ASS12010 請購申請作業 - 資料模型
 */

/**
 * ASS12010 查詢請求參數
 */
export interface ASS12010QueryRequest {
  /** 倉別 */
  WH_ID?: string | null;
  /** 需求單號 */
  NEED_ID?: string | null;
  /** 品項代號 */
  GOODS_ID?: string | null;
  /** 申請人代號 */
  EMP_ID?: string | null;
  /** 部門代號 */
  ORG_ID?: string | null;
  /** 需求日期(起) */
  APPLY_DATE_FROM?: Date | null;
  /** 需求日期(迄) */
  APPLY_DATE_TO?: Date | null;
  /** 請購申請狀態 */
  NEEDS_STATUS?: string | null;
  /** 每頁筆數 */
  PageSize?: number;
  /** 頁碼 */
  PageIndex?: number;
  /** 排序條件 */
  SortBy?: { field: string; order: number }[];
}

/**
 * ASS12010 查詢結果資料
 */
export interface ASS12010Data {
  /** 需求單號 */
  NEED_ID?: string;
  /** 申請人編號 */
  EMP_ID?: string;
  /** 申請人名稱 */
  EMP_NAME?: string;
  /** 倉別 */
  WH_ID?: string;
  /** 部門代號 */
  ORG_ID?: string;
  /** 部門名稱 */
  ORG_NAME?: string;
  /** 需求日期 */
  APPLY_DATE?: Date | string;
  /** 請購申請狀態 */
  NEEDS_STATUS?: string;
  /** 請購申請狀態名稱 */
  NEEDS_STATUS_NAME?: string;
}

/**
 * ASS12010 品項明細資料
 */
export interface ASS12010Item {
  /** 品項代碼 */
  GOODS_ID?: string;
  /** 保管單位 */
  CUSTODY_UNIT?: string;
  /** 保管人 */
  CUSTODIAN?: string;
  /** 單位 */
  UNIT?: string;
  /** 數量 */
  QUANTITY?: string | number;
  /** 單項說明 */
  ITEM_REMARK?: string;
}

/**
 * ASS12010 新增請求參數
 */
export interface ASS12010InsertRequest {
  /** 部門代號 */
  ORG_ID: string;
  /** 申請人代號 */
  EMP_ID: string;
  /** 需求日期 */
  APPLY_DATE: Date | string;
  /** 需求期限(天) */
  NEED_PERIOD?: string;
  /** 倉別 */
  WH_ID: string;
  /** 說明 */
  REMARK?: string;
  /** 品項明細 */
  items: ASS12010Item[];
}

/**
 * ASS12010 更新請求參數
 */
export interface ASS12010UpdateRequest {
  /** 需求單號 */
  NEED_ID: string;
  /** 部門代號 */
  ORG_ID: string;
  /** 申請人代號 */
  EMP_ID: string;
  /** 需求日期 */
  APPLY_DATE: Date | string;
  /** 需求期限(天) */
  NEED_PERIOD?: string;
  /** 倉別 */
  WH_ID: string;
  /** 說明 */
  REMARK?: string;
  /** 品項明細 */
  items: ASS12010Item[];
}
