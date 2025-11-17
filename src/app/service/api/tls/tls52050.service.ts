import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment'; // 請確認你的 environment 路徑是否正確
import { ApiResponse } from '../../system/auth.service'; // 請確認你的 ApiResponse 介面路徑是否正確
import { SortMeta } from 'primeng/api';

//
// 調整後的介面定義
//
// 查詢 POS2008M (商品促銷主檔) 的請求介面
export interface IQueryTLS52050Request {
  MAM_No?: string;
  VEN_No?: string;
  LOGO_No?: string[];
  MAM_Status?: string[];
  APPLY_USR_No?: string[];
  APPLY_Date_Start?: string;
  APPLY_Date_End?: string;
  APRV_USR_No?: string[];
  APRV_Date_Start?: string;
  APRV_Date_End?: string;
  showReturnPriceOrdersOnly?: boolean;

  PageSize?: number;
  PageIndex?: number;
  SortBy?: SortMeta[];
}

// 查詢 POS2008M (商品促銷主檔) 的單筆響應資料介面
export interface ITLS52050Data {
  Id: number;
  MAM_No: string;
  SYS_StoreNo: string;
  VEN_No: string;
  LOGO_No: string;
  MAM_BegDate: string;
  MAM_EndDate: string;
  MAM_Status: string;
  MAM_Method: string;
  MAM_TotAmt: number;
  MAM_MaxCondition: number;
  MAM_DiscType: string;
  MAM_Source: string;
  MAM_InvDesc: string;
  APPLY_Date: string;
  APPLY_USR_Name: string;
  APRV_Date: string;
  APRV_USR_Name: string;
}

// 插入 POS2008M 的單項明細資料介面
export interface IInsertTLS52050Detail {
  id?: number;
  PLU_MagNo?: string;
  PLU_OrderPrcRate?: number;
  PLU_OrderPrc?: number;
  MAM_OrderPrc?: number;
  PLU_SalePrc?: number;
  MAM_UnitPrc?: number;
  MAD_Remark?: string;
}

// 插入 POS2008M (商品促銷主檔) 的請求介面
export interface IInsertTLS52050Request {
  LOGO_No?: string;
  VEN_No?: string;
  MAM_Remark?: string;
  MAM_BegDate?: string;
  MAM_EndDate?: string;
  MAM_Method?: string;
  MAM_Status?: number;
  MAM_Type?: number;
  MAM_Source?: number;
  MAM_DateType?: number;
  MAM_Week1?: string;
  MAM_Week2?: string;
  MAM_Week3?: string;
  MAM_Week4?: string;
  MAM_Week5?: string;
  MAM_Week6?: string;
  MAM_Week7?: string;
  MAM_Day?: number;
  details: IInsertTLS52050Detail[];
}
// 新增: 更新明細資料介面
export interface IUpdateTLS52050Detail extends IInsertTLS52050Detail {
  ID?: number | null;
}

// 新增: 更新主檔請求介面
export interface IUpdateTLS52050Request extends IInsertTLS52050Request {
  ID?: number | null;
  MAM_No?: string;
  details: IUpdateTLS52050Detail[];
}

// 新增: 查詢明細請求介面
export interface IQueryTLS52050DetailRequest {
  LOGO_No?: string;
  VEN_No?: string;
  PLU_MagNo?: string;
  PLU_Name?: string;
  CAT_LNo?: string;
  CAT_MNo?: string;
  CAT_SNo?: string;

  PageSize?: number;
  PageIndex?: number;
  SortBy?: SortMeta[];
}

// 新增: 查詢明細響應資料介面
export interface IQueryTLS52050DetailData {
  id: string;
  PLU_MagNo: string;
  PLU_Name: string;
  CAT_LNo: string;
  CAT_LName: string;
  CAT_MNo: string;
  CAT_MName: string;
  CAT_SNo: string;
  CAT_SName: string;
  PLU_OrderPrcRate: string;
  PLU_OrderPrc: string;
  PLU_SalePrc: string;
  [key: string]: string;
}

export interface TLS52050UpdateDetail {
  id: string,
  MAM_No: string,
  PLU_MagNo: string,
  PLU_SalePrc: number,
  MAM_UnitPrc: number,
  PLU_OrderPrc: number,
  MAM_OrderPrc: number,
  PLU_OrderPrcRate: number,
  MAD_Remark: string,
  CAT_LNo: string,
  CAT_LName: string,
  CAT_MNo: string,
  CAT_MName: string,
  CAT_SNo: string,
  CAT_SName: string
}

export interface IExportLabelResponse {
  PLU_MagNO: string,
  PLU_Name: string,
  Label_Qty: string,
  PLU_SalePrc: string,
  UNIT_NAME: string,
  PLU_OrgPLUNo: string,
  PLU_NO: string
}

@Injectable({
  providedIn: 'root',
})
export class Tls52050Service {
  private apiUrl: string = environment.ApiUrl + '/TLS0000/TLS5000';

  constructor(private http: HttpClient) { }

  /**
   * 查詢 POS2008M (商品促銷主檔) 資料表
   * @param params 查詢條件 (IQueryTLS52050Request)
   * @returns 包含 ITLS52050Data 陣列的 API 響應
   */
  queryTLS52050(params: IQueryTLS52050Request): Observable<ApiResponse<ITLS52050Data[]>> {
    return this.http.post<ApiResponse<ITLS52050Data[]>>(`${this.apiUrl}/queryTLS52050`, params);
  }

  /**
   * 插入 POS2008M (商品促銷主檔) 資料表
   * @param data 插入資料 (IInsertTLS52050Request)
   * @returns 包含操作結果的 API 響應
   */
  insertTLS52050(data: IInsertTLS52050Request): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(`${this.apiUrl}/insertTLS52050`, data);
  }
  /**
    * 更新 POS2008M (商品促銷主檔) 資料表
    * @param data 更新資料 (IUpdateTLS52050Request)
    * @returns 包含操作結果的 API 響應
    */
  updateTLS52050(data: IUpdateTLS52050Request): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(`${this.apiUrl}/updateTLS52050`, data);
  }

  /**
   * 查詢 POS2008D (商品促銷明細檔) 資料表
   * @param params 查詢條件 (IQueryTLS52050DetailRequest)
   * @returns 包含 IQueryTLS52050DetailData 陣列的 API 響應
   */
  queryTLS52050Detail(params: IQueryTLS52050DetailRequest): Observable<ApiResponse<IQueryTLS52050DetailData[]>> {
    return this.http.post<ApiResponse<IQueryTLS52050DetailData[]>>(`${this.apiUrl}/queryTLS52050Detail`, params);
  }

  queryTLS52050UpdateDetail(MAM_No: string): Observable<ApiResponse<TLS52050UpdateDetail[]>> {
    return this.http.post<ApiResponse<TLS52050UpdateDetail[]>>(`${this.apiUrl}/queryTLS52050UpdateDetail`, { MAM_No });
  }

  approveTLS52050(data: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/approveTLS52050`, data);
  }

  // 取得標籤檔資料
  getLabelTLS52050(params: { MAM_No: string }): Observable<ApiResponse<IExportLabelResponse[]>> {
    return this.http.post<ApiResponse<IExportLabelResponse[]>>(`${this.apiUrl}/getLabelTLS52050`, params);
  }
  /**
   * 上傳檔案到伺服器
   * @param file 要上傳的檔案
   * @returns 包含操作結果的 API 響應
   */
  uploadTLS52050(file: File): Observable<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/uploadTLS52050`, formData);
  }
}
