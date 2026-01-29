/**
 * TLS12040-v2 條件設定項目介面
 * 對應現有 tls12040-next3/models/tls12040-next3.model.ts
 */

import { DataStatus } from '../../constants/workflow-step.enum';

/**
 * 基礎條件介面
 */
interface BaseCondition {
  /** ID */
  id?: number | string;
  /** 專櫃招募編號 */
  apply_no?: string;
  /** 合約編號 */
  talent_id?: string;
  /** 抽成類型 */
  condition_type?: string;
  /** 資料狀態 */
  _status?: DataStatus;
}

/**
 * 固定租金條件 (tlt_term_type = '1')
 */
export interface FixedRentCondition extends BaseCondition {
  /** 開始日期 */
  cag_bdate?: string;
  /** 結束日期 */
  cag_edate?: string;
  /** 租金 */
  base_rent?: number;
}

/**
 * 底租抽成取高者條件 (tlt_term_type = '2')
 */
export interface BaseRentHigherCondition extends BaseCondition {
  /** 開始日期 */
  cag_bdate?: string;
  /** 結束日期 */
  cag_edate?: string;
  /** 底租金額 */
  base_rent?: number;
  /** 抽成率 */
  cag_charge_rate?: number;
}

/**
 * 包底抽成條件 (tlt_term_type = '4')
 */
export interface BaseCommissionCondition extends BaseCondition {
  /** 開始日期 */
  cag_bdate?: string;
  /** 結束日期 */
  cag_edate?: string;
  /** 包底金額 */
  limit_amt?: number;
  /** 包底抽成率 */
  limit_charge_rate?: number;
}

/**
 * 層級抽成條件 (tlt_term_type = '5')
 */
export interface GraduatedCommissionCondition extends BaseCondition {
  /** 開始日期 */
  cag_bdate?: string;
  /** 結束日期 */
  cag_edate?: string;
  /** 序號 */
  seq_no?: number;
  /** 業績起值 */
  start_number?: number;
  /** 業績迄值 */
  end_number?: number;
  /** 抽成率 */
  charge_rate?: number;
}

/**
 * 包底加層級條件 (tlt_term_type = '6')
 */
export interface BaseTierCondition extends BaseCondition {
  /** 開始日期 */
  cag_bdate?: string;
  /** 結束日期 */
  cag_edate?: string;
  /** 包底金額 */
  limit_amt?: number;
  /** 序號 */
  seq_no?: number;
  /** 業績起值 */
  start_number?: number;
  /** 業績迄值 */
  end_number?: number;
  /** 抽成率 */
  charge_rate?: number;
}

/**
 * 條件項目聯合類型
 */
export type ConditionItem =
  | FixedRentCondition
  | BaseRentHigherCondition
  | BaseCommissionCondition
  | GraduatedCommissionCondition
  | BaseTierCondition;

/**
 * 條件資料結構
 */
export interface ConditionData {
  /** 固定租金條件 */
  fixedRentItems?: FixedRentCondition[];
  /** 底租抽成取高者條件 */
  baseRentHigherItems?: BaseRentHigherCondition[];
  /** 包底抽成條件 */
  baseCommissionItems?: BaseCommissionCondition[];
  /** 層級抽成條件 */
  graduatedItems?: GraduatedCommissionCondition[];
  /** 包底加層級條件 */
  baseTierItems?: BaseTierCondition[];
}

/**
 * API 查詢回應格式
 */
export interface ConditionQueryResponse {
  ExistingData: ConditionItem[];
  CommissionType: string;
}

/**
 * 條件表格配置
 */
export interface ConditionTableConfig {
  commissionType: string;
  title: string;
  dataProperty: keyof ConditionData;
  columns: ConditionColumn[];
}

/**
 * 條件表格欄位定義
 */
export interface ConditionColumn {
  field: string;
  header: string;
  type: 'text' | 'number' | 'date' | 'percent';
  width?: string;
  editable?: boolean;
  required?: boolean;
}
