import { BaseQueryRequest } from '@shared/models/api/base-api.interface';

export interface FIN73010Data {
  dataKey?: string;

  pettyCashNo: string;          // 零用金單號
  applyDate: Date | string;     // 申請日期
  applicantNo: string;          // 零用金申請人編號
  applicantName: string;        // 零用金申請人
  applicantDept: string;        // 申請人組織
  custodianNo: string;          // 零用金保管人編號
  custodianName: string;        // 零用金保管人
  custodianDept: string;        // 保管單位
  status: string;               // 狀態
  expenseAccountNo: string;     // 費用會計科目
  expenseAccountName: string;   // 費用科目名稱
  expenseDeptNo: string;        // 費用科目組織
  expenseDeptName: string;      // 費用科目組織名稱
  subjectSummary: string;       // 項目摘要
  detailCategory: string;       // 明細類別
  invoiceReceiptNo: string;     // 發票/收據號碼
  expenseDate: Date | string;   // 日期
  amountUntaxed: number;        // 未稅金額
  tax: number;                  // 稅額
  total: number;                // 總額
}

export interface FIN73010Query extends BaseQueryRequest {
  pettyCashNo?: string | null;
  applyDateStart?: string | null;
  applyDateEnd?: string | null;
  applicantNo?: string | null;
  custodianNo?: string | null;
  status?: string | null;
  custodianDeptNo?: string | null;
  pageIndex: number;
  pageSize: number;
  SortBy?: Array<{ field: string; order: number }>;
}

export interface FIN73010Option {
  label: string;
  value: string;
}