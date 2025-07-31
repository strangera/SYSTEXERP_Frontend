import { Column } from "@shared/componentkit/table/table.model"

export const TxnTypeOptions = [
  { label: '一般銷售', value: '00' },
  { label: '退貨銷售', value: '04' }
]
export const CrdTxnFgOptions = [
  { label: '一般', value: '0' },
  { label: '分期', value: '1' },
  { label: '紅利', value: '2' }
]
export const CheckOptions = [
  { label: '手刷補登', value: '0' },
  { label: '調整補登', value: '2' },
  { label: 'CardPool欠落', value: '3' }
]
export const POS611XOptions = [
  { label: '銀行A', value: 'A' },
  { label: '銀行B', value: 'B' },
  { label: '銀行C', value: 'C' }
]
export const queryFilterOptions = [
  { label: '全部', value: 'all' },
  { label: '未處理', value: 'unprocessed' },
  { label: '已處理', value: 'processed' }
]
export const POS6118_columns: Column[] = [
  { field: 'ECR_No', header: '收銀機號' },
  { field: 'TXN_No', header: '交易流水號' },
  { field: 'TLT_No', header: '專櫃編號' },
  { field: '', header: '卡別' },
  { field: '', header: '金額' },
  { field: '', header: '銷售日期' },
  { field: '', header: '銷售時間' },
  { field: '', header: '請款日期' },
  { field: '', header: '卡號' },
  { field: '', header: '發票號碼' },
  { field: '', header: 'EDC號碼' },
  { field: '', header: '授權碼' },
  { field: '', header: '銷售狀況' },
  { field: '', header: '交易類別' },
  { field: '', header: '輸入狀況' },
  { field: '', header: '分期期數' },
  { field: '', header: '請款來源' },
  { field: '', header: '建立者' },
  { field: '', header: '建立日期' },
  { field: '', header: '修改者' },
  { field: '', header: '修改日期' },

];
export const POS6119_columns: Column[] = [

];
export const POS6119P_columns: Column[] = [

];
