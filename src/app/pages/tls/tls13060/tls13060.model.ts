import { getSYS1000 } from "@service/system/sys1000.service";
import { ColumnGroup, formatDateTime } from "@shared/components/table-report/table-report.model";
import { transformOptionsForExport } from "src/app/others/componentextends/basic-print/basic-print-data.component";
import { Column, formatYN } from "../../../others/component/table/table.model";

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
  // 基本資料
  { field: 'upd_date', header: '更新時間', visible: true, format: formatDateTime },
  // { field: 'tlt_bdate', header: '合約起始日期', visible: true, format: formatDate },
  // { field: 'tlt_edate', header: '合約終止日期', visible: true, format: formatDate },
  // { field: 'contract_subno', header: '版次', visible: true },
  // { field: 'building_desc', header: '館別名稱', visible: true },
  // { field: 'tlt_building', header: '館別', visible: true },
  // { field: 'org_id', header: '組織代碼', visible: true },
  // { field: 'org_name', header: '組織名稱', visible: true },
  { field: 'location_no', header: '位置編號', visible: true },
  { field: 'VEN_Name', header: '廠商名稱', visible: true },
  { field: 'tlt_name', header: '專櫃名稱', visible: true },
  { field: 'tlt_no', header: '專櫃編號', visible: true },

  { field: 'pos_yn', header: '是否使用業主收銀機', visible: true, format: formatYN },
  { field: 'rece_yn', header: '是否開立業主發票', visible: true, format: formatYN },
  { field: 'cap_saletype2', header: '會員卡集點', visible: true, format: formatYN },
  { field: 'cash_yn', header: '是否為業主收現', visible: true, format: formatYN },
  { field: 'invoice_type', header: '貨款支付方式', visible: true, format: (value) => getSYS1000('invoice_type', value) },

  // 有價券
  { field: 'pay_no_62', header: '商品提貨單', groupField: '有價券', visible: true, format: formatPayNo, exportFormat: Pay_no_ExportFormat },
  { field: 'pay_no_24', header: '禮券餘代卡', groupField: '有價券', visible: true, format: formatPayNo, exportFormat: Pay_no_ExportFormat },
  { field: 'pay_no_25', header: '提貨單餘代卡', groupField: '有價券', visible: true, format: formatPayNo, exportFormat: Pay_no_ExportFormat },
  { field: 'pay_no_20', header: '禮券', groupField: '有價券', visible: true, format: formatPayNo, exportFormat: Pay_no_ExportFormat },
  { field: 'pay_no_71', header: '商品抵用券', groupField: '有價券', visible: true, format: formatPayNo, exportFormat: Pay_no_ExportFormat },
  { field: 'pay_no_72', header: '外來提貨單(抵用券)', groupField: '有價券', visible: true, format: formatPayNo, exportFormat: Pay_no_ExportFormat },
  { field: 'pay_no_73', header: '外來禮券(抵用券)', groupField: '有價券', visible: true, format: formatPayNo, exportFormat: Pay_no_ExportFormat },
  { field: 'pay_no_74', header: '活動券(自營)', groupField: '有價券', visible: true, format: formatPayNo, exportFormat: Pay_no_ExportFormat },
  { field: 'pay_no_75', header: '折價券', groupField: '有價券', visible: true, format: formatPayNo, exportFormat: Pay_no_ExportFormat },
  { field: 'pay_no_76', header: '現抵', groupField: '有價券', visible: true, format: formatPayNo, exportFormat: Pay_no_ExportFormat },
  { field: 'pay_no_77', header: '感熱紙抵用券', groupField: '有價券', visible: true, format: formatPayNo, exportFormat: Pay_no_ExportFormat },
  { field: 'pay_no_78', header: 'APP抵用券', groupField: '有價券', visible: true, format: formatPayNo, exportFormat: Pay_no_ExportFormat },
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
