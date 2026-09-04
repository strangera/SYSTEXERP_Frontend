import { ApiRequest } from '@shared/utils/rxjs-operators/validate-api-response';
/**
 * ASS13040 批次報廢作業 - 查詢條件
 */
export interface ASS13040QueryRequest extends ApiRequest {
  DAMAGEM_ID?: string | null;
  ASSET_ID?: string | null;
  EMP_ID?: string | null;
  ORG_ID?: string;
  APPLY_DATE_S?: string;
  APPLY_DATE_E?: string;
  DAMAGEM_STATUS?: string | null;
}

/**
 * ASS13040 批次報廢作業 - 查詢結果列（對應 QueryASS13040Response）
 */
export interface ASS13040QueryRow {
  FAASSABANM_ID?: number;
  FAASSET_ID?: number;
  DAMAGEM_ID?: string | null;
  ASSET_ID?: string | null;
  GOODS_NAME?: string | null;
  CHECK_STATUS?: string | null;
  EMP_ID?: string | null;
  EMP_NAME?: string | null;
  ORG_ID?: string | null;
  ORG_NAME?: string | null;
  APPLY_DATE?: string | null;
  DAMAGEM_STATUS?: string | null;
  DAMAGEM_STATUS_NAME?: string | null;
  NOTES?: string | null;
}

export interface ASS13040QueryDataWrapper {
  QueryData?: ASS13040QueryRow[];
  TotalRows?: number;
  TotalCount?: number;
}
