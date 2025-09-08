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
  { header: '總計', field: 'group_name', hidden: true },
  { header: '收銀機代號', field: 'ECR_No' },
  { header: '專櫃編號', field: 'TLT_NO' },
  { header: '專櫃名稱', field: 'tlt_name' },
  { header: '系統帳', field: 'BOOK_PayAmt', isTotal: true },
  { header: '實收帳', field: 'ACT_PayAmt', isTotal: true },
  { header: '系統/實收帳差異', field: 'OVER_PayAmt', isTotal: true },

  {
    header: '狀況',
    field: 'OVER_PayAmt',
    format: (v: number) => {
      if (v < 0) return '欠';
      if (v === 0) return '平';
      if (v > 0) return '溢';
      return v; // 預設 fallback
    }
  },
  { header: '審核人員', field: 'check_usr_name' },

];

export const creditCardColumns: Column[] = [
  { header: '總計', field: 'group_name', hidden: true },
  { header: '收銀機代號', field: 'ECR_No' },
  { header: '專櫃編號', field: 'TLT_NO' },
  { header: '專櫃名稱', field: 'tlt_name' },

  { header: '信用卡', field: 'BOOK_PayAmt1', groupField: 'BOOK' },
  { header: 'AE', field: 'BOOK_PayAmt2', groupField: 'BOOK' },
  { header: 'DINER', field: 'BOOK_PayAmt3', groupField: 'BOOK' },
  { header: '總金額', field: 'BOOK_PayAmt', isTotal: true },

  { header: '信用卡', field: 'ACT_PayAmt1', groupField: 'ACT' },
  { header: 'AE', field: 'ACT_PayAmt2', groupField: 'ACT' },
  { header: 'DINER', field: 'ACT_PayAmt3', groupField: 'ACT' },
  { header: '總金額', field: 'ACT_PayAmt', isTotal: true },


  { header: '信用卡', field: 'OVER_PayAmt1', groupField: 'OVER' },
  { header: 'AE', field: 'OVER_PayAmt2', groupField: 'OVER' },
  { header: 'DINER', field: 'OVER_PayAmt3', groupField: 'OVER' },
  { header: '總金額', field: 'OVER_PayAmt', isTotal: true },
  {
    header: '審核狀態',
    field: 'check_status',
    format: (v) => {
      // check_status: 'N' = 未審核, 其他 = 已審核
      if (v === 'N' || v === 0) return '未審核';
      if (v === 'Y' || v === 1) return '已審核';
      return v;
    }
  },

  { header: '狀況', field: 'OVER_Status' },
  { header: '審核人員', field: 'check_usr_name' },
  {
    header: '是否有缺單',
    field: 'onAbnormalClick',
    format: (v) => v === 'Y' ? '是' : v === 'N' ? '否' : v
  }
];

export const creditCardGroup: ColumnGroup[] = [
  { field: 'BOOK', header: '系統帳' },
  { field: 'ACT', header: '實收帳' },
  { field: 'OVER', header: '實收帳 - 系統帳' },
];

