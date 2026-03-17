import { BaseQueryRequest } from '@shared/models/api/base-api.interface';

/** 查詢預算審核 Request */
export interface QueryFIN41030Request extends BaseQueryRequest {
  /** 版本 */
  budget_version?: string | null;
  /** 年度 */
  budget_yy?: string | null;
  /** 審核狀態 Y=已審核 N=未審核 */
  budget_status?: string | null;
}

/** 查詢結果行資料 */
export interface FIN41030QueryRow {
  /** 年度 */
  budget_yy: string;
  /** 版本 */
  budget_version: string;
  /** 審核狀態 Y=已審核 N=未審核 */
  budget_status: string;
}

/** 審核/反審核 Request */
export interface ApproveFIN41030Request {
  /** Action: 'A'=審核, 'U'=反審核 */
  Action: 'A' | 'U';
  /** 年度 */
  budget_yy: string;
  /** 版本 */
  budget_version: string;
}

/** 審核/反審核 API 回傳的 Data */
export interface FIN41030ApproveData {
  ReturnCode: number;
  ReturnMsg: string;
}
