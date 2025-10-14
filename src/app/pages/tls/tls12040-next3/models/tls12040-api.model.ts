export interface ChargeDetailApiItem {
  id: number;
  apply_no: number;
  tlt_id: string;
  cag_barcode: string;
  tlt_bdate: string;
  tlt_edate: string;
  cag_charge_rate: number;
  barcode_desc?: string;
}

export interface RentSettingApiData {
  CommissionMasters?: CommissionMasterApiItem[];
  ChargedDetails?: ChargeDetailApiItem[];
  RentDetails?: RentDetailApiItem[];
  LimitDetails?: LimitDetailApiItem[];
  LevelDetails?: LevelDetailApiItem[];
  BottomTierDetails?: BottomTierDetailApiItem[];
}

export interface CommissionMasterApiItem {
  id: number;
  apply_no: number;
  tlt_id: string;
  tlt_id_desc: string;
  cag_bdate: string;
  cag_edate: string;
  cag_taxtype: string;
  sst_amount: number | null;
  sst_rate: number | null;
  cap_saletype1: string | null;
  cap_saletype2: string | null;
  cap_saletype5: string | null;
  cag_remark: string | null;
}

export interface RentDetailApiItem {
  id: number;
  apply_no: number;
  tlt_id: string;
  cag_bdate: string;
  cag_edate: string;
  base_rent: number;
}

export interface LimitDetailApiItem {
  id: number;
  apply_no: number;
  tlt_id: string;
  cag_bdate: string;
  cag_edate: string;
  limit_amt: number;
  limit_charge_rate: number;
}

export interface LevelDetailApiItem {
  id: number;
  apply_no: number;
  seq_no: number;
  cag_bdate: string;
  cag_edate: string;
  limit_amt?: number;
  start_number: number;
  end_number: number;
  charge_rate: number;
}

export interface BottomTierDetailApiItem {
  id: number;
  apply_no: number;
  seq_no: number;
  cag_bdate: string;
  cag_edate: string;
  limit_amt: number;
  start_number: number;
  end_number: number;
  charge_rate: number;
}
