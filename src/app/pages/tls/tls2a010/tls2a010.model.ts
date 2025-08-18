import { Column, ColumnGroup } from "@shared/componentkit/table/table.model";

export interface TLS2A010Data {
  TXN_Date: string;         // 日期，例如：'2024/05/08'
  ECR_No: string;           // 收銀機代號，例如：'000081'
  ECR_No_Start: string;    // 收銀機代號起始，例如：'000081'
  ECR_No_End: string;      // 收銀機代號結束，例如：'000081'
  TXN_No: string;           // 交易序號
  TLT_NO: string;           // 專櫃編號
  tlt_name: string;         // 專櫃名稱
  TXN_GUINo: string;        // 發票號碼
  CRD_No: string;           // 付款卡號
  TXN_PayAmt: number;       // 付款金額
  check_status: number;     // 審核狀態 (1~4)
  check_Remark: string;     // 備註
}

export const defaultColumns = [
  { header: '收銀機代號', field: 'ECR_No' },
  { header: '專櫃編號', field: 'TLT_NO' },
  { header: '專櫃名稱', field: 'tlt_name' },
  // { header: '付款別', field: 'PAY_NO' },
  { header: '系統帳', field: 'BOOK_PayAmt' },
  { header: '實收帳', field: 'ACT_PayAmt' },
  { header: '系統/實收帳差異', field: 'OVER_PayAmt' },
  // { header: '修正後金額', field: 'MOD_PayAmt' },
  {
    header: '審核狀態',
    field: 'Check_Status',
    format: (v: string) => v === 'Y' ? '已審核' : v === 'N' ? '未審核' : v
  },
  { header: '審核人員', field: 'check_usr_name' },
  {
    header: '是否有缺單',
    field: 'isMissing',
    format: (v: string) => v === 'Y' ? '是' : v === 'N' ? '否' : v
  }
];
export const creditCardColumns: Column[] = [
  { header: '收銀機代號', field: 'ECR_No' },
  { header: '專櫃編號', field: 'TLT_NO' },
  { header: '專櫃名稱', field: 'tlt_name' },

  { header: '信用卡', field: 'SYS_Credit', groupField: 'SYS' },  // if CRD_Type!=A、D 顯示BOOK_PayAmt的值否則0
  { header: 'AE', field: 'SYS_AE', groupField: 'SYS' }, 	      // if CRD_Type=A 顯示BOOK_PayAmt的值否則0
  { header: 'DINER', field: 'SYS_DINER', groupField: 'SYS' },   // if CRD_Type=D 顯示BOOK_PayAmt的值否則0
  { header: '總金額', field: 'SYS_Total' }, 					          // 上面三個加總

  { header: '信用卡', field: 'ACT_Credit', groupField: 'ACT' }, // if CRD_Type!=A、D 顯示ACT_PayAmt的值否則0
  { header: 'AE', field: 'ACT_AE', groupField: 'ACT' }, 	     // if CRD_Type=A 顯示ACT_PayAmt的值否則0
  { header: 'DINER', field: 'ACT_DINER', groupField: 'ACT' },  // if CRD_Type=D 顯示ACT_PayAmt的值否則0
  { header: '總金額', field: 'ACT_Total' },                     // 上面三個加總

  { header: '信用卡', field: 'ACT_SYS_Credit', groupField: 'ACT_SYS' },
  { header: 'AE', field: 'ACT_SYS_AE', groupField: 'ACT_SYS' },
  { header: 'DINER', field: 'ACT_SYS_DINER', groupField: 'ACT_SYS' },
  { header: '總金額', field: 'ACT_SYS_Total' },
  {
    header: '審核狀態',
    field: 'Check_Status',
    format: (v) => v === 'Y' ? '已審核' : v === 'N' ? '未審核' : v
  },
  { header: '審核人員', field: 'check_usr_name' },
  {
    header: '是否有缺單',
    field: 'isMissing',
    format: (v) => v === 'Y' ? '是' : v === 'N' ? '否' : v
  }
];

export const creditCardGroup: ColumnGroup[] = [
  { field: 'SYS', header: '系統帳' },
  { field: 'ACT', header: '實收帳' },
  { field: 'ACT_SYS', header: '實收帳 - 系統帳' },
];

