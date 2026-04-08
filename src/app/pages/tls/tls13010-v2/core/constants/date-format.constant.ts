/**
 * 日期格式常數
 * 統一管理前後端日期格式
 */
export const DATE_FORMATS = {
  /** 後端標準格式 YYYY-MM-DD */
  BACKEND: 'YYYY-MM-DD',
  /** 代扣款緊湊格式 YYYYMM (只有年月) */
  COMPACT: 'YYYYMM',
  /** 前端顯示格式 */
  DISPLAY: 'YYYY/MM/DD',
  /** 前端顯示格式含時間 */
  DISPLAY_DATETIME: 'YYYY/MM/DD HH:mm',
  /** ISO 8601 格式 */
  ISO: 'YYYY-MM-DDTHH:mm:ss'
} as const;

export type DateFormatType = typeof DATE_FORMATS[keyof typeof DATE_FORMATS];
