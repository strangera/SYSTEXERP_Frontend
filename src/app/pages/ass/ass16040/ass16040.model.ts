import { BaseQueryRequest } from '@shared/models/api/base-api.interface';

/**
 * ASS16040 領用審核作業 - 查詢請求
 */
export interface ASS16040QueryRequest extends BaseQueryRequest {
  MTAPPLY_ID?: string;   // 領用單號（長度 15）
  EMP_ID?: string;       // 申請人代號
  FASITEM_ID?: number;   // 品項編號
  APPLY_DATE_S?: string; // 申請日期起 (YYYY-MM-DD)
  APPLY_DATE_E?: string; // 申請日期迄 (YYYY-MM-DD)
  APRV_DATE_S?: string;  // 審核日期起 (YYYY-MM-DD)
  APRV_DATE_E?: string;  // 審核日期迄 (YYYY-MM-DD)
  ORG_ID?: string;       // 部門代號
  CHECK_DATE?: string;   // 發料日期 (YYYY-MM-DD)
  APRV_EMP_ID?: string;  // 審核者代號
  WH_ID?: string;        // 倉別
  STATUS?: string;       // 領用單狀態
}

/**
 * ASS16040 查詢結果列
 * 每筆代表一筆明細，MTAPPLY_ID 相同的 rows 屬於同一張領用單
 */
export interface ASS16040Data {
  ID: number;
  MTAPPLY_ID: string;        // 領用單號
  EMP_ID: string;            // 申請人代號
  EMP_NAME?: string;         // 申請人名稱
  ORG_ID: string;            // 部門代號
  ORG_NAME?: string;         // 部門名稱
  APPLY_DATE: string;        // 申請日期
  MTAPPLY_STATUS: string;        // 領用單狀態代碼
  MTAPPLY_STATUS_NAME?: string;  // 領用單狀態名稱
  AMT: number;
  APRV_EMP_ID: string;       // 審核者代號
  APRV_EMP_NAME?: string;    // 審核者名稱
  APRV_DATE: string;         // 審核日期
  WH_ID: string;             // 倉別代號
  WH_NAME?: string;          // 倉別名稱
  CHECK_DATE: string;        // 發料日期
  LINE_NUM: number;          // 明細筆數（頭檔總計）
  FASITEM_ID: number;        // 品項編號（明細）
  QTY: number;               // 數量（明細）
  GOODS_PRICE: number;
  ITEM_AMT: number;
}

/**
 * ASS16040 審核請求
 */
export interface ASS16040ApproveRequest {
  MTAPPLY_ID: string;   // 領用單號
  APRV_EMP_ID: string;  // 審核者代號（登入者 user_No）
}

/**
 * ASS16040 CRU 明細列
 */
export interface ASS16040DetailRow {
  FASITEM_ID: number;    // 品項編號
  UNIT?: string;         // 單位
  QTY: number;           // 數量
  ITEM_REMARK?: string;  // 單項說明
}
