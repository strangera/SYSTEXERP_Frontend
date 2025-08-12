import { Column } from '@shared/componentkit/table/table.model';

// 資料介面
export interface TLS56020Item {
  id: number;
  MID: number;
  SPM_No: string;
  SYS_StoreNo: string;
  LOGO_No: string;
  HOS_No: string;
  HOS_NAME: string;
  org_id: string;
  Org_Name: string;
  SPM_Type: string;
  SPM_Type_Name: string;
  SPM_Status: string;
  SPM_Status_Name: string;
  APPLY_Date: string | null;
  APPLY_USR_No: string;
  APPLY_USR_Name: string;
  SPM_TotQty: number;
  SPM_TotBuyNet: number;
  SPM_TotBuyTax: number;
  SPM_TotBuyAmt: number;
  SPM_TotSaleNet: number;
  SPM_TotSaleTax: number;
  SPM_TotSaleAmt: number;
  APRV_Date: string | null;
  APRV_USR_No: string;
  APRV_USR_Name: string;
  VOID_Date: string | null;
  VOID_USR_No: string;
  VOID_USR_Name: string;
  SPM_Date: string | null;
  SPM_USR_No: string;
  SPM_USR_Name: string;
  SPM_Remark: string;
  CRT_Date: string | null;
  CRT_USR_No: string;
  CRT_USR_Name: string;
  UPD_Date: string | null;
  UPD_USR_No: string;
  UPD_USR_Name: string;
}

// 共用格式化
export const fmtDate = (v: string | null) =>
  v ? v.split('T')[0].replace(/\./g, '-').replace(/\//g, '-') : '';

export const fmtMoney = (n: number) =>
  (typeof n === 'number') ? new Intl.NumberFormat().format(n) : '';

// 預設欄位設定
export const TLS56020_COLUMNS: Column[] = [
  { field: 'SPM_No', header: '領用單編號', visible: true },
  { field: 'SPM_Type_Name', header: '領用類別', visible: true },
  { field: 'SPM_Status_Name', header: '單據狀態', visible: true },
  { field: 'HOS_NAME', header: '倉別', visible: true },
  { field: 'Org_Name', header: '部門', visible: true },
  { field: 'LOGO_No', header: '品牌', visible: true },
  { field: 'APPLY_Date', header: '申請日期', visible: true, format: fmtDate },
  { field: 'APPLY_USR_Name', header: '申請人', visible: true },
  { field: 'APRV_Date', header: '審核日期', visible: true, format: fmtDate },
  { field: 'APRV_USR_Name', header: '審核人', visible: true },
  { field: 'SPM_TotQty', header: '總數量', visible: true },
  { field: 'SPM_TotBuyAmt', header: '進貨總額', visible: true, format: fmtMoney },
  { field: 'SPM_TotSaleAmt', header: '售價總額', visible: true,format: fmtMoney },
  { field: 'VOID_Date', header: '作廢日期', visible: true, format: fmtDate },
  { field: 'VOID_USR_Name', header: '作廢人', visible: true },
  { field: 'SPM_Remark', header: '說明', visible: true },
  { field: 'CRT_Date', header: '建立時間', visible: false, format: fmtDate },
  { field: 'CRT_USR_Name', header: '建立人', visible: false },
  { field: 'UPD_Date', header: '更新時間', visible: false, format: fmtDate },
  { field: 'UPD_USR_Name', header: '更新人', visible: false },
];
