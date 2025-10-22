import { SystemOptionsService } from "@service/system/sys1000.service";
import { ReportColumn } from "@shared/componentkit/table-report/table-report.model";
import { Column, formatAmount, formatDate, formatDateTime, formatDateTimeToHHMMSS } from "@shared/componentkit/table/table.model"
// --- POS6118 聯信特店MIS LOG檔案 ---
export const columns: ReportColumn[] = [
  { field: 'ECR_No', header: '收銀機號' }, // 對應 ECR_No
  { field: 'TXN_No', header: '交易流水號' }, // 對應 TXN_No
  { field: 'TLT_No', header: '專櫃編號' }, // 對應 TLT_No
  { field: 'PayCrdType', header: '卡別', format: (value) => PayCrdTypeOptions.find(item => item.value === value)?.label || value }, // 對應 PayCrdType
  { field: 'TxnAmt', header: '金額', format: formatAmount }, // 對應 TxnAmt (number)
  { field: 'TxnDate', header: '銷售日期', format: formatDate }, // 對應 TxnDate (DATE)
  { field: 'TxnTime', header: '銷售時間', format: formatDateTimeToHHMMSS }, // 對應 TxnTime (string/time), 使用新函式只顯示時間
  { field: 'ReqDate', header: '請款日期', format: formatDate }, // 對應 ReqDate (DATE)
  { field: 'CrdNo', header: '卡號' }, // 對應 CrdNo
  { field: 'TmID', header: 'EDC號碼' }, // 對應 TmID
  { field: 'ApprovalCode', header: '授權碼' }, // 對應 ApprovalCode
  { field: 'TxnType', header: '銷售狀況', format: (value) => TxnTypeOptions.find(item => item.value === value)?.label || value }, // 對應 TxnType
  { field: 'CrdTxnFg', header: '交易類別', format: (value) => CrdTxnFgOptions.find(item => item.value === value)?.label || value }, // 對應 CrdTxnFg
  { field: 'CheckStatus', header: '輸入狀態', format: (value) => CheckOptions.find(item => item.value === value)?.label || value }, // 對應 CheckStatus
  { field: 'TermNo', header: '分期期數', format: (value) => SystemOptionsService.getOptions('T109').find(item => item.SYS_Code === String(value))?.SYS_Name || value }, // 對應 TermNo
  { field: 'acquiring_Bank', header: '收單行' }, // 變更標題為 '收單行'
  { field: 'FileName', header: '請款來源' }, // 新增
  { field: 'BatCloseDate', header: '入帳日', format: formatDate }, // 對應 BatCloseDate (DATE), 移至後方
  { field: 'CRT_USR_No', header: '建立者' }, // 對應 CRT_USR_No
  { field: 'CRT_Date', header: '建立日期', format: formatDateTime }, // 對應 CRT_Date (DATETIME)
  { field: 'UPD_USR_No', header: '修改者' }, // 對應 UPD_USR_No
  { field: 'UPD_Date', header: '修改日期', format: formatDateTime }, // 對應 UPD_Date (DATETIME)
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
// C=一般交易、I=分期交易、R=紅利交易
export const CrdTxnFgOptions = [
  { label: '一般交易', value: 'C' },
  { label: '分期交易', value: 'I' },
  { label: '紅利交易', value: 'R' }
];

// 0=手刷補登
// 2=調整補登
// 3=CardPool欠落
export const CheckOptions = [
  { label: '手刷補登', value: '0' },
  { label: '調整補登', value: '2' },
  { label: 'CardPool欠落', value: '3' },
  { label: '比對正確', value: 'Y' },
  { label: '比對錯誤', value: 'N' },
  { label: '已修正', value: 'M' },
  { label: '手動新增', value: 'A' }
];

export const POS611XOptions = [
  { label: '聯合', value: 'POS6118' },
  { label: '中信', value: 'POS6119' },
  { label: '中信-停車場', value: 'POS6119P' },
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
