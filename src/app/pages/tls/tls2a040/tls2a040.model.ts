import { Column, formatAmount, formatDate } from "@shared/componentkit/table/table.model";
import { formatTxnNo } from "@shared/models/system/query-form.model";

// 定義共用欄位
const commonHeaderColumns: Column[] = [
  { field: 'TXN_Date', header: '銷售日期', format: formatDate },
  { field: 'ECR_No', header: '收銀機號' },
  { field: 'TXN_No', header: '交易序號', format: formatTxnNo },
  { field: 'TLT_No', header: '專櫃編號' },
  { field: 'tlt_name', header: '櫃位名稱' },
];
const commonTailColumns: Column[] = [
  { field: 'TXN_PayAmt', header: '金額', format: formatAmount, align: 'right' },
  { field: 'check_status_Name', header: '狀況' },
  { field: 'check_remark', header: '備註' },
];

export const DOC_TYPE_COLUMNS: Record<string, Column[]> = {
  'creditcard': [
    ...commonHeaderColumns,
    { field: 'CRD_No', header: '信用卡卡號' },
    ...commonTailColumns,
  ],
  'voucher': [
    ...commonHeaderColumns,
    { field: 'CPN_No', header: '券號' },
    ...commonTailColumns,
  ],
  'voidInvoice': [
    ...commonHeaderColumns,
    { field: 'TXN_GUIBegNo', header: '發票號碼' },
    ...commonTailColumns,
  ]
};