/**
 * 數字工具函數
 */

/**
 * 安全解析數字
 */
export function parseNumber(value: string | number | null | undefined): number | undefined {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }

  const num = Number(value);
  return isNaN(num) ? undefined : num;
}

/**
 * 安全解析整數
 */
export function parseInteger(value: string | number | null | undefined): number | undefined {
  const num = parseNumber(value);
  return num !== undefined ? Math.floor(num) : undefined;
}

/**
 * 將百分比轉換為小數比率
 * 例如: 5 → 0.05
 */
export function percentageToRate(percentage: number | null | undefined): number {
  if (percentage === null || percentage === undefined) return 0;
  return percentage / 100;
}

/**
 * 將小數比率轉換為百分比
 * 例如: 0.05 → 5
 */
export function rateToPercentage(rate: number | null | undefined): number {
  if (rate === null || rate === undefined) return 0;
  return rate * 100;
}

/**
 * 格式化金額 (加千分位)
 */
export function formatCurrency(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') return '0';

  const num = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(num) ? '0' : num.toLocaleString('zh-TW');
}

/**
 * 檢查是否為有效的正數 ID
 */
export function isValidId(id: string | number | null | undefined): boolean {
  if (id === null || id === undefined) return false;

  const strId = String(id);
  if (strId.startsWith('temp_') || strId.includes('new_')) return false;

  const numId = Number(id);
  return !isNaN(numId) && numId > 0;
}
