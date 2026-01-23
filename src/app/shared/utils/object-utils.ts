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
