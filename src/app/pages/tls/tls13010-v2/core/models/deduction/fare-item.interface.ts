/**
 * 代扣款項目狀態
 */
export type FareItemStatus = 'new' | 'modified' | 'deleted' | 'original';

/**
 * 代扣款項目 (前端使用)
 * 包含索引簽章以支援動態屬性存取
 */
export interface FareItem {
  id?: string | number;
  serialNumber?: number;
  talent_id: string;
  cap_type: string;
  cap_item: string;
  cap_name: string;
  tpy_bdate?: string;
  tpy_edate?: string;
  tpy_type?: string;
  tpy_qty?: number;
  tpy_unitamt?: number;
  tpy_amount?: number | null;
  tpy_totalamt?: number | null;
  day_account?: string;
  interval?: number | null;
  down_payment?: number | null;
  period_nos?: number | null;
  cap_saletype?: string;
  edc_bank?: string;
  instms_type?: string;
  pay_no?: string;
  gui_flag?: string;
  tpy_rate?: number;
  org_id?: string;
  is_commonly_used?: string;
  cap_tax_type?: string;
  acc_no?: string;
  data_source: string;
  is_selected: boolean;
  is_new_item: boolean;
  calc_type?: string;
  rent_plus_rate?: number;
  over_base_rate?: number;
  _status?: FareItemStatus;
  _originalSelected?: boolean;
  _originalData?: Partial<FareItem>;
  level_id?: string;
  is_first_level?: boolean;
  // 索引簽章 - 支援動態屬性存取
  [key: string]: unknown;
}

/**
 * 清理後的代扣款項目 (提交用)
 */
export interface CleanFareItem {
  id?: number;
  cap_type: string;
  cap_item: string;
  tpy_bdate?: string;
  tpy_edate?: string;
  tpy_type?: string;
  tpy_qty?: number;
  tpy_unitamt?: number;
  tpy_amount?: number;
  tpy_totalamt?: number;
  gui_flag?: string;
  org_id?: string;
  day_account?: string;
  interval?: number;
  down_payment?: number;
  period_nos?: number;
  tpy_rate?: number;
  calc_type?: string;
  rent_plus_rate?: number;
  over_base_rate?: number;
  edc_bank?: string;
  pay_no?: string;
  cap_saletype?: string;
  instms_type?: string;
}

/**
 * 清理後的代扣款操作集合
 */
export interface CleanDeductions {
  toInsert: CleanFareItem[];
  toUpdate: CleanFareItem[];
  toDelete: CleanFareItem[];
}
