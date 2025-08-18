// tls2-b030.model.ts
export interface TLS2B030Request {
  TXN_Date_Start?: string | Date | null;
  TXN_Date_End?: string | Date | null;
  TXN_YearMonth?: string | null;
  TLT_No_List?: string[];
  ECR_No_List?: string[];
  ECR_Type?: string | null;
  tlt_building?: string | null;
  tlt_floor?: string[];
  area_no?: string[];
  OnlyShowOverAmount: boolean;
  pageIndex?: number;
  pageSize?: number;
  SortBy?: { field: string; order: 1 | -1 }[];
}

export interface TLS2B030Row {
  ECR_No: string;
  TLT_No: string;
  TLT_Name: string;
  [k: `Pay_Dif_${string}`]: number;
  PPay_Dif_sum: number;
}

export interface ApiResponse<T> {
  Status: string;        // '0000' 表成功
  Message?: string;
  Data: T;
  TotalCount?: number;
  TotalPage?: number;
}
