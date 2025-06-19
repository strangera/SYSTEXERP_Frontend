import { Column, formatAmount, formatDate, formatDateTime, formatYN } from "../../../shared/componentkit/table/table.model";

/**
 * @interface ITLTTALENT
 * @description TLTTALENT 專櫃主檔的數據模型
 */
export interface ITLTTALENT {
  id: number; // 主鍵 ID
  mid: number; // 相關 ID (預設 0)
  talent_id: number; // 合約編號系統 id
  apply_no: string; // 申請設櫃編號
  approved_date: string | null; // 核准日期
  approved_userno: string | null; // 核准人員
  approved_user_name: string | null; // 核准人員姓名

  tlt_openflag: string; // 營業狀態: 0閉店/撤櫃, 1=營業中, 2=合約結束, 9=核准時合約尚未開始
  contract_no: string; // 合約編號
  contract_subno: number; // 合約附號

  // 基本資料
  tlt_no: string; // 專櫃編號
  tlt_shortname: string | null; // 專櫃簡稱
  tlt_name: string; // 品牌(專櫃名稱)
  ven_uniform: string; // 廠商統一編號(pos2013)
  VEN_Name: string; // 廠商名稱(pos2013.ven_name)

  // 洽談階段資訊
  paper_type: string | null; // 營業型態(sys1000.T101)
  org_id: string; // 組織代碼

  bus_type: string; // 大分類代碼(tltbustype)
  bus_class: string; // 中分類代碼(tltbusclass)
  bus_sclass: string | null; // 小分類(tltbussclass)

  tlt_bdate: string; // 合約起始日期
  tlt_edate: string; // 合約終止日期
  tlt_contract_bdate: string; // 正式營運起始日期
  tlt_contract_edate: string; // 正式營運終止日期
  feedback_date: string | null; // 回函日期
  due_date: string | null; // 回函截止日期

  contact_Date: string | null; // 洽談日期
  contact_USR_No: string | null; // 洽談人員
  contact_USR_Name: string | null; // 洽談人員姓名

  // 商務條件
  tlt_kind: string | null; // 專櫃櫃別: 1.正櫃 2.臨時櫃 3.特賣會 4.虛擬櫃
  deco_type: string | null; // 裝璜方式(1:統設統裝(A統) 2:統設自裝 3:自設統裝 4:自設自裝)
  tlt_term_type: string; // 抽成別 (1:固定租金 2:底租抽成取高者 3:一般抽成 4:包底抽成 5:階梯式抽成 6:包底加階梯)
  comm_comp_type: string; // 抽成計算方式(1:含稅, 2:除稅)--畫面上只有2的選項
  edc_yn: string | null; // 是否使用業主商店代號-保留欄位, 但不使用
  machine_id: string | null; // 業主商店代號-目前沒有資料, 保留欄位但不使用

  tlt_ctype_mtotal: string | null; // 包底類別(1:年包 2:月包 0:期間包)
  overall_status: string | null; // 超出部份處理方式(1:全部 2:部份)

  rent_ahead: string | null; // 預收租金(Y:是 N:否)
  rent_period: number | null; // 預收租金期數
  base_rent: number | null; // 租金(抽成別為1:固定租金為必填)
  deposit: number | null; // 押金

  rece_yn: string | null; // 是否開立業主發票(Y:是 N:否)
  pos_yn: string | null; // 是否使用業主收銀機(Y:是 N:否)
  cash_yn: string | null; // 是否為業主收現(Y:是 N:否)
  comm_yn: string | null; // 是否為抽成(Y:是 N:否)
  money_type: string | null; // 結帳方式 10=十日結 15=半月結 30=月結

  store_way: string | null; // 配合方式(1=專櫃 2=自營)
  check_type: string | null; // 對帳方式(1:傳真 2:郵寄 3:網路 )可複選, 例如: 1,2,3
  paytype: string | null; // 付款方式(1:匯款 2:支票)

  vip_yn: string | null; // 是否配合聯名卡(Y:是 N:否)
  credit_card: number | null; // 聯名卡折數-參考欄位, 與pos不連動

  total_amt: number | null; // 年目標營業額(業主)-TARGET_AMOUNT_M
  total_amt_vendor: number | null; // 年目標營業額(廠商)-TARGET_AMOUNT_V

  // 保證金 準時開業、施工保證、契約屆滿保證票
  open_deposit: string | null; // 準時開業-保證金付款方式 1:現金 2:支票 3:履約保證金
  open_fees: number | null; // 準時開業保證金金額
  construct_deposit: string | null; // 施工保證-保證金付款方式 1:現金 2:支票 3:履約保證金
  construct_fees: number | null; // 施工保證金額
  expiration_deposit: string | null; // 契約屆滿保證票-保證金付款方式 1:現金 2:支票 3:履約保證金
  expiration_fees: number | null; // 契約屆滿保證金金額
  ticket_remarks: string | null; // 保證票摘要

  // 付款條件
  check_day: number; // 結帳後幾日付款
  invoice_type: string; // 請款單據別 0:發票 1:收據
  email: string | null; // 電子郵件信箱
  invoice_email: string | null; // 發票電子郵件信箱

  CHECK_TITLE: string | null; // 票據抬頭
  store_tel: string | null; // 專櫃電話號碼

  bank_id: string | null; // 廠商匯款銀行代號(含分行代碼)
  vendor_acct_name: string | null; // 廠商帳戶名稱
  vendor_acct_no: string | null; // 廠商銀行帳號

  contact_tel: string | null; // 公司電話號碼
  contact_fax: string | null; // 公司電話傳真
  contact_addr: string | null; // 郵寄地址

  // 抄表資訊
  water_flag: string | null; // 水錶 Y/N default N
  electric_flag: string | null; // 電錶 Y/N default N
  gas_flag: string | null; // 瓦斯錶 Y/N default N

  // 參加活動資訊是提供給UTK系統使用, 固定租金在合約上設定
  cap_saletype1: string | null; // 參加滿千送百 Y/N
  cap_saletype2: string | null; // 參加全館消費滿額集點 Y/N
  cap_saletype3: string | null; // 參加有價券 Y/N
  cap_saletype4: string | null; // 參加會員卡 Y/N

  tlt_remark: string | null; // 備註

  crt_date: string | null; // 建立日期
  crt_usr_no: string | null; // 建立人員
  crt_usr_name: string | null; // 建立人員姓名
  upd_date: string | null; // 變更日期
  upd_usr_no: string | null; // 變更人員
  upd_usr_name: string | null; // 變更人員姓名

  app_date: string | null; // 核准日期
  app_usr_no: string | null; // 核准人員
  app_usr_name: string | null; // 核准人員姓名
}

export const TLTTALENT_columns: Column[] = [
  { field: 'id', header: '主鍵 ID', visible: true },
  { field: 'mid', header: '相關 ID (預設 0)', visible: true },
  { field: 'talent_id', header: '合約編號系統 id', visible: true },
  { field: 'apply_no', header: '申請設櫃編號', visible: true },
  { field: 'approved_date', header: '核准日期', visible: true, format: formatDate }, // 假設 formatDate 可用
  { field: 'approved_userno', header: '核准人員', visible: true },
  { field: 'approved_user_name', header: '核准人員姓名', visible: true },

  { field: 'tlt_openflag', header: '營業狀態', visible: true },
  { field: 'contract_no', header: '合約編號', visible: true },
  { field: 'contract_subno', header: '合約附號', visible: true },

  // 基本資料
  { field: 'tlt_no', header: '專櫃編號', visible: true },
  { field: 'tlt_shortname', header: '專櫃簡稱', visible: true },
  { field: 'tlt_name', header: '品牌(專櫃名稱)', visible: true },
  { field: 'ven_uniform', header: '廠商統一編號(pos2013)', visible: true },
  { field: 'VEN_Name', header: '廠商名稱(pos2013.ven_name)', visible: true },

  // 洽談階段資訊
  { field: 'paper_type', header: '營業型態(sys1000.T101)', visible: true },
  { field: 'org_id', header: '組織代碼', visible: true },

  { field: 'bus_type', header: '大分類代碼(tltbustype)', visible: true },
  { field: 'bus_class', header: '中分類代碼(tltbusclass)', visible: true },
  { field: 'bus_sclass', header: '小分類(tltbussclass)', visible: true },

  { field: 'tlt_bdate', header: '合約起始日期', visible: true, format: formatDate },
  { field: 'tlt_edate', header: '合約終止日期', visible: true, format: formatDate },
  { field: 'tlt_contract_bdate', header: '正式營運起始日期', visible: true, format: formatDate },
  { field: 'tlt_contract_edate', header: '正式營運終止日期', visible: true, format: formatDate },
  { field: 'feedback_date', header: '回函日期', visible: true, format: formatDate },
  { field: 'due_date', header: '回函截止日期', visible: true, format: formatDate },

  { field: 'contact_Date', header: '洽談日期', visible: true, format: formatDate },
  { field: 'contact_USR_No', header: '洽談人員', visible: true },
  { field: 'contact_USR_Name', header: '洽談人員姓名', visible: true },

  // 商務條件
  { field: 'tlt_kind', header: '專櫃櫃別', visible: true },
  { field: 'deco_type', header: '裝璜方式', visible: true },
  { field: 'tlt_term_type', header: '抽成別', visible: true },
  { field: 'comm_comp_type', header: '抽成計算方式', visible: true },
  { field: 'edc_yn', header: '是否使用業主商店代號', visible: true },
  { field: 'machine_id', header: '業主商店代號', visible: true },

  { field: 'tlt_ctype_mtotal', header: '包底類別', visible: true },
  { field: 'overall_status', header: '超出部份處理方式', visible: true },

  { field: 'rent_ahead', header: '預收租金', visible: true, format: formatAmount },
  { field: 'rent_period', header: '預收租金期數', visible: true },
  { field: 'base_rent', header: '租金', visible: true },
  { field: 'deposit', header: '押金', visible: true },

  { field: 'rece_yn', header: '是否開立業主發票', visible: true, format: formatYN },
  { field: 'pos_yn', header: '是否使用業主收銀機', visible: true, format: formatYN },
  { field: 'cash_yn', header: '是否為業主收現', visible: true, format: formatYN },
  { field: 'comm_yn', header: '是否為抽成', visible: true, format: formatYN },
  { field: 'money_type', header: '結帳方式', visible: true },

  { field: 'store_way', header: '配合方式', visible: true },
  { field: 'check_type', header: '對帳方式', visible: true },
  { field: 'paytype', header: '付款方式', visible: true },

  { field: 'vip_yn', header: '是否配合聯名卡', visible: true, format: formatYN },
  { field: 'credit_card', header: '聯名卡折數', visible: true },

  { field: 'total_amt', header: '年目標營業額(業主)', visible: true, format: formatAmount },
  { field: 'total_amt_vendor', header: '年目標營業額(廠商)', visible: true, format: formatAmount },

  // 保證金 準時開業、施工保證、契約屆滿保證票
  { field: 'open_deposit', header: '準時開業-保證金付款方式', visible: true },
  { field: 'open_fees', header: '準時開業保證金金額', visible: true, format: formatAmount },
  { field: 'construct_deposit', header: '施工保證-保證金付款方式', visible: true },
  { field: 'construct_fees', header: '施工保證金額', visible: true, format: formatAmount },
  { field: 'expiration_deposit', header: '契約屆滿保證票-保證金付款方式', visible: true },
  { field: 'expiration_fees', header: '契約屆滿保證金金額', visible: true, format: formatAmount },
  { field: 'ticket_remarks', header: '保證票摘要', visible: true },

  // 付款條件
  { field: 'check_day', header: '結帳後幾日付款', visible: true },
  { field: 'invoice_type', header: '請款單據別', visible: true },
  { field: 'email', header: '電子郵件信箱', visible: true },
  { field: 'invoice_email', header: '發票電子郵件信箱', visible: true },

  { field: 'CHECK_TITLE', header: '票據抬頭', visible: true },
  { field: 'store_tel', header: '專櫃電話號碼', visible: true },

  { field: 'bank_id', header: '廠商匯款銀行代號(含分行代碼)', visible: true },
  { field: 'vendor_acct_name', header: '廠商帳戶名稱', visible: true },
  { field: 'vendor_acct_no', header: '廠商銀行帳號', visible: true },

  { field: 'contact_tel', header: '公司電話號碼', visible: true },
  { field: 'contact_fax', header: '公司電話傳真', visible: true },
  { field: 'contact_addr', header: '郵寄地址', visible: true },

  // 抄表資訊
  { field: 'water_flag', header: '水錶', visible: true, format: formatYN },
  { field: 'electric_flag', header: '電錶', visible: true, format: formatYN },
  { field: 'gas_flag', header: '瓦斯錶', visible: true, format: formatYN },

  // 參加活動資訊是提供給UTK系統使用, 固定租金在合約上設定
  { field: 'cap_saletype1', header: '參加滿千送百', visible: true, format: formatYN },
  { field: 'cap_saletype2', header: '參加全館消費滿額集點', visible: true, format: formatYN },
  { field: 'cap_saletype3', header: '參加有價券', visible: true, format: formatYN },
  { field: 'cap_saletype4', header: '參加會員卡', visible: true, format: formatYN },

  { field: 'tlt_remark', header: '備註', visible: true },

  { field: 'crt_date', header: '建立日期', visible: true, format: formatDateTime },
  { field: 'crt_usr_no', header: '建立人員', visible: true },
  { field: 'crt_usr_name', header: '建立人員姓名', visible: true },
  { field: 'upd_date', header: '變更日期', visible: true, format: formatDateTime },
  { field: 'upd_usr_no', header: '變更人員', visible: true },
  { field: 'upd_usr_name', header: '變更人員姓名', visible: true },

  { field: 'app_date', header: '核准日期', visible: true, format: formatDateTime },
  { field: 'app_usr_no', header: '核准人員', visible: true },
  { field: 'app_usr_name', header: '核准人員姓名', visible: true },
];

/**
 * @interface ITLTTALENT_VoucherType
 * @description TLTTALENT_VoucherType 專櫃扣款券類設定檔的數據模型
 */
export interface ITLTTALENT_VoucherType {
  id: number; // 主鍵 ID
  mid: number; // 相關 ID (預設 0)
  talent_id: number; // 合約編號系統 id
  cap_item: string; // 扣款代碼
  pay_no: string; // 付款別代碼(pos1006.pay_no)
  calc_type: string; // 券類計算方式 (1=單筆 2=單月累積營業額 3=全租期累計營業額)
  rent_plus_rate: number | null; // 全租期累計加抽比率
  over_base_rate: number | null; // 超過基準比率
  crt_date: string | null; // 建立日期
  crt_usr_no: string | null; // 建立人員
  crt_usr_name: string | null; // 建立人員姓名
  upd_date: string | null; // 變更日期
  upd_usr_no: string | null; // 變更人員
  upd_usr_name: string | null; // 變更人員姓名
}
