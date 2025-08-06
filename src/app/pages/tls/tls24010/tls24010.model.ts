import { Column, formatDate } from "@shared/componentkit/table/table.model";

export const TXN_GUIPaperOptions = [
  { label: '補原機台', value: 'E' },
  { label: '手開二聯式發票', value: '2' },
  { label: '交易作廢', value: 'R' },
  { label: '折讓單', value: 'C' }
]
export const txnStatusOptions = [
  { label: '一般交易', value: 'N' },
  { label: '退貨交易', value: 'E' },
  { label: '作廢交易', value: 'D' },
];
export const columns: Column[] = [
  { field: 'TXN_Date', header: '銷售日期', visible: true, format: formatDate },
  { field: 'ECR_No', header: '收銀機號', visible: true },
  { field: 'TXN_No', header: '交易序號', visible: true },
  { field: 'TLT_No', header: '專櫃編號', visible: true },
  { field: 'TLT_Name', header: '專櫃名稱', visible: true },
  { field: 'TXN_Status', header: '交易型態', visible: true, format: (value: string) => txnStatusOptions.find(opt => opt.value === value)?.label || value },
];

export enum FIX_TYPE {
  專櫃編號修正 = '01',
  折扣別修正 = '02',
  抽成類別修正 = '03',
  付款別修正 = '04',
  交易資料作廢 = '06',
  預售交易修正 = '07',
}
export const FIX_TYPE_LABEL: Record<FIX_TYPE, string> = {
  [FIX_TYPE.專櫃編號修正]: '專櫃編號修正',
  [FIX_TYPE.折扣別修正]: '折扣別修正',
  [FIX_TYPE.抽成類別修正]: '抽成類別修正',
  [FIX_TYPE.付款別修正]: '付款別修正',
  [FIX_TYPE.交易資料作廢]: '交易資料作廢',
  [FIX_TYPE.預售交易修正]: '預售交易修正',
};
