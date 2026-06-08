import { BaseQueryRequest } from '@shared/models/api/base-api.interface';

// ====== 主檔查詢清單每列（queryASS16030M response）======
export interface ASS16030QueryData {
  MASTER_ID: number;
  MTAPPLY_ID: string;
  EMP_ID: string;
  EMP_NAME?: string | null;
  ORG_ID: string;
  ORG_NAME?: string | null;
  APPLY_DATE: string;
  MTAPPLY_STATUS: string;
  MTAPPLY_STATUS_NAME?: string | null;
  AMT: number | null;
  APRV_EMP_ID: string | null;
  APRV_EMP_NAME?: string | null;
  APRV_DATE: string | null;
  WH_ID: string;
  WH_NAME?: string | null;
  CHECK_DATE: string | null;
  TOTAL_COUNT: number;
}

// ====== 單據明細查詢每列（queryASS16030 — D endpoint response）======
// 每筆同時帶 master + detail（後端 JOIN）；無 detail 時仍會回一列 detail 欄位為 null。
export interface ASS16030DetailQueryData {
  MASTER_ID: number | null;
  MTAPPLY_ID: string | null;
  EMP_ID: string | null;
  user_Name: string | null;      // master JOIN：申請人名稱
  ORG_ID: string | null;
  Org_Name: string | null;       // master JOIN：部門名稱
  APPLY_DATE: string | null;
  MTAPPLY_STATUS: string | null;
  AMT: number | null;
  APRV_EMP_ID: string | null;
  APRV_DATE: string | null;
  WH_ID: string | null;
  CHECK_DATE: string | null;
  DETAIL_ID: number | null;
  MID: number | null;
  STO_NO: string | null;
  MTAPPLYM_ID: number | null;
  FASITEM_ID: number | null;
  GOODS_NAME: string | null;     // detail JOIN：品項名稱
  LINE_NUM: number | null;
  QTY: number | null;
  Unit: string | null;           // detail JOIN：單位代碼（後端 swagger 欄位名為 Unit，首字大寫 U）
  GOODS_PRICE: number | null;
  TAX_CODE: string | null;
  ITEM_AMT: number | null;
  CHECK_QTY: number | null;
  RETURN_QTY: number | null;
  NOTES: string | null;
  UPD_USR_No: string | null;
  UPD_Date: string | null;
  UPD_USR_Name: string | null;
  CRT_USR_No: string | null;
  CRT_Date: string | null;
  CRT_USR_Name: string | null;
  TOTAL_COUNT: number;
}

// ====== 查詢 Response 內層 wrapper（M / D 共用 shape）======
// 後端 ApiResponse.Data 為 { TotalCount, TotalPage, QueryData: T[] }，
// service 需 pipe(map) 把 QueryData 攤平到 Data。
export interface ASS16030QueryResultWrapper<T> {
  TotalCount?: number;
  TotalPage?: number;
  QueryData?: T[];
}

// ====== 查詢 Request ======
export interface ASS16030QueryRequest extends BaseQueryRequest {
  MTAPPLY_ID?: string | null;
  EMP_ID?: string | null;
  FASITEM_ID?: number | null;
  APPLY_DATE_S?: string | null;
  APPLY_DATE_E?: string | null;
  APRV_DATE_S?: string | null;
  APRV_DATE_E?: string | null;
  ORG_ID?: string | null;
  CHECK_DATE?: string | null;
  APRV_EMP_ID?: string | null;
  WH_ID?: string | null;
  STATUS?: string | null;
}

// ====== 品項明細（Insert & Update 共用）======
export interface ASS16030DetailItem {
  FASITEM_ID: number;
  QTY: number;
  // TODO: 待規格確認 GOODS_PRICE 來源（從 FASITEM 帶入？手動輸入？）暫送 0
  GOODS_PRICE: number;
  Unit?: string | null;       // swagger 欄位名為 Unit（首字大寫 U）；單位代碼，由品項下拉自動帶入
  NOTES?: string | null;
}

// ====== 新增 Request ======
export interface ASS16030InsertRequest {
  EMP_ID: string;
  ORG_ID: string;
  APPLY_DATE: string;
  REQUIRE_DAYS?: number | null;
  WH_ID: string;
  NOTES?: string | null;
  // CRT_USR 由後端自動帶入，前端略
  DETAILS: ASS16030DetailItem[];
}

// ====== 修改 Request ======
export interface ASS16030UpdateRequest {
  MTAPPLY_ID: string;
  EMP_ID: string;
  ORG_ID: string;
  APPLY_DATE: string;
  REQUIRE_DAYS?: number | null;
  WH_ID: string;
  NOTES?: string | null;
  // UPD_USR 由後端自動帶入，前端略
  DETAILS: ASS16030DetailItem[];
}

// ====== 新增成功 Response（Data 欄位）======
export interface ASS16030InsertResponse {
  MTAPPLY_ID: string | null;
}

// ====== 列印 PDF Request ======
export interface ASS16030ExportRequest {
  MTAPPLY_ID: string;
}
