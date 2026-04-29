import { BaseQueryRequest } from '@shared/models/api/base-api.interface';

/** queryFIN73030 / 匯出 共用的篩選欄位（不含分頁） */
export interface FIN73030FilterBody {
  SYS_StoreNo: string | null;
  PCS_RqstNo?: string | null;
  PCS_RqstDate_S?: string | null;
  PCS_RqstDate_E?: string | null;
  PCS_Status?: string | null;
}

/** 查詢請求（含 table-report 分頁排序） */
export interface FIN73030Query extends FIN73030FilterBody, BaseQueryRequest {
  pageIndex?: number;
  pageSize?: number;
  SortBy?: Array<{ field: string; order: number }>;
}

/** Swagger QueryFIN73030SPResponse 單筆 */
export interface QueryFIN73030SPResponse {
  SYS_StoreNo?: string | null;
  Keep_UsrNo?: string | null;
  Keep_UsrName?: string | null;
  PCS_RqstNo?: string | null;
  PCS_RqstDate?: string | null;
  PCS_Status?: string | null;
  StatusDate?: string | null;
  StatusUsrNo?: string | null;
  StatusUsrName?: string | null;
  PCS_ItemDesc?: string | null;
  PCS_TotAmt?: number | null;
  PCS_TotNet?: number | null;
  PCS_TotTax?: number | null;
  PCS_TotAmtDisplay?: number | null;
  PCS_TotAmt_Chinese?: string | null;
}

/** 收合列一筆（後端若給明細陣列可改為多筆） */
export interface FIN73030ExpansionLine {
  PCS_ItemDesc: string;
  unit: string;
  quantity: number | null;
  unitPrice: number | null;
  PCS_TotAmt: number | null;
}

/** 表格列（主表 + 收合資料） */
export interface FIN73030TableRow extends QueryFIN73030SPResponse {
  rowKey: string;
  expansionLines: FIN73030ExpansionLine[];
}

export interface FIN73030Option {
  label: string;
  value: string;
}
