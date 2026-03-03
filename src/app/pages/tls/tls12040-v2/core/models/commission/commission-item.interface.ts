/**
 * TLS12040-v2 抽成設定項目介面
 * 對應現有 tls12040-next2/models/tls12040-next2.model.ts
 */

import { DataStatus } from '../../constants/workflow-step.enum';

/**
 * 抽成主檔
 */
export interface CommissionMaster {
  /** ID */
  id?: number | string;
  /** 專櫃招募編號 */
  apply_no?: string;
  /** 合約編號 */
  talent_id?: string;
  /** 抽成分類代碼 */
  tlt_id: string;
  /** 抽成分類說明 */
  tlt_id_desc?: string;
  /** 開始日期 (YYYY-MM-DD) */
  cag_bdate?: string;
  /** 結束日期 (YYYY-MM-DD) */
  cag_edate?: string;
  /** 稅別 (0:不課稅 1:課稅) */
  cag_taxtype?: string;
  /** 固定金額 */
  sst_amount?: number;
  /** 固定比率 */
  sst_rate?: number;
  /** 滿仟送佰 (Y/N) */
  cap_saletype1?: string;
  /** 會員卡集點 (Y/N) */
  cap_saletype2?: string;
  /** 收取禮劵 (Y/N) */
  cap_saletype3?: string;
  /** (Y/N) */
  cap_saletype5?: string;
  /** 備註 */
  cag_remark?: string;
  /** 資料狀態 */
  _status?: DataStatus;
  /** 是否展開 */
  _isExpanded?: boolean;
}

/**
 * 折扣設定明細
 */
export interface ChargeDetail {
  /** ID */
  id?: number | string;
  /** 專櫃招募編號 */
  apply_no?: string;
  /** 抽成分類代碼 */
  tlt_id?: string;
  /** 折扣別代碼 */
  cag_barcode: string;
  /** 折扣別說明 */
  barcode_desc?: string;
  /** 開始日期 */
  tlt_bdate?: string | Date;
  /** 結束日期 */
  tlt_edate?: string | Date;
  /** 抽成比率 */
  cag_charge_rate?: number;
  /** 是否已設定 */
  is_configured?: boolean;
  /** 是否啟用 */
  is_enabled?: boolean;
  /** 是否勾選 (UI 用) */
  is_selected?: boolean;
  /** 資料狀態 */
  _status?: DataStatus;
}

/**
 * 年度業績抽成明細
 */
export interface YearChargeDetail {
  /** ID */
  id?: number | string;
  /** 專櫃招募編號 */
  apply_no?: string;
  /** 抽成分類代碼 */
  tlt_id?: string;
  /** 開始日期 */
  tlt_bdate?: string;
  /** 結束日期 */
  tlt_edate?: string;
  /** 年度業績目標 */
  year_amount?: number;
  /** 額外抽成比率 */
  extra_rate?: number;
  /** 資料狀態 */
  _status?: DataStatus;
}

/**
 * 層級抽成明細
 */
export interface LevelChargeDetail {
  /** ID */
  id?: number | string;
  /** 抽成主檔 ID */
  charged_id?: number | string;
  /** 專櫃招募編號 */
  apply_no?: string;
  /** 抽成分類代碼 */
  tlt_id?: string;
  /** 序號 */
  seq_no?: number;
  /** 折扣別代碼 */
  cag_barcode?: string;
  /** 折扣別說明 */
  barcode_desc?: string;
  /** 金額範圍下限 */
  level_bmount?: number;
  /** 金額範圍上限 */
  level_eamount?: number;
  /** 抽成比率 */
  level_charge_rate?: number;
  /** 是否已設定 */
  is_configured?: boolean;
  /** 是否啟用 */
  is_enabled?: boolean;
  /** 是否勾選 (UI 用) */
  is_selected?: boolean;
  /** 資料狀態 */
  _status?: DataStatus;
}

/**
 * 抽成設定完整項目 (主檔 + 明細)
 */
export interface CommissionItem extends CommissionMaster {
  /** 折扣設定明細 */
  ChargeDetails?: ChargeDetail[];
  /** 年度業績抽成明細 */
  YearChargeDetails?: YearChargeDetail[];
  /** 層級抽成明細 */
  LevelChargeDetails?: LevelChargeDetail[];
}

/**
 * API 查詢回應格式
 */
export interface CommissionQueryResponse {
  ChargeSettings: CommissionItem[];
  TotalCount: number;
}
