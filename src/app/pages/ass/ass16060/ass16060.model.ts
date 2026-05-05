import { BaseQueryRequest } from '@shared/models/api/base-api.interface';

/**
 * 領用退料查詢 — 請求參數（欄位名稱待後端定案時可再對齊）
 */
export interface ASS16060QueryRequest extends BaseQueryRequest {
  WH_ID?: string | null;
  RETURN_STATUS?: string | null;
  RETURN_NO?: string | null;
  RETURN_EMP_ID?: string | null;
  ORG_ID?: string | null;
  RETURN_DATE_S?: string | null;
  RETURN_DATE_E?: string | null;
}

/**
 * 領用退料查詢 — 列表列
 */
export interface ASS16060QueryRow {
  ID?: string | number | null;
  RETURN_NO?: string | null;
  RETURN_EMP_ID?: string | null;
  WH_NAME?: string | null;
  ORG_ID?: string | null;
  RETURN_DATE?: string | null;
  RETURN_STATUS_NAME?: string | null;
  DETAIL_COUNT?: number | string | null;
}
