import { ColumnGroup, formatAmount, ReportColumn } from "src/app/shared/components/table-report/table-report.model";

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
export interface RecalculationTLS2A010Request {
  TXN_Date: string;
  ECR_No: string;
  PAY_NO: string;
}
export interface TLS2A010Query {
  pageSize: number;
  pageIndex: number;
  SortBy?: any;
  TXN_Date?: string;
  Floor_No?: string;
  ECR_No_Start?: string;
  ECR_No_End?: string;
  PAY_NO?: string;
  Building_No?: string;
  OVER_Status?: string[];
}


export const defaultColumns: ReportColumn[] = [
  { header: '收銀機代號', field: 'ECR_No' },
  { header: '專櫃編號', field: 'TLT_NO' },
  { header: '櫃位名稱', field: 'tlt_name' },
  { header: '系統帳', field: 'BOOK_PayAmt', isTotal: true, format: formatAmount },
  { header: '原始實收帳', field: 'ACT_PayAmt', isTotal: true, format: formatAmount },
  {
    header: '現行實收帳', field: 'MOD_PayAmt', isTotal: true, format: formatAmount,
    cellClass: (row) => {
      return row.MOD_PayAmt !== row.ACT_PayAmt ? 'text-blue-600 font-bold' : '';
    }
  },
  { header: '系統/實收帳差異', field: 'OVER_PayAmt', isTotal: true, format: formatAmount },
  {
    header: '審核狀態',
    field: 'check_status',
    format: (v: any) => {
      // check_status: 'N' = 未審核, 其他 = 已審核
      if (v === 'N' || v === 0) return '未審核';
      if (v === 'Y' || v === 1) return '已審核';
      return v;
    }
  },
  {
    header: '狀況',
    field: 'OVER_Status',
    cellClass: (row) => getStatusColor(row)
  },
  { header: '審核人員', field: 'check_usr_name' },

];

export const creditCardColumns: ReportColumn[] = [
  { header: '收銀機代號', field: 'ECR_No' },
  { header: '專櫃編號', field: 'TLT_NO' },
  { header: '櫃位名稱', field: 'tlt_name' },

  { header: '信用卡', field: 'BOOK_PayAmt1', groupField: 'BOOK', isTotal: true, format: formatAmount },
  // { header: 'AE', field: 'BOOK_PayAmt2', groupField: 'BOOK', isTotal: true, format: formatAmount },
  // { header: 'DINER', field: 'BOOK_PayAmt3', groupField: 'BOOK', isTotal: true, format: formatAmount },
  // { header: '總金額', field: 'BOOK_PayAmt', isTotal: true, format: formatAmount },

  { header: '信用卡', field: 'ACT_PayAmt1', groupField: 'ACT', isTotal: true, format: formatAmount },
  // { header: 'AE', field: 'ACT_PayAmt2', groupField: 'ACT', isTotal: true, format: formatAmount },
  // { header: 'DINER', field: 'ACT_PayAmt3', groupField: 'ACT', isTotal: true, format: formatAmount },
  // { header: '總金額', field: 'ACT_PayAmt', isTotal: true, format: formatAmount },

  {
    header: '信用卡', field: 'MOD_PayAmt1', groupField: 'MOD', isTotal: true, format: formatAmount,
    cellClass: (row) => {
      return row.MOD_PayAmt1 !== row.ACT_PayAmt1 ? 'text-blue-600 font-bold' : '';
    }
  },
  // { header: 'AE', field: 'MOD_PayAmt2', groupField: 'MOD', isTotal: true, format: formatAmount },
  // { header: 'DINER', field: 'MOD_PayAmt3', groupField: 'MOD', isTotal: true, format: formatAmount },
  // { header: '總金額', field: 'MOD_PayAmt', isTotal: true, format: formatAmount },

  { header: '信用卡', field: 'OVER_PayAmt1', groupField: 'OVER', isTotal: true, format: formatAmount },
  // { header: 'AE', field: 'OVER_PayAmt2', groupField: 'OVER', isTotal: true, format: formatAmount },
  // { header: 'DINER', field: 'OVER_PayAmt3', groupField: 'OVER', isTotal: true, format: formatAmount },
  // { header: '總金額', field: 'OVER_PayAmt', isTotal: true, format: formatAmount },
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
  {
    header: '狀況',
    field: 'OVER_Status',
    cellClass: (row) => getStatusColor(row)
  },
  { header: '審核人員', field: 'check_usr_name' },
  { header: '是否有缺單', field: 'lose_doc' }
];

export const creditCardGroup: ColumnGroup[] = [
  { field: 'BOOK', header: '系統帳' },
  { field: 'ACT', header: '原始實收帳' },
  { field: 'MOD', header: '現行實收帳' },
  { field: 'OVER', header: '系統/實收帳差異' },
];

export const overStatusOptions = [
  {
    label: '平',
    value: '0'
  },
  {
    label: '溢',
    value: '1'
  },
  {
    label: '欠',
    value: '-1'
  }
];

export function getStatusColor(row: any): string {
  switch (row.OVER_Status) {
    case '欠': // 粉紅：欠
      return 'bg-pink-100 text-red-600';
    case '溢': // 綠：溢
      return 'bg-green-100 text-green-700';
    default:
      return '';
  }
}
