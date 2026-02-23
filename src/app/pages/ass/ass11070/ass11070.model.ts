/**
 * ASS11070 備用供應商資料維護作業 - 資料模型
 */
export interface ASS11070Data {
  RowNum?: number;
  /** 主鍵，供 table-report dataKey 使用 */
  VendorID?: string | number;
  CreateDate?: string;
  VendorUID?: string;
  VendorName?: string;
  ContactPerson?: string;
  ContactPhone?: string;
  ContactCellphone?: string;
  [key: string]: string | number | undefined;
}

/**
 * ASS11070 查詢請求參數
 */
export interface ASS11070QueryRequest {
  CreateDate_S?: string;
  CreateDate_E?: string;
  ReceptionPerson?: string;
  VendorUID?: string;
  BussinessModel?: number;
  VendorCName?: string;
  VendorEName?: string;
  ContactPerson?: string;
  ContactPhone?: string;
  ContactTitle?: string;
  ContactFax?: string;
  ContactCellphone?: string;
  ContactEmail?: string;
  CompanyAddress?: string;
  CompanyResponsibility?: string;
  PaymentMethod?: number;
  TicketPeriod_S?: string;
  TicketPeriod_E?: string;
  Services?: string;
  Remark?: string;
  PageSize?: number;
  PageIndex?: number;
  SortBy?: { field: string; order: number }[];
}

/** 查詢回應資料結構（後端若回傳包裝物件時使用） */
export interface ASS11070QueryDataWrapper {
  TotalCount: number;
  QueryData?: ASS11070Data[];
  Data?: ASS11070Data[];
}

/** 新增請求參數（與表單欄位對應） */
export interface ASS11070InsertRequest {
  BuildDate?: string;
  ReceptionPerson?: string;
  VendorUID?: string;
  BussinessModel?: number;
  VendorCName?: string;
  VendorEName?: string;
  ContactPerson?: string;
  ContactPhone?: string;
  ContactTitle?: string;
  ContactFax?: string;
  ContactCellphone?: string;
  ContactEmail?: string;
  CompanyAddress?: string;
  CompanyResponsibility?: string;
  PaymentMethod?: number;
  TicketPeriodStart?: string;
  TicketPeriodEnd?: string;
  Services?: string;
  Remark?: string;
}

/** 更新請求參數（含主鍵，與表單欄位對應） */
export interface ASS11070UpdateRequest extends ASS11070InsertRequest {
  VendorID?: string | number;
}
