import { SystemOptionsService } from "@service/system/sys1000.service";
import { Column, formatAmount, formatDate, formatDateTime, formatDateTimeToHHMMSS } from "@shared/componentkit/table/table.model"
// --- POS6118 聯信特店MIS LOG檔案 ---
export const POS6118_columns: Column[] = [
  { field: 'ECR_No', header: '收銀機號' }, // 對應 POS6118.ECR_No
  { field: 'TXN_No', header: '交易流水號' }, // 對應 POS6118.TXN_No
  { field: 'TLT_No', header: '專櫃編號' }, // 對應 POS6118.TLT_No
  { field: 'NCML_TxnAmt', header: '金額', format: formatAmount }, // 對應 POS6118.NCML_TxnAmt
  { field: 'NCML_TmID', header: 'EDC號碼' }, // 對應 POS6118.NCML_TmID
  { field: 'NCML_BatCloseDate', header: '入帳日', format: formatDate }, // 對應 POS6118.NCML_BatCloseDate (DATE)
  { field: 'NCML_PayCrdType', header: '卡別', format: (value) => PayCrdTypeOptions.find(item => item.value === value)?.label || value }, // 對應 POS6118.NCML_PayCrdType
  { field: 'NCML_CrdNo', header: '卡號' }, // 對應 POS6118.NCML_CrdNo
  { field: 'NCML_TxnDate', header: '銷售日期', format: formatDate }, // 對應 POS6118.NCML_TxnDate (DATE)
  { field: 'NCML_TxnTime', header: '銷售時間', format: formatDateTimeToHHMMSS }, // 對應 POS6118.NCML_TxnTime (DATETIME), 使用新函式只顯示時間
  { field: 'NCML_Date', header: '請款日期', format: formatDate }, // 對應 POS6118.NCML_Date (DATE)
  { field: 'NCML_TxnType', header: '銷售狀況', format: (value) => TxnTypeOptions.find(item => item.value === value)?.label || value }, // 對應 POS6118.NCML_TxnType
  { field: 'NCML_ApprovalCode', header: '授權碼' }, // 對應 POS6118.NCML_ApprovalCode
  { field: 'NCML_CrdTxnFg', header: '交易類別', format: (value) => CrdTxnFgOptions.find(item => item.value === value)?.label || value }, // 對應 POS6118.NCML_CrdTxnFg
  { field: 'NCML_TermNo', header: '分期期數', format: (value) => SystemOptionsService.getOptions('T109').find(item => item.SYS_Code === String(value))?.SYS_Name || value }, // 對應 POS6118.NCML_TermNo
  { field: 'NCML_Check', header: '輸入狀況', format: (value) => CheckOptions.find(item => item.value === value)?.label || value }, // 對應 POS6118.NCML_Check
  { field: 'acquiring_Bank', header: '分行別' },
  { field: 'CRT_USR_No', header: '建立者' }, // 對應 POS6118.CRT_USR_No
  { field: 'CRT_Date', header: '建立日期', format: formatDateTime }, // 對應 POS6118.CRT_Date (DATETIME)
  { field: 'UPD_USR_No', header: '修改者' }, // 對應 POS6118.UPD_USR_No
  { field: 'UPD_Date', header: '修改日期', format: formatDateTime }, // 對應 POS6118.UPD_Date (DATETIME)
];

// --- POS6119 中信信用卡帳務檔 ---
export const POS6119_columns: Column[] = [
  { field: 'ECR_No', header: '收銀機號' }, // 對應 POS6119.ECR_No
  { field: 'TXN_No', header: '交易流水號' }, // 對應 POS6119.TXN_No
  { field: 'TLT_No', header: '專櫃編號' }, // 對應 POS6119.TLT_No
  { field: 'CTBC_TxnAmt', header: '金額', format: formatAmount }, // 對應 POS6119.CTBC_TxnAmt
  { field: 'CTBC_TmID', header: 'EDC號碼' }, // 對應 POS6119.CTBC_TmID
  { field: 'CTBC_Date', header: '請款日期', format: formatDate }, // 對應 POS6119.CTBC_Date (DATE)
  { field: 'CTBC_PayDate', header: '入帳日', format: formatDate }, // 對應 POS6119.CTBC_PayDate (DATE), 應為 formatDate
  { field: 'CTBC_TxnTime', header: '銷售日期', format: formatDateTime }, // 對應 POS6119.CTBC_TxnTime (DATETIME), 標題改為「交易時間」更精確
  { field: 'CTBC_CrdNo', header: '卡號' }, // 對應 POS6119.CTBC_CrdNo
  { field: 'CTBC_TxnCode', header: '交易類別碼', format: (value) => CTBC_TxnCodeOptions.find(item => item.value === value)?.label || value }, // 對應 POS6119.CTBC_TxnCode, 標題改為「交易類別碼」
  { field: 'CTBC_ApprovalCode', header: '授權碼' }, // 對應 POS6119.CTBC_ApprovalCode
  { field: 'CTBC_DataType', header: '資料型態', format: (value) => CrdTxnFgOptions.find(item => item.value === value)?.label || value }, // 對應 POS6119.CTBC_DataType, 標題改為「資料型態」
  { field: 'CTBC_TermNo', header: '分期期數', format: (value) => SystemOptionsService.getOptions('T109').find(item => item.SYS_Code === String(value))?.SYS_Name || value }, // 對應 POS6119.CTBC_TermNo
  { field: 'CTBC_Check', header: '輸入狀況', format: (value) => CheckOptions.find(item => item.value === value)?.label || value }, // 對應 POS6119P.CTBC_Check
  { field: 'acquiring_Bank', header: '分行別' },
  { field: 'CRT_USR_No', header: '建立者' }, // 對應 POS6119.CRT_USR_No
  { field: 'CRT_Date', header: '建立日期', format: formatDateTime }, // 對應 POS6119.CRT_Date (DATETIME)
  { field: 'UPD_USR_No', header: '修改者' }, // 對應 POS6119.UPD_USR_No
  { field: 'UPD_Date', header: '修改日期', format: formatDateTime }, // 對應 POS6119.UPD_Date (DATETIME)
];

// --- POS6119P 中信信用卡帳務檔-停車場 ---
export const POS6119P_columns: Column[] = [
  { field: 'ECR_No', header: '收銀機號' }, // 對應 POS6119P.ECR_No
  { field: 'TXN_No', header: '交易流水號' }, // 對應 POS6119P.TXN_No
  { field: 'TLT_No', header: '專櫃編號' }, // 對應 POS6119P.TLT_No
  { field: 'CTBC_TxnAmt', header: '金額', format: formatAmount }, // 對應 POS6119P.CTBC_TxnAmt
  { field: 'CTBC_TmID', header: 'EDC號碼' }, // 對應 POS6119P.CTBC_TmID
  { field: 'CTBC_CrdNo', header: '卡號' }, // 對應 POS6119P.CTBC_CrdNo
  { field: 'CTBC_TxnDate', header: '銷售日期', format: formatDate }, // 對應 POS6119P.CTBC_TxnDate (DATE)
  { field: 'CTBC_Date', header: '請款日期', format: formatDate }, // 對應 POS6119P.CTBC_Date (DATE)
  { field: 'CTBC_PayDate', header: '入帳日', format: formatDate }, // 對應 POS6119P.CTBC_PayDate (DATE), 應為 formatDate
  { field: 'CTBC_TxnType', header: '交易類型', format: (value) => CTBC_TxnTypeOptions.find(item => item.value === value)?.label || value }, // 對應 POS6119P.CTBC_TxnType, 標題改為「交易類型」
  { field: 'CTBC_ApprovalCode', header: '授權碼' }, // 對應 POS6119P.CTBC_ApprovalCode
  { field: 'CTBC_Check', header: '輸入狀況', format: (value) => CheckOptions.find(item => item.value === value)?.label || value }, // 對應 POS6119P.CTBC_Check
  { field: 'acquiring_Bank', header: '分行別' },
  { field: 'CRT_USR_No', header: '建立者' }, // 對應 POS6119P.CRT_USR_No
  { field: 'CRT_Date', header: '建立日期', format: formatDateTime }, // 對應 POS6119P.CRT_Date (DATETIME)
  { field: 'UPD_USR_No', header: '修改者' }, // 對應 POS6119P.UPD_USR_No
  { field: 'UPD_Date', header: '修改日期', format: formatDateTime }, // 對應 POS6119P.UPD_Date (DATETIME)
];

// --- 選項定義（保持不變，或根據實際需求調整） ---
export const TxnTypeOptions = [
  { label: '一般銷售', value: '00' },
  { label: '退貨銷售', value: '04' }
];

export const CTBC_TxnCodeOptions = [
  { label: '正向交易', value: '01' },
  { label: '負向交易', value: '02' }
];

export const CTBC_TxnTypeOptions = [
  { label: '請款', value: '40' }, // 交易類型，40=請款
  { label: '退款', value: '41' }  // 交易類型，41=退款
];

// `NCML_CrdTxnFgOptions` 是一個空陣列，如果沒有實際用途可以移除
// export const NCML_CrdTxnFgOptions = [];

// C=一般交易、I=分期交易、R=紅利交易
export const CrdTxnFgOptions = [
  { label: '一般交易', value: 'C' },
  { label: '分期交易', value: 'I' },
  { label: '紅利交易', value: 'R' }
];

export const BusCrdTxnFgOptions = [
  { label: '一般交易', value: 'C' },
];

// Y=比對正確、N=比對錯誤、M=已修正、A=手動新增
// export const CheckOptions = [
//   { label: '比對正確', value: 'Y' },
//   { label: '比對錯誤', value: 'N' },
//   { label: '已修正', value: 'M' },
//   { label: '手動新增', value: 'A' }
// ];
// 0=手刷補登
// 2=調整補登
// 3=CardPool欠落
export const CheckOptions = [
  { label: '手刷補登', value: '0' },
  { label: '調整補登', value: '2' },
  { label: 'CardPool欠落', value: '3' },
];

export const POS611XOptions = [
  { label: '聯合', value: '0', table: 'POS6118' },
  { label: '中信', value: '1', table: 'POS6119' },
  { label: '中信-停車場', value: '2', table: 'POS6119P' },
];

export const PayCrdTypeOptions = [
  { label: 'VISA', value: 'V' },
  { label: 'MASTER', value: 'M' },
  { label: 'JCB', value: 'J' },
  { label: 'AE', value: 'A' },
  { label: 'DINVER', value: 'D' },
  { label: '銀聯卡', value: 'S' },
  { label: '其他', value: 'O' },
];

export const queryFilterOptions = [
  { label: '收銀機號為空', value: 'ECR_NoBtn' },
  { label: '專櫃編號為空', value: 'StoIDBtn' },
  { label: '專櫃編號不存在', value: 'TLT_NoIsExistBtn' },
  { label: '交易流水號為空', value: 'TXN_NoBtn' },
  { label: '銷售日期為空', value: 'TxnDateBtn' },
  { label: '銷售日期與請款日不同', value: 'DateDifferBtn' },
];

export const queryFilterForPos6119POptions = [
  { label: '收銀機號為空', value: 'ECR_NoBtn' },
  { label: '專櫃編號為空', value: 'StoIDBtn' },
  { label: '交易流水號為空', value: 'TXN_NoBtn' },
  { label: '銷售日期為空', value: 'TxnDateBtn' },
  { label: '銷售日期與請款日不同', value: 'DateDifferBtn' },
];
