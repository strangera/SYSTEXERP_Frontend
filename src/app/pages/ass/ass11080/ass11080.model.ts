/**
 * ASS11080 處分資產基本設定 - 資料模型
 */

/** 表單資料結構（內部使用） */
export interface ASS11080Data {
  PS: string;        // 變賣傳票是否啟用
  PC: string;        // 報廢傳票是否啟用
  PC_LOSS: string;   // 資產報廢->處分資產損失
  AR: string;        // 資產變賣->應收帳款
  LOSS: string;      // 資產變賣->處分資產損失
  GET: string;       // 資產變賣->處分資產收入
  MTDAM: string;     // 資產變賣->耗材報廢會科
  MTINVW: string;    // 耗材盤點->耗材盤盈會科
  MTINVL: string;    // 耗材盤點->耗材盤損會科
}

/** 查詢回應中的單一資料項目 */
export interface ASS11080QueryDataItem {
  SortNo: number;
  Tag: string;
  TagDesc: string;
  IsActive: boolean;
  AccNo: string;
  AccName: string;
  Notes: string;
  ID: number;
  CRT_Date: string;
  CRT_USR_No: string;
  CRT_USR_Name: string;
  UPD_Date: string;
  UPD_USR_No: string;
  UPD_USR_Name: string;
}

/** 查詢請求 */
export interface ASS11080QueryRequest {
  TAG?: string;  // 可選，空字串或 undefined 查詢所有，有值查詢特定 TAG
}

/** 查詢回應的 Data 部分 */
export interface ASS11080QueryResponse {
  TotalCount: number;
  QueryData: ASS11080QueryDataItem[];
}

/** 更新請求中的單一項目 */
export interface ASS11080UpdateItem {
  TAG: string;
  AccNo: string;
  NOTES: string;
  IsActive: boolean;
  Sort: number;
}

/** 更新請求 */
export interface ASS11080UpdateRequest {
  Items: ASS11080UpdateItem[];
}
