import { ApiRequest } from '@shared/utils/rxjs-operators/validate-api-response';
/**
 * ASS12010 請購申請作業 - 資料模型
 */

/**
 * ASS12010 查詢請求參數
 */
export interface ASS12010QueryRequest extends ApiRequest {
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
  APPLY_DATE_S?: Date | null;
  /** 需求日期(迄) */
  APPLY_DATE_E?: Date | null;
  /** 請購申請狀態 */
  NEEDS_STATUS?: string | null;
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
  /** 明細筆數 */
  Detail_CNT?: number;
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
  /** 申請人代號 */
  EMP_ID: string;
  /** 部門代號 */
  ORG_ID: string;
  /** 倉別 */
  WH_ID: string;
  /** 需求日期 */
  APPLY_DATE: Date | string;
  /** 需求單號 */
  NEED_NUM?: string;
  /** 備註 */
  NOTE?: string;
  /** 明細資料（JSON 字串） */
  DetailJson: string;
}

/**
 * ASS12010 取得詳細資料請求
 */
export interface ASS12010DetailRequest {
  /** 需求單號 */
  NEED_ID: string;
}

/**
 * ASS12010 詳細資料表頭
 */
export interface ASS12010DetailHeader {
  /** ID */
  ID?: number;
  /** 倉庫單號 */
  STO_NO?: string;
  /** 需求單號 */
  NEED_ID?: string;
  /** 申請人代號 */
  EMP_ID?: string;
  /** 申請人名稱 */
  EMP_NAME?: string;
  /** 部門代號 */
  ORG_ID?: string;
  /** 部門名稱 */
  ORG_NAME?: string;
  /** 倉別 */
  WH_ID?: string;
  /** 申請日期 */
  APPLY_DATE?: Date | string;
  /** 需求單號 */
  NEED_NUM?: string;
  /** 備註 */
  NOTE?: string;
  /** 明細筆數 */
  Detail_CNT?: number;
  /** 請購申請狀態 */
  NEEDS_STATUS?: string;
  /** 請購申請狀態名稱 */
  NEEDS_STATUS_NAME?: string;
  /** 批次ID */
  BATCH_ID?: string;
  /** 傳票ID */
  SUBPOENA_ID?: string;
  /** 建立日期 */
  CRT_Date?: Date | string;
  /** 建立人員編號 */
  CRT_USR_No?: string;
  /** 建立人員名稱 */
  CRT_USR_Name?: string;
  /** 更新日期 */
  UPD_Date?: Date | string;
  /** 更新人員編號 */
  UPD_USR_No?: string;
  /** 更新人員名稱 */
  UPD_USR_Name?: string;
}

/**
 * ASS12010 詳細資料明細
 */
export interface ASS12010DetailItem {
  /** ID */
  ID?: number;
  /** 品項代號 */
  GOODS_ID?: string;
  /** 品項名稱 */
  GOODS_NAME?: string;
  /** 單位 */
  Unit?: string;
  /** 數量 */
  QTY?: number;
  /** 採購數量 */
  PURCHASE_QTY?: number;
  /** 品項類別屬性代碼 */
  MATERIAL_TYPE?: string;
  /** 保管部門代號 */
  HOLD_ORG_ID?: string;
  /** 保管部門名稱 */
  HOLD_ORG_NAME?: string;
  /** 保管人員代號 */
  HOLD_EMP_ID?: string;
  /** 保管人員名稱 */
  HOLD_EMP_NAME?: string;
  /** 備註 */
  NOTES?: string;
}

/**
 * ASS12010 詳細資料回應
 */
export interface ASS12010DetailResponse {
  /** 表頭資料 */
  Header: ASS12010DetailHeader;
  /** 明細資料 */
  Details: ASS12010DetailItem[];
}

/**
 * ASS12010 查詢回應資料包裝器
 */
export interface ASS12010QueryDataWrapper {
  /** 總筆數 */
  TotalRows: number;
  /** 總頁數 */
  TotalPages: number;
  /** 查詢資料 */
  QueryData: ASS12010Data[];
}

/**
 * ASS12010 更新請求參數（符合新 API 規格）
 */
export interface ASS12010UpdateRequest {
  /** 需求單號 */
  NEED_ID: string;
  /** 申請人代號 */
  EMP_ID: string;
  /** 部門代號 */
  ORG_ID: string;
  /** 倉別 */
  WH_ID: string;
  /** 申請日期 */
  APPLY_DATE: Date | string;
  /** 需求單號 */
  NEED_NUM?: string;
  /** 備註 */
  NOTE?: string;
  /** 明細資料 */
  Details: ASS12010UpdateDetailItem[];
}

/**
 * ASS12010 更新請求明細項目
 */
export interface ASS12010UpdateDetailItem {
  /** 品項代號 */
  GOODS_ID: string;
  /** 數量 */
  QTY: number;
  /** 保管部門代號 */
  HOLD_ORG_ID: string;
  /** 保管人員代號 */
  HOLD_EMP_ID: string;
  /** 備註 */
  NOTES?: string;
}

/**
 * ASS12010 刪除請求參數
 */
export interface ASS12010DeleteRequest {
  /** 需求單號 */
  NEED_ID: string;
}

/**
 * ASS12010 審核請求參數
 */
export interface ASS12010ApproveRequest {
  /** 需求單號 */
  NEED_ID: string;
}

/**
 * ASS12010 下載報表請求參數
 */
export interface ASS12010DownloadReportRequest {
  /** 需求單號 */
  NEED_ID: string;
}
