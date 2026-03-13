/**
 * ASS15020 財產保管清冊 - 資料模型
 */
import { BaseQueryRequest } from '@shared/models/api/base-api.interface';

/** 查詢條件 request */
export interface ASS15020QueryRequest extends BaseQueryRequest {
  /** 保管部門 (SYS3100) */
  KeepingDept?: string | null;
  /** 使用單位 (來源未提供) */
  UsageUnit?: string | null;
  /** 使用部門 (SYS3100) */
  UsageDept?: string | null;
  /** 使用人員 (TBLUSER) */
  UsagePerson?: string | null;
  /** 財產編號 (來源未提供) */
  PropertyCode?: string | null;
  /** 品項編號 (來源未提供) */
  ItemCode?: string | null;
  /** 財產類型 (SYS1000 ASSET_TYPE) */
  PropertyType?: string | null;
  /** 資產狀態 (SYS1000 ASSET_STATUS) */
  AssetStatus?: string | null;
  /** 購入日期起 */
  PurchaseDateFrom?: string | null;
  /** 購入日期訖 */
  PurchaseDateTo?: string | null;
  /** 群組分類 (1=有保管部門, 2=保管人員, 3=品項編號, 4=財產類型) */
  Grouping?: number | string | null;
}

/** 查詢結果單筆 */
export interface ASS15020QueryRow {
  /** 序號 (前端或後端) */
  RowNum?: number | null;
  /** 資產代號 */
  AssetCode?: string | null;
  /** 財產名稱 */
  AssetName?: string | null;
  /** 設備編號 */
  EquipmentNo?: string | null;
  /** 購入日期 */
  PurchaseDate?: string | null;
  /** 資產狀態 */
  AssetStatus?: string | null;
  /** 保管單位 */
  KeepingDept?: string | null;
  /** 保管人 */
  KeepingPerson?: string | null;
  /** 使用單位 */
  UsageUnit?: string | null;
  /** 使用人 */
  UsagePerson?: string | null;
  /** 原購入金額 */
  OriginalAmount?: number | string | null;
  /** 備注 */
  Remark?: string | null;
  /** 供 table dataKey 使用 (可為 ID 或 資產代號等唯一值) */
  ID?: number | string | null;
  [key: string]: unknown;
}

/** 後端回傳包裝 (若 API 為 { Data: { QueryData, TotalRows } }) */
export interface ASS15020QueryDataWrapper {
  QueryData?: ASS15020QueryRow[];
  TotalRows?: number;
  TotalCount?: number;
}
