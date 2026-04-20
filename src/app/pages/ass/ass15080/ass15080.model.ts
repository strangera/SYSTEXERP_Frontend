/**
 * ASS15080 資產重估查詢 - 資料模型
 */
import { BaseQueryRequest } from '@shared/models/api/base-api.interface';

/** 查詢條件 request */
export interface ASS15080QueryRequest extends BaseQueryRequest {
  STO_NO?: string | null;
  ACC_NO?: string | null;
  ORG_ID?: string | null;
  APP_DATE_S?: string | null;
  APP_DATE_E?: string | null;
  CHK_DATE_S?: string | null;
  CHK_DATE_E?: string | null;
  B_CLASS_ID?: string | null;
  M_CLASS_ID?: string | null;
  S_CLASS_ID?: string | null;
  GOODS_ID?: string | null;
  BASE_DATE?: string | null;
}

/** 查詢結果單筆 */
export interface ASS15080QueryRow {
  ASSET_ID?: string | null;
  GOODS_ID?: string | null;
  GOODS_NAME?: string | null;
  CRT_Date?: string | null;
  HOLD_ORG_ID?: string | null;
  Org_Name?: string | null;
  HOLD_EMP_ID?: string | null;
  user_Name?: string | null;
  UPD_GET_COST?: number | null;
  UPD_EXP_YEAR?: number | null;
  NOTES?: string | null;
  RowNum?: number | null;
  ID?: string | number | null;
  [key: string]: unknown;
}

/** 後端 Data 包裝 */
export interface ASS15080QueryDataWrapper {
  QueryData?: ASS15080QueryRow[];
  TotalRows?: number;
  TotalPages?: number;
}
