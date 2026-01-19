/**
 * ASS11010 大分類維護作業 - 資料模型
 */
export interface ASS11010Data {
  RowNum?: number;     // 列序號
  CLASS_ID: string;    // 大分類代碼
  CLASS_NAME: string;  // 大分類名稱
}

/**
 * ASS11010 查詢請求參數
 */
export interface ASS11010QueryRequest {
  CLASS_ID?: string;   // 大分類代碼
  Keyword?: string;    // 大分類名稱關鍵字
}

/**
 * ASS11010 新增請求參數
 */
export interface ASS11010InsertRequest {
  CLASS_ID: string;    // 大分類代碼
  CLASS_NAME: string;  // 大分類名稱
}

/**
 * ASS11010 更新請求參數
 */
export interface ASS11010UpdateRequest {
  OLD_CLASS_ID: string;    // 原大分類代碼
  NEW_CLASS_ID: string;    // 新大分類代碼
  NEW_CLASS_NAME: string;  // 新大分類名稱
}

/**
 * ASS11010 更新結果
 */
export interface ASS11010UpdateResult {
  IsUpdateSuccess: boolean;
  ErrorMsg: string;
}
