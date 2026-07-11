/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

type DateLike = Date | string | null | undefined;

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
export function toLocalIsoString(d: DateLike): string | null {
  if (d === null || d === undefined || d === '') return null;
  const date = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(date.getTime())) return null;
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString();
}

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * 將日期轉成 "YYYY-MM-DDTHH:mm:ss" 格式（無時區），直接用本地年月日組合，
 * 避免 toISOString/UTC 偏移造成時間跑掉。
 * endOfDay=true 時時間為 23:59:59，用於查詢結束日。
 */
export function toLocalDateTimeString(d: DateLike, endOfDay = false): string | null {
  if (d === null || d === undefined || d === '') return null;
  const date = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(date.getTime())) return null;
  const datePart = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  return endOfDay ? `${datePart}T23:59:59` : `${datePart}T00:00:00`;
}

/** 同 toLocalDateTimeString，時間固定為 23:59:59，用於日期範圍查詢的結束日 */
export function toLocalIsoStringEndOfDay(d: DateLike): string | null {
  return toLocalDateTimeString(d, true);
}
