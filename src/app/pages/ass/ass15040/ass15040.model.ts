import { BaseQueryRequest } from '@shared/models/api/base-api.interface';

/**
 * QueryASS15040Request
 * 查詢財產目錄之會計科目報表 - 查詢條件
 */
export interface QueryASS15040Request extends BaseQueryRequest {
  /** 基準年月 (必填，格式：yyyyMM) */
  BaseYM: string;
  /** 會計科目代碼 */
  STYPE_ID?: string | null;
  /** 保管單位代碼 */
  HOLD_ORG_ID?: string | null;
  /** 品項編號 */
  GOODS_ID?: string | null;
}

/**
 * 匯出財產目錄之會計科目報表（PDF / Excel）
 */
export interface PrintASS15040Request {
  /** 基準年月 (必填，格式：yyyyMM) */
  BaseYM: string;
  /** 會計科目代碼 */
  STYPE_ID?: string | null;
  /** 保管單位代碼 */
  HOLD_ORG_ID?: string | null;
  /** 品項編號 */
  GOODS_ID?: string | null;
}

/**
 * QueryASS15040Response
 * 查詢財產目錄之會計科目報表 - 明細列
 */
export interface QueryASS15040Response {
  /** 會計科目代碼 */
  STYPE_ID?: string | null;
  /** 會計科目名稱 */
  STYPE_NAME?: string | null;
  /** 資產編號 */
  ASSET_ID?: string | null;
  /** 品項編號 */
  GOODS_ID?: string | null;
  /** 品項名稱 */
  GOODS_NAME?: string | null;
  /** 保管單位代碼 */
  HOLD_ORG_ID?: string | null;
  /** 保管單位名稱 */
  HOLD_ORG_NAME?: string | null;
  /** 取得日期 */
  GET_DATE?: string | null;
  /** 備註 */
  NOTES?: string | null;
  /** 耐用年數 */
  EXP_YEAR?: number | null;
  /** 取得成本（原始成本＋評估追加） */
  GET_COST?: number | null;
  /** 殘值 */
  RESI_VALUE?: number | null;
  /** 年初累計折舊 */
  YEAR_BEGIN_DEPREAMT?: number | null;
  /** 前期折舊（最早期間～基準月前一個月） */
  PREV_DEPREAMT?: number | null;
  /** 本期折舊 */
  YEAR_DEPREAMT?: number | null;
  /** 本月折舊 */
  MONTH_DEPREAMT?: number | null;
  /** 累計折舊 */
  ACCUMULATED_DEPREAMT?: number | null;
  /** 帳面價值（淨值） */
  AMT?: number | null;
  /** 明細＋小計列總筆數（供前端計算總頁數） */
  TOTAL_COUNT?: number | null;
}

/**
 * QueryASS15040Result
 * 查詢財產目錄之會計科目報表 - Data 結構
 */
export interface QueryASS15040Result {
  TotalCount?: number | null;
  TotalPage?: number | null;
  QueryData?: QueryASS15040Response[] | null;
}
