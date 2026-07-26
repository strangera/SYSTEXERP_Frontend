
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

/** 匯入單筆資料錯誤明細 */
export interface FIN41010ImportRowError {
  /** Excel 實際行號 */
  RowNumber: number;
  /** 該行會科代號 */
  AccNo: string | null;
  /** 錯誤原因 */
  Reason: string;
}

/** 匯入 API 回傳的 Data */
export interface FIN41010ImportData {
  ReturnCode: number;
  ReturnMsg: string;
  InsertedRows: number;
  UpdatedRows: number;
  TotalUpsertRows: number;
  /** 匯入錯誤明細，成功時為 null */
  Errors: FIN41010ImportRowError[] | null;
  /** 錯誤檢查檔相對路徑(在原始檔案標示錯誤列)，成功時為 null */
  ErrorFilePath: string | null;
}

/** 審核/反審核 API 回傳的 Data */
export interface FIN41010ApproveData {
  ReturnCode: number;
  ReturnMsg: string;
}
