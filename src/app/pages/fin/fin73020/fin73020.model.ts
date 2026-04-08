import { BaseQueryRequest } from '@shared/models/api/base-api.interface';

export interface FIN73020Data {
  dataKey?: string;

  paymentRequestNo: string;     // 支出請款單號
  createDate: Date | string;    // 產生日期
  status: string;               // 狀態

  pettyCashNo: string;          // 零用金單號
  applyDate: Date | string;     // 申請日期
  applicant: string;            // 申請人
  applicantDept: string;        // 申請人組織
  custodian: string;            // 零用金保管人

  expenseAccount: string;       // 費用會計科目
  expenseDept: string;          // 科目組織代號
  subjectSummary: string;       // 項目摘要
  detailCategory: string;       // 明細類別
  receiptNo: string;            // 發票/收據號碼
  expenseDate: Date | string;   // 日期
  amountUntaxed: number;        // 未稅金額
  tax: number;                  // 稅額
  total: number;                // 總額
  voucherNo: string;            // 傳票號碼

  applicantNo?: string;
  custodianNo?: string;
  custodianDeptNo?: string;
}

export interface FIN73020Query extends BaseQueryRequest {
  paymentRequestNo?: string | null;
  createDateStart?: string | null;
  createDateEnd?: string | null;
  applicantNo?: string | null;
  custodianNo?: string | null;
  status?: string | null;
  custodianDeptNo?: string | null;
  pageIndex: number;
  pageSize: number;
  SortBy?: Array<{ field: string; order: number }>;
}

export interface FIN73020Option {
  label: string;
  value: string;
}