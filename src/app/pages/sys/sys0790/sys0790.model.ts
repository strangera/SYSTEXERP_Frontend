// SYS0790 使用者作業按鈕歷程報表 資料模型
import { BaseQueryRequest } from '@shared/models/api/base-api.interface';

/* -------------------------------------------------------------------------- */
/* 查詢                                                                        */
/* -------------------------------------------------------------------------- */

/** SYS0790 查詢條件 */
export interface QuerySYS0790Request extends BaseQueryRequest {
  /** 使用者帳號 */
  UserNo?: string | null;
  /** LOG時間（起）— 格式 YYYY-MM-DD HH:mm:ss */
  LogTime_S?: string | null;
  /** LOG時間（迄）— 格式 YYYY-MM-DD HH:mm:ss */
  LogTime_E?: string | null;
  /** 作業代碼（多選）— 對應 SYS1000.SYS_Type='SYS_ID' */
  FunctionCodeList?: string[] | null;
}

/** SYS0790 查詢結果單筆 */
export interface SYS0790QueryData {
  /** SP 回傳序號 */
  ROWNO?: number;
  /** Log 主鍵 ID */
  ID?: number;
  /** Log 時間 */
  LogTime?: string;
  /** 使用者帳號 */
  UserNo?: string;
  /** 使用者名稱 */
  UserName?: string;
  /** 作業代碼 */
  FunctionCode?: string;
  /** 作業名稱 */
  FunctionName?: string;
  /** 按鈕名稱 */
  ButtonName?: string;
  /** 連結位置 */
  LinkUrl?: string;
  /** 總筆數（SP 逐列回傳） */
  TotalCount?: number;
  /** 總頁數（SP 逐列回傳） */
  TotalPage?: number;
}

/**
 * SYS0790 查詢 API 原始回傳（`ApiResponse.Data` 內層）。
 * 後端將清單包在 `QueryData`，service 會攤平成 `ApiResponse<SYS0790QueryData[]>`。
 */
export interface SYS0790QueryResponse {
  QueryData: SYS0790QueryData[];
  TotalCount?: number;
  TotalPage?: number;
}

/* -------------------------------------------------------------------------- */
/* 新增（按鈕觸發後寫入 LOG）                                                  */
/* -------------------------------------------------------------------------- */

/** SYS0790 新增 LOG Request */
export interface InsertSYS0790Request {
  /** 使用者帳號 */
  UserNo: string;
  /** 使用者名稱 */
  UserName: string;
  /** 功能代碼 */
  FunctionCode: string;
  /** 功能名稱 */
  FunctionName: string;
  /** 按鈕名稱 */
  ButtonName: string;
  /** 連結網址 */
  LinkUrl?: string;
}
