import { BaseQueryRequest, BaseDeleteRequest } from '@shared/models/api/base-api.interface';

/**
 * ASS11100 倉別設定作業 - 資料模型
 */
export interface ASS11100Data {
  id?: number;           // 用於刪除和表格識別
  STO_NO?: string;       // 分店
  WH_ID: string;         // 倉別代號
  WH_NAME: string;       // 倉別名稱
  NOTES?: string;        // 備註
  WH_ATTR?: string;      // 倉別屬性
  ATT_ORG_ID?: string;   // 所屬部門
}

/**
 * ASS11100 查詢請求參數
 */
export interface ASS11100QueryRequest extends BaseQueryRequest {
  WH_ID?: string;        // 倉別，最多10字
  WH_NAME?: string;     // 倉別名稱，最多40字
  ATT_ORG_ID?: string;   // 部門代號
  NOTES?: string;       // 備註，最多100字
}

/**
 * ASS11100 刪除請求參數
 */
export interface ASS11100DeleteRequest extends BaseDeleteRequest {
  idList: number[];     // 刪除用的 ID 列表
}

/**
 * ASS11100 新增請求參數
 */
export interface ASS11100InsertRequest {
  WH_ID: string;        // 倉別，必填，最多10字
  WH_NAME: string;       // 倉別名稱，必填，最多50字
  ATT_ORG_ID: string;    // 部門代號，必填
  NOTES?: string;        // 備註，非必填，最多100字
}

/**
 * ASS11100 更新請求參數
 */
export interface ASS11100UpdateRequest {
  id: number;           // 記錄 ID，必填
  WH_ID: string;        // 倉別，必填，最多10字
  WH_NAME: string;      // 倉別名稱，必填，最多50字
  ATT_ORG_ID: string;   // 部門代號，必填
  NOTES?: string;       // 備註，非必填，最多100字
}
