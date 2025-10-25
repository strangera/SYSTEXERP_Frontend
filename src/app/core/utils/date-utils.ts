/**
 * 日期工具類 - 避免時區問題
 */
export class DateUtils {
  /**
   * 將任何日期格式轉換為 YYYY-MM-DD 字串
   * 這是唯一應該被使用的日期格式化方法
   */
  static toDateString(date: any): string {
    if (!date) return '';

    // 已經是正確格式，直接返回
    if (typeof date === 'string') {
      const dateOnlyRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (dateOnlyRegex.test(date)) {
        return date;
      }

      // ISO 格式，取日期部分
      if (date.includes('T')) {
        return date.split('T')[0];
      }

      // 其他分隔符號 (/, -)
      const cleaned = date.replace(/\//g, '-');
      if (dateOnlyRegex.test(cleaned)) {
        return cleaned;
      }
    }

    // Date 物件，使用本地時間格式化（避免時區轉換）
    if (date instanceof Date && !isNaN(date.getTime())) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    // 最後嘗試解析
    try {
      const parsed = new Date(date);
      if (!isNaN(parsed.getTime())) {
        const year = parsed.getFullYear();
        const month = String(parsed.getMonth() + 1).padStart(2, '0');
        const day = String(parsed.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
    } catch (e) {
      console.error('日期轉換失敗:', date, e);
    }

    return '';
  }

  /**
   * 檢查日期字串是否有效
   */
  static isValidDateString(dateString: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return false;
    const date = new Date(dateString + 'T00:00:00');
    return !isNaN(date.getTime());
  }

  /**
   * 比較兩個日期字串
   * @returns -1 if date1 < date2, 0 if equal, 1 if date1 > date2
   */
  static compareDates(date1: string, date2: string): number {
    return date1.localeCompare(date2);
  }

  /**
   * 格式化為顯示用的日期 (YYYY/MM/DD)
   */
  static formatForDisplay(dateString: string): string {
    if (!dateString) return '';
    const normalized = this.toDateString(dateString);
    return normalized.replace(/-/g, '/');
  }
}
