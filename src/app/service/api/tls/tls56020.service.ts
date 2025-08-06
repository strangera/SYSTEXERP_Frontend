
export interface TLS56020Data {
  id: number;
  PO_No: string; // 採購單號
  SYS_StoreNo: string; // 門店編號 (系統)
  VEN_No: string; // 廠商代號
  LOGO_No: string; // LOGO代碼
  HOS_No: string; // 醫院代號
  HOS_NAME: string; // 醫院名稱
  org_id: string; // 組織代碼
  ODM_TaxType: string; // 稅別
  APPLY_Date: string; // 申請日期 (ISO 格式字串)
  APPLY_USR_No: string; // 申請人員編號
  APPLY_USR_Name: string; // 申請人員姓名
  PO_TotalSubQty: number; // 採購總數量
  PO_TotalBuyNet: number; // 採購總淨額
  PO_TotalBuyTax: number; // 採購總稅額
  PO_TotalBuyAmt: number; // 採購總金額
  PO_TotalSaleNet: number; // 銷售總淨額
  PO_TotalSaleTax: number; // 銷售總稅額
  PO_TotalSaleAmt: number; // 銷售總金額
  PO_Status: string; // 採購單狀態
  APRV_Date: string | null; // 核准日期 (ISO 格式字串)
  APRV_USR_No: string | null; // 核准人員編號
  APRV_USR_Name: string | null; // 核准人員姓名
  VOID_Date: string | null; // 作廢日期 (ISO 格式字串)
  VOID_USR_No: string | null; // 作廢人員編號
  VOID_USR_Name: string | null; // 作廢人員姓名
  CLOS_Date: string | null; // 結案日期 (ISO 格式字串)
  CLOS_USR_No: string | null; // 結案人員編號
  CLOS_USR_Name: string | null; // 結案人員姓名
  PO_Remark: string | null; // 採購單備註
  CRT_Date: string; // 建立日期 (ISO 格式字串)
  CRT_USR_No: string; // 建立人員編號
  CRT_USR_Name: string; // 建立人員姓名
  UPD_Date: string; // 變更日期 (ISO 格式字串)
  UPD_USR_No: string; // 變更人員編號
  UPD_USR_Name: string; // 變更人員姓名
  CanClos: boolean; // 是否可結案
}
