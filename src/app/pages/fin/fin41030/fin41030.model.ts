import { BaseQueryRequest } from '@shared/models/api/base-api.interface';

/** 查詢年度預算審核 Request */
export interface QueryFIN41030Request extends BaseQueryRequest {
  /** 預算年度 */
  BudgetYear?: string | null;
  /** 預算版本 */
  BudgetVersion?: string | null;
  /** 預算審核狀態 */
  BudgetStatus?: string | null;
}

/** 查詢結果行資料（年度預算審核） */
export interface FIN41030QueryRow {
  RowNo: number;
  BudgetYear: string;
  BudgetVersion: string;
  BudgetStatus: string;
  ID: number;
  MID: number;
  BudgetYYMM: string;
  CreateDate: string;
  CreateUserNo: string;
  CreateUserName: string;
  UpdateDate: string;
  UpdateUserNo: string;
  UpdateUserName: string;
}

/** 審核/反審核年度預算 Request */
export interface ApproveFIN41030Request {
  /** 審核動作：'A'=審核, 'U'=反審核 */
  Action: 'A' | 'U';
  /** 主檔流水號 */
  MID: number;
  /** 預算年度 */
  BudgetYear: string;
  /** 預算版本 */
  BudgetVersion: string;
}

/** 審核/反審核年度預算 API 回傳的 Data */
export interface FIN41030ApproveData {
  ResultCode: number;
  ResultMessage: string;
  AffectedRows: number;
}
