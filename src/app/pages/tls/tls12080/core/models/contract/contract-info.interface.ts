/**
 * TLS12080-v2 合約基本資料介面
 * 對應現有 tls12080-cru/models/tls12080-cru.model.ts
 */

import { LocationItem } from './location-item.interface';

/**
 * 合約基本資料
 */
export interface ContractInfo {
  // === 識別資訊 ===
  /** 專櫃招募編號 */
  apply_no?: string;
  /** 專櫃編號 */
  tlt_no?: string;
  /** 合約編號 */
  talent_id?: string;
  /** 版本編號 */
  contract_subno?: number;

  // === 廠商資訊 ===
  /** 廠商統編 */
  ven_uniform?: string;
  /** 廠商編號 */
  ven_no?: string;
  /** 廠商名稱 */
  VEN_Name?: string;
  /** 公司登記地址 */
  VEN_Address?: string;

  // === 專櫃資訊 ===
  /** 櫃位名稱 */
  tlt_name?: string;
  /** 專櫃簡稱 */
  tlt_shortname?: string;
  /** 專櫃電話號碼 */
  store_tel?: string;

  // === 申請資訊 ===
  /** 申請案件內容 (1:新約 2:續約) */
  apply_type?: string;
  /** 申請日期 */
  apply_date?: string;
  /** 申請案件狀態 */
  apply_status?: string;
  /** 合約類型 */
  contract_type?: string;

  // === 日期資訊 ===
  /** 契約起始日 */
  tlt_bdate?: string;
  /** 契約截止日 */
  tlt_edate?: string;
  /** 營運起始日 */
  tlt_contract_bdate?: string;
  /** 營運截止日 */
  tlt_contract_edate?: string;
  /** 回函日期 */
  feedback_date?: string;
  /** 回函截止日 */
  due_date?: string;
  /** 洽談日期 */
  contact_Date?: string;

  // === 分類資訊 ===
  /** 營業型態 */
  paper_type?: string;
  /** 組織代號 */
  org_id?: string;
  /** 大分類代號 */
  bus_type?: string;
  /** 中分類代號 */
  bus_class?: string;
  /** 小分類代號 */
  bus_sclass?: string;
  /** 櫃別 */
  tlt_kind?: string;

  // === 抽成相關 ===
  /** 抽成別 (1-6) */
  tlt_term_type?: string;
  /** 抽成額計算方式 (1:含稅 2:除稅) */
  comm_comp_type?: string;
  /** 是否為抽成 */
  comm_yn?: string;
  /** 包底類別 (1:年包 2:月包 0:區間包) */
  tlt_ctype_mtotal?: string;
  /** 超出部份處理方式 (1:全部 2:部份) */
  overall_status?: string;

  // === 營運設定 ===
  /** 裝璜方式 */
  deco_type?: string;
  /** 結帳方式 (10/15/30) */
  money_type?: string;
  /** 配合方式 (1:專櫃 2:自營) */
  store_way?: string;
  /** 對帳方式 */
  check_type?: string;
  /** 營運狀態 */
  tlt_openflag?: string;
  /** 是否使用業主商店代號 */
  edc_yn?: string;

  // === 發票/付款 ===
  /** 開立業主發票 */
  rece_yn?: string;
  /** 是否使用業主收銀機 */
  pos_yn?: string;
  /** 使用業主收現 */
  cash_yn?: string;
  /** 付款方式 (1:匯款 2:支票) */
  paytype?: string;
  /** 請款單據別 (0:發票 1:收據) */
  invoice_type?: string;
  /** 付款期限(天數) */
  check_day?: number;

  // === 費用相關 ===
  /** 租金 */
  base_rent?: number;
  /** 押金 */
  deposit?: number;
  /** 預收租金 */
  rent_ahead?: string;
  /** 預收租金期數 */
  rent_period?: number;

  // === 會員卡 ===
  /** 是否配合聯名卡 */
  vip_yn?: string;
  /** 聯名卡折數 */
  credit_card?: number;

  // === 目標營業額 ===
  /** 年目標營業額(業主) */
  total_amt?: number;
  /** 年目標營業額(廠商) */
  total_amt_vendor?: number;
  /** 目標營業額單位(業主) */
  total_amt_unit?: string;
  /** 目標營業額單位(廠商) */
  total_amt_vendor_unit?: string;

  // === 保證金 ===
  /** 準時開業-保證金付款方式 */
  open_deposit?: string;
  /** 準時開業保證金金額 */
  open_fees?: number;
  /** 施工保證-保證金付款方式 */
  construct_deposit?: string;
  /** 施工保證金額 */
  construct_fees?: number;
  /** 契約屆滿保證票-保證金付款方式 */
  expiration_deposit?: string;
  /** 契約屆滿保證金金額 */
  expiration_fees?: number;
  /** 保證金備註 */
  ticket_remarks?: string;

  // === 銀行資訊 ===
  /** 廠商匯款銀行代號 */
  bank_id?: string;
  /** 廠商帳戶名稱 */
  vendor_acct_name?: string;
  /** 廠商銀行帳號 */
  vendor_acct_no?: string;

  // === 聯絡資訊 ===
  /** 電子信箱 */
  email?: string;
  /** 發票電子郵件信箱 */
  invoice_email?: string;
  /** 公司電話號碼 */
  contact_tel?: string;
  /** 公司電話傳真 */
  contact_fax?: string;
  /** 郵寄地址 */
  contact_addr?: string;
  /** 票據抬頭 */
  CHECK_TITLE?: string;

  // === 水電瓦斯 ===
  /** 水錶 */
  water_flag?: string;
  /** 電錶 */
  electric_flag?: string;
  /** 瓦斯錶 */
  gas_flag?: string;

  // === 活動參與 ===
  /** 參加滿千送百 */
  cap_saletype1?: string;
  /** 參加全館消費滿額集點 */
  cap_saletype2?: string;
  /** 參加有價券 */
  cap_saletype3?: string;
  /** 參加會員卡 */
  cap_saletype4?: string;
  /** 收取商品提貨單 */
  cap_saletype5?: string;

  // === 洽談資訊 ===
  /** 洽談人員代號 */
  contact_USR_No?: string;
  /** 洽談人員姓名 */
  contact_USR_Name?: string;

  // === 備註 ===
  /** 備註 */
  tlt_remark?: string;

  // === 狀態 ===
  /** 審核狀態 */
  approve_status?: string;

  // === 位置資訊 ===
  /** 位置列表 */
  locationInfo?: LocationItem[];
}

/**
 * 合約資料與位置資料合併
 */
export interface ContractFormData {
  contractInfo: ContractInfo;
  locationData: LocationItem[];
}
