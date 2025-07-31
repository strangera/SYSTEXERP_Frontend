import { Column } from "@shared/componentkit/table/table.model"

export const POS6118_columns: Column[] = [
  { field: 'ECR_No', header: '收銀機號' },
  { field: 'TXN_No', header: '交易流水號' },
  { field: 'TLT_No', header: '專櫃編號' },
  { field: 'NCML_PayCrdType', header: '卡別' },
  { field: 'NCML_TxnAmt', header: '金額' },
  { field: 'NCML_TxnDate', header: '銷售日期' },
  { field: 'NCML_TxnTime', header: '銷售時間' },
  { field: 'NCML_BatCloseDate', header: '請款日期' },
  { field: 'NCML_CrdNo', header: '卡號' },
  { field: 'NCML_GUI_No', header: '發票號碼' },
  { field: 'NCML_TmID', header: 'EDC號碼' },
  { field: 'NCML_ApprovalCode', header: '授權碼' },
  { field: 'NCML_TxnType', header: '銷售狀況' },
  { field: 'NCML_CrdTxnFg', header: '交易類別' },
  { field: 'NCML_Check', header: '輸入狀況' },
  { field: 'NCML_TermNo', header: '分期期數' },
  { field: 'NCML_Source', header: '請款來源' },
  { field: 'CRT_USR_No', header: '建立者' },
  { field: 'CRT_Date', header: '建立日期' },
  { field: 'UPD_USR_No', header: '修改者' },
  { field: 'UPD_Date', header: '修改日期' },
  // acquiring_Bank
];
export const POS6119_columns: Column[] = [
  { field: 'ECR_No', header: '收銀機號' },
  { field: 'TXN_No', header: '交易流水號' },
  { field: 'TLT_No', header: '專櫃編號' },
  { field: 'CTBC_TxnAmt', header: '金額' },
  { field: 'CTBC_TxnTime', header: '銷售日期' },
  { field: 'CTBC_Date', header: '請款日期' },
  { field: 'CTBC_CrdNo', header: '卡號' },
  { field: 'CTBC_GUI_No', header: '發票號碼' },
  { field: 'CTBC_TmID', header: 'EDC號碼' },
  { field: 'CTBC_ApprovalCode', header: '授權碼' },
  { field: 'CTBC_TxnCode', header: '銷售狀態' },
  { field: 'CTBC_DataType', header: '交易類別' },
  { field: 'CTBC_Check', header: '輸入狀況' },
  { field: 'CTBC_TermNo', header: '分期期數' },
  { field: 'CRT_USR_No', header: '建立者' },
  { field: 'CRT_Date', header: '建立日期' },
  { field: 'UPD_USR_No', header: '修改者' },
  { field: 'UPD_Date', header: '修改日期' },
];
export const POS6119P_columns: Column[] = [
  { field: 'ECR_No', header: '收銀機號' },
  { field: 'TXN_No', header: '交易流水號' },
  { field: 'TLT_No', header: '專櫃編號' },
  { field: 'CTBC_TxnAmt', header: '金額' },
  { field: 'CTBC_TxnDate', header: '銷售日期' },
  { field: 'CTBC_BusDate', header: '請款日期' },
  { field: 'CTBC_CrdNo', header: '卡號' },
  { field: 'CTBC_GUI_No', header: '發票號碼' },
  { field: 'CTBC_TmID', header: 'EDC號碼' },
  { field: 'CTBC_ApprovalCode', header: '授權碼' },
  { field: 'CTBC_TxnType', header: '交易類型' },
  { field: 'CTBC_DataType', header: '交易類別' },
  { field: 'CTBC_Check', header: '輸入狀況' },
  { field: 'CTBC_TermNo', header: '分期期數' },
  { field: 'CTBC_Source', header: '請款來源' },
  { field: 'CRT_USR_No', header: '建立者' },
  { field: 'CRT_Date', header: '建立日期' },
  { field: 'UPD_USR_No', header: '修改者' },
  { field: 'UPD_Date', header: '修改日期' },
];

export interface PosConfig {
  columns: Column[];
  formFields: (keyof TLS27040Form)[];
  api: string;
}

export interface TLS27040Form {
  POS611X?: string;

  // 聯合
  NCML_TmID?: string;
  NCML_BatCloseDate?: Date;
  NCML_PayCrdType?: string;
  NCML_CrdNo?: string;
  NCML_TxnDate?: Date;
  NCML_TxnTime?: string;
  NCML_TxnType?: string;
  NCML_ApprovalCode?: string;
  NCML_CrdTxnFg?: string;
  NCML_TermNo?: string;
  NCML_TxnAmt?: number;
  NCML_Check?: string;

  // 中信 / 停車
  CTBC_TmID?: string;
  CTBC_Date?: Date;
  CTBC_TxnDate?: Date;
  CTBC_TxnTime?: string;
  CTBC_TxnCode?: string;
  CTBC_TxnType?: string;
  CTBC_CrdNo?: string;
  CTBC_ApprovalCode?: string;
  CTBC_DataType?: string;
  CTBC_TermNo?: string;
  CTBC_TxnAmt?: number;
  CTBC_Check?: string;

  // 共用
  ECR_No?: string;
  TXN_No?: string;
  TLT_No?: string;
}

export const POS611X_CONFIGS: Record<string, PosConfig> = {
  0: {
    columns: POS6118_columns,
    formFields: [
      'NCML_TmID', 'NCML_BatCloseDate', 'NCML_PayCrdType', 'NCML_CrdNo',
      'NCML_TxnDate', 'NCML_TxnTime', 'NCML_TxnType', 'NCML_ApprovalCode',
      'NCML_CrdTxnFg', 'NCML_TermNo', 'ECR_No', 'TXN_No', 'TLT_No',
      'NCML_TxnAmt', 'NCML_Check'
    ],
    api: 'queryPOS6118'
  },
  1: {
    columns: POS6119_columns,
    formFields: [
      'CTBC_TmID', 'CTBC_Date', 'CTBC_CrdNo', 'CTBC_TxnTime', 'CTBC_TxnCode',
      'CTBC_ApprovalCode', 'CTBC_DataType', 'CTBC_TermNo', 'ECR_No',
      'TXN_No', 'TLT_No', 'CTBC_TxnAmt', 'CTBC_Check'
    ],
    api: 'queryPOS6119'
  },
  2: {
    columns: POS6119P_columns,
    formFields: [
      'CTBC_TmID', 'CTBC_TxnDate', 'CTBC_CrdNo', 'CTBC_TxnType',
      'CTBC_ApprovalCode', 'ECR_No', 'TXN_No', 'TLT_No',
      'CTBC_TxnAmt', 'CTBC_Check'
    ],
    api: 'queryPOS6119P'
  }
};
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
export const CrdTxnFgOptions = [
  { label: '一般', value: '0' },
  { label: '分期', value: '1' },
  { label: '紅利', value: '2' }
]
export const BusCrdTxnFgOptions = [
  { label: '一般', value: '0' },
]
export const CheckOptions = [
  { label: '手刷補登', value: '0' },
  { label: '調整補登', value: '2' },
  { label: 'CardPool欠落', value: '3' }
]
export const POS611XOptions = [
  { label: '聯合', value: '0' },
  { label: '中信', value: '1' },
  { label: '中信-停車場', value: '2' }
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
  { label: '收銀機號為空', value: '00' },
  { label: '專櫃編號為空', value: '01' },
  { label: '專櫃編號不存在', value: '02' },
  { label: '交易流水號為空', value: '03' },
  { label: '銷售日期為空', value: '04' },
  { label: '銷售日期與請款日不同', value: '05' },
]
