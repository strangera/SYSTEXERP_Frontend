import { BaseQueryRequest } from '@shared/models/api/base-api.interface';

/**
 * ASS13040 批次報廢作業 - 查詢條件
 */
export interface ASS13040QueryRequest extends BaseQueryRequest {
  SCRAP_FORM_NO?: string;
  ITEM_NO?: string;
  SCRAP_USER_NO?: string;
  ORG_ID?: string;
  APPLY_DATE_S?: string;
  APPLY_DATE_E?: string;
  SCRAP_STATUS?: string;
}

/**
 * ASS13040 批次報廢作業 - 查詢結果列
 */
export interface ASS13040QueryRow {
  SCRAP_FORM_NO: string;
  ITEM_NO: string;
  SCRAP_USER_NO: string;
  ORG_ID: string;
  APPLY_DATE: string;
  SCRAP_STATUS: string;
  REMARK?: string;
}

export interface ASS13040QueryDataWrapper {
  QueryData?: ASS13040QueryRow[];
  TotalRows?: number;
  TotalCount?: number;
}
