import { BaseQueryRequest } from '@shared/models/api/base-api.interface';

/** 查詢部門預算審核 Request */
export interface QueryFIN41060Request extends BaseQueryRequest {
  /** 部門代號 */
  Org_ID?: string | null;
  /** 版本 */
  Budget_Version?: string | null;
  /** 年度 */
  Budget_Year?: string | null;
  /** 審核狀態 Y/N */
  Audit_Status?: string | null;
}

/** 查詢結果行資料（部門預算審核） */
export interface FIN41060QueryRow {
  RowNo: number;
  Org_ID: string;
  Org_Name: string;
  Budget_Year: string;
  Budget_Version: string;
  Audit_Status_NM: string;
}

/** 審核/反審核部門預算 Request */
export interface UpdateFIN41060Request {
  /** 部門代號 */
  Org_ID: string;
  /** 年度 */
  Budget_Year: string;
  /** 版本 */
  Budget_Version: string;
  /** 動作: 'Y'=審核, 'N'=反審核 */
  Action: 'Y' | 'N';
}

/** 審核/反審核 API 回傳的 Data */
export interface FIN41060UpdateData {
  ErrCode: number;
  ErrMsg: string;
}
