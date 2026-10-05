/**
 * TLS12080-v2 代扣款項目介面
 * 對應現有 tls12080-next1/models/tls12080-next1.model.ts
 */

import { DataStatus } from '../../constants/workflow-step.enum';

/**
 * 扣款類型
 */
export type FareType = 'A' | 'B' | 'C' | 'D';

/**
 * 扣款類型名稱
 */
export const FARE_TYPE_NAMES: Record<FareType, string> = {
  A: '一次扣款',
  B: '每月扣款',
  C: '平均分攤',
  D: '比率分攤'
};

/**
 * 代扣款項目
 */
export interface FareItem {
  /** ID */
  id?: string | number;
  /** 專櫃招募編號 */
  apply_no?: string;
  /** 合約編號 */
  talent_id?: string;

  // === 扣款基本資訊 ===
  /** 扣款類型 (A/B/C/D/E) */
  cap_type: FareType;
  /** 扣款項目代碼 */
  cap_item: string;
  /** 扣款項目名稱 */
  cap_name: string;

  // === 扣款期間 ===
  /** 開始日期 (YYYYMM) */
  tpy_bdate?: string;
  /** 結束日期 (YYYYMM) */
  tpy_edate?: string;

  // === 金額相關 ===
  /** 扣款方式 */
  tpy_type?: string;
  /** 數量 */
  tpy_qty?: number;
  /** 單價 */
  tpy_unitamt?: number;
  /** 金額 */
  tpy_amount?: number;
  /** 總金額 */
  tpy_totalamt?: number;
  /** 比率 */
  tpy_rate?: number;

  // === C 類型專用 (平均分攤) ===
  /** 頭期款 */
  down_payment?: number;
  /** 期數 */
  period_nos?: number;

  // === D 類型專用 (比率分攤) ===
  /** 銷售類型 */
  cap_saletype?: string;
  /** 期數 */
  instms_type?: string;
  /** 收單行 */
  edc_bank?: string;
  /** 支付編號 */
  pay_no?: string;
  /** 券類計算方式 */
  calc_type?: string;
  /** 超過基準比率 */
  over_base_rate?: number;
  /** 加抽比率 */
  rent_plus_rate?: number;

  // === 設定欄位 ===
  /** 入帳日 */
  day_account?: string;
  /** 間隔 */
  interval?: number;
  /** GUI旗標 */
  gui_flag?: string;

  // === 狀態管理 ===
  /** 資料來源 (APS_AVAILABLE | CONTRACT_EXISTING) */
  data_source?: string;
  /** 是否選中 */
  is_selected?: boolean;
  /** 是否常用 */
  is_commonly_used?: string;
  /** 資料狀態 */
  _status?: DataStatus;
}

/**
 * 按類型分組的扣款資料
 */
export interface FaresByType {
  A: FareItem[];
  B: FareItem[];
  C: FareItem[];
  D: FareItem[];
}

/**
 * API 查詢回應格式
 */
export interface FareQueryResponse {
  FaresByType: FaresByType;
  AllAvailableCount: number;
  ContractExistingCount: number;
}
