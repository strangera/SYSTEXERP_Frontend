import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@service/system/auth.service';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface queryParams {
  TXN_Date: string,
  TLT_NOList: string[],
  ECR_NoList: string[],
  ACT_PayAmt: string
}

export interface TLS27020Data {
  id: number,
  TXN_Date: string,
  ECR_No: string,
  TLT_NO: string,
  tlt_name: string,
  BOOK_PayAmt: number,
  ACT_PayAmt: number,
  ACT_PayAmt_ori: number,
  MOD_PayAmt: number,
  mod_date: string,
  crt_usr_name: string
  Check_Status: string
  isClose: string
}

export interface CheckValue {
  SYS_StoreNo: string
  TXN_Date: string
  ECR_No: string
}

export interface InsertTLS27020 {
  SYS_StoreNo: string,
  TXN_Date: string,
  ECR_No: string,
  TLT_NO: string,
  ACT_PayAmt: number,
}
export interface UpdateTLS27020 {
  id: number,
  ACT_PayAmt_ori: number,
  BOOK_PayAmt: number,
  ACT_PayAmt: number,
  MOD_PayAmt: number
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

  queryIsExist(checkValue: CheckValue): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.apiUrl}/queryIsExist`, checkValue);
  }

  queryClsDate(): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.apiUrl}/queryClsDate`, {});
  }

  deleteTLS27020(params: { idList: number[] }): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/deleteTLS27020`, params);
  }
}
