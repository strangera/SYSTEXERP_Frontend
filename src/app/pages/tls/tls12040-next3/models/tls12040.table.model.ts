// 條件設定相關介面
export interface BaseConditionItem {
  id?: number | string;
  talent_id: string;
  _status?: 'original' | 'new' | 'modified' | 'deleted';
  _isNew?: boolean;
  _fromNext2?: boolean;
  _readonly?: boolean;
}

export interface FixedRentCondition extends BaseConditionItem {
  tlt_id: string;
  cag_bdate: string;
  cag_edate: string;
  base_rent: number;
}

export interface BaseRentHigherCondition extends BaseConditionItem {
  tlt_id: string;
  cag_bdate: string;
  cag_edate: string;
  base_rent: number;
  cag_charge_rate?: number;
}

export interface GeneralCommissionCondition extends BaseConditionItem {
  tlt_id: string;
  tlt_id_desc: string;
  cag_taxtype: string;
  cag_bdate: string;
  cag_edate: string;
  cag_barcode?: string;
  cag_charge_rate?: number;
}

export interface BaseCommissionCondition extends BaseConditionItem {
  tlt_id: string;
  cag_bdate: string;
  cag_edate: string;
  limit_amt: number;
  limit_charge_rate: number;
}

export interface GraduatedCommissionCondition extends BaseConditionItem {
  seq_no: number;
  cag_bdate: string;
  cag_edate: string;
  start_number: number;
  end_number: number;
  charge_rate: number;
}

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

export type ConditionItem =
  | FixedRentCondition
  | BaseRentHigherCondition
  | GeneralCommissionCondition
  | BaseCommissionCondition
  | GraduatedCommissionCondition
  | BaseTierCondition;
