import { SystemOptionsService } from "@service/system/sys1000.service";
import { Column, formatDate, formatDateTime, formatDateTimeToHHMMSS } from "@shared/componentkit/table/table.model"

export const POS6118_columns: Column[] = [
  { field: 'ECR_No', header: '收銀機號' },
  { field: 'TXN_No', header: '交易流水號' },
  { field: 'TLT_No', header: '專櫃編號' },
  { field: 'NCML_TxnAmt', header: '金額' },
  { field: 'NCML_TmID', header: 'EDC號碼' },
  { field: 'NCML_BatCloseDate', header: '請款日期', format: formatDate },
  { field: 'NCML_PayCrdType', header: '卡別', format: (value) => PayCrdTypeOptions.find(item => item.value === value)?.label || value },
  { field: 'NCML_CrdNo', header: '卡號' },
  { field: 'NCML_TxnDate', header: '銷售日期', format: formatDate },
  { field: 'NCML_Date', header: '檔案日期', format: formatDate },
  { field: 'NCML_TxnTime', header: '銷售時間', format: formatDateTimeToHHMMSS },
  { field: 'NCML_TxnType', header: '銷售狀況', format: (value) => TxnTypeOptions.find(item => item.value === value)?.label || value },
  { field: 'NCML_ApprovalCode', header: '授權碼' },
  { field: 'NCML_CrdTxnFg', header: '交易類別', format: (value) => CrdTxnFgOptions.find(item => item.value === value)?.label || value },
  { field: 'NCML_TermNo', header: '分期期數', format: (value) => SystemOptionsService.getOptions('T109').find(item => item.SYS_Code === value)?.SYS_Name || value },
  { field: 'NCML_Check', header: '輸入狀況', format: (value) => CheckOptions.find(item => item.value === value)?.label || value },
  { field: 'acquiring_Bank', header: '分行別' },
  { field: 'CRT_USR_No', header: '建立者' },
  { field: 'CRT_Date', header: '建立日期', format: formatDateTime },
  { field: 'UPD_USR_No', header: '修改者' },
  { field: 'UPD_Date', header: '修改日期', format: formatDateTime },
];
export const POS6119_columns: Column[] = [
  { field: 'ECR_No', header: '收銀機號' },
  { field: 'TXN_No', header: '交易流水號' },
  { field: 'TLT_No', header: '專櫃編號' },
  { field: 'CTBC_TxnAmt', header: '金額' },
  { field: 'CTBC_TmID', header: 'EDC號碼' },
  { field: 'CTBC_Date', header: '請款日期', format: formatDate },
  { field: 'CTBC_PayDate', header: '入帳日', format: formatDateTime },
  { field: 'CTBC_CrdNo', header: '卡號' },
  { field: 'CTBC_TxnTime', header: '銷售日期', format: formatDateTime },
  { field: 'CTBC_TxnCode', header: '銷售狀態', format: (value) => CTBC_TxnCodeOptions.find(item => item.value === value)?.label || value },
  { field: 'CTBC_ApprovalCode', header: '授權碼' },
  { field: 'CTBC_DataType', header: '交易類別', format: (value) => CrdTxnFgOptions.find(item => item.value === value)?.label || value },
  { field: 'CTBC_TermNo', header: '分期期數', format: (value) => SystemOptionsService.getOptions('T109').find(item => item.SYS_Code === value)?.SYS_Name || value },
  { field: 'CTBC_Check', header: '輸入狀況', format: (value) => CheckOptions.find(item => item.value === value)?.label || value },
  { field: 'acquiring_Bank', header: '分行別' },
  { field: 'CRT_USR_No', header: '建立者' },
  { field: 'CRT_Date', header: '建立日期', format: formatDateTime },
  { field: 'UPD_USR_No', header: '修改者' },
  { field: 'UPD_Date', header: '修改日期', format: formatDateTime },
];
export const POS6119P_columns: Column[] = [
  { field: 'ECR_No', header: '收銀機號' },
  { field: 'TXN_No', header: '交易流水號' },
  { field: 'TLT_No', header: '專櫃編號' },
  { field: 'CTBC_TxnAmt', header: '金額' },
  { field: 'CTBC_TmID', header: 'EDC號碼' },
  { field: 'CTBC_BusDate', header: '請款日期', format: formatDate },
  { field: 'CTBC_CrdNo', header: '卡號' },
  { field: 'CTBC_TxnDate', header: '銷售日期', format: formatDate },
  { field: 'CTBC_TxnType', header: '銷售狀況', format: (value) => CTBC_TxnTypeOptions.find(item => item.value === value)?.label || value },
  { field: 'CTBC_ApprovalCode', header: '授權碼' },
  { field: 'CTBC_Check', header: '輸入狀況', format: (value) => CheckOptions.find(item => item.value === value)?.label || value },
  { field: 'acquiring_Bank', header: '分行別' },
  { field: 'CRT_USR_No', header: '建立者' },
  { field: 'CRT_Date', header: '建立日期', format: formatDateTime },
  { field: 'UPD_USR_No', header: '修改者' },
  { field: 'UPD_Date', header: '修改日期', format: formatDateTime },
];
export const TxnTypeOptions = [
  { label: '一般銷售', value: '00' },
  { label: '退貨銷售', value: '04' }
]
export const CTBC_TxnCodeOptions = [
  { label: '正向交易', value: '01' },
  { label: '負向交易', value: '02' }
]
export const CTBC_TxnTypeOptions = [
  { label: '正向交易(銷售)', value: '40' },
  { label: '退款', value: '41' }
]
export const NCML_CrdTxnFgOptions = [
]
// C=一般交易、I=分期交易、R=紅利交易
export const CrdTxnFgOptions = [
  { label: '一般交易', value: 'C' },
  { label: '分期交易', value: 'I' },
  { label: '紅利交易', value: 'R' }
]
export const BusCrdTxnFgOptions = [
  { label: '一般交易', value: 'C' },
]
// Y=比對正確、N=比對錯誤、M=已修正、A=手動新增
export const CheckOptions = [
  { label: '比對正確', value: 'Y' },
  { label: '比對錯誤', value: 'N' },
  { label: '已修正', value: 'M' },
  { label: '手動新增', value: 'A' }
]
export const POS611XOptions = [
  { label: '聯合', value: '0', table: 'POS6118' },
  { label: '中信', value: '1', table: 'POS6119' },
  { label: '中信-停車場', value: '2', table: 'POS6119P' },
]
export const PayCrdTypeOptions = [
  { label: 'VISA', value: 'V' },
  { label: 'MASTER', value: 'M' },
  { label: 'JCB', value: 'J' },
  { label: 'AE', value: 'A' },
  { label: 'DINVER', value: 'D' },
  { label: '銀聯卡', value: 'S' },
  { label: '其他', value: 'O' },
]
export const queryFilterOptions = [
  { label: '收銀機號為空', value: 'ECR_NoBtn' },
  { label: '專櫃編號為空', value: 'StoIDBtn' },
  { label: '專櫃編號不存在', value: 'TLT_NoIsExistBtn' },
  { label: '交易流水號為空', value: 'TXN_NoBtn' },
  { label: '銷售日期為空', value: 'TxnDateBtn' },
  { label: '銷售日期與請款日不同', value: 'DateDifferBtn' },
]
