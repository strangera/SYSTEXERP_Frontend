/**
 * 日期工具函數
 */

/**
 * 檢查日期是否有效
 */
export function isValidDate(date: Date | string | null | undefined): boolean {
  if (!date) return false;

  const d = date instanceof Date ? date : new Date(date);
  return !isNaN(d.getTime());
}

/**
 * 比較兩個日期是否相同 (只比較年月日)
 */
export function isSameDate(date1: Date | string, date2: Date | string): boolean {
  const d1 = date1 instanceof Date ? date1 : new Date(date1);
  const d2 = date2 instanceof Date ? date2 : new Date(date2);

  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
}

/**
 * 檢查日期範圍是否重疊
 */
export function hasDateOverlap(
  start1: Date | string,
  end1: Date | string,
  start2: Date | string,
  end2: Date | string
): boolean {
  const s1 = new Date(start1).getTime();
  const e1 = new Date(end1).getTime();
  const s2 = new Date(start2).getTime();
  const e2 = new Date(end2).getTime();

  return s1 <= e2 && e1 >= s2;
}

/**
 * 取得今天日期的 YYYY-MM-DD 格式
 */
export function getTodayString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 取得一年後的日期
 */
export function getOneYearLater(from?: Date): Date {
  const date = from ? new Date(from) : new Date();
  date.setFullYear(date.getFullYear() + 1);
  return date;
}
