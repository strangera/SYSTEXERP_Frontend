/**
 * ASS11030 小分類維護作業 - 資料模型
 */
export interface ASS11030Data {
  RowNum?: number;        // 列序號
  S_CLASS_ID: string;     // 小分類代碼
  S_CLASS_NAME: string;   // 小分類名稱
  M_CLASS_ID: string;     // 中分類代碼
  M_CLASS_NAME?: string;  // 中分類名稱
  B_CLASS_ID: string;     // 大分類代碼
  B_CLASS_NAME?: string;  // 大分類名稱
  NOTES?: string;         // 說明
}

/**
 * ASS11030 查詢請求參數
 */
export interface ASS11030QueryRequest {
  S_CLASS_ID?: string;    // 小分類代碼
  S_CLASS_NAME?: string;  // 小分類名稱
  M_CLASS_ID?: string;    // 中分類代碼
  M_CLASS_NAME?: string;  // 中分類名稱
  B_CLASS_ID?: string;    // 大分類代碼
  B_CLASS_NAME?: string;  // 大分類名稱
  NOTES_KEYWORD?: string; // 說明關鍵字
}

/**
 * ASS11030 新增請求參數
 */
export interface ASS11030InsertRequest {
  B_CLASS_ID: string;     // 大分類代碼
  M_CLASS_ID: string;     // 中分類代碼
  CLASS_ID: string;       // 小分類代碼
  CLASS_NAME: string;     // 小分類名稱
  NOTES?: string;         // 說明
}

/**
 * ASS11030 更新請求參數
 */
export interface ASS11030UpdateRequest {
  OLD_B_CLASS_ID: string;   // 原大分類代碼
  OLD_M_CLASS_ID: string;   // 原中分類代碼
  OLD_CLASS_ID: string;     // 原小分類代碼
  NEW_B_CLASS_ID: string;   // 新大分類代碼
  NEW_M_CLASS_ID: string;   // 新中分類代碼
  NEW_CLASS_ID: string;     // 新小分類代碼
  NEW_CLASS_NAME: string;   // 新小分類名稱
  NEW_NOTES?: string;       // 新說明
}

/**
 * ASS11030 更新結果
 */
export interface ASS11030UpdateResult {
  IsUpdateSuccess: boolean;
  ErrorMsg: string;
}
