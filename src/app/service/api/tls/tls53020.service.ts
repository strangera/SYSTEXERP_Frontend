import { ApiRequest, ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

// 查詢參數介面
export interface TLS53020QueryParams extends ApiRequest {
  PST_No?: string | null; // 盤點單編號
  HOS_No?: string[] | null; // 倉別代碼
  LOGO_No?: string[] | null; // 品牌代碼
  PST_DateStart: string; // 盤點基準日期(起) 必填
  PST_DateEnd: string;   // 盤點基準日期(迄) 必填
  PST_Status?: string[] | null; // 盤點狀態
  PST_Type?: string | null; // 盤點類型
}

// 查詢結果項目介面
export interface TLS53020Data {
  id: number;
  PST_No?: string | null;
  LOGO_No?: string | null;
  LOGO_CH_NAME?: string | null;
  HOS_No?: string | null;
  HOS_NAME?: string | null;
  PST_Date?: string | null;
  PST_Type?: string | null;
  PST_Status?: string | null;
  CRT_Date?: string | null;
  CRT_USR_No?: string | null;
  CRT_USR_Name?: string | null;
  UPD_Date?: string | null;
  UPD_USR_No?: string | null;
  UPD_USR_Name?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class TLS53020Service {
  private apiUrl: string = environment.ApiUrl;

  constructor(
    private http: HttpClient,
  ) { }

  queryTLS53020(data: TLS53020QueryParams): Observable<ApiResponse<TLS53020Data[]>> {
    return this.http.post<ApiResponse<TLS53020Data[]>>(`${this.apiUrl}/TLS0000/TLS5000/queryTLS53020`, data);
  }

  uploadTLS53020(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/TLS0000/TLS5000/uploadTLS53020`, formData);
  }
}
