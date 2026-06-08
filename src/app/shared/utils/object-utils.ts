/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

/**
 * 移除物件中的空值（null, undefined, 空字串）
 */
export function removeEmptyValues<T extends Record<string, any>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) =>
      value !== null && value !== undefined && value !== ''
    )
  ) as Partial<T>;
}

/**
 * 將 Date 轉成 ISO 字串，但保留「本地時區的牆鐘時間」，避免 `toISOString()` 在
 * 非 UTC 時區把 local-midnight 拉到前一天（例：Asia/Taipei 2026-06-01 00:00
 * 直接 toISOString 會變成 2025-05-31T16:00:00.000Z）。
 *
 * 用法限於只關心日期（年月日）的欄位；後端讀為 UTC 後解析出的日期會與使用者
 * 在畫面上看到的一致。
 */
export function toLocalIsoString(d: Date | string | null | undefined): string | null {
  if (d === null || d === undefined || d === '') return null;
  const date = d instanceof Date ? d : new Date(d);
  if (isNaN(date.getTime())) return null;
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString();
}
