/**
 * 「顯示狀態」（預售 PreSale／消費人數 ConsumerNum）欄位可見度共用邏輯。
 *
 * 背景：tls31010/tls31080/tls31090/tls32010/tls32020/tls32030 等營業報表查詢頁，
 * 都有「預售」「消費人數」兩個勾選開關，勾選變化時要同步切換 columns 裡對應欄位的 visible。
 * 各作業的 ConsumerNum/ConsumerOrder 兩個欄位名稱固定一致，但「預售」對應的欄位名稱各作業不同
 * （PrePerformance / PreOrderAmt / BasePreOrderAmt...），故用 preSaleField 參數化，不強制改欄位命名。
 *
 * 使用方式（沿用各頁面原本的 setColumns() 呼叫時機，不需改變呼叫時機本身）：
 * ```ts
 * setColumns() {
 *   this.columns = applyDisplayStatusVisibility(this.columns, {
 *     preSale: this.queryForm.get('PreSale')?.value === true,
 *     consumerNum: this.queryForm.get('ConsumerNum')?.value === true,
 *     preSaleField: 'PreOrderAmt', // 欄位名稱跟 PrePerformance 不同的作業才需要帶
 *   });
 * }
 * ```
 */
export interface DisplayStatusVisibilityOptions {
  preSale: boolean;
  consumerNum: boolean;
  /** PreSale 開關對應的欄位名稱，預設 'PrePerformance'（多數作業用這個名字，少數作業如
   *  tls32010 用 'PreOrderAmt'、tls32020 用 'BasePreOrderAmt'，呼叫時才需要覆蓋）。
   *  少數有基準/比較/差異/成長率四組欄位都要跟著同一個開關切換的作業（如 tls32030），可傳陣列一次涵蓋多個欄位名稱。 */
  preSaleField?: string | string[];
  /** ConsumerNum 開關對應的欄位名稱清單，預設 ['ConsumerNum', 'ConsumerOrder']（目前所有作業都一致）。 */
  consumerNumFields?: string[];
  /** 欄位不在上述兩組對應表內、且欄位本身沒帶 visible 時的預設值。
   *  預設不指定（維持原本 `col.visible` 的值，即多數作業原本的行為）；
   *  tls31010 原本額外 fallback 成 true，改用該作業時傳 `fallbackWhenUnset: true` 以維持既有行為。 */
  fallbackWhenUnset?: boolean;
}

export function applyDisplayStatusVisibility<T extends { field: string; visible?: boolean }>(
  columns: T[],
  options: DisplayStatusVisibilityOptions,
): T[] {
  const preSaleFields = options.preSaleField
    ? (Array.isArray(options.preSaleField) ? options.preSaleField : [options.preSaleField])
    : ['PrePerformance'];
  const consumerNumFields = options.consumerNumFields ?? ['ConsumerNum', 'ConsumerOrder'];

  const visibleMap: Record<string, boolean> = {};
  for (const field of preSaleFields) visibleMap[field] = options.preSale;
  for (const field of consumerNumFields) visibleMap[field] = options.consumerNum;

  return columns.map(col => ({
    ...col,
    visible: visibleMap[col.field] ?? col.visible ?? options.fallbackWhenUnset,
  }));
}
