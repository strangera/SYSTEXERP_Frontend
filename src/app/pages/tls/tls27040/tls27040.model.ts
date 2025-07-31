import { Column } from "@shared/componentkit/table/table.model"

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

export interface PosConfig {
  columns: Column[];
  formFields: (keyof TLS27040Form)[];
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
    ]
  },
  1: {
    columns: POS6119_columns,
    formFields: [
      'CTBC_TmID', 'CTBC_Date', 'CTBC_CrdNo', 'CTBC_TxnTime', 'CTBC_TxnCode',
      'CTBC_ApprovalCode', 'CTBC_DataType', 'CTBC_TermNo', 'ECR_No',
      'TXN_No', 'TLT_No', 'CTBC_TxnAmt', 'CTBC_Check'
    ]
  },
  2: {
    columns: POS6119P_columns,
    formFields: [
      'CTBC_TmID', 'CTBC_TxnDate', 'CTBC_CrdNo', 'CTBC_TxnType',
      'CTBC_ApprovalCode', 'ECR_No', 'TXN_No', 'TLT_No',
      'CTBC_TxnAmt', 'CTBC_Check'
    ]
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
export const queryFilterOptions = [
  { label: '全部', value: 'all' },
  { label: '未處理', value: 'unprocessed' },
  { label: '已處理', value: 'processed' }
]
