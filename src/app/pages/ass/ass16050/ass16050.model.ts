import { BaseQueryRequest } from '@shared/models/api/base-api.interface';

/** 查詢條件 Request */
export interface Ass16050QueryRequest extends BaseQueryRequest {
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

/**
 * 查詢結果（每品項一列，扁平結構）
 * API response 為每品項一列，前端需依 MTAPPLY_ID group by
 */
export interface Ass16050QueryData {
  ID: number;
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
  LINE_NUM: number;
  FASITEM_ID: number;
  QTY: number;
  GOODS_PRICE: number;
  ITEM_AMT: number;
  DISPATCH_QTY?: number | null;
}

/** 依 MTAPPLY_ID group by 後的聚合記錄 */
export interface Ass16050GroupedRecord
  extends Omit<Ass16050QueryData, 'LINE_NUM' | 'FASITEM_ID' | 'QTY' | 'GOODS_PRICE' | 'ITEM_AMT' | 'DISPATCH_QTY'> {
  detailCount: number;
  items: Ass16050ItemRow[];
}

/** 品項明細列 */
export interface Ass16050ItemRow {
  FASITEM_ID: number;
  QTY: number;
  GOODS_PRICE: number;
  ITEM_AMT: number;
  DISPATCH_QTY?: number | null;
}

/** 結案/發料 Request */
export interface Ass16050DispatchRequest {
  MTAPPLY_ID: string;
}

/** 結案/發料 Response Data */
export interface Ass16050DispatchData {
  MTAPPLY_ID: string;
}
