import { ApiRequest } from '@shared/utils/rxjs-operators/validate-api-response';
/**
 * QueryASS17110Request
 * 耗材進耗存之會計科目報表 - 查詢條件
 * 對應 SP：dbo.SP_ASS17110Query
 *
 * 規格欄位（SA 規格書 gid=1396854590）：
 *   @DATE_YM   統計年月        (必填，格式 yyyyMM 例：201901)
 *   @GOODS_ID  品項編號        (非必填，下拉 queryFASITEM_DropDownList MATERIAL_TYPE=3)
 *   @ACC_NO    會計科目代碼    (非必填，下拉 queryFASAccNoDropDownList)
 */
export interface QueryASS17110Request extends ApiRequest {
  /** 統計年月 yyyyMM (必填) */
  DATE_YM: string;
  /** 品項編號 (非必填) */
  GOODS_ID?: string | null;
  /** 會計科目代碼 (非必填) */
  ACC_NO?: string | null;
}

/**
 * 匯出耗材進耗存之會計科目報表 PDF 請求
 * 對應 endpoint：POST /ASS0000/ASS1000/exportPDFASS17110
 * （後端目前僅提供 PDF 匯出，無 Excel 匯出）
 */
export interface PrintASS17110Request {
  /** 統計年月 yyyyMM (必填) */
  DATE_YM: string;
  /** 品項編號 (非必填) */
  GOODS_ID?: string | null;
  /** 會計科目代碼 (非必填) */
  ACC_NO?: string | null;
}

/**
 * QueryASS17110Response
 * 耗材進耗存之會計科目報表 - 明細列
 *
 * 欄位對齊 swagger（POST /ASS0000/ASS1000/queryASS17110 → Data[]）。
 * 數量為 *_QTY、成本為 *_COST，成對出現。
 */
export interface QueryASS17110Response {
  /** 序號 */
  SEQ_NO?: number | null;
  /** 會計科目代碼 */
  ACC_NO?: string | null;
  /** 會計科目名稱 */
  ACC_NAME?: string | null;
  /** 品項編號 */
  GOODS_ID?: string | null;
  /** 品項名稱 */
  GOODS_NAME?: string | null;
  /** 期初庫存 - 數量 */
  OPEN_QTY?: number | null;
  /** 期初庫存 - 成本 */
  OPEN_COST?: number | null;
  /** 本期進貨 - 數量 */
  IN_QTY?: number | null;
  /** 本期進貨 - 成本 */
  IN_COST?: number | null;
  /** 本期領用 - 數量 */
  ISSUE_QTY?: number | null;
  /** 本期領用 - 成本 */
  ISSUE_COST?: number | null;
  /** 本期領用 - 領用單位代碼 */
  ISSUE_ORG_ID?: string | null;
  /** 本期領用 - 領用單位名稱 */
  ISSUE_ORGNAME?: string | null;
  /** 本期領用 - 領用會計科目代碼 */
  ISSUE_ACC_NO?: string | null;
  /** 本期領用 - 領用會計科目名稱 */
  ISSUE_ACC_NAME?: string | null;
  /** 本期退料 - 數量 */
  RETURN_QTY?: number | null;
  /** 本期退料 - 成本 */
  RETURN_COST?: number | null;
  /** 盤點調整 - 數量 */
  ADJUST_QTY?: number | null;
  /** 盤點調整 - 成本 */
  ADJUST_COST?: number | null;
  /** 本期調撥 - 數量 */
  TRANSFER_QTY?: number | null;
  /** 本期調撥 - 成本 */
  TRANSFER_COST?: number | null;
  /** 本期報廢 - 數量 */
  DAMAGE_QTY?: number | null;
  /** 本期報廢 - 成本 */
  DAMAGE_COST?: number | null;
  /** 期末庫存 - 數量 */
  CLOSE_QTY?: number | null;
  /** 期末庫存 - 成本 */
  CLOSE_COST?: number | null;
}
