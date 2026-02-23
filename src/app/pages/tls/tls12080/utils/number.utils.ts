/**
 * TLS12080-v2 數值工具函數
 */

/**
 * 解析數值，返回 number 或 undefined
 */
export function parseNumber(value: any): number | undefined {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }

  const num = typeof value === 'string' ? parseFloat(value) : Number(value);
  return isNaN(num) ? undefined : num;
}

/**
 * 解析數值，返回 number 或預設值
 */
export function parseNumberWithDefault(value: any, defaultValue: number): number {
  const num = parseNumber(value);
  return num !== undefined ? num : defaultValue;
}

/**
 * 格式化數值為千分位顯示
 */
export function formatThousands(value: number | string | null | undefined): string {
  const num = parseNumber(value);
  if (num === undefined) return '';

  return num.toLocaleString('zh-TW');
}

/**
 * 格式化百分比顯示
 */
export function formatPercent(value: number | string | null | undefined, decimals: number = 2): string {
  const num = parseNumber(value);
  if (num === undefined) return '';

  return `${num.toFixed(decimals)}%`;
}

/**
 * 格式化金額顯示（含貨幣符號）
 */
export function formatCurrency(value: number | string | null | undefined): string {
  const num = parseNumber(value);
  if (num === undefined) return '';

  return `$${num.toLocaleString('zh-TW')}`;
}

/**
 * 四捨五入到指定小數位
 */
export function roundTo(value: number, decimals: number = 0): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * 確保數值在範圍內
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * 檢查是否為有效的正數
 */
export function isPositiveNumber(value: any): boolean {
  const num = parseNumber(value);
  return num !== undefined && num > 0;
}

/**
 * 檢查是否為有效的非負數
 */
export function isNonNegativeNumber(value: any): boolean {
  const num = parseNumber(value);
  return num !== undefined && num >= 0;
}

/**
 * 計算總金額
 */
export function calculateTotal(items: any[], field: string): number {
  return items.reduce((sum, item) => {
    const value = parseNumber(item[field]);
    return sum + (value || 0);
  }, 0);
}

/**
 * 深複製物件
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item)) as unknown as T;
  }

  return Object.keys(obj).reduce((result, key) => {
    (result as any)[key] = deepClone((obj as any)[key]);
    return result;
  }, {} as T);
}

/**
 * 檢查 ID 是否有效
 */
export function hasValidId(id: any): boolean {
  if (id === null || id === undefined) return false;
  if (typeof id === 'number') return id > 0;
  if (typeof id === 'string') return id.trim() !== '' && id !== '0';
  return false;
}
