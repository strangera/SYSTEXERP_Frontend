/**
 * ASS15010 財產標籤列印
 * 與 Swagger QueryASS15010Request / QueryASS15010Response 一致
 * （查詢 API 不含分頁欄位）
 */
export interface QueryASS15010ApiRequest {
  /** 分店編號 */
  STO_NO?: string | null;

  /** 財產類型（1:資產, 2:列管品） */
  DEPRE_YN?: string | null;

  /** 大分類 */
  B_CLASS_ID?: string | null;

  /** 中分類 */
  M_CLASS_ID?: string | null;

  /** 小分類 */
  S_CLASS_ID?: string | null;

  /** 品項編號 */
  GOODS_ID?: string | null;

  /** 財產編號起 */
  ASSET_ID_START?: string | null;

  /** 財產編號迄 */
  ASSET_ID_END?: string | null;

  /** 保管人 */
  HOLD_EMP_ID?: string | null;

  /** 保管單位 */
  HOLD_ORG_ID?: string | null;

  /** 取得(入帳)日期起 */
  GET_DATE_START?: string | null;

  /** 取得(入帳)日期迄 */
  GET_DATE_END?: string | null;

  /**
   * 勾選後要列印的財產編號清單
   * 查詢時可不帶，匯出 PDF 時帶入
   */
  ASSET_ID_LIST?: string[];
}

/**
 * 查詢結果列（Swagger QueryASS15010Response）
 */
export interface QueryASS15010Response {
  CompName?: string | null;

  /** 保管單位名稱 */
  Org_Name?: string | null;

  /** 財產編號 */
  ASSET_ID?: string | null;

  /** 財產名稱 */
  GOODS_NAME?: string | null;

  /** 保管人 */
  user_Name?: string | null;

  /** 地點 */
  LOCATION_ID?: string | null;

  /** 取得日期 */
  GET_DATE?: string | null;

  Warranty_YEAR?: number | null;

  /** 表格列唯一鍵，前端使用 */
  ROW_UID?: string;

  /** Checkbox 是否勾選，前端使用 */
  SELECTED?: boolean;
}