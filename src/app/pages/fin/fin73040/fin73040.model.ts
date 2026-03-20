import { BaseQueryRequest } from '@shared/models/api/base-api.interface';

export interface FIN73040Data {
  dataKey?: string;

  custodianDept: string;        // 保管人組織
  custodian: string;            // 零用金保管人
  applyDate: Date | string;     // 申請日期
  paymentRequestNo: string;     // 支出請款單號
  paymentDate: Date | string;   // 請款日期
  replenishDate: Date | string | null; // 撥補日期
  replenishAmount: number;      // 撥補金額
  unpaidAmount: number;         // 應付未付金額

  custodianNo?: string;
  custodianDeptNo?: string;
}

export interface FIN73040Query extends BaseQueryRequest {
  paymentRequestNo?: string | null;
  custodianNo?: string | null;
  custodianDeptNo?: string | null;

  applyDateStart?: string | null;
  applyDateEnd?: string | null;

  paymentDateStart?: string | null;
  paymentDateEnd?: string | null;

  replenishDateStart?: string | null;
  replenishDateEnd?: string | null;

  pageIndex: number;
  pageSize: number;
  SortBy?: Array<{ field: string; order: number }>;
}

export interface FIN73040Option {
  label: string;
  value: string;
}