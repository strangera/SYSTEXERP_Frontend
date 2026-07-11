import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from './fin26010.service';

export interface APS3006Response {
  PAM_No: string; // 付款編號（開票單號）
  CHK_IssueDate: string; // 開票日期
  BNK_id: string; // 銀行代碼
  BNK_AccName: string; // 銀行帳戶名稱
}

export interface QueryFIN65010Request {
  VEN_No?: string; // 廠商代碼
  CHK_No_S?: number; // 票據號碼起
  CHK_No_E?: number; // 票據號碼迄
  CHK_IssueDate_S?: Date; // 開票日期起
  CHK_IssueDate_E?: Date; // 開票日期迄
  PAM_No?: string; // 開票單號
  VouNo_S?: number; //傳票號碼起
  VouNo_E?: number; //傳票號碼迄
}

export interface QueryFIN65010Response {
  CheckNo: string; // 票據號碼
  IssueDate: string; // 開票日期
  BNK_No: string; // 全省銀行代號
  BNK_AccNo: string; // 銀行帳號
  PaymentBank: string; // 付款銀行
  DueDate: string; // 到期日
  VEN_No: string; // 廠商代號
  VEN_Name: string; // 廠商名稱
  Amount: number; // 金額
  Summary: string; // 摘要
  IssueAmount: number; // 開票金額
  ContactName: string; // 聯絡人姓名
  ContactPhone: string; // 聯絡人電話
  TotalCount: number; // 總筆數
  TotalPage: number; // 總頁數
}

@Injectable({
  providedIn: 'root'
})
export class Fin65010Service {
  private readonly apiUrl = `${environment.ApiUrl}/FIN0000/NTS1000`;

  constructor(private readonly http: HttpClient) { }

  queryFIN65010(body: QueryFIN65010Request): Observable<ApiResponse<QueryFIN65010Response[]>> {
    return this.http.post<ApiResponse<QueryFIN65010Response[]>>(`${this.apiUrl}/queryFIN65010`, body);
  }

  queryAPS3006_DropDownList(PAM_No: string | null): Observable<ApiResponse<APS3006Response[]>> {
    return this.http.post<ApiResponse<APS3006Response[]>>(`${environment.ApiUrl}/queryAPS3006_DropDownList`, { PAM_No });
  }
}
