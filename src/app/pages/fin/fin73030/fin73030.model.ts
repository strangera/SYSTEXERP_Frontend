import { BaseQueryRequest } from '@shared/models/api/base-api.interface';

export interface FIN73030Data {
  dataKey?: string;

  paymentRequestNo: string;     // 支出請款單號
  createDate: Date | string;    // 產生日期
  status: string;               // 狀態
  printSignOff: boolean;        // 列印簽核欄

  title: string;                // 例如：零用金撥補：TC201502060005
  contentName: string;          // 名稱/摘要/內容
  unit: string;                 // 單位
  quantity: number | null;      // 數量
  unitPrice: number | null;     // 單價
  totalPrice: number;           // 總價
}

export interface FIN73030Query extends BaseQueryRequest {
  paymentRequestNo?: string | null;
  createDateStart?: string | null;
  createDateEnd?: string | null;
  status?: string | null;
  printSignOff?: boolean | null;
  pageIndex: number;
  pageSize: number;
  SortBy?: Array<{ field: string; order: number }>;
}

export interface FIN73030Option {
  label: string;
  value: string;
}