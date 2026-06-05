import { ReportColumn } from "@shared/componentkit/table-report/table-report.model";
import { formatDate, formatDateTime } from "@shared/componentkit/table/table.model";

export enum TXN_GUIPAPER {
  補原機台 = 'E',
  手開發票 = '2',
  交易作廢取消 = 'R',
  折讓單交易取消 = 'C',
  交易修正 = 'M'
}

export const TXN_GUIPaperOptions = [
  { label: '補原機台', value: 'E' },
  { label: '手開發票', value: '2' },
  { label: '交易作廢取消', value: 'R' },
  { label: '折讓單交易取消', value: 'C' },
  { label: '交易修正', value: 'M' }// 非P  modify
]
export enum TXN_STATUS {
  一般交易 = 'N',
  退貨交易 = 'E',
  作廢交易 = 'D'
}
export const txnStatusOptions = [
  { label: '一般交易', value: 'N' },
  { label: '退貨交易', value: 'E' },
  { label: '作廢交易', value: 'D' },
];
export const columns: ReportColumn[] = [
  { field: 'TXN_Date', header: '銷售日期', format: formatDate },
  { field: 'ECR_No', header: '收銀機號' },
  { field: 'TXN_No', header: '交易序號', format: (value: string) => value.padStart(8, '0') },
  { field: 'TLT_No', header: '專櫃編號' },
  { field: 'TLT_Name', header: '專櫃名稱' },
  { field: 'TXN_Status', header: '交易型態', format: (value: string) => txnStatusOptions.find(opt => opt.value === value)?.label || value },
  { field: 'CRT_USR_Name', header: '補登者' },
  { field: 'CRT_Date', header: '補登日期', format: formatDateTime },
];

export const C_columns: ReportColumn[] = [
  { field: 'TXN_Ret_No', header: '折讓單號' },
  ...columns
];

export enum FIX_TYPE {
  專櫃編號修正 = '01',
  折扣別修正 = '02',
  抽成類別修正 = '03',
  付款別修正 = '04',
  交易資料作廢 = '06',
  預售交易修正 = '07',
  刪除交易 = '08',
}
export const FIX_TYPE_LABEL: Record<FIX_TYPE, string> = {
  [FIX_TYPE.專櫃編號修正]: '專櫃編號修正',
  [FIX_TYPE.折扣別修正]: '折扣別修正',
  [FIX_TYPE.抽成類別修正]: '抽成類別修正',
  [FIX_TYPE.付款別修正]: '付款別修正',
  [FIX_TYPE.交易資料作廢]: '交易資料作廢',
  [FIX_TYPE.預售交易修正]: '預售交易修正',
  [FIX_TYPE.刪除交易]: '刪除交易',
};
