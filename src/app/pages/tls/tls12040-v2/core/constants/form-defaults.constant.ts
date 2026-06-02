/**
 * TLS12040-v2 表單預設值
 * 對應現有 tls12040-cru/constants/tls12040-defaults.constants.ts
 */

/** 表單預設值 */
export const FORM_DEFAULTS = {
  // 基本資訊預設值
  tlt_kind: '1',              // 正櫃
  deco_type: '1',             // 統設統裝
  tlt_term_type: '3',         // 一般抽成
  comm_comp_type: '2',        // 除稅
  money_type: '30',           // 月結
  apply_status: '1',          // 申請中
  approve_status: '1',        // 未審核
  tlt_openflag: '9',          // 合約未生效
  store_way: '1',             // 專櫃

  // Y/N 預設值
  edc_yn: 'N',
  comm_yn: 'N',
  rece_yn: 'N',
  pos_yn: 'N',
  cash_yn: 'N',
  vip_yn: 'Y',
  rent_ahead: 'N',
  water_flag: 'N',
  electric_flag: 'N',
  gas_flag: 'N',

  // 活動參與預設值
  cap_saletype1: 'N',
  cap_saletype2: 'N',
  cap_saletype3: 'N',
  cap_saletype4: 'N',
  cap_saletype5: 'N',

  // 付款相關
  paytype: '1',               // 匯款
  check_type: '3',            // 網路對帳
  invoice_type: '0',          // 發票
  check_day: 30,              // 付款期限

  // 保證金預設
  open_deposit: '1',          // 現金
  construct_deposit: '1',     // 現金
  expiration_deposit: '1',    // 現金

  // 目標營業額單位
  total_amt_unit: '萬',
  total_amt_vendor_unit: '萬'
};

/** 根據抽成別的條件預設值 */
export const CONDITIONAL_DEFAULTS: Record<string, Partial<typeof FORM_DEFAULTS>> = {
  // 固定租金
  '1': {
    rent_ahead: 'Y',
    comm_yn: 'N'
  },
  // 底租抽成取高者
  '2': {
    rent_ahead: 'Y',
    comm_yn: 'Y'
  },
  // 一般抽成
  '3': {
    rent_ahead: 'N',
    comm_yn: 'Y'
  },
  // 包底抽成
  '4': {
    rent_ahead: 'N',
    comm_yn: 'Y'
  },
  // 層級抽成
  '5': {
    rent_ahead: 'N',
    comm_yn: 'Y'
  },
  // 包底加層級
  '6': {
    rent_ahead: 'N',
    comm_yn: 'Y'
  }
};

/** 包底類別選項 */
export const BAODI_TYPE_OPTIONS = [
  { label: '年包', value: '1' },
  { label: '月包', value: '2' },
  { label: '區間包', value: '0' }
];

/** 超出部份處理方式選項 */
export const OVERALL_STATUS_OPTIONS = [
  { label: '全部', value: '1' },
  { label: '部份', value: '2' }
];
