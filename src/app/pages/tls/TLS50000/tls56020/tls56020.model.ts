import { formatDate } from '@shared/componentkit/table-report/table-report.model';
import { Column } from '@shared/componentkit/table/table.model';

/** === 清單：單筆資料 === */
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

/** === 分頁輸入 === */
export interface TLS56020PagingInput {
  PageSize: number;
  PageIndex: number;
  SortBy: { field: string; order: number }[];
  OrderBy?: string;
  Offset?: number;
}

/** === 清單：回應包裝 === */
export interface TLS56020ListResponse {
  Status: string;
  Data: TLS56020Item[];
  Error?: { Code: string; Message: string; Details: string } | null;
  Meta?: { Timestamp: string; RequestId: string } | null;
  Message: string;
  TotalCount: number;
  TotalPage: number;
}

/** === 查詢請求（對齊後端規格） === */
export interface TLS56020QueryRequest {


  SPM_No?: string;
  queryNo?: string;
  HOS_NoList?: string[];
  LOGO_NoList?: string[];
  SPM_TypeList?: string[];
  SPM_StatusList?: string[];
  APPLY_Date_Start?: string;          // 'YYYY-MM-DD'
  APPLY_Date_End?: string;            // 'YYYY-MM-DD'
  APPLY_USR?: string;
  APRV_Date_Start?: string;           // 'YYYY-MM-DD'
  APRV_Date_End?: string;             // 'YYYY-MM-DD'
  APRV_USR?: string;
}

/** === Insert：明細 === */
export interface TLS56020InsertDetail {
  SYS_StoreNo: string;
  HOS_No: string;
  PLU_MagNo: string;
  PLU_No: string;
  PLU_Unit: string;        // ex: 'ST'
  PLU_BoxQty: number;
  PLU_Name: string;
  PLU_StockTaxType: string;
  SPD_ConfirmQty: number;
  SPD_BuyPrc: number;
  SPD_BuyNet: number;
  SPD_BuyTax: number;
  SPD_BuyAmt: number;
  PLU_TaxType: string;
  SPD_SalePrc: number;
  SPD_SaleTax: number;
  SPD_SaleAmt: number;
  SPD_Remark: string;
}

/** === Insert：主檔 + 明細 請求 === */
export interface TLS56020InsertRequest {
  SYS_StoreNo: string;
  LOGO_No: string;
  HOS_No: string;
  org_id: string;
  SPM_Type: string;
  APPLY_Date: string;       // 建議 'YYYY-MM-DDTHH:mm:ss.sssZ' 或依後端規格
  APPLY_USR_No: string;
  APPLY_USR_Name: string;
  SPM_TotQty: number;
  SPM_TotBuyNet: number;
  SPM_TotBuyTax: number;
  SPM_TotBuyAmt: number;
  SPM_TotSaleNet: number;
  SPM_TotSaleTax: number;
  SPM_TotSaleAmt: number;
  SPM_Remark: string;
  Details: TLS56020InsertDetail[];
}

/** === Update：明細 === */
export interface TLS56020UpdateDetail {
  id: number;
  SYS_StoreNo: string;
  HOS_No: string;
  SPM_No: string;
  PLU_MagNo: string;
  PLU_No: string;
  PLU_Unit: string;       // 例：'ST'
  PLU_BoxQty: number;
  PLU_Name: string;
  PLU_StockTaxType: string;
  SPD_ConfirmQty: number;
  SPD_BuyPrc: number;
  SPD_BuyNet: number;
  SPD_BuyTax: number;
  SPD_BuyAmt: number;
  PLU_TaxType: string;
  SPD_SalePrc: number;
  SPD_SaleTax: number;
  SPD_SaleAmt: number;
  SPD_Remark: string;
}

/** === Update：主檔 請求 === */
export interface TLS56020UpdateRequest {
  id: number;
  SYS_StoreNo: string;
  LOGO_No: string;
  HOS_No: string;
  org_id: string;
  SPM_Type: string;
  APPLY_Date: string;       // 或 string | Date，看後端規格
  APPLY_USR_No: string;
  APPLY_USR_Name: string;
  SPM_TotQty: number;
  SPM_TotBuyNet: number;
  SPM_TotBuyTax: number;
  SPM_TotBuyAmt: number;
  SPM_TotSaleNet: number;
  SPM_TotSaleTax: number;
  SPM_TotSaleAmt: number;
  SPM_Remark: string;
  SPM_Status: string;
  SPM_No: string;
  Details: TLS56020UpdateDetail[];
}

/** === 狀態異動（批次） === */
export type TLS56020Status = '1' | '2' | '3' | '9' | string; // 1已申請 2已審核 3已領用 9已作廢

export interface TLS56020StatusItem {
  SPM_No: string;
  SPM_Status: TLS56020Status;
}

export interface TLS56020UpdateStatusRequest {
  DetailList: TLS56020StatusItem[];
}

/** === 共用格式化 === */
export const fmtDate = (v: string | null) =>
  v ? v.split('T')[0].replace(/\./g, '-').replace(/\//g, '-') : '';

export const fmtMoney = (n: number) =>
  typeof n === 'number' ? new Intl.NumberFormat().format(n) : '';

/** === 表格欄位設定（主清單） === */
export const TLS56020_COLUMNS: Column[] = [
  { field: 'SPM_No', header: '領用單編號', visible: true },
  { field: 'APPLY_Date', header: '申請日期', visible: true, format: formatDate },
  { field: 'SPM_Type_Name', header: '領用類別', visible: true },
  { field: 'HOS_NAME', header: '倉別', visible: true },
  { field: 'LOGO_No', header: '品牌', visible: true },
  { field: 'Org_Name', header: '部門', visible: true },
  { field: 'SPM_Remark', header: '說明', visible: true },
  { field: 'APPLY_USR_Name', header: '申請人', visible: true },
  { field: 'APRV_USR_Name', header: '審核人', visible: true },
  { field: 'APRV_Date', header: '審核日期', visible: true, format: formatDate },
  { field: 'SPM_Status_Name', header: '單據狀態', visible: true },
  // { field: 'APPLY_USR_Name', header: '申請人', visible: true },
  // { field: 'APRV_Date', header: '審核日期', visible: true, format: fmtDate },
  // { field: 'APRV_USR_Name', header: '審核人', visible: true },
  // { field: 'SPM_TotQty', header: '總數量', visible: true },
  // { field: 'SPM_TotBuyAmt', header: '進貨總額', visible: true, format: fmtMoney },
  // { field: 'SPM_TotSaleAmt', header: '售價總額', visible: true, format: fmtMoney },
  // { field: 'VOID_Date', header: '作廢日期', visible: true, format: fmtDate },
  // { field: 'VOID_USR_Name', header: '作廢人', visible: true },
  // { field: 'SPM_Remark', header: '說明', visible: true },
  // { field: 'CRT_Date', header: '建立時間', visible: false, format: fmtDate },
  // { field: 'CRT_USR_Name', header: '建立人', visible: false },
  // { field: 'UPD_Date', header: '更新時間', visible: false, format: fmtDate },
  // { field: 'UPD_USR_Name', header: '更新人', visible: false },
];
export const toYmd = (d: any): string | null => {
  if (!d) return null;
  const dt = new Date(d);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const day = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};


/** 把前端各種命名(pageSize/PageSize, sortBy/SortBy...)對映成後端需要的鍵 */
export const mapPagingToBackend = (paging: any = {}): TLS56020PagingInput => {
  const ps = paging.PageSize ?? paging.pageSize ?? 20;
  const pi = paging.PageIndex ?? paging.pageIndex ?? 1;
  const sb = paging.SortBy ?? paging.sortBy ?? [{ field: 'SPM_No', order: 1 }];
  const ob = paging.OrderBy ?? paging.orderBy;
  const off = paging.Offset ?? paging.offset;

  const out: TLS56020PagingInput = {
    PageSize: Number(ps) || 20,
    PageIndex: Number(pi) || 1,
    SortBy: Array.isArray(sb) ? sb : [{ field: 'SPM_No', order: 1 }],
  };
  if (ob != null) out.OrderBy = String(ob);
  if (off != null) out.Offset = Number(off);
  return out;
};


/** 只在有值時才放進物件，避免送空字串/空陣列 */
const putIfHasValue = (obj: any, key: string, val: any) => {
  if (val === null || val === undefined) return;
  if (Array.isArray(val) && val.length === 0) return;
  if (typeof val === 'string' && val.trim() === '') return;
  obj[key] = val;
};

/** 將任意輸入安全轉為 string[]（供 *_List 欄位使用） */
const toStringArray = (v: any): string[] =>
  Array.isArray(v) ? v.filter(x => x !== null && x !== undefined && String(x).trim() !== '').map(String) : [];

/** === 建構查詢 Body：把表單值 + 分頁轉成後端規格（TLS56020QueryRequest） === */
export const buildTLS56020QueryBody = (
  formValue: any,
  paging?: any,
  alwaysIncludeAllFields = false,
): any => {
  const v = formValue || {};
  const body: any = {};

  if (alwaysIncludeAllFields) {
    // 強制帶出所有欄位（即使為空值或空陣列），以符合後端範例格式
    body.SPM_No = v.SPM_No ?? '';
    body.queryNo = v.queryNo ?? '';

    body.HOS_NoList = toStringArray(v.HOS_NoList);
    body.LOGO_NoList = toStringArray(v.LOGO_NoList);
    body.SPM_TypeList = toStringArray(v.SPM_TypeList);
    body.SPM_StatusList = toStringArray(v.SPM_StatusList);

    body.APPLY_USR = v.APPLY_USR ?? '';
    body.APRV_USR = v.APRV_USR ?? '';

    body.APPLY_Date_Start = toYmd(v.APPLY_Date_Start) ?? '';
    body.APPLY_Date_End = toYmd(v.APPLY_Date_End) ?? '';
    body.APRV_Date_Start = toYmd(v.APRV_Date_Start) ?? '';
    body.APRV_Date_End = toYmd(v.APRV_Date_End) ?? '';
  } else {
    putIfHasValue(body, 'SPM_No', v.SPM_No);
    putIfHasValue(body, 'queryNo', v.queryNo);

    putIfHasValue(body, 'HOS_NoList', toStringArray(v.HOS_NoList));
    putIfHasValue(body, 'LOGO_NoList', toStringArray(v.LOGO_NoList));
    putIfHasValue(body, 'SPM_TypeList', toStringArray(v.SPM_TypeList));
    putIfHasValue(body, 'SPM_StatusList', toStringArray(v.SPM_StatusList));

    putIfHasValue(body, 'APPLY_USR', v.APPLY_USR);
    putIfHasValue(body, 'APRV_USR', v.APRV_USR);

    putIfHasValue(body, 'APPLY_Date_Start', toYmd(v.APPLY_Date_Start));
    putIfHasValue(body, 'APPLY_Date_End', toYmd(v.APPLY_Date_End));
    putIfHasValue(body, 'APRV_Date_Start', toYmd(v.APRV_Date_Start));
    putIfHasValue(body, 'APRV_Date_End', toYmd(v.APRV_Date_End));
  }

  // 若有傳入分頁/排序參數，就把它轉成後端需要的欄位並合併進 body
  if (paging) {
    const pagingMapped = mapPagingToBackend(paging);
    Object.assign(body, pagingMapped);
  }

  return body;
};

