/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface QueryFIN55060Payload {
  AccNoFrom: string;
  AccNoTo: string;
  DateFrom: string;       // yyyy-MM-dd
  DateTo: string;         // yyyy-MM-dd
  OrgId: string;
  Notes: string;
  VendorFrom: string;
  VendorTo: string;
  PTAFrom: string;
  PTATo: string;
  VouType: string;
  VouStatus: string;
  TargetNo: string;
}

export interface FIN55060DetailRow {
  AccNo: string;
  AccCName: string;
  DetailNo: string | null;
  ORG_ID: string | null;
  Org_Name: string | null;
  ProjectNo: string | null;
  Debit_Amt: number;
  Credit_Amt: number;
  OpeningBal: number;
}
export interface ExportFIN55060Payload {
  AccNoFrom: string;
  AccNoTo: string;
  DateFrom: string;
  DateTo: string;
  OrgId: string;
  Notes: string;
  VendorFrom: string;
  VendorTo: string;
  PTAFrom: string;
  PTATo: string;
  VouType: string;
  VouStatus: string;
  TargetNo: string;
  /** 匯出會科是否單一頁（Y=不拆分頁/N=依會科拆分頁），未帶預設 N */
  IsExportSingle?: string;
}
@Injectable({ providedIn: 'root' })
export class FIN55060Service {
  private baseApi = environment.ApiUrl + '/FIN0000/GLS1000';

  constructor(private http: HttpClient) { }

  /** 查詢（回傳 AccNo4 群組 + _Details） */
  queryFIN55060(body: QueryFIN55060Payload): Observable<any> {
    const url = `${this.baseApi}/queryFIN55060`;
    return this.http.post<any>(url, body);
  }

  /** 匯出 PDF */
  exportFIN55060PDF(body: ExportFIN55060Payload): Observable<HttpResponse<Blob>> {
    const url = `${this.baseApi}/exportFIN55060PDF`;
    return this.http.post(url, body, {
      responseType: 'blob',
      observe: 'response',
    });
  }

  /** 匯出 Excel */
  exportFIN55060Excel(body: ExportFIN55060Payload): Observable<HttpResponse<Blob>> {
    const url = `${this.baseApi}/exportFIN55060`;
    return this.http.post(url, body, {
      responseType: 'blob',
      observe: 'response',
    });
  }
}
