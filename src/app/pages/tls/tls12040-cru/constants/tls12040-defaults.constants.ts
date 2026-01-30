/**
 * TLS12040 表單欄位預設值常數
 * 集中管理所有預設值，方便維護和修改
 */
export const TLS12040_FORM_DEFAULTS = {
  // ========== 基本資訊 ==========
  talent_id: '',
  apply_no: '',                    // 系統自動產生
  tlt_no: '',                      // 待確認
  tlt_name: '',
  ven_uniform: '',
  ven_no: '',
  VEN_Name: '',
  VEN_Address: '',

  // ========== 申請資訊 ==========
  apply_type: '',                  // 申請案件內容
  apply_date: getTodayDate(),                 // 申請日期
  apply_status: '1',                // 申請案件狀態
  contract_type: '',               // 申請案件型態
  approve_status: '1',             // 審核狀態：未審核
  contract_subno: '1',             // 版次：預設1

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
  tlt_kind: '1',                   // 專櫃種類：正櫃
  deco_type: '1',                  // 裝潢方式：統設統裝(A統)
  tlt_term_type: '3',              // 抽成別：一般抽成
  comm_comp_type: '2',             // 抽成額計算方式：除稅
  edc_yn: 'Y',                     // 是否使用業主商店代號：是
  tlt_ctype_mtotal: '',            // 包底類別
  overall_status: '1',             // 超出部份處理方式
  tlt_openflag: '9',               // 營運狀態：合約未生效

  // ========== 租金相關 ==========
  rent_ahead: 'N',                 // 預收租金：否
  rent_period: 0,                  // 預收租金期數
  base_rent: 0,                    // 固定租金
  deposit: 0,                      // 押金

  // ========== 業務設定 - Y/N 選項 ==========
  comm_yn: 'Y',                    // 是否為抽成：是
  rece_yn: 'Y',                    // 是否開立業主發票：是
  pos_yn: 'Y',                     // 是否使用業主收銀機：是
  cash_yn: 'N',                    // 是否為業主收現：否
  vip_yn: 'N',                     // 是否配合聯名卡：否

  // ========== 結帳與付款 ==========
  money_type: '30',                // 結帳方式：月結
  store_way: '1',                  // 配合方式：專櫃
  check_typeList: ['1', '2', '3'], // 對帳方式：郵寄 + 網路（複選）
  paytype: '1',                    // 付款方式：匯款
  invoice_type: '0',               // 請款單據別：發票
  check_day: 0,                    // 結帳後幾日付款

  // ========== 目標營業額 ==========
  total_amt: 0,
  total_amt_unit: 'M',             // 單位：月
  total_amt_vendor: 0,
  total_amt_vendor_unit: 'M',      // 單位：月

  // ========== 會員卡 ==========
  credit_card: 0,                  // 會員卡折數

  // ========== 保證金 ==========
  open_deposit: '',                // 準時開業保證金付款方式
  open_fees: 0,                    // 準時開業保證金
  construct_deposit: '',           // 施工保證金付款方式
  construct_fees: 0,               // 施工保證金
  expiration_deposit: '',          // 合約屆滿保證金付款方式
  expiration_fees: 0,              // 合約屆滿保證金
  ticket_remarks: '',              // 保證金備註

  // ========== 抄錶設定 ==========
  water_flag: 'N',                 // 水錶抄錶：否
  electric_flag: 'N',              // 電錶抄錶：否
  gas_flag: 'N',                   // 瓦斯錶抄錶：否

  // ========== 活動參與 ==========
  cap_saletype1: 'N',              // 滿仟送佰：否
  cap_saletype2: 'N',              // 會員卡集點：否
  cap_saletype3: 'N',              // 收取禮卷：否
  cap_saletype4: 'N',              // 會員卡：否
  cap_saletype5: 'N',              // 參加提貨單：否

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
  tlt_remark: ''
} as const;

/**
 * 特定模式下的預設值覆寫
 */
export const TLS12040_MODE_DEFAULTS = {
  // 新增模式特有預設值
  CREATE: {
    approve_status: '1',           // 未審核
    tlt_openflag: '9',            // 合約未生效
    contract_subno: '1'           // 版次1
  },

  // 編輯模式特有預設值（通常不需要，因為會載入既有資料）
  EDIT: {},

  // 檢視模式特有預設值（通常不需要）
  READ: {}
} as const;

/**
 * 需要根據其他欄位動態設定的預設值邏輯
 */
export const TLS12040_CONDITIONAL_DEFAULTS = {
  /**
   * 根據抽成別設定相關預設值
   */
  byTermType: {
    '1': { // 固定租金
      rent_ahead: 'Y',
      comm_yn: 'N'
    },
    '2': { // 固定租金＋抽成
      rent_ahead: 'Y',
      comm_yn: 'Y'
    },
    '3': { // 一般抽成
      rent_ahead: 'N',
      comm_yn: 'Y'
    },
    '4': { // 保底抽成
      rent_ahead: 'N',
      comm_yn: 'Y'
    },
    '5': { // 階梯抽成
      rent_ahead: 'N',
      comm_yn: 'Y'
    },
    '6': { // 保底階梯抽成
      rent_ahead: 'N',
      comm_yn: 'Y'
    }
  }
} as const;

export function getTodayDate(addDays: number = 0): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (addDays !== 0) {
    today.setDate(today.getDate() + addDays);
  }

  return today;
}

