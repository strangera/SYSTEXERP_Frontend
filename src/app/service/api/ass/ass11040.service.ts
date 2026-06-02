import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  CreateASS11040Request,
  CreateASS11040Response,
  FACLASS1Data,
  FACLASS2Data,
  QueryASS11040DataResponse,
  QueryASS11040DataWrapper,
  QueryASS11040Request,
  QueryFACLASS1Request,
  QueryFACLASS2Request,
  QueryFACLASSMDataWrapper,
  QueryFACLASSMRequest,
  UpdateASS11040Request,
} from '@pages/ass/ass11040/ass11040.model';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ASS11040Service {
  private readonly apiUrl = environment.ApiUrl + '/ASS0000/ASS1000';

  constructor(private http: HttpClient) { }

  /**
   * 品項資料查詢（ASS11040）
   */
  queryASS11040(params: QueryASS11040Request): Observable<ApiResponse<QueryASS11040DataWrapper>> {
    return this.http.post<ApiResponse<QueryASS11040DataWrapper>>(`${this.apiUrl}/queryASS11040`, params);
  }

  /**
   * 新增品項（createASS11040）
   * 回傳新建品項 NewID、NewGoodsId 等供後續上傳圖片與 update 使用
   */
  createASS11040(params: CreateASS11040Request): Observable<ApiResponse<CreateASS11040Response>> {
    return this.http.post<ApiResponse<CreateASS11040Response>>(`${this.apiUrl}/createASS11040`, params);
  }

  /**
   * 更新品項（updateASS11040）
   */
  updateASS11040(params: UpdateASS11040Request): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/updateASS11040`, params);
  }

  /**
   * 大分類下拉選單（回傳結構為 Data: { Data: FACLASSMData[] }）
   */
  queryFACLASSM_DropDownList(params: QueryFACLASSMRequest | object = {}): Observable<ApiResponse<QueryFACLASSMDataWrapper>> {
    return this.http.post<ApiResponse<QueryFACLASSMDataWrapper>>(`${this.apiUrl}/queryFACLASSM_DropDownList`, params);
  }

  /**
   * 中分類下拉選單（queryFACLASS1_DropDownList）
   * 新版：`ApiResponse.Data` 直接為 `FACLASS1Data[]`（舊版曾為巢狀 `{ Data: FACLASS1Data[] }`）
   */
  queryFACLASS1_DropDownList(params: QueryFACLASS1Request): Observable<ApiResponse<FACLASS1Data[]>> {
    return this.http.post<ApiResponse<FACLASS1Data[]>>(`${this.apiUrl}/queryFACLASS1_DropDownList`, params);
  }

  /**
   * 小分類下拉選單（queryFACLASS2_DropDownList）
   * 新版：`ApiResponse.Data` 直接為 `FACLASS2Data[]`（舊版曾為巢狀 `{ Data: FACLASS2Data[] }`）
   */
  queryFACLASS2_DropDownList(params: QueryFACLASS2Request): Observable<ApiResponse<FACLASS2Data[]>> {
    return this.http.post<ApiResponse<FACLASS2Data[]>>(`${this.apiUrl}/queryFACLASS2_DropDownList`, params);
  }

  /**
   * 查詢品項資料（queryFASITEM_DropDownList）
   */
  queryFASITEM_DropDownList(
    params: QueryASS11040Request
  ): Observable<ApiResponse<QueryASS11040DataResponse>> {
    return this.http.post<ApiResponse<QueryASS11040DataResponse>>(`${this.apiUrl}/queryFASITEM_DropDownList`, params);
  }
}
