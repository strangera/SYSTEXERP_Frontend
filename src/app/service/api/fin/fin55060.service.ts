/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface QueryFIN55060Payload {
  TXN_BDATE: string;       // yyyy-MM-dd
  TXN_EDATE: string;       // yyyy-MM-dd
  org_idList: string[];
  ProjectNoList: string[];
  AccNoList: string[];
  DetailNoList: string[];
}

export interface ExportFIN55060Payload {
  TXN_BDATE: string;       // yyyy-MM-dd
  TXN_EDATE: string;       // yyyy-MM-dd
  org_idList: string[];
  ProjectNoList: string[];
  AccNoList: string[];
  DetailNoList: string[];
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

@Injectable({ providedIn: 'root' })
export class FIN55060Service {
  private baseApi = environment.ApiUrl + '/FIN0000/GLS1000';

  constructor(private http: HttpClient) {}

  /** 查詢（回傳 AccNo4 群組 + _Details） */
  queryFIN55060(body: QueryFIN55060Payload): Observable<any> {
    const url = `${this.baseApi}/queryFIN55060`;
    return this.http.post<any>(url, body);
  }

  /** 匯出 PDF（等後端 API ready 直接可用） */
  exportFIN55060PDF(body: ExportFIN55060Payload): Observable<HttpResponse<Blob>> {
    const url = `${this.baseApi}/exportFIN55060PDF`;
    return this.http.post(url, body, {
      responseType: 'blob',
      observe: 'response',
    });
  }

  /** 匯出 Excel（等後端 API ready 直接可用） */
  exportFIN55060Excel(body: ExportFIN55060Payload): Observable<HttpResponse<Blob>> {
    const url = `${this.baseApi}/exportFIN55060Excel`;
    return this.http.post(url, body, {
      responseType: 'blob',
      observe: 'response',
    });
  }
}
