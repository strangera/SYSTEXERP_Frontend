import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from './tls25030.service';

/** 通用分頁與排序 */
export interface SortCondition {
  field: string;
  order: number;
}

/** 1. queryTLS56030 查詢條件與結果 */
export interface QueryTLS56030Req {
  PageSize?: number;
  PageIndex?: number;
  OrderBy?: string;
  SortBy?: SortCondition[];
  RPM_No?: string;
  HOS_NoList?: string[];
  org_idList?: string[];
  LOGO_NoList?: string[];
  RPM_StatusList?: string[];
  APPLY_Date_Start?: string;
  APPLY_Date_End?: string;
  APPLY_USRList?: string[];
}

export interface POS2023RTN_Data {
  id: number;
  MID: number;
  RPM_No: string;
  SYS_StoreNo: string;
  LOGO_No: string;
  HOS_No: string;
  HOS_NAME: string;
  org_id: string;
  Org_Name: string;
  RPM_Type: string;
  RPM_Status: string;
  APPLY_Date: string;
  APPLY_USR_No: string;
  APPLY_USR_Name: string;
  RPM_TotQty: number;
  RPM_TotBuyAmt: number;
  RPM_TotSaleAmt: number;
  RPM_Remark: string;
  // ... 其他欄位根據需求增減
}

/** 2. queryPOS2004Detail 查詢條件與結果 */
export interface QueryPOS2004Req {
  queryNo: string; // 商品管理編號/條碼/貨號
  PLU_Name?: string;
  LOGO_No?: string;
  HOS_No?: string;
  RPM_Type?: string;
}

export interface POS2004_Data {
  id: number;
  PLU_MagNo: string;
  PLU_Name: string;
  PLU_No: string;
  PLU_Unit: string;
  UNIT_NAME: string;
  PLU_BoxQty: number;
  NowHaveQty: number;
}

/** 3. Insert / Update 共用明細 */
export interface RTN_Detail {
  id?: number;
  RPM_No?: string;
  SYS_StoreNo: string;
  HOS_No: string;
  PLU_MagNo: string;
  PLU_No: string;
  RPD_ConfirmQty: number;
  RPD_BuyAmt: number;
  RPD_SaleAmt: number;
  RPD_Remark?: string;
  [key: string]: any;
}

export interface SaveTLS56030Req {
  id?: number;
  RPM_No?: string;
  SYS_StoreNo: string;
  LOGO_No: string;
  HOS_No: string;
  RPM_Type: string;
  RPM_Status?: string;
  APPLY_Date: string;
  Details: RTN_Detail[];
}

/** 4. updateStatus 條件 */
export interface UpdateStatusReq {
  DetailList: {
    RPM_No: string;
    RPM_Status: string;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class Tls56030Service {
  private apiUrl = `${environment.ApiUrl}/TLS0000/TLS5000`;

  constructor(private http: HttpClient) { }

  /** 1. 查詢 POS2023RTN 資料表 (主檔清單) */
  queryTLS56030(data: QueryTLS56030Req): Observable<ApiResponse<POS2023RTN_Data[]>> {
    return this.http.post<ApiResponse<POS2023RTN_Data[]>>(`${this.apiUrl}/queryTLS56030`, data);
  }

  /** 2. 查詢國際條碼/商品管理編號/廠商貨號查詢商品 (開窗選商品) */
  queryPOS2004Detail_TLS56030(data: QueryPOS2004Req): Observable<ApiResponse<POS2004_Data[]>> {
    return this.http.post<ApiResponse<POS2004_Data[]>>(`${this.apiUrl}/queryPOS2004Detail_TLS56030`, data);
  }

  /** 3. 新增 POS2023RTN 資料 (連同明細) */
  insertTLS56030(data: SaveTLS56030Req): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(`${this.apiUrl}/insertTLS56030`, data);
  }

  /** 4. 更新 POS2023RTN、POS2024RTN 資料 */
  updateTLS56030(data: SaveTLS56030Req): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(`${this.apiUrl}/updateTLS56030`, data);
  }

  /** 5. 查詢 POS2024RTN 資料表 (單筆單據明細) */
  queryPOS2024RTN(data: { RPM_No: string }): Observable<ApiResponse<RTN_Detail[]>> {
    return this.http.post<ApiResponse<RTN_Detail[]>>(`${this.apiUrl}/queryPOS2024RTN`, data);
  }

  /** 6. 根據狀態更新 POS2023RTN 資料 (如：審核、作廢) */
  updateStatusTLS56030(data: UpdateStatusReq): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(`${this.apiUrl}/updateStatusTLS56030`, data);
  }
}
