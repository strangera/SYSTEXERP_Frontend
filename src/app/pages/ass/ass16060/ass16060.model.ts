import { ApiRequest } from '@shared/utils/rxjs-operators/validate-api-response';
/** 領用退料作業 共用查詢條件 Request（queryASS16060M 與 queryASS16060 共用） */
export interface ASS16060QueryRequest extends ApiRequest {
  WH_ID?: string | null;
  /** 退回單狀態 SYS1000: AM_MTRETURNM_STATUS */
  MTRETURNM_STATUS?: string | null;
  /** 退回單號（支援模糊查詢） */
  MTRETURN_ID?: string | null;
  EMP_ID?: string | null;
  ORG_ID?: string | null;
  RETURN_DATE_START?: string | null;
  RETURN_DATE_END?: string | null;
}

/** 主檔列（queryASS16060M Response.Data.QueryData 內每筆） */
export interface ASS16060MasterRow {
  MTRETURN_ID?: string | null;
  EMP_ID?: string | null;
  EMP_NAME?: string | null;
  WH_ID?: string | null;
  WH_NAME?: string | null;
  ORG_ID?: string | null;
  ORG_NAME?: string | null;
  RETURN_DATE?: string | null;
  MTRETURNM_STATUS?: string | null;
  STATUS_NAME?: string | null;
  DetailCount?: number | null;
}

/** 主檔+明細列（queryASS16060 Response.Data.QueryData 內每筆 — flat 結構） */
export interface ASS16060DetailRow extends ASS16060MasterRow {
  ID?: number | null;
  MID?: number | null;
  STO_NO?: string | null;
  GOODS_ID?: string | null;
  LINE_NUM?: number | null;
  QTY?: number | null;
  GOODS_PRICE?: number | null;
  TAX_CODE?: string | null;
  AMT?: number | null;
  CHECK_QTY?: number | null;
  NOTES?: string | null;
  MTAPPLY_ID?: string | null;
  CRT_USR_No?: string | null;
  CRT_USR_Name?: string | null;
  CRT_DATE?: string | null;
  UPD_USR_No?: string | null;
  UPD_USR_Name?: string | null;
  UPD_DATE?: string | null;
}

/** API Response 包裝（Data.QueryData 結構） */
export interface ASS16060QueryDataWrapper<T> {
  QueryData: T[];
  TotalCount: number;
  TotalPage: number;
}

/** 查詢頁顯示用：主檔 + lowercase detailCount（從 DetailCount 轉一致命名） */
export interface ASS16060MasterDisplayRow extends ASS16060MasterRow {
  detailCount: number;
}
