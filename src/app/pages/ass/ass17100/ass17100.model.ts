/**
 * ASS17100 耗材進耗存報表 — API 型別（Swagger QueryASS17100Request / QueryASS17100Response）
 */
export interface QueryASS17100Request {
  /** 分店 */
  STO_NO?: string | null;
  /** 統計起日 */
  DATE_S?: string | null;
  /** 統計迄日 */
  DATE_E?: string | null;
  /** 倉別 */
  WH_ID?: string | null;
  /** 倉別名稱 */
  WH_NAME?: string | null;
  /** 品項編號 */
  GOODS_ID?: string | null;
}

/** 查詢結果列 */
export interface QueryASS17100Response {
  /** 列識別（前端附加，供表格 dataKey） */
  ROW_UID?: string;
  /** 序號 */
  SEQ_NO?: number | null;
  /** 品項編號 */
  GOODS_ID?: string | null;
  /** 品項名稱 */
  GOODS_NAME?: string | null;
  /** 日期 */
  TRANS_DATE?: string | null;
  /** 期初 */
  OPEN_QTY?: number | null;
  /** 進貨 */
  IN_QTY?: number | null;
  /** 領用 */
  ISSUE_QTY?: number | null;
  /** 退料 */
  RETURN_QTY?: number | null;
  /** 調整 */
  ADJUST_QTY?: number | null;
  /** 調撥 */
  TRANSFER_QTY?: number | null;
  /** 報廢 */
  DAMAGE_QTY?: number | null;
  /** 期末 */
  CLOSE_QTY?: number | null;
}
