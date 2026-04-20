import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface queryParams {
  TXN_Date: string,
  TLT_NOList: string[],
  ECR_NoList: string[],
  TSDP_DepositAmt: number,
}

export interface TLS27020Data {
  ID: number,
  TXN_Date: string,
  ECR_No: string,
  TLT_NO: string,
  tlt_name: string,
  TSDP_DepositAmt: number,
  PRM_TSDP_DepositAmt: number,
  TSDP_PayTime: string,
  TSDP_File: string,
  CRT_USR_No: string,
  Check_Status: string,
  isClose: string,
}
export interface InsertTLS27020 {
  TXN_Date: string,
  ECR_No: string,
  TLT_NO: string,
  Talent_ID: number,
  TSDP_DepositAmt: number,
}
export interface UpdateTLS27020 {
  ID: number,
  Talent_ID: number,
  TXN_Date: string,
  old_TXN_Date: string,
  ECR_No: string,
  old_ECR_No: string,
  TLT_NO: string,
  PayAmt: number,
  TSDP_DepositAmt: number,
  PRM_TSDP_DepositAmt: number,
}
export interface deleteTLS27020 {
  selectList: DeleteItem[];
}
export interface DeleteItem {
  ID: number,
  ECR_No: string,
  TXN_Date: string,
}

@Injectable({
  providedIn: 'root'
})
export class TLS27020Service {

  private readonly apiUrl = environment.ApiUrl + '/TLS0000/TLS2000';

  constructor(private http: HttpClient) { }

  queryTLS27020(queryParams: queryParams): Observable<ApiResponse<TLS27020Data[]>> {
    return this.http.post<ApiResponse<TLS27020Data[]>>(`${this.apiUrl}/queryTLS27020`, queryParams);
  }

  insertTLS27020(data: InsertTLS27020): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(`${this.apiUrl}/insertTLS27020`, data);
  }

  updateTLS27020(data: UpdateTLS27020): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(`${this.apiUrl}/updateTLS27020`, data);
  }

  queryClsDate(): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.apiUrl}/queryClsDate`, {});
  }

  deleteTLS27020(params: deleteTLS27020): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/deleteTLS27020`, params);
  }
}
