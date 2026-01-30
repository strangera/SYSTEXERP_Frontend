/**
 * TLS12040-v2 日期工具函數
 */

/**
 * 格式化日期為 YYYY-MM-DD 格式
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '';

  if (typeof date === 'string') {
    // 如果已經是 YYYY-MM-DD 格式，直接返回
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }
    // 嘗試解析其他格式
    date = new Date(date);
  }

  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return '';
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * 格式化日期為 YYYYMM 格式（代扣款用）
 */
export function formatCompactDate(date: Date | string | null | undefined): string {
  if (!date) return '';

  if (typeof date === 'string') {
    // 如果已經是 YYYYMM 格式，直接返回
    if (/^\d{6}$/.test(date)) {
      return date;
    }
    // 嘗試解析其他格式
    date = new Date(date);
  }

  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return '';
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');

  return `${year}${month}`;
}

/**
 * 解析 YYYYMM 格式為 Date
 */
export function parseCompactDate(compact: string): Date | null {
  if (!compact || compact.length !== 6) {
    return null;
  }

  const year = parseInt(compact.substring(0, 4), 10);
  const month = parseInt(compact.substring(4, 6), 10) - 1;

  if (isNaN(year) || isNaN(month)) {
    return null;
  }

  return new Date(year, month, 1);
}

/**
 * 解析 YYYY-MM-DD 格式為 Date
 */
export function parseDate(dateStr: string): Date | null {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return null;
  }

  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * 取得今天的日期字串 (YYYY-MM-DD)
 */
export function getTodayString(): string {
  return formatDate(new Date());
}

/**
 * 比較兩個日期是否相同
 */
export function isSameDate(date1: Date | string, date2: Date | string): boolean {
  return formatDate(date1) === formatDate(date2);
}

/**
 * 日期加減月份
 */
export function addMonths(date: Date | string, months: number): Date {
  const d = typeof date === 'string' ? parseDate(date) : date;
  if (!d) return new Date();

  const result = new Date(d);
  result.setMonth(result.getMonth() + months);
  return result;
}

/**
 * 日期加減天數
 */
export function addDays(date: Date | string, days: number): Date {
  const d = typeof date === 'string' ? parseDate(date) : date;
  if (!d) return new Date();

  const result = new Date(d);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * 檢查日期是否有效
 */
export function isValidDate(date: Date | string | null | undefined): boolean {
  if (!date) return false;

  if (typeof date === 'string') {
    date = parseDate(date);
  }

  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * 將 Date 物件轉為 ISO 字串（用於 API 提交）
 */
export function toISODateString(date: Date | string | null | undefined): string {
  if (!date) return '';

  if (typeof date === 'string') {
    // 如果已經是 YYYY-MM-DD 格式
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }
    date = new Date(date);
  }

  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return '';
  }

  return date.toISOString().split('T')[0];
}
