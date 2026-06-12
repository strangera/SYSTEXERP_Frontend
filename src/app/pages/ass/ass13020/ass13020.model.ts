/**
 * ASS13020 資產轉入（Excel 匯入）相關 model
 *
 * API 規格參考：
 * - POST /ASS0000/ASS1000/checkImportASS13020 (檢查 Excel)
 * - POST /ASS0000/ASS1000/importASS13020 (正式匯入)
 *
 * FormData 共同欄位（依 Swagger / multipart/form-data）：
 *   - File：上傳 Excel 檔（必填）
 *   - STO_NO：分店編號（待後端開欄位）
 *   - 工作表名稱：待後端開欄位
 */

/**
 * 檢查 Excel 匯入 Response Data（checkImportASS13020）
 */
export interface CheckImportASS13020ResponseData {
  /** 結果代碼（0 = 成功 / 非 0 = 失敗） */
  ResultCode: number;
  /** 結果訊息（檢查通過 / 錯誤明細） */
  Message: string | null;
}

/**
 * 正式匯入 Excel Response Data（importASS13020）
 */
export interface ImportASS13020ResponseData {
  /** 結果代碼（0 = 成功 / 非 0 = 失敗） */
  ResultCode: number;
  /** 結果訊息 */
  Message: string | null;
  /** 成功筆數 */
  SuccessCount: number;
  /** 失敗筆數 */
  FailCount: number;
}
