import { ApiRequest } from '@shared/utils/rxjs-operators/validate-api-response';

// ====== 主檔查詢清單每列（queryASS16030M response）======
export interface ASS16030QueryData {
  MASTER_ID: number;
  MTAPPLY_ID: string;

  EMP_ID: string;
  EMP_NAME?: string | null;

  ORG_ID: string;
  ORG_NAME?: string | null;

  APPLY_DATE: string;

  /**
   * 建議需求(日)
   * DB：FACONSUMEM.REQUIRE_DATE
   */
  REQUIRE_DATE?: number | null;

  /**
   * 主檔說明
   * DB：FACONSUMEM.NOTES
   */
  MASTER_NOTES?: string | null;

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


// ====== 單據明細查詢每列（queryASS16030D response）======
// 每筆同時帶 master + detail。
// 無 detail 時仍可能回一列，detail 欄位為 null。
export interface ASS16030DetailQueryData {
  // -------------------------
  // Master
  // -------------------------
  MASTER_ID: number | null;

  MTAPPLY_ID: string | null;

  EMP_ID: string | null;

  /**
   * 申請人名稱
   */
  user_Name: string | null;

  ORG_ID: string | null;

  /**
   * 部門名稱
   */
  Org_Name: string | null;

  APPLY_DATE: string | null;

  /**
   * 建議需求(日)
   * DB：FACONSUMEM.REQUIRE_DATE
   */
  REQUIRE_DATE: number | null;

  /**
   * 主檔說明
   *
   * SQL：
   * M.NOTES AS MASTER_NOTES
   */
  MASTER_NOTES: string | null;

  MTAPPLY_STATUS: string | null;

  AMT: number | null;

  APRV_EMP_ID: string | null;

  APRV_DATE: string | null;

  WH_ID: string | null;

  CHECK_DATE: string | null;


  // -------------------------
  // Detail
  // -------------------------
  DETAIL_ID: number | null;

  MID: number | null;

  STO_NO: string | null;

  MTAPPLYM_ID: number | null;

  FASITEM_ID: number | null;

  /**
   * 品項名稱
   */
  GOODS_NAME: string | null;

  LINE_NUM: number | null;

  QTY: number | null;

  /**
   * 單位代碼
   * 後端 Swagger 欄位名為 Unit
   */
  Unit: string | null;

  GOODS_PRICE: number | null;

  TAX_CODE: string | null;

  ITEM_AMT: number | null;

  CHECK_QTY: number | null;

  RETURN_QTY: number | null;

  /**
   * 明細說明
   *
   * SQL：
   * D.NOTES AS NOTES
   */
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
// 後端 ApiResponse.Data 為：
// {
//   TotalCount,
//   TotalPage,
//   QueryData: T[]
// }
//
// Service 再 pipe(map) 將 QueryData 攤平到 Data。
export interface ASS16030QueryResultWrapper<T> {
  TotalCount?: number;
  TotalPage?: number;
  QueryData?: T[];
}


// ====== 查詢 Request ======
export interface ASS16030QueryRequest extends ApiRequest {
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

  /**
   * TODO:
   * 待規格確認 GOODS_PRICE 來源
   * 目前暫送 0
   */
  GOODS_PRICE: number;

  /**
   * 單位代碼
   */
  Unit?: string | null;

  /**
   * 明細說明
   *
   * DB：
   * FACONSUMED.NOTES
   */
  NOTES?: string | null;
}


// ====== 新增 Request ======
export interface ASS16030InsertRequest {
  EMP_ID: string;

  ORG_ID: string;

  APPLY_DATE: string;

  /**
   * 建議需求(日)
   */
  REQUIRE_DATE?: number | null;

  WH_ID: string;

  /**
   * 主檔說明
   *
   * DB：
   * FACONSUMEM.NOTES
   */
  MASTER_NOTES?: string | null;

  /**
   * 明細
   *
   * DETAILS[].NOTES
   * ↓
   * FACONSUMED.NOTES
   */
  DETAILS: ASS16030DetailItem[];
}


// ====== 修改 Request ======
export interface ASS16030UpdateRequest {
  MTAPPLY_ID: string;

  EMP_ID: string;

  ORG_ID: string;

  APPLY_DATE: string;

  /**
   * 建議需求(日)
   */
  REQUIRE_DATE?: number | null;

  WH_ID: string;

  /**
   * 主檔說明
   *
   * DB：
   * FACONSUMEM.NOTES
   */
  MASTER_NOTES?: string | null;

  /**
   * 明細
   */
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