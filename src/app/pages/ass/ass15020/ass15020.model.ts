import { ApiRequest } from '@shared/utils/rxjs-operators/validate-api-response';
/**
 * ASS15020 財產保管清冊 - 資料模型
 */
/** 查詢條件 request */
export interface ASS15020QueryRequest extends ApiRequest {
  STO_NO?: string | null;
  HOLD_ORG_ID?: string | null;
  USE_ORG_ID?: string | null;
  USE_EMP_ID?: string | null;
  ASSET_ID?: string | null;
  GOODS_ID?: string | null;
  DEPRE_YN?: string | null;
  ASSET_STATUS?: string | null;
  GET_DATE_S?: string | null;
  GET_DATE_E?: string | null;
  GROUP?: string | null;
}

/** 查詢結果單筆 */
export interface ASS15020QueryRow {
  RowNum?: number | null;
  ASSET_ID?: string | null;
  GOODS_ID?: string | null;
  GOODS_NAME?: string | null;
  EQUIP_ID?: string | null;
  GET_DATE?: string | null;
  ASSET_STATUS?: string | null;
  ASSET_STATUS_NAME?: string | null;
  HOLD_ORG_NAME?: string | null;
  HOLD_ORG_ID?: string | null;
  HOLD_EMP_NAME?: string | null;
  HOLD_EMP_ID?: string | null;
  USE_ORG_NAME?: string | null;
  USE_ORG_ID?: string | null;
  USE_EMP_NAME?: string | null;
  USE_EMP_ID?: string | null;
  FIR_GET_COST?: number | null;
  CHANGE_COST?: number | null;
  TOTAL_COST?: number | null;
  NOTES?: string | null;
  PURCHASE_NOTES?: string | null;
  GroupKey?: string | null;
  GroupName?: string | null;
  ID?: number | string | null;
  [key: string]: unknown;
}

/** 後端回傳 Data 包裝 */
export interface ASS15020QueryDataWrapper {
  Details?: ASS15020QueryRow[];
  TotalRows?: number;
  TotalPages?: number;
}
