import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseQueryRequest } from '@shared/models/api/base-api.interface';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

// ==================== Request 介面 ====================

/**
 * 品項資料查詢
 */
export interface QueryASS11040Request extends BaseQueryRequest {
  /** 品項代碼(可模糊) */
  GOODS_ID?: string | null;
  /** 品項名稱(關鍵字) */
  GOODS_NAME?: string | null;
  /** 大分類代碼 */
  B_CLASS_ID?: string | null;
  /** 中分類代碼 */
  M_CLASS_ID?: string | null;
  /** 小分類代碼 */
  S_CLASS_ID?: string | null;
  /** 品項類別屬性(對照 SYS1000.PROD_TYPE) */
  MATERIAL_TYPE?: string | null;
  /** 基本單位(對照 SYS1000.UNIT) */
  UNIT?: string | null;
  /** 包裝單位(對照 SYS1000.PACK_UNIT) */
  PACK_UNIT?: string | null;
  /** 保固方式(0=廠商、1=公司) */
  MT_MODE?: string | null;
  /** 保養方式(0=廠商、1=公司) */
  IVN_MODE?: string | null;
  /** 說明/備註(關鍵字) */
  NOTES_KW?: string | null;
}

/**
 * 大分類查詢
 */
export interface QueryFACLASSMRequest {
  /** 大分類代碼 */
  CLASS_ID?: string | null;
  /** 大分類名稱關鍵字 */
  Keyword?: string | null;
}

/**
 * 中分類查詢
 */
export interface QueryFACLASS1Request {
  /** 中分類代碼 */
  M_CLASS_ID?: string | null;
  /** 中分類名稱 */
  M_CLASS_NAME?: string | null;
  /** 大分類代碼 */
  B_CLASS_ID?: string | null;
  /** 大分類名稱 */
  B_CLASS_NAME?: string | null;
  /** 說明關鍵字 */
  NOTES_KEYWORD?: string | null;
}

/**
 * 小分類查詢
 */
export interface QueryFACLASS2Request {
  /** 小分類代碼 */
  S_CLASS_ID?: string | null;
  /** 小分類名稱 */
  S_CLASS_NAME?: string | null;
  /** 中分類代碼 */
  M_CLASS_ID?: string | null;
  /** 中分類名稱 */
  M_CLASS_NAME?: string | null;
  /** 大分類代碼 */
  B_CLASS_ID?: string | null;
  /** 大分類名稱 */
  B_CLASS_NAME?: string | null;
  /** 說明關鍵字 */
  NOTES_KEYWORD?: string | null;
}

// ==================== Response 介面 ====================

/**
 * 品項資料查詢回應 (外層包裝)
 */
export interface QueryASS11040DataWrapper {
  TotalCount: number;
  TotalPages: number;
  Data: QueryASS11040Response[];
}

/**
 * 品項資料查詢回應
 */
export interface QueryASS11040Response {
  /** 序號 */
  RowNum?: number | null;
  /** ID */
  ID?: number | null;
  /** MID */
  MID?: number | null;
  /** 分店編號 */
  STO_NO?: string | null;
  /** 品項代碼 */
  GOODS_ID?: string | null;
  /** 品項名稱 */
  GOODS_NAME?: string | null;
  /** 大分類代碼 */
  B_CLASS_ID?: string | null;
  /** 大分類名稱 */
  B_CLASS_NAME?: string | null;
  /** 中分類代碼 */
  M_CLASS_ID?: string | null;
  /** 中分類名稱 */
  M_CLASS_NAME?: string | null;
  /** 小分類代碼 */
  S_CLASS_ID?: string | null;
  /** 小分類名稱 */
  S_CLASS_NAME?: string | null;
  /** 品項類別屬性代碼 */
  MATERIAL_TYPE?: string | null;
  /** 品項類別屬性名稱 */
  MATERIAL_TYPE_NAME?: string | null;
  /** 備註說明 */
  NOTES?: string | null;
  /** 條碼 */
  BAR_CODE?: string | null;
  /** 照片URL */
  PHOTO_URL?: string | null;
  /** 長(CM) */
  LENGTH_CM?: number | null;
  /** 寬(CM) */
  WIDTH_CM?: number | null;
  /** 高(CM) */
  HEIGHT_CM?: number | null;
  /** 重量(KG) */
  WEIGHT_KG?: number | null;
  /** 基本單位代碼 */
  UNIT?: string | null;
  /** 基本單位名稱 */
  UNIT_NAME?: string | null;
  /** 包裝單位代碼 */
  PACK_UNIT?: string | null;
  /** 包裝單位名稱 */
  PACK_UNIT_NAME?: string | null;
  /** 包裝數量 */
  PACK_NUM?: number | null;
  /** 成本定價 */
  COST_PRICE?: number | null;
  /** 稅別代碼 */
  TAX_CODE?: string | null;
  /** 保固方式代碼 */
  MT_MODE?: string | null;
  /** 保固方式名稱 */
  MT_MODE_NAME?: string | null;
  /** 維保廠商 */
  MT_SUPP?: string | null;
  /** 保固年 */
  MT_YEAR?: number | null;
  /** 保固月 */
  MT_MONTH?: number | null;
  /** 保固日 */
  MT_DAY?: number | null;
  /** 保養方式代碼 */
  IVN_MODE?: string | null;
  /** 保養方式名稱 */
  IVN_MODE_NAME?: string | null;
  /** 保養廠商 */
  IVN_SUPP?: string | null;
  /** 可維修年 */
  IVN_YEAR?: number | null;
  /** 可維修月 */
  IVN_MONTH?: number | null;
  /** 可維修日 */
  IVN_DAY?: number | null;
  /** 折舊年限(年) */
  EXP_YEAR?: number | null;
  /** 折舊年限(月) */
  EXP_MONTH?: number | null;
  /** 續命年限(年) */
  ADD_EXP_YEAR?: number | null;
  /** 續命年限(月) */
  ADD_EXP_MONTH?: number | null;
  /** 狀態 */
  STATUS?: string | null;
  /** 保養週期 */
  MT_PERIOD?: number | null;
  /** 盤點週期 */
  IVN_PERIOD?: number | null;
  /** 安全庫存量 */
  SAFE_QTY?: number | null;
  /** 最高庫存量 */
  HIGH_STOCK_QTY?: number | null;
  /** 店售定價 */
  STORE_SALES_AMT?: number | null;
  /** 是否領殘值 */
  RESI_STATUS?: string | null;
  /** 建立日期 */
  CRT_Date?: string | null;
  /** 建立人員代碼 */
  CRT_USR_No?: string | null;
  /** 建立人員姓名 */
  CRT_USR_Name?: string | null;
  /** 更新日期 */
  UPD_Date?: string | null;
  /** 更新人員代碼 */
  UPD_USR_No?: string | null;
  /** 更新人員姓名 */
  UPD_USR_Name?: string | null;
}

/**
 * 大分類查詢回應 (外層包裝)
 */
export interface QueryFACLASSMDataWrapper {
  Data: FACLASSMData[];
}

/**
 * 大分類資料
 */
export interface FACLASSMData {
  /** 序號 */
  RowNum?: number | null;
  /** 大分類代碼 */
  CLASS_ID?: string | null;
  /** 大分類名稱 */
  CLASS_NAME?: string | null;
}

/**
 * 中分類查詢回應 (外層包裝)
 */
export interface QueryFACLASS1DataWrapper {
  Data: FACLASS1Data[];
}

/**
 * 中分類資料
 */
export interface FACLASS1Data {
  /** 序號 */
  RowNum?: number | null;
  /** 中分類代碼 */
  CLASS_ID?: string | null;
  /** 中分類名稱 */
  CLASS_NAME?: string | null;
  /** 大分類代碼 */
  B_CLASS_ID?: string | null;
  /** 大分類名稱 */
  B_CLASS_NAME?: string | null;
  /** 說明 */
  NOTES?: string | null;
}

/**
 * 小分類查詢回應 (外層包裝)
 */
export interface QueryFACLASS2DataWrapper {
  Data: FACLASS2Data[];
}

/**
 * 小分類資料
 */
export interface FACLASS2Data {
  /** 序號 */
  RowNum?: number | null;
  /** 小分類代碼 */
  S_CLASS_ID?: string | null;
  /** 小分類名稱 */
  S_CLASS_NAME?: string | null;
  /** 中分類代碼 */
  M_CLASS_ID?: string | null;
  /** 中分類名稱 */
  M_CLASS_NAME?: string | null;
  /** 大分類代碼 */
  B_CLASS_ID?: string | null;
  /** 大分類名稱 */
  B_CLASS_NAME?: string | null;
  /** 說明 */
  NOTES?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class ASS11040Service {
  private readonly apiUrl = environment.ApiUrl + '/ASS0000/ASS1000';

  constructor(private http: HttpClient) { }

  /**
   * 品項資料查詢
   */
  queryFASITEM(params: QueryASS11040Request): Observable<ApiResponse<QueryASS11040DataWrapper>> {
    return this.http.post<ApiResponse<QueryASS11040DataWrapper>>(`${this.apiUrl}/queryFASITEM`, params);
  }

  /**
   * 大分類查詢
   */
  queryFACLASSM(params: QueryFACLASSMRequest): Observable<ApiResponse<QueryFACLASSMDataWrapper>> {
    return this.http.post<ApiResponse<QueryFACLASSMDataWrapper>>(`${this.apiUrl}/queryFACLASSM`, params);
  }

  /**
   * 中分類查詢
   */
  queryFACLASS1(params: QueryFACLASS1Request): Observable<ApiResponse<QueryFACLASS1DataWrapper>> {
    return this.http.post<ApiResponse<QueryFACLASS1DataWrapper>>(`${this.apiUrl}/queryFACLASS1`, params);
  }

  /**
   * 小分類查詢
   */
  queryFACLASS2(params: QueryFACLASS2Request): Observable<ApiResponse<QueryFACLASS2DataWrapper>> {
    return this.http.post<ApiResponse<QueryFACLASS2DataWrapper>>(`${this.apiUrl}/queryFACLASS2`, params);
  }
}
