import { BaseQueryRequest } from '@shared/models/api/base-api.interface';

/**
 * ASS15050 折舊攤提表 — API 型別（Swagger QueryASS15050Request / QueryASS15050Response）
 */
export interface QueryASS15050Request extends BaseQueryRequest {
  /** 會計科目(A.STYPE_D)，NULL = 全部 */
  STYPE_D?: string | null;
  /** 折舊年限起，例如 202002 */
  DEPRE_YM_S?: number | null;
  /** 折舊年限訖，例如 202603 */
  DEPRE_YM_E?: number | null;
  /** 報表形式：1=合併、2=展開 */
  ReportType?: string | null;
  /** true=顯示折舊金額為 0；false=不顯示 */
  ShowZero?: boolean | null;
}

/** 查詢結果列（Swagger QueryASS15050Response） */
export interface QueryASS15050Response {
  /** 前端列鍵 */
  ROW_UID?: string;
  /** 序號 */
  ROWNO?: number | null;
  /** 會計科目 / 小計 / 總合計 */
  ACCNO?: string | null;
  /** 科目名稱 */
  ACCNO_NAME?: string | null;
  /** 資產編號（僅展開模式） */
  ASSET_ID?: string | null;
  GET_DATE?: string | null;
  GOODS_ID?: string | null;
  GOODS_NAME?: string | null;
  EXP_YEAR?: number | null;
  /** 每月折舊金額 */
  PERIOD_DEPRE_AMOUNT?: number | null;
  /** 累計折舊金額（展開模式為主） */
  TOTAL_DEPRE_AMOUNT?: number | null;
  /** 畫面用：合併／展開顯示之折舊金額 */
  ACCUM_DEPRE_AMOUNT?: number | null;
}

/** Swagger Data 本體（巢狀） */
export interface QueryASS15050Result {
  Details?: QueryASS15050Response[] | null;
  TotalRows?: number | null;
  TotalPages?: number | null;
}

/** 查詢 API 回應（Data 為巢狀 Result） */
export interface QueryASS15050ApiResponse {
  Status: string;
  Data: QueryASS15050Result | null;
  Message: string;
  TotalCount: number;
  TotalPage: number;
}
