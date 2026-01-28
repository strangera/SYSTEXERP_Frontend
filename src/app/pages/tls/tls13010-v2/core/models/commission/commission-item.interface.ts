/**
 * 抽成項目狀態
 */
export type CommissionItemStatus = 'original' | 'modified' | 'new' | 'deleted';

/**
 * 抽成主檔項目 (前端使用)
 */
export interface CommissionItem {
  id: number | string;
  tlt_id: string;
  tlt_id_desc: string;
  cag_taxtype: number | string;
  discountSummary: string;
  sst_amount: number;
  sst_rate: number;
  cap_saletype2: boolean | string;
  cap_saletype1: boolean | string;
  cap_saletype5: boolean | string;
  selectedSettingOption: string;
  discountSettingItems: DiscountSettingItem[];
  annualPerformanceItems: AnnualPerformanceItem[];
  discountLevelItems: DiscountLevelItem[];
  detailItems: unknown[];
  currentTab?: string;
  _status?: CommissionItemStatus;
  mainStartDate?: Date | string;
  mainEndDate?: Date | string;
  remark?: string;
  _hasError?: boolean;
  _hasValidationError?: boolean;
  // 額外欄位 (用於表單綁定)
  charge_rate?: number;
  cag_bdate?: Date | string;
  cag_edate?: Date | string;
  cag_remark?: string;
}

/**
 * 折扣設定項目
 */
export interface DiscountSettingItem {
  id?: number | string;
  selected: boolean;
  cag_barcode: string;
  tlt_bdate: Date | string;
  tlt_edate: Date | string;
  cag_charge_rate?: number;
  discount_rate?: number;
  _status?: CommissionItemStatus;
  _source?: 'api' | 'new';
  is_configured: boolean;
  is_enabled: boolean;
  _hasError?: boolean;
  _hasValidationError?: boolean;
  _hasDateOverlapError?: boolean;
}

/**
 * 年度業績項目
 */
export interface AnnualPerformanceItem {
  id?: number | string;
  selected: boolean;
  tlt_bdate: Date | string;
  tlt_edate: Date | string;
  year_amount: number;
  extra_rate: number;
  _status?: CommissionItemStatus;
  _hasError?: boolean;
  _hasValidationError?: boolean;
  _hasDateOverlapError?: boolean;
}

/**
 * 折扣層級項目
 */
export interface DiscountLevelItem {
  id?: number | string;
  charged_id?: number | string;
  seq_no?: number;  // 序號，後端更新時需要此欄位
  selected: boolean;
  cag_barcode: string;
  level_bmount: number;
  level_eamount: number;
  level_charge_rate: number;
  _status?: CommissionItemStatus;
  _source?: 'api' | 'new';
  contract_period?: string;
  tlt_bdate?: Date | string;
  tlt_edate?: Date | string;
  is_configured: boolean;
  is_enabled: boolean;
  _hasError?: boolean;
  _hasValidationError?: boolean;
  _canDelete?: boolean;  // 是否可刪除（每個折扣至少保留一個層級）
}

/**
 * 清理後的抽成主檔
 */
export interface CleanCommissionMaster {
  id?: number;
  tlt_id: string;
  tlt_id_desc: string;
  cag_taxtype: string;
  sst_amount?: number;
  sst_rate?: number;
  cap_saletype1?: string;
  cap_saletype2?: string;
  cap_saletype5?: string;
  cag_bdate: string;
  cag_edate: string;
}

/**
 * 清理後的抽成主檔操作集合
 */
export interface CleanCommissionMasters {
  toInsert: CleanCommissionMaster[];
  toUpdate: CleanCommissionMaster[];
  toDelete: CleanCommissionMaster[];
}

/**
 * 清理後的抽成明細操作集合
 */
export interface CleanCommissionDetails {
  toInsert: unknown[];
  toUpdate: unknown[];
  toDelete: unknown[];
}

/**
 * 清理後的抽成資料集合
 */
export interface CleanCommissions {
  masters: CleanCommissionMasters;
  discountSettings: CleanCommissionDetails;
  annualSettings: CleanCommissionDetails;
  levelSettings: CleanCommissionDetails;
}
