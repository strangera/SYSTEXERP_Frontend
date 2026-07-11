import { ApiRequest } from '@shared/utils/rxjs-operators/validate-api-response';
/** ASS16050 共用查詢條件 Request（queryASS16050M 與 queryASS16050 共用同一個 DTO） */
export interface Ass16050QueryRequest extends ApiRequest {
  MTAPPLY_ID?: string | null;        // 領用單號（長度 15）
  EMP_ID?: string | null;            // 申請人代號
  FASITEM_ID?: number | null;        // 品項 ID (int64)
  APPLY_DATE_S?: string | null;      // 申請日期起
  APPLY_DATE_E?: string | null;      // 申請日期迄
  APRV_DATE_S?: string | null;       // 審核日期起
  APRV_DATE_E?: string | null;       // 審核日期迄
  ORG_ID?: string | null;            // 部門代號
  CHECK_DATE?: string | null;        // 發料日期
  APRV_EMP_ID?: string | null;       // 審核者代號
  WH_ID?: string | null;             // 倉別
  STATUS?: string | null;            // 領用單狀態 (CHAR(1))
}

/** 主檔列（queryASS16050M Response.Data.QueryData 內每筆） */
export interface Ass16050MasterRow {
  MASTER_ID: number;
  MTAPPLY_ID: string;
  EMP_ID: string;
  ORG_ID: string;
  APPLY_DATE: string;
  MTAPPLY_STATUS: string;
  AMT: number;
  APRV_EMP_ID: string;
  APRV_DATE: string;
  WH_ID: string;
  CHECK_DATE: string;
  TOTAL_COUNT?: number;
}

/** 主檔+明細列（queryASS16050 Response.Data.QueryData 內每筆 — flat 結構） */
export interface Ass16050DetailRow extends Ass16050MasterRow {
  DETAIL_ID: number;
  MID: number;
  STO_NO: string;
  MTAPPLYM_ID: number;
  FASITEM_ID: number;
  LINE_NUM: number;
  QTY: number;
  GOODS_PRICE: number;
  TAX_CODE: string;
  ITEM_AMT: number;
  CHECK_QTY: number;
  RETURN_QTY: number;
  NOTES: string;
  UPD_USR_No?: string;
  UPD_Date?: string;
  UPD_USR_Name?: string;
  CRT_USR_No?: string;
  CRT_Date?: string;
  CRT_USR_Name?: string;
}

/** API Response 包裝（Data.QueryData 結構） */
export interface Ass16050QueryDataWrapper<T> {
  QueryData: T[];
  TotalCount: number;
  TotalPage: number;
}

/** 查詢頁顯示用：主檔 + 自行 group 出的明細筆數 */
export interface Ass16050MasterDisplayRow extends Ass16050MasterRow {
  detailCount: number;
}

/** 結案/發料 Request */
export interface Ass16050DispatchRequest {
  MTAPPLY_ID: string;
  /** 由後端自動帶入，前端通常不需傳 */
  APRV_EMP_ID?: string | null;
}

/** 結案/發料 Response Data */
export interface Ass16050DispatchData {
  MTAPPLY_ID: string;
}
