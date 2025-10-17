export interface LocationDetails {
  id?: number | string;
  apply_no: string;
  location_no: string;
  tlt_building: string;
  tlt_floor: string;
  area_no: string;
  tlt_space: number;
  building_desc: string;
  floor_desc: string;
  area_desc: string;
  _status?: 'new' | 'modified' | 'deleted' | 'original';
  _isNew?: boolean;
  _isEmpty?: boolean
}

export interface TLS12040RequestModel {
  id: number | string | undefined | null;
  apply_no: string;
}

export interface Tls12040SelectorTableColumn {
  field: string;
  header: string;
  sortable?: boolean;
}


export interface TLS12040DetailModel {
  id?: string | null;
  // ========== 基本資訊 ==========
  talent_id: string;
  apply_no: string;     // 專櫃招募編號
  tlt_no?: string;      // 專櫃編號
  tlt_name: string;     // 櫃位名稱
  ven_uniform: string;  // 廠商編號
  ven_no: string;
  VEN_Name: string;
  contract_subno?: string;
  contract_no?: string;
  apply_type: string; // 申請案件內容
  apply_date: string; // 申請日期
  contract_type?: string; // 合約類型

  apply_status: string; // 申請案件狀態
  // ========== 日期欄位 ==========
  tlt_bdate: string;              // 契約起始日
  tlt_edate: string;              // 契約截止日
  tlt_contract_bdate: string;     // 營運起始日
  tlt_contract_edate: string;     // 營運截止日
  feedback_date?: string | null;  // 回函日期
  due_date?: string | null;       // 回函截止日
  contact_Date?: string | null;   // 洽談日期

  // ========== 分類與商務條件 ==========
  tlt_term_type: string;   // 抽成別
  comm_comp_type: string;  // 抽成計算方式
  paper_type?: string;     // 營業型態
  bus_type: string;       // 大分類代號
  bus_class: string; //中分類
  bus_sclass?: string; //小分類

  // ========== 組織與人員 ==========
  org_id?: string;          // 組織代碼
  contact_USR_No?: string;  // 洽談者代號
  contact_USR_Name?: string; // 洽談者姓名

  // ========== 其他條件 ==========
  deco_type?: string;             // 裝潢方式
  money_type?: string;            // 結帳方式
  check_typeList?: string[];      // 支票類型
  check_type?: string;      // 支票類型
  edc_yn?: string;                // 是否支援EDC
  tlt_openflag?: string;          // 營運狀況
  comm_yn?: string;
  rece_yn?: string;               // 是否開立業主發票
  pos_yn?: string;                // 是否使用收銀機
  cash_yn?: string;               // 是否收現
  store_way?: string;             // 配合方式
  paytype?: string;               // 付款方式
  vip_yn?: string;

  // ========== 費用相關 ==========
  base_rent?: number;
  deposit?: number;
  credit_card?: number;
  check_day?: number;

  total_amt?: number;
  total_amt_vendor?: number;
  construct_deposit?: string;
  construct_fees?: number;
  expiration_deposit?: string;
  expiration_fees?: number;
  open_deposit?: string;
  open_fees?: number;

  // ========== 其他設定 ==========
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


  // ========== 聯絡資訊 ==========
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
  total_amt_unit?: string;        // 目標營業額單位(業主)
  total_amt_vendor_unit?: string; // 目標營業額單位(廠商)

  approve_status: string; // 合約狀態

  VEN_Address: string; //公司登記地址


  // ========== 位置資訊 ==========
  locationInfo: LocationDetails[];
}
