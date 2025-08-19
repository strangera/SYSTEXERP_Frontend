import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { BaseQueryRequest, BaseQueryResponse } from '@shared/models/api/base-api.interface';

export interface FIN15020QueryRequest extends BaseQueryRequest {
  MID?: number;
  STO_No?: string;
  TXN_Ret_No_S?: string;
  TXN_Ret_No_E?: string;
  PUR_GUIDate?: string;
  PUR_VoucherType?: string;
  GUI_Track?: string;
  PUR_GUINo_S?: string;
  PUR_GUINo_E?: string;
  PUR_GUIDate_S?: string;
  PUR_GUIDate_E?: string;
  Credit_Type?: string;
  PUR_RepYYYYMM?: string;
  PUR_GUIDateYYYYMM_S?: string;
  PUR_GUIDateYYYYMM_E?: string;
  Source_Doc_No_S?: string;
  Source_Doc_No_E?: string;
  Voucher_No_S?: string;
  Voucher_No_E?: string;
  SAL_Type?: string;
}

export interface FIN15020Data {
  No: number;
  TXN_Ret_No: string;
  PUR_VoucherType: string;
  GUI_Track: string;
  InvoiceNo: string;
  PUR_GUIDate: string;
  Credit_Type: string;
  PUR_RepYYYYMM: string;
  PUR_Net: number;
  PUR_Tax: number;
  Source_Doc_No: string;
  Voucher_No: string;
  SAL_Type: string;
  PUR_DiscNo: string;
  PUR_Uniform: string;
}

export interface FIN15020PrintRequest extends FIN15020QueryRequest {
  IsMerge?: boolean;
  IsExcel?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class FIN15020Service {
  private readonly apiUrl = `${environment.ApiUrl}/FIN0000/INV1000`;

  constructor(private http: HttpClient) { }

  queryFIN15020(data: FIN15020QueryRequest): Observable<BaseQueryResponse<FIN15020Data>> {
    return this.http.post<BaseQueryResponse<FIN15020Data>>(`${this.apiUrl}/queryFIN15020`, data);
  }

  // 列印進貨退出或折讓明細表
  printFIN15020(data: FIN15020PrintRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/printFIN15020`, data);
  }
}