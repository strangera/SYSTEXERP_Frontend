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
  ECR_No: string | null;
  TLT_No: string | null;
  TLT_Name: string | null;

  /** 後端帶回的動態付款欄位（巢狀） */
  PayDiffs?: Record<`Pay_Dif_${string}`, number | string | null | undefined>;
  [k: `Pay_Dif_${string}`]: number | any;

  PPay_Dif_sum: number;
}

export interface PayTypeItem {
  No: string;   // 例如 "10"
  Name: string; // 例如 "現金"
}
