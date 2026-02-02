import { CleanDeductions } from '../deduction';
import { CleanCommissions } from '../commission';
import { CleanConditions } from '../condition';
import { CleanLocationInfo } from '../contract';

/**
 * 清理後的提交資料 (配合後端 CleanContractRequest)
 */
export interface CleanSubmitData {
  contractInfo: CleanContractInfo;
  deductions: CleanDeductions;
  commissions: CleanCommissions;
  conditions: CleanConditions;
  metadata: CleanMetadata;
  commissionTypeChange?: CommissionTypeChangeInfo | null;
}

/**
 * 清理後的合約資訊
 */
export interface CleanContractInfo {
  operation: 'INSERT' | 'UPDATE';
  data: CleanContractData;
}

/**
 * 清理後的合約資料
 */
export interface CleanContractData {
  // 基本資料
  talent_id: string;
  apply_no: string;
  tlt_no?: string;
  tlt_name: string;
  ven_uniform: string;
  ven_no: string;
  VEN_Name: string;
  VEN_Address?: string;
  contract_subno?: string;

  // 日期欄位
  tlt_bdate: string;
  tlt_edate: string;
  tlt_contract_bdate: string;
  tlt_contract_edate: string;
  feedback_date?: string | null;
  due_date?: string | null;
  contact_Date?: string | null;

  // 商務條件
  tlt_term_type: string;
  comm_comp_type: string;
  paper_type?: string;
  bus_type?: string;
  bus_class?: string;
  bus_sclass?: string;

  // 組織與聯絡
  org_id?: string;
  contact_USR_No?: string;
  contact_USR_Name?: string;

  // 狀態設定
  deco_type?: string;
  money_type?: string;
  check_typeList?: string[];
  edc_yn?: string;
  tlt_openflag?: string;
  comm_yn?: string;
  rece_yn?: string;
  pos_yn?: string;
  cash_yn?: string;
  store_way?: string;
  paytype?: string;
  vip_yn?: string;

  // 費用相關
  base_rent?: number;
  deposit?: number;
  credit_card?: number;
  check_day?: number;
  open_fees?: number;
  total_amt?: number;
  total_amt_vendor?: number;
  construct_deposit?: string;
  construct_fees?: number;
  expiration_deposit?: string;
  expiration_fees?: number;
  open_deposit?: string;

  // 其他設定
  invoice_type?: string;
  tlt_kind?: string;
  tlt_ctype_mtotal?: string;
  overall_status?: string;
  rent_ahead?: string;
  rent_period?: number;
  water_flag?: string;
  electric_flag?: string;
  gas_flag?: string;
  cap_saletype1?: string;
  cap_saletype2?: string;
  cap_saletype3?: string;
  cap_saletype4?: string;
  cap_saletype5?: string;

  // 聯絡資訊
  email?: string;
  invoice_email?: string;
  CHECK_TITLE?: string;
  store_tel?: string;
  bank_id?: string;
  vendor_acct_name?: string;
  vendor_acct_no?: string;
  contact_tel?: string;
  contact_fax?: string;
  contact_addr?: string;
  company_addr?: string;
  tlt_remark?: string;
  ticket_remarks?: string;
  total_amt_unit?: string;
  total_amt_vendor_unit?: string;

  approve_status: string;

  // 位置資訊
  locationInfo: CleanLocationInfo[];
}

/**
 * 清理後的元數據
 */
export interface CleanMetadata {
  talentId: string;
  contractId: string;
  commissionType: string;
  isNewContract: boolean;
  submittedAt: string;
  totalOperations: number;
}

/**
 * 抽成別變更資訊
 */
export interface CommissionTypeChangeInfo {
  HasChanged: boolean;
  OriginalTermType: string;
  NewTermType: string;
  ClearOperations: DataClearOperations;
}

/**
 * 資料清除操作
 */
export interface DataClearOperations {
  clearRentDetails: boolean;
  clearCommissionMasters: boolean;
  clearChargedDetails: boolean;
  clearLimitDetails: boolean;
  clearLevelDetails: boolean;
}
