import { LocationItem } from './location-item.interface';

/**
 * 合約基本資料介面
 * 用於前端表單和狀態管理
 */
export interface ContractInfo {
  id?: string | number;
  talent_id: string;
  tlt_no: string;
  apply_no: string;
  tlt_name: string;
  vendor_ven_no: string;
  VEN_Name: string;
  VEN_Address?: string;
  contract_subno?: string;
  ven_uniform?: string;

  // 日期欄位
  tlt_contract_bdate?: string;
  tlt_contract_edate?: string;
  tlt_bdate?: string;
  tlt_edate?: string;
  feedback_date?: string;
  due_date?: string;
  contact_Date?: string;

  // 商務條件
  tlt_term_type?: string;
  comm_comp_type?: string;
  paper_type?: string;
  bus_type?: string;
  bus_class?: string;
  bus_sclass?: string;

  // 組織與聯絡
  org_id?: string;
  contact_USR_No?: string;
  contact_USR_Name?: string;

  // 狀態設定
  approve_status?: string;
  ven_no?: string;
  contract_no?: string;
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
  base_rent?: string;
  deposit?: string;
  credit_card?: string;
  check_day?: string;
  open_fees?: string;
  total_amt?: string;
  total_amt_vendor?: string;
  construct_deposit?: string;
  construct_fees?: string;
  expiration_deposit?: string;
  expiration_fees?: string;
  open_deposit?: string;

  // 其他設定
  invoice_type?: string;
  tlt_kind?: string;
  tlt_ctype_mtotal?: string;
  overall_status?: string;
  rent_ahead?: string;
  rent_period?: string;
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
  tlt_remark?: string;
  ticket_remarks?: string;
  total_amt_unit?: string;
  total_amt_vendor_unit?: string;

  // 位置資訊
  locationInfo?: LocationItem[];
  totalLocationSpace?: number;

  // 內部標記
  _isNewContract?: boolean;
}

/**
 * 合約查詢請求
 */
export interface ContractRequest {
  talent_id: string;
  apply_no: string;
  tlt_term_type?: string;
  tlt_name?: string;
  tlt_no?: string;
  _isNewContract?: boolean;
}

/**
 * 合約列表項目 (查詢結果)
 */
export interface ContractItem {
  talent_id: string;
  apply_no: string;
  tlt_no: string;
  tlt_name: string;
  ven_uniform: string;
  ven_no: string;
  VEN_Name: string;
  paper_type: string;
  contract_subno: string;
  feedback_date: string;
  due_date: string;
  tlt_bdate: string;
  tlt_edate: string;
  contact_Date: string;
  tlt_contract_bdate: string;
  tlt_contract_edate: string;
  bus_type: string;
  bus_class: string;
  bus_sclass: string;
  deco_type: string;
  money_type: string;
  check_type: string;
  tlt_term_type: string;
  comm_comp_type: string;
  comm_yn: string;
  store_way: string;
  rece_yn: string;
  pos_yn: string;
  cash_yn: string;
  tlt_openflag: string;
  org_id: string;
  rent_ahead: string;
  rent_period: string;
  base_rent: string;
  deposit: string;
  total_amt: string;
  total_amt_vendor: string;
  open_deposit: string;
  open_fees: string;
  construct_deposit: string;
  construct_fees: string;
  expiration_deposit: string;
  expiration_fees: string;
  check_day: string;
  tlt_kind: string;
  edc_yn: string;
  tlt_ctype_mtotal: string;
  overall_status: string;
  paytype: string;
  vip_yn: string;
  credit_card: string;
  invoice_type: string;
  water_flag: string;
  electric_flag: string;
  gas_flag: string;
  email: string;
  invoice_email: string;
  CHECK_TITLE: string;
  store_tel: string;
  bank_id: string;
  vendor_acct_name: string;
  vendor_acct_no: string;
  contact_tel: string;
  contact_fax: string;
  contact_addr: string;
  tlt_remark: string;
  ticket_remarks: string;
  source_type: string;
  rental_count: string;
  contract_type: string;
  total_amt_unit: string;
  total_amt_vendor_unit: string;
  approve_status: string;
  CanEdit?: boolean;
}
