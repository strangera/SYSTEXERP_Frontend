import { BaseQueryRequest } from '@shared/models/api/base-api.interface';

/**
 * ASS13060 固定資產重估作業 - 資料模型
 */

/**
 * ASS13060 查詢請求參數
 */
export interface ASS13060QueryRequest extends BaseQueryRequest {
  /** 申請編號 */
  RequestCode?: string | null;
  /** 商品管理編號 */
  ManagementCode?: string | null;
  /** 申請人員編號 */
  UserCode?: string | null;
  /** 部門代號 */
  OrganizationNumber?: string | null;
  /** 申請日期(起) */
  ApplicationDateFrom?: Date | null;
  /** 申請日期(迄) */
  ApplicationDateTo?: Date | null;
  /** 申請單狀態 */
  RequestStatus?: string | null;
}

/**
 * ASS13060 查詢結果資料
 */
export interface ASS13060QueryRow {
  /** 固資重估單編號 */
  RevaluationNo?: string;
  /** 申請人員編號 */
  UserCode?: string;
  /** 申請人員名稱 */
  UserName?: string;
  /** 部門代號 */
  OrganizationNumber?: string;
  /** 部門名稱 */
  OrganizationName?: string;
  /** 狀態 */
  Status?: string;
  /** 狀態名稱 */
  StatusName?: string;
  /** 申請日期 */
  ApplicationDate?: Date | string;
  /** 說明 */
  Remark?: string;
  /** 狀態碼（供儲存按鈕禁用判斷：審核、作廢不可儲存） */
  StatusCode?: string;
}

/**
 * ASS13060 明細項目
 */
export interface ASS13060DetailItem {
  /** 商品編號 */
  GoodsId?: string;
  /** 商品名稱 */
  GoodsName?: string;
  /** 商品單位 */
  Unit?: string;
  /** 數量 */
  Quantity?: number;
  /** 折舊年限 */
  DepreciationLife?: number;
  /** 已異動折舊年限 */
  AlteredDepreciationLife?: number;
  /** 異動年限（可手動輸入） */
  AlteredLife?: number;
  /** 取得價格 */
  ReceivePrice?: number;
  /** 已異動價格 */
  AlteredPrice?: number;
  /** 累計已攤提金額 */
  TotalSharedPrice?: number;
  /** 累計已攤提月數 */
  TotalSharedMonth?: number;
  /** 異動購入金額（可手動輸入） */
  AlteredBuyPrice?: number;
  /** 折舊科目 */
  Depreciation?: string;
  /** 累計折舊科目 */
  TotalDepreciation?: string;
  /** 使用單位 */
  UsageUnit?: string;
  /** 單項報廢說明（可手動輸入） */
  SingleRemark?: string;
}

/**
 * ASS13060 新增請求參數
 */
export interface ASS13060InsertRequest {
  /** 申請人員編號 */
  UserCode: string;
  /** 部門代號 */
  OrganizationNumber: string;
  /** 申請日期 */
  ApplicationDate: Date | string;
  /** 固資重估說明 */
  Remark?: string;
  /** 明細資料 */
  Details: ASS13060DetailItem[];
}

/**
 * ASS13060 修改請求參數
 */
export interface ASS13060UpdateRequest {
  /** 固資重估單編號 */
  RevaluationNo: string;
  /** 申請人員編號 */
  UserCode: string;
  /** 部門代號 */
  OrganizationNumber: string;
  /** 申請日期 */
  ApplicationDate: Date | string;
  /** 固資重估說明 */
  Remark?: string;
  /** 明細資料 */
  Details: ASS13060DetailItem[];
}

/**
 * ASS13060 刪除請求參數
 */
export interface ASS13060DeleteRequest {
  /** 固資重估單編號 */
  RevaluationNo: string;
}

/**
 * ASS13060 資產查詢請求參數（批次新增彈窗用）
 */
export interface ASS13060AssetQueryRequest extends BaseQueryRequest {
  /** 資產編號 */
  AssetNo?: string | null;
  /** 大分類編號 */
  BClassId?: string | null;
  /** 中分類編號 */
  MClassId?: string | null;
  /** 小分類編號 */
  SClassId?: string | null;
  /** 保管人代號 */
  CustodianCode?: string | null;
  /** 保管單位代號 */
  CustodyUnitCode?: string | null;
  /** 品項名稱 */
  ItemName?: string | null;
}

/**
 * ASS13060 資產查詢結果（批次新增彈窗用）
 */
export interface ASS13060AssetQueryRow {
  /** 資產編號 */
  AssetNo?: string;
  /** 資產名稱 */
  AssetName?: string;
  /** 單位 */
  Unit?: string;
  /** 狀態 */
  Status?: string;
  /** 購入金額 */
  PurchaseAmount?: number;
  /** 異動金額 */
  AlteredAmount?: number;
  /** 合計金額 */
  TotalAmount?: number;
  /** 購入日期 */
  PurchaseDate?: Date | string;
  /** 原折舊年限 */
  OriginalDepreciationLife?: number;
  /** 異動折舊年限 */
  AlteredDepreciationLife?: number;
  /** 累計已攤提金額 */
  TotalSharedPrice?: number;
  /** 累計已攤提月數 */
  TotalSharedMonth?: number;
  /** 折舊會科 */
  Depreciation?: string;
  /** 累計折舊會科 */
  TotalDepreciation?: string;
  /** 使用單位 */
  UsageUnit?: string;
}

/**
 * ASS13060 查詢回應資料包裝器
 */
export interface ASS13060QueryDataWrapper {
  /** 總筆數 */
  TotalRows: number;
  /** 總頁數 */
  TotalPages: number;
  /** 查詢資料 */
  QueryData: ASS13060QueryRow[];
}

/**
 * ASS13060 審核請求參數
 */
export interface ASS13060ApproveRequest {
  /** 固資重估單編號 */
  RevaluationNo: string;
}

/**
 * ASS13060 列印請求參數
 */
export interface ASS13060PrintRequest {
  /** 固資重估單編號 */
  RevaluationNo: string;
}
