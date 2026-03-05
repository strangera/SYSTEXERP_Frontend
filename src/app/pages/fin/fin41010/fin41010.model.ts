
/** 匯出年度預算請求 */
export interface ExportYearBudgetFIN41010Request {
  /** 年度 */
  BudgetYear: string;
  /** 版本 */
  BudgetVersion: string;
  /** 部門 */
  OrgId: string;
}

/** 匯入年度預算請求（表單/邏輯用；實際送 API 時以 FormData 搭配 File） */
export interface ImportYearBudgetFIN41010Request {
  /** 年度 */
  BudgetYear: string;
  /** 版本 */
  BudgetVersion: string;
  /** 部門 */
  OrgId: string;
}

/** 審核/反審核年度預算請求 */
export interface ApproveYearBudgetFIN41010Request {
  /** Action: 'A'=審核, 'U'=反審核 */
  Action: 'A' | 'U';
  /** 年度 */
  BudgetYear: string;
  /** 版本 */
  BudgetVersion: string;
  /** 部門 */
  OrgId: string;
}

/** 匯入 API 回傳的 Data */
export interface FIN41010ImportData {
  ReturnCode: number;
  ReturnMsg: string;
  InsertedRows: number;
  UpdatedRows: number;
  TotalUpsertRows: number;
}

/** 審核/反審核 API 回傳的 Data */
export interface FIN41010ApproveData {
  ReturnCode: number;
  ReturnMsg: string;
}
