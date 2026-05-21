import { getSYS1000, getSYS1000Options } from "@service/system/sys1000.service";
import { transformOptionsForExport } from "@shared/componentextends/basic-print/basic-print-data.component";
import { ReportColumn } from "@shared/componentkit/table-report/table-report.model";
import { formatAmount, formatDate, formatDateTime } from "@shared/componentkit/table/table.model";
import { formatTxnNo } from "@shared/models/system/query-form.model";
// --- POS6118 聯信特店MIS LOG檔案 ---
export const columns: ReportColumn[] = [
  { field: 'ECR_No', header: '收銀機號' }, // 對應 ECR_No
  { field: 'TXN_No', header: '交易流水號', format: formatTxnNo }, // 對應 TXN_No
  { field: 'TLT_No', header: '專櫃編號' }, // 對應 TLT_No
  { field: 'CRD_Type_Name', header: '卡別', sortField: 'CRD_Type' }, // 對應 CRD_Type
  { field: 'TxnAmt', header: '金額', format: formatAmount, isTotal: true, align: 'right' }, // 對應 TxnAmt (number)
  { field: 'AccTxnDate', header: '帳務日期', format: formatDate },
  { field: 'TxnDate', header: '銷售日期', format: formatDate }, // 對應 TxnDate (DATE)
  { field: 'TxnTime', header: '銷售時間' }, // 對應 TxnTime (string->HHmmss)
  { field: 'ReqDate', header: '請款日期', format: formatDate }, // 對應 ReqDate (DATE)
  { field: 'CrdNo', header: '卡號' }, // 對應 CrdNo
  { field: 'TmID', header: 'EDC號碼' }, // 對應 TmID
  { field: 'ApprovalCode', header: '授權碼' }, // 對應 ApprovalCode
  { field: 'TxnType', header: '銷售狀況', format: (value) => TxnTypeOptions.find(item => item.value === value)?.label || value }, // 對應 TxnType
  { field: 'CrdTxnFg', header: '交易類別', format: (value) => CrdTxnFgOptions.find(item => item.value === value)?.label || value }, // 對應 CrdTxnFg
  // { field: 'CheckStatus', header: '比對備註', format: (value) => getSYS1000('CTBC_Check', value) }, // 對應 CheckStatus
  { field: 'EntryFg_Name', header: '輸入狀態', sortField: 'EntryFg' }, // 對應 EntryFg
  { field: 'TermNo', header: '分期期數', format: (value) => getSYS1000('T109', value), exportFormat: transformOptionsForExport(getSYS1000Options('T109')) }, // 對應 TermNo
  { field: 'acquiring_Bank', header: '收單行' }, // 變更標題為 '收單行'
  { field: 'FileName', header: '請款來源' }, // 新增
  { field: 'BatCloseDate', header: '入帳日', format: formatDate }, // 對應 BatCloseDate (DATE), 移至後方
  { field: 'CRT_USR_No', header: '建立者' }, // 對應 CRT_USR_No
  { field: 'CRT_Date', header: '建立日期', format: formatDateTime }, // 對應 CRT_Date (DATETIME)
  { field: 'UPD_USR_No', header: '修改者' }, // 對應 UPD_USR_No
  { field: 'UPD_Date', header: '修改日期', format: formatDateTime }, // 對應 UPD_Date (DATETIME)
];
// --- 選項定義（保持不變，或根據實際需求調整） ---
export const queryTxnTypeOptions = [
  {
    label: '一般銷售',
    value: ['00', '01', '40'] // 一般銷售對應的三個代碼
  },
  {
    label: '退貨銷售',
    value: ['04', '02', '41'] // 退貨銷售對應的三個代碼
  }
];
export const TxnTypeOptions = [
  { label: '一般銷售', value: '00' },
  { label: '退貨銷售', value: '04' },
  { label: '一般銷售', value: '01' },
  { label: '退貨銷售', value: '02' },
  { label: '一般銷售', value: '40' },
  { label: '退貨銷售', value: '41' }
]
// 聯信 POS6118 (交易類型)
export const POS6118_TxnTypeOptions = [
  { label: '一般銷售', value: '00' },
  { label: '退貨銷售', value: '04' }
];
// 中信 POS6119 (交易類型)
export const POS6119_TxnCodeOptions = [
  { label: '正向交易', value: '01' },
  { label: '負向交易', value: '02' }
];
// 中信-停車場 POS6119P (交易類型)
export const POS6119P_TxnTypeOptions = [
  { label: '請款', value: '40' },
  { label: '退款', value: '41' }
];
export const queryCrdTxnFgOptions = [
  {
    label: '一般',
    value: ['C', '0'] // 一般銷售對應的三個代碼
  },
  {
    label: '分期',
    value: ['I', '1'] // 一般銷售對應的三個代碼
  },
  {
    label: '紅利',
    value: ['R', '2'] // 一般銷售對應的三個代碼
  }
];
export const CrdTxnFgOptions = [
  { label: '一般', value: '0' },
  { label: '分期', value: '1' },
  { label: '紅利', value: '2' },
  { label: '一般', value: 'C' },
  { label: '分期', value: 'I' },
  { label: '紅利', value: 'R' }
];
export const pos6118TxnFgOptions = [
  { label: '一般', value: '0' },
  { label: '分期', value: '1' },
  { label: '紅利', value: '2' },
];
export const pos6119TxnFgOptions = [
  { label: '一般', value: 'C' },
  { label: '分期', value: 'I' },
  { label: '紅利', value: 'R' }
];
export const pos6119pTxnFgOptions = [
  { label: '一般', value: 'C' },
];

export const POS611XOptions = [
  { label: '聯合', value: 'POS6118' },
  { label: '聯合-宏誌', value: 'POS6118H' },
  { label: '中信', value: 'POS6119' },
  { label: '中信-停車場', value: 'POS6119P' },
];

export const queryFilterOptions = [
  { label: '收銀機號為空', value: 'ECR_NoBtn' },
  { label: '專櫃編號為空', value: 'TLT_NoBtn' },
  { label: '專櫃編號不存在', value: 'TLT_NoIsExistBtn' },
  { label: '交易流水號為空', value: 'TXN_NoBtn' },
  { label: '銷售日期為空', value: 'TxnDateBtn' },
  { label: '銷售日期與請款日不同', value: 'DateDifferBtn' },
];
