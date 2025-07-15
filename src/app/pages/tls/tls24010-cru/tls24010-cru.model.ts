import { Column } from "../../../shared/componentkit/table/table.model";

export const txnStatusOptions = [
  { label: '一般交易', value: 'N' },
  { label: '退貨交易', value: 'E' },
  { label: '作廢交易', value: 'D' },
];
export const txnTaxTypeOptions = [
  { label: '免稅', value: '0' },
  { label: '應稅', value: '1' },
  { label: '零稅', value: '2' },
];
export const TXN_GUI_CarrTypeOptions = [
  { label: '悠遊載具卡', value: '1K0001' },
  { label: '手機條碼', value: '3J0002' },
  { label: '自然人憑證', value: 'CQ0001' },
  { label: '一卡通載具', value: '1H0001' },
  { label: '信用卡載具', value: 'EK0002' },
  { label: '取消載具', value: '#' },
]
export const POS5007Columns: Column[] = [

]
