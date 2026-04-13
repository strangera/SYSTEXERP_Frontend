import { BaseQueryRequest } from '@shared/models/api/base-api.interface';

/**
 * ASS15070 財產進貨清單 - 查詢 Request
 */
export interface QueryASS15070Request extends BaseQueryRequest {
  STO_NO?: string | null;
  CHECK_DATE_S?: string | null;
  CHECK_DATE_E?: string | null;
  SUBPOENA_ID?: string | null;
  SUPPLIER_ID?: string | null;
  EMP_ID?: string | null;
}

/**
 * ASS15070 財產進貨清單 - 單筆列
 */
export interface QueryASS15070Row {
  SUBPOENA_ID?: string | null;
  CHECK_DATE?: string | null;
  EMP_ID?: string | null;
  user_Name?: string | null;
  SUPPLIER_ID?: string | null;
  VEN_Name?: string | null;
  NOTES?: string | null;
}

/** app-table-report 分頁／排序傳入 body（含小寫 pageSize/pageIndex） */
export type QueryASS15070QueryBody = QueryASS15070Request & {
  pageSize?: number;
  pageIndex?: number;
};
