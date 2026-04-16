import { BaseQueryRequest } from '@shared/models/api/base-api.interface';

/** queryASS17080 Request */
export interface QueryASS17080Request extends BaseQueryRequest {
  /** 商場代碼 */
  MID?: string | null;
  /** 分店代號 */
  STO_NO?: string | null;
  /** 查詢類型: 0=全部 / 1=低於安全庫存 */
  QUERY_TYPE?: number | null;
  /** 查詢日期 */
  STOCK_DATE?: string | null;
  /** 倉別 */
  WH_ID?: string | null;
  /** 大分類 */
  B_CLASS_ID?: string | null;
  /** 中分類 */
  M_CLASS_ID?: string | null;
  /** 小分類 */
  S_CLASS_ID?: string | null;
  /** 品項 */
  GOODS_ID?: string | null;
}

/** queryASS17080 後端回傳 Data 包裝 */
export interface QueryASS17080Response {
  /** 庫存數量(總計) */
  StocksQty?: number | null;
  /** 請購中數量(總計) */
  ProjectQty?: number | null;
  /** 驗收中數量(總計) */
  ExamineQty?: number | null;
  /** 安全庫存(總計) */
  SafeQty?: number | null;
  /** 月結單價(總計) */
  StocksAmt?: number | null;
  /** 庫存總金額(總計) */
  StocksTolAmt?: number | null;
  /** 明細 */
  Details?: QueryASS17080DetailRow[] | null;
  /** 總筆數 */
  TotalRows?: number | null;
  /** 總頁數 */
  TotalPages?: number | null;
}

/** Details[] 單筆明細 */
export interface QueryASS17080DetailRow {
  /** 列類別(D 明細 || S 小計) */
  RowType?: string | null;
  /** 列號 */
  RowNo?: number | null;
  /** 品項編號 */
  GoodsID?: string | null;
  /** 品項名稱 */
  GoodName?: string | null;
  /** 庫存數量 */
  StocksQty?: number | null;
  /** 請購中數量 */
  ProjectQty?: number | null;
  /** 驗收中數量 */
  ExamineQty?: number | null;
  /** 安全庫存 */
  SafeQty?: number | null;
  /** 月結單價 */
  StocksAmt?: number | null;
  /** 庫存總金額 */
  StocksTolAmt?: number | null;
  /** 表格 dataKey 用 */
  ID?: string;
}
