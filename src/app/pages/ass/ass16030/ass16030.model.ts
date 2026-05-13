import { BaseQueryRequest } from '@shared/models/api/base-api.interface';

// ====== 查詢結果清單每列 ======
export interface ASS16030QueryData {
  ID: number;
  MTAPPLY_ID: string;
  EMP_ID: string;
  EMP_NAME?: string | null;
  ORG_ID: string;
  ORG_NAME?: string | null;
  APPLY_DATE: string;
  MTAPPLY_STATUS: string;
  MTAPPLY_STATUS_NAME?: string | null;
  APRV_EMP_ID: string | null;
  APRV_EMP_NAME?: string | null;
  APRV_DATE: string | null;
  WH_ID: string;
  WH_NAME?: string | null;
  CHECK_DATE: string | null;
  LINE_NUM: number | null;
  AMT: number | null;
  TOTAL_COUNT: number;
  // 扁平化結構也含明細欄位，但清單頁只使用主檔欄位
  FASITEM_ID?: number | null;
  QTY?: number | null;
  GOODS_PRICE?: number | null;
  NOTES?: string | null;
}

// ====== 查詢 Response 內層 wrapper（後端實際回傳是 nested 結構）======
// 後端 ApiResponse.Data 為 { TotalRows, TotalPages, QueryData: T[] }，
// service 需 pipe(map) 把 QueryData 攤平到 Data，將 TotalRows 提升到 TotalCount。
export interface ASS16030QueryResultWrapper {
  TotalRows?: number;
  TotalPages?: number;
  QueryData?: ASS16030QueryData[];
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
