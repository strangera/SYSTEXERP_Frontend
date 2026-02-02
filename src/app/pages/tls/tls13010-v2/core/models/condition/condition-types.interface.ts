/**
 * 條件項目狀態
 */
export type ConditionItemStatus = 'original' | 'new' | 'modified' | 'deleted';

/**
 * 條件項目基礎介面
 */
export interface BaseConditionItem {
  id?: number | string;
  talent_id: string;
  _status?: ConditionItemStatus;
  _isNew?: boolean;
  _fromNext2?: boolean;
  _readonly?: boolean;
}

/**
 * 固定租金條件 (抽成別 = 1)
 */
export interface FixedRentCondition extends BaseConditionItem {
  tlt_id: string;
  cag_bdate: string;
  cag_edate: string;
  base_rent: number;
}

/**
 * 底租抽成取高者條件 (抽成別 = 2)
 */
export interface BaseRentHigherCondition extends BaseConditionItem {
  tlt_id: string;
  cag_bdate: string;
  cag_edate: string;
  base_rent: number;
  cag_charge_rate?: number;
}

/**
 * 一般抽成條件 (抽成別 = 3)
 */
export interface GeneralCommissionCondition extends BaseConditionItem {
  tlt_id: string;
  tlt_id_desc: string;
  cag_taxtype: string;
  cag_bdate: string;
  cag_edate: string;
  cag_barcode?: string;
  cag_charge_rate?: number;
}

/**
 * 包底抽成條件 (抽成別 = 4)
 */
export interface BaseCommissionCondition extends BaseConditionItem {
  tlt_id: string;
  cag_bdate: string;
  cag_edate: string;
  limit_amt: number;
  limit_charge_rate: number;
}

/**
 * 層級抽成條件 (抽成別 = 5)
 */
export interface GraduatedCommissionCondition extends BaseConditionItem {
  seq_no: number;
  cag_bdate: string;
  cag_edate: string;
  start_number: number;
  end_number: number;
  charge_rate: number;
}

/**
 * 包底加層級條件 (抽成別 = 6)
 */
export interface BaseTierCondition extends BaseConditionItem {
  seq_no: number;
  tlt_id: string;
  cag_bdate: string;
  cag_edate: string;
  limit_amt: number;
  start_number: number;
  end_number: number;
  charge_rate: number;
}

/**
 * 條件項目聯合類型
 */
export type ConditionItem =
  | FixedRentCondition
  | BaseRentHigherCondition
  | GeneralCommissionCondition
  | BaseCommissionCondition
  | GraduatedCommissionCondition
  | BaseTierCondition;

/**
 * 條件項目分類結果
 */
export interface CategorizedConditions {
  fixedRent: FixedRentCondition[];
  baseRentHigher: BaseRentHigherCondition[];
  generalCommission: GeneralCommissionCondition[];
  baseCommission: BaseCommissionCondition[];
  graduated: GraduatedCommissionCondition[];
  baseTier: BaseTierCondition[];
}

/**
 * 條件驗證結果
 */
export interface ConditionValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * 條件項目統計
 */
export interface ConditionItemCounts {
  total: number;
  display: number;
  new: number;
  modified: number;
  deleted: number;
  original: number;
}

/**
 * 清理後的固定租金/底租抽成條件 (用於提交)
 */
export interface CleanRentCondition {
  id?: number;
  talent_id: string;
  tlt_id: string;
  cag_bdate: string;
  cag_edate: string;
  base_rent: number;
  cag_charge_rate?: number;
}

/**
 * 清理後的包底抽成條件 (用於提交)
 */
export interface CleanLimitCondition {
  id?: number;
  talent_id: string;
  tlt_id: string;
  cag_bdate: string;
  cag_edate: string;
  limit_amt: number;
  limit_charge_rate: number;
}

/**
 * 清理後的層級/包底加層級條件 (用於提交)
 */
export interface CleanLevelCondition {
  id?: number;
  talent_id: string;
  seq_no: number;
  cag_bdate: string;
  cag_edate: string;
  limit_amt?: number;
  start_number: number;
  end_number: number;
  charge_rate: number;
}

/**
 * 清理後的條件操作集合
 */
export interface CleanConditionOperations<T = unknown> {
  toInsert: T[];
  toUpdate: T[];
  toDelete: T[];
}

/**
 * 清理後的條件資料集合
 */
export interface CleanConditions {
  fixedRents: CleanConditionOperations<CleanRentCondition>;
  baseRentHigher: CleanConditionOperations<CleanRentCondition>;
  baseCommissions: CleanConditionOperations<CleanLimitCondition>;
  graduated: CleanConditionOperations<CleanLevelCondition>;
  baseTier: CleanConditionOperations<CleanLevelCondition>;
}
