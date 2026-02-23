import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response'; // 請確認你的 ApiResponse 介面路徑是否正確
import { SortMeta } from 'primeng/api';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment'; // 請確認你的 environment 路徑是否正確

/** 國際條碼/商品管理編號/廠商貨號查詢商品 (queryPOS2004Detail) 的請求介面 */
export interface IQueryPOS2004DetailRequest {
  PageSize: number,
  PageIndex: number,
  SortBy?: SortMeta[],

  queryNo?: string, // 國際條碼/商品管理編號/廠商貨號
  PLU_Name?: string,

  VEN_No?: string,
  LOGO_No?: string,
  HOS_No?: string,

  CAT_LNo?: string,
  CAT_MNo?: string,
  CAT_SNo?: string
}

export interface IQueryPOS2004DetailResponse {
  id: number,
  PLU_MagNo: string,
  PLU_Name: string,
  PLU_No: string,
  PLU_OrgPLUNo: string,
  PLU_Unit: string,
  UNIT_NAME: string,
  PLU_BoxQty: number,
  PLU_StockTaxType: string,
  PLU_SalePrc_UNI: number,
  PLU_SalePrc: number,
  PLU_TaxType: string,

  POD_SubQty?: number,
  POD_BuyNet?: number,
  POD_SaleAmt?: number,
  POD_Remark?: string
  POD_BuyTax?: number
  POD_BuyAmt?: number
  POD_SaleTax?: number
}

@Injectable({
  providedIn: 'root',
})
export class ProductAutocompleteService {
  private apiUrl: string = environment.ApiUrl + '/TLS0000/TLS5000';

  constructor(private http: HttpClient) { }
  /**
   * 查詢 POS2004 (商品詳細資料) 資料表
   * @param params 查詢條件 (VEN_No, queryNo, PLU_Name, LOGO_No)
   * @returns 包含 IPOS2004DetailData 陣列的 API 響應
   */
  queryPOS2004Detail(params: IQueryPOS2004DetailRequest): Observable<ApiResponse<IQueryPOS2004DetailResponse[]>> {
    return this.http.post<ApiResponse<IQueryPOS2004DetailResponse[]>>(`${this.apiUrl}/queryPOS2004Detail`, params);
  }
}
