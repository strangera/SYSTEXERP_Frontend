/**
 * ASS11020 中分類維護作業 - 資料模型
 */
export interface ASS11020Data {
  RowNum?: number;        // 列序號
  M_CLASS_ID: string;     // 中分類代碼
  M_CLASS_NAME: string;   // 中分類名稱
  B_CLASS_ID: string;     // 大分類代碼
  B_CLASS_NAME?: string;  // 大分類名稱
  NOTES?: string;         // 說明
}

/**
 * ASS11020 查詢請求參數
 */
export interface ASS11020QueryRequest {
  M_CLASS_ID?: string;     // 中分類代碼
  M_CLASS_NAME?: string;   // 中分類名稱
  B_CLASS_ID?: string;     // 大分類代碼
  B_CLASS_NAME?: string;   // 大分類名稱
  NOTES_KEYWORD?: string;  // 說明關鍵字
}

/**
 * ASS11020 新增請求參數
 */
export interface ASS11020InsertRequest {
  CLASS_ID: string;      // 中分類代碼
  CLASS_NAME: string;    // 中分類名稱
  B_CLASS_ID: string;    // 大分類代碼
  NOTES?: string;        // 說明
}

/**
 * ASS11020 更新請求參數
 */
export interface ASS11020UpdateRequest {
  OLD_B_CLASS_ID: string;  // 原大分類代碼
  OLD_CLASS_ID: string;    // 原中分類代碼
  NEW_B_CLASS_ID: string;  // 新大分類代碼
  NEW_CLASS_ID: string;    // 新中分類代碼
  NEW_CLASS_NAME: string;  // 新中分類名稱
  NEW_NOTES?: string;      // 新說明
}
