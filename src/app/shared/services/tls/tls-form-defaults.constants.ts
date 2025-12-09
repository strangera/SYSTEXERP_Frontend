/**
 * TLS 合約表單共用預設值常數
 * 適用於 TLS13010 (專櫃合約) 和 TLS12040 (專櫃要約書)
 */

/**
 * 取得今天日期
 * @param addDays 要增加的天數 (預設為0，即今天)
 * @returns Date 物件
 */
export function getTodayDate(addDays: number = 0): Date {
  const today = new Date();
  if (addDays !== 0) {
    today.setDate(today.getDate() + addDays);
  }
  return today;
}

/**
 * 取得今天日期字串 (YYYY-MM-DD 格式)
 * @param addDays 要增加的天數
 * @returns 日期字串
 */
export function getTodayDateString(addDays: number = 0): string {
  const date = getTodayDate(addDays);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

/**
 * TLS 表單共用預設值
 * 包含兩個模組都會使用的欄位預設值
 */
export const TLS_COMMON_FORM_DEFAULTS = {
  // ========== 基本資訊 ==========
  talent_id: '',
  apply_no: '',                      // 系統自動產生
  tlt_no: '',
  tlt_name: '',
  ven_uniform: '',
  ven_no: '',
  VEN_Name: '',
  VEN_Address: '',

  // ========== 業務分類 ==========
  paper_type: '',
  bus_type: '',
  bus_class: '',
  bus_sclass: '',
  org_id: '',

  // ========== 日期資訊 ==========
  tlt_bdate: '',
  tlt_edate: '',
  tlt_contract_bdate: '',
  tlt_contract_edate: '',
  feedback_date: getTodayDate(),
  due_date: getTodayDate(15),
  contact_Date: getTodayDate(),

  // ========== 聯絡人 ==========
  contact_USR_No: '',
  contact_USR_Name: '',

  // ========== 商務條件 - 基本 ==========
  tlt_kind: '1',                     // 專櫃種類：正櫃
  deco_type: '1',                    // 裝潢方式：統設統裝(A統)
  tlt_term_type: '3',                // 抽成別：一般抽成
  comm_comp_type: '2',               // 抽成額計算方式：除稅
  edc_yn: 'Y',                       // 是否使用業主商店代號：是
  tlt_ctype_mtotal: '',              // 包底類別
  overall_status: '1',               // 超出部份處理方式
  tlt_openflag: '9',                 // 營運狀態：合約未生效

  // ========== 租金相關 ==========
  rent_ahead: 'N',                   // 預收租金：否
  rent_period: 0,                    // 預收租金期數
  base_rent: 0,                      // 固定租金
  deposit: 0,                        // 押金

  // ========== 業務設定 - Y/N 選項 ==========
  comm_yn: 'Y',                      // 是否為抽成：是
  rece_yn: 'Y',                      // 是否開立業主發票：是
  pos_yn: 'Y',                       // 是否使用業主收銀機：是
  cash_yn: 'Y',                      // 是否為業主收現：是（會被 SPECIFIC_DEFAULTS 覆蓋）
  vip_yn: 'N',                       // 是否配合聯名卡：否

  // ========== 結帳與付款 ==========
  money_type: '30',                  // 結帳方式：月結
  store_way: '1',                    // 配合方式：專櫃
  check_typeList: ['1', '2', '3'],   // 對帳方式：郵寄 + 網路（複選）
  paytype: '1',                      // 付款方式：匯款
  invoice_type: '0',                 // 請款單據別：發票
  check_day: 0,                      // 結帳後幾日付款

  // ========== 目標營業額 ==========
  total_amt: '',                     // 會被 SPECIFIC_DEFAULTS 覆蓋
  total_amt_unit: 'M',               // 單位：月
  total_amt_vendor: '',              // 會被 SPECIFIC_DEFAULTS 覆蓋
  total_amt_vendor_unit: 'M',        // 單位：月

  // ========== 會員卡 ==========
  credit_card: '',                   // 會員卡折數（會被 SPECIFIC_DEFAULTS 覆蓋）

  // ========== 保證金 ==========
  open_deposit: '',                  // 準時開業保證金付款方式
  open_fees: 0,                      // 準時開業保證金
  construct_deposit: '',             // 施工保證金付款方式
  construct_fees: 0,                 // 施工保證金
  expiration_deposit: '',            // 合約屆滿保證金付款方式
  expiration_fees: 0,                // 合約屆滿保證金
  ticket_remarks: '',                // 保證金備註

  // ========== 抄錶設定 ==========
  water_flag: 'N',                   // 水錶抄錶：否
  electric_flag: 'N',                // 電錶抄錶：否
  gas_flag: 'N',                     // 瓦斯錶抄錶：否

  // ========== 活動參與 ==========
  cap_saletype1: '',                 // 滿仟送佰（會被 SPECIFIC_DEFAULTS 覆蓋）
  cap_saletype2: '',                 // 會員卡集點（會被 SPECIFIC_DEFAULTS 覆蓋）
  cap_saletype3: '',                 // 收取禮卷（會被 SPECIFIC_DEFAULTS 覆蓋）
  cap_saletype4: '',                 // 會員卡（會被 SPECIFIC_DEFAULTS 覆蓋）
  cap_saletype5: '',                 // 參加提貨單（會被 SPECIFIC_DEFAULTS 覆蓋）

  // ========== 聯絡資訊 ==========
  email: '',
  invoice_email: '',
  CHECK_TITLE: '',
  store_tel: '',
  bank_id: '',
  vendor_acct_name: '',
  vendor_acct_no: '',
  contact_tel: '',
  contact_fax: '',
  contact_addr: '',
  tlt_remark: '',

  // ========== 其他 ==========
  selectedBankInfo: null
} as const;

/**
 * 新增模式的預設值
 */
export const TLS_CREATE_MODE_DEFAULTS = {
  contract_subno: '1',               // 版次：1
  approve_status: '1',               // 審核狀態：未審核
  tlt_openflag: '9',                 // 營運狀態：合約未生效
  overall_status: '1',               // 整體狀態
} as const;

/**
 * 根據抽成別設定的條件式預設值
 * 當使用者選擇不同的抽成別時，自動調整相關欄位
 */
export const TLS_CONDITIONAL_DEFAULTS_BY_TERM_TYPE = {
  '1': {  // 固定租金
    rent_ahead: 'Y',                 // 預收租金：是
    comm_yn: 'N'                     // 是否為抽成：否
  },
  '2': {  // 固定租金＋抽成
    rent_ahead: 'Y',                 // 預收租金：是
    comm_yn: 'Y'                     // 是否為抽成：是
  },
  '3': {  // 一般抽成
    rent_ahead: 'N',                 // 預收租金：否
    comm_yn: 'Y'                     // 是否為抽成：是
  },
  '4': {  // 保底抽成
    rent_ahead: 'N',                 // 預收租金：否
    comm_yn: 'Y'                     // 是否為抽成：是
  },
  '5': {  // 階梯抽成
    rent_ahead: 'N',                 // 預收租金：否
    comm_yn: 'Y'                     // 是否為抽成：是
  },
  '6': {  // 保底階梯抽成
    rent_ahead: 'N',                 // 預收租金：否
    comm_yn: 'Y'                     // 是否為抽成：是
  }
} as const;

/**
 * TLS13010 特有的預設值 (如果有與共用不同的地方)
 */
export const TLS13010_SPECIFIC_DEFAULTS = {
  // TLS13010 使用這些預設值（與 TLS12040 不同）
  cash_yn: 'Y',                      // 是否為業主收現：是
  total_amt: '',                     // 目標營業額：空字串
  total_amt_vendor: '',              // 廠商目標營業額：空字串
  credit_card: '',                   // 會員卡折數：空字串
  cap_saletype1: '',                 // 滿仟送佰：空字串
  cap_saletype2: '',                 // 會員卡集點：空字串
  cap_saletype3: '',                 // 收取禮卷：空字串
  cap_saletype4: '',                 // 會員卡：空字串
  cap_saletype5: '',                 // 參加提貨單：空字串
} as const;

/**
 * TLS12040 特有的預設值
 */
export const TLS12040_SPECIFIC_DEFAULTS = {
  // TLS12040 額外的欄位
  apply_type: '',                    // 申請案件內容
  apply_date: getTodayDate(),        // 申請日期
  apply_status: '1',                 // 申請案件狀態
  contract_type: '',                 // 申請案件型態

  // TLS12040 使用這些預設值（與 TLS13010 不同）
  cash_yn: 'N',                      // 是否為業主收現：否
  total_amt: 0,                      // 目標營業額：0
  total_amt_vendor: 0,               // 廠商目標營業額：0
  credit_card: 0,                    // 會員卡折數：0
  cap_saletype1: 'N',                // 滿仟送佰：否
  cap_saletype2: 'N',                // 會員卡集點：否
  cap_saletype3: 'N',                // 收取禮卷：否
  cap_saletype4: 'N',                // 會員卡：否
  cap_saletype5: 'N',                // 參加提貨單：否
} as const;

/**
 * 取得 TLS13010 完整預設值
 */
export function getTLS13010FormDefaults() {
  return {
    ...TLS_COMMON_FORM_DEFAULTS,
    ...TLS13010_SPECIFIC_DEFAULTS,
    ...TLS_CREATE_MODE_DEFAULTS
  };
}

/**
 * 取得 TLS12040 完整預設值
 */
export function getTLS12040FormDefaults() {
  return {
    ...TLS_COMMON_FORM_DEFAULTS,
    ...TLS12040_SPECIFIC_DEFAULTS,
    ...TLS_CREATE_MODE_DEFAULTS
  };
}
