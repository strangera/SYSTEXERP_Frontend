import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface QueryTLS28020Request {
  TXN_DATE: string;
  BAG_TYPE: string;
  ECR_NO?: string;
  STATUS?: string;
}

export interface ITLS28020Data {
  SYS_StoreNo: string,
  TXN_Date: string,
  BAG_TYPE: string,
  ECR_No: string,
  TLT_No: string,
  GET_TIME: string,
  BAK_TIME: string,
  CRT_Date: string,
  CRT_USR_No: string,
  CRT_USR_Name: string,
  UPD_Date: string,
  UPD_USR_No: string,
  UPD_USR_Name: string
}

export interface UpdateTLS28020Request {
  TXN_DATE: string;
  ECR_NO: string;
  BAG_TYPE: string;
}

@Injectable({
  providedIn: 'root'
})
export class TLS28020Service {
  private readonly apiUrl = environment.ApiUrl + '/TLS0000/TLS2000'; // 請依實際路徑調整

  constructor(private http: HttpClient) { }

  // 查詢
  queryTLS28020(params: QueryTLS28020Request): Observable<ApiResponse<ITLS28020Data[]>> {
    return this.http.post<ApiResponse<ITLS28020Data[]>>(`${this.apiUrl}/queryTLS28020`, params);
  }

  // 新增 (執行 SP_TLS28020Insert)
  insertTLS28020(params: { TXN_DATE: string | null }): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/insertTLS28020`, params);
  }

  // 掃描條碼更新 (執行 Update 動作)
  updateTLS28020(params: UpdateTLS28020Request): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/updateTLS28020`, params);
  }
}
