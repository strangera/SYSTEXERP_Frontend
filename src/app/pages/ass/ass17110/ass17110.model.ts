import { BaseQueryRequest } from '@shared/models/api/base-api.interface';

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
export interface QueryASS17110Request extends BaseQueryRequest {
  /** 統計年月 yyyyMM (必填) */
  DATE_YM: string;
  /** 品項編號 (非必填) */
  GOODS_ID?: string | null;
  /** 會計科目代碼 (非必填) */
  ACC_NO?: string | null;
}

/**
 * 匯出耗材進耗存之會計科目報表 (PDF / Excel) 請求
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
 * 註：SP_ASS17110Query 之回傳欄位需待後端 swagger 發佈後對齊
 * 欄位命名沿用「進耗存」報表慣例，量／成本成對；
 * 若實際欄位名稱與此不同，請更新 ass17110.component.ts columns 對應 field。
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
  OPEN_AMT?: number | null;
  /** 本期進貨 - 數量 */
  IN_QTY?: number | null;
  /** 本期進貨 - 成本 */
  IN_AMT?: number | null;
  /** 本期領用 - 數量 */
  ISSUE_QTY?: number | null;
  /** 本期領用 - 成本 */
  ISSUE_AMT?: number | null;
  /** 領用單位 */
  ISSUE_ORG_NAME?: string | null;
  /** 領用會計科目 */
  ISSUE_ACC_NAME?: string | null;
  /** 本期退料 - 數量 */
  RETURN_QTY?: number | null;
  /** 本期退料 - 成本 */
  RETURN_AMT?: number | null;
  /** 盤點調整 - 數量 */
  ADJUST_QTY?: number | null;
  /** 盤點調整 - 成本 */
  ADJUST_AMT?: number | null;
  /** 本期調撥 - 數量 */
  TRANSFER_QTY?: number | null;
  /** 本期調撥 - 成本 */
  TRANSFER_AMT?: number | null;
  /** 本期報廢 - 數量 */
  DAMAGE_QTY?: number | null;
  /** 本期報廢 - 成本 */
  DAMAGE_AMT?: number | null;
  /** 期末庫存 - 數量 */
  CLOSE_QTY?: number | null;
  /** 期末庫存 - 成本 */
  CLOSE_AMT?: number | null;
}
