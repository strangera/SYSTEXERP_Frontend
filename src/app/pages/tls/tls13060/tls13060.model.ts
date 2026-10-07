import { getSYS1000 } from "@service/system/sys1000.service";
import { ColumnGroup } from "@shared/components/table-report/table-report.model";
import { transformOptionsForExport } from "src/app/others/componentextends/basic-print/basic-print-data.component";
import { Column, formatDate, formatYN } from "../../../others/component/table/table.model";

export const Pay_no_Option = [
  { value: '0', label: '不收取' },
  { value: '1', label: '收取' },
];

// 列印/匯出由後端產生，不會套用 format，需另外提供 exportFormat 對照
const Pay_no_ExportFormat = transformOptionsForExport(Pay_no_Option);

export const formatPayNo = (value: string): string => {
  return Pay_no_Option.find((opt) => opt.value === value)?.label ?? '';
};

export const TLTTALENT_columns: Column[] = [
  // { field: 'talent_id', header: '合約編號系統 id', visible: true },
  // { field: 'apply_no', header: '申請設櫃編號', visible: true },
  // { field: 'approved_date', header: '核准日期', visible: true, format: formatDate }, // 假設 formatDate 可用
  // { field: 'approved_userno', header: '核准人員', visible: true },
  // { field: 'approved_user_name', header: '核准人員姓名', visible: true },

  // { field: 'tlt_openflag', header: '營業狀態', visible: true },
  // { field: 'contract_no', header: '合約編號', visible: true },

  // 基本資料
  { field: 'building_desc', header: '館別', visible: true },
  { field: 'org_id', header: '組織代碼', visible: true },
  { field: 'org_name', header: '組織名稱', visible: true },
  { field: 'VEN_Name', header: '廠商名稱', visible: true },
  { field: 'tlt_no', header: '專櫃編號', visible: true },
  { field: 'location_no', header: '位置編號', visible: true },

  // { field: 'tlt_shortname', header: '專櫃簡稱', visible: true },
  { field: 'tlt_name', header: '櫃位名稱', visible: true },
  // { field: 'ven_uniform', header: '廠商統一編號(pos2013)', visible: true },

  // 洽談階段資訊
  // { field: 'paper_type', header: '營業型態(sys1000.T101)', visible: true },

  // { field: 'bus_type', header: '大分類代碼(tltbustype)', visible: true },
  // { field: 'bus_class', header: '中分類代碼(tltbusclass)', visible: true },
  // { field: 'bus_sclass', header: '小分類(tltbussclass)', visible: true },
  { field: 'contract_subno', header: '版次', visible: true },
  { field: 'tlt_bdate', header: '合約起始日期', visible: true, format: formatDate },
  { field: 'tlt_edate', header: '合約終止日期', visible: true, format: formatDate },
  // { field: 'tlt_contract_bdate', header: '正式營運起始日期', visible: true, format: formatDate },
  // { field: 'tlt_contract_edate', header: '正式營運終止日期', visible: true, format: formatDate },
  // { field: 'feedback_date', header: '回函日期', visible: true, format: formatDate },
  // { field: 'due_date', header: '回函截止日期', visible: true, format: formatDate },

  // { field: 'contact_Date', header: '洽談日期', visible: true, format: formatDate },
  // { field: 'contact_USR_No', header: '洽談人員', visible: true },
  // { field: 'contact_USR_Name', header: '洽談人員姓名', visible: true },

  // 商務條件
  // { field: 'tlt_kind', header: '專櫃櫃別', visible: true },
  // { field: 'deco_type', header: '裝璜方式', visible: true },
  // { field: 'tlt_term_type', header: '抽成別', visible: true },
  // { field: 'comm_comp_type', header: '抽成計算方式', visible: true },
  // { field: 'edc_yn', header: '是否使用業主商店代號', visible: true },
  // { field: 'machine_id', header: '業主商店代號', visible: true },

  // { field: 'tlt_ctype_mtotal', header: '包底類別', visible: true },
  // { field: 'overall_status', header: '超出部份處理方式', visible: true },

  // { field: 'rent_ahead', header: '預收租金', visible: true, format: formatAmount },
  // { field: 'rent_period', header: '預收租金期數', visible: true },
  // { field: 'base_rent', header: '租金', visible: true },
  // { field: 'deposit', header: '押金', visible: true },

  { field: 'rece_yn', header: '是否開立業主發票', visible: true, format: formatYN },
  { field: 'pos_yn', header: '是否使用業主收銀機', visible: true, format: formatYN },
  { field: 'cash_yn', header: '是否為業主收現', visible: true, format: formatYN },
  // { field: 'comm_yn', header: '是否為抽成', visible: true, format: formatYN },
  // { field: 'money_type', header: '結帳方式', visible: true },

  // { field: 'store_way', header: '配合方式', visible: true },
  // { field: 'check_type', header: '對帳方式', visible: true },
  // { field: 'paytype', header: '付款方式', visible: true },

  // { field: 'vip_yn', header: '是否配合聯名卡', visible: true, format: formatYN },
  // { field: 'credit_card', header: '聯名卡折數', visible: true },

  // { field: 'total_amt', header: '年目標營業額(業主)', visible: true, format: formatAmount },
  // { field: 'total_amt_vendor', header: '年目標營業額(廠商)', visible: true, format: formatAmount },

  // 保證金 準時開業、施工保證、契約屆滿
  // { field: 'open_deposit', header: '準時開業-保證金付款方式', visible: true },
  // { field: 'open_fees', header: '準時開業保證金金額', visible: true, format: formatAmount },
  // { field: 'construct_deposit', header: '施工保證-保證金付款方式', visible: true },
  // { field: 'construct_fees', header: '施工保證金額', visible: true, format: formatAmount },
  // { field: 'expiration_deposit', header: '契約屆滿-保證金付款方式', visible: true },
  // { field: 'expiration_fees', header: '契約屆滿保證金金額', visible: true, format: formatAmount },
  // { field: 'ticket_remarks', header: '保證票摘要', visible: true },

  // 付款條件
  // { field: 'check_day', header: '結帳後幾日付款', visible: true },
  { field: 'invoice_type', header: '請款單據別', visible: true, format: (value) => getSYS1000('invoice_type', value) },
  // { field: 'email', header: '電子郵件信箱', visible: true },
  // { field: 'invoice_email', header: '發票電子郵件信箱', visible: true },

  // { field: 'CHECK_TITLE', header: '票據抬頭', visible: true },
  // { field: 'store_tel', header: '專櫃電話號碼', visible: true },

  // { field: 'bank_id', header: '廠商匯款銀行代號(含分行代碼)', visible: true },
  // { field: 'vendor_acct_name', header: '廠商帳戶名稱', visible: true },
  // { field: 'vendor_acct_no', header: '廠商銀行帳號', visible: true },

  // { field: 'contact_tel', header: '公司電話號碼', visible: true },
  // { field: 'contact_fax', header: '公司電話傳真', visible: true },
  // { field: 'contact_addr', header: '郵寄地址', visible: true },

  // 抄表資訊
  // { field: 'water_flag', header: '水錶', visible: true, format: formatYN },
  // { field: 'electric_flag', header: '電錶', visible: true, format: formatYN },
  // { field: 'gas_flag', header: '瓦斯錶', visible: true, format: formatYN },

  // 參加活動資訊是提供給UTK系統使用, 固定租金在合約上設定
  // { field: 'cap_saletype1', header: '參加滿千送百', visible: true, format: formatYN },
  { field: 'cap_saletype2', header: '參加全館消費滿額集點', visible: true, format: formatYN },
  // { field: 'cap_saletype3', header: '參加有價券', visible: true, format: formatYN },
  // { field: 'cap_saletype4', header: '參加會員卡', visible: true, format: formatYN },

  // { field: 'tlt_remark', header: '備註', visible: true },

  // { field: 'crt_date', header: '建立日期', visible: true, format: formatDateTime },
  // { field: 'crt_usr_no', header: '建立人員', visible: true },
  // { field: 'crt_usr_name', header: '建立人員姓名', visible: true },
  // { field: 'upd_date', header: '變更日期', visible: true, format: formatDateTime },
  // { field: 'upd_usr_no', header: '變更人員', visible: true },
  // { field: 'upd_usr_name', header: '變更人員姓名', visible: true },

  // { field: 'app_date', header: '核准日期', visible: true, format: formatDateTime },
  // { field: 'app_usr_no', header: '核准人員', visible: true },
  // { field: 'app_usr_name', header: '核准人員姓名', visible: true },

  // 有價券 (Pay_no_Option)
  // { field: 'pay_no_79', header: 'APP提貨單', groupField: '有價券', visible: true, format: formatPayNo, exportFormat: Pay_no_ExportFormat },
  // { field: 'pay_no_77', header: '感熱紙抵用券', groupField: '有價券', visible: true, format: formatPayNo, exportFormat: Pay_no_ExportFormat },
  // { field: 'pay_no_78', header: 'APP抵用券', groupField: '有價券', visible: true, format: formatPayNo, exportFormat: Pay_no_ExportFormat },
  // { field: 'pay_no_62', header: '商品提貨單', groupField: '有價券', visible: true, format: formatPayNo, exportFormat: Pay_no_ExportFormat },
  // { field: 'pay_no_20', header: '禮券', groupField: '有價券', visible: true, format: formatPayNo, exportFormat: Pay_no_ExportFormat },
  // { field: 'pay_no_71', header: '商品抵用券', groupField: '有價券', visible: true, format: formatPayNo, exportFormat: Pay_no_ExportFormat },
  // { field: 'pay_no_72', header: '外來提貨單(抵用券)', groupField: '有價券', visible: true, format: formatPayNo, exportFormat: Pay_no_ExportFormat },
  // { field: 'pay_no_73', header: '外來禮券(抵用券)', groupField: '有價券', visible: true, format: formatPayNo, exportFormat: Pay_no_ExportFormat },
  // { field: 'pay_no_74', header: '活動券(自營)', groupField: '有價券', visible: true, format: formatPayNo, exportFormat: Pay_no_ExportFormat },
  // { field: 'pay_no_75', header: '折價券', groupField: '有價券', visible: true, format: formatPayNo, exportFormat: Pay_no_ExportFormat },
  // { field: 'pay_no_76', header: '現抵', groupField: '有價券', visible: true, format: formatPayNo, exportFormat: Pay_no_ExportFormat },

  { field: 'pay_no_79', header: 'APP提貨單', groupField: '有價券', visible: true, format: formatPayNo, exportFormat: Pay_no_ExportFormat },
  { field: 'pay_no_77', header: '感熱紙抵用券', groupField: '有價券', visible: true, format: formatPayNo, exportFormat: Pay_no_ExportFormat },
  { field: 'pay_no_78', header: 'APP抵用券', groupField: '有價券', visible: true, format: formatPayNo, exportFormat: Pay_no_ExportFormat },
  { field: 'pay_no_62', header: '商品提貨單', groupField: '有價券', visible: true, format: formatPayNo, exportFormat: Pay_no_ExportFormat },
  { field: 'pay_no_20', header: '禮券', groupField: '有價券', visible: true, format: formatPayNo, exportFormat: Pay_no_ExportFormat },
  { field: 'pay_no_71', header: '商品抵用券', groupField: '有價券', visible: true, format: formatPayNo, exportFormat: Pay_no_ExportFormat },
  { field: 'pay_no_72', header: '外來提貨單(抵用券)', groupField: '有價券', visible: true, format: formatPayNo, exportFormat: Pay_no_ExportFormat },
  { field: 'pay_no_73', header: '外來禮券(抵用券)', groupField: '有價券', visible: true, format: formatPayNo, exportFormat: Pay_no_ExportFormat },
  { field: 'pay_no_74', header: '活動券(自營)', groupField: '有價券', visible: true, format: formatPayNo, exportFormat: Pay_no_ExportFormat },
  { field: 'pay_no_75', header: '折價券', groupField: '有價券', visible: true, format: formatPayNo, exportFormat: Pay_no_ExportFormat },
  { field: 'pay_no_76', header: '現抵', groupField: '有價券', visible: true, format: formatPayNo, exportFormat: Pay_no_ExportFormat },
];

export const TLS13060_columnGroup: ColumnGroup[] = [
  { field: '有價券', header: '有價券' },
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
