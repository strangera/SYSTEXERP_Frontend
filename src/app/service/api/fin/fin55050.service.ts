/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

/** 查詢（/FIN0000/GLS1000/queryFIN55050）Payload */
export interface QueryFIN55050Payload {
  pageSize: number;   // ✅ 小寫
  pageIndex: number;  // ✅ 小寫
  SortBy: { field: string; order: number }[];

  DateFrom: string;
  DateTo: string;
  OrgIdList: string[];
  AccNoList: string[];
  VendorNoList: string[];
  PTAFrom: string;
  PTATo: string;
  TargetNoList: string[];
  Notes: string;
  VouTypeList: string[];
  VouStatusList: string[];
  IsTarget: string;
}


/** 匯出（/FIN0000/GLS1000/exportFIN55050*）Payload */
export interface ExportFIN55050Payload {
  SortBy: { field: string; order: number }[];
  DateFrom: string;      // yyyy-MM-dd
  DateTo: string;        // yyyy-MM-dd
  OrgIdList: string[];
  AccNoList: string[];
  VendorNoList: string[];
  PTAFrom: string;
  PTATo: string;
  TargetNoList: string[];
  Notes: string;
  VouTypeList: string[];
  VouStatusList: string[];
  IsTarget: string;      // 'Y' | 'N' | ''
}

/** 傳票 Response 資料結構 */
export interface FIN55050Data {
  ID: number;
  VOUNO?: string;
  DETAILNO?: string;
  POSTFLAG?: string;
  ORG_ID?: string;
  ORG_NAME?: string;
  ProjectNo?: string;
  PTA?: string;
  NoteDesc?: string;
  D_AMT?: number;
  C_AMT?: number;
  Balance?: number;
}

@Injectable({ providedIn: 'root' })
export class FIN55050Service {
  /** 後端 API（query/export 同一個模組） */
  private baseApi = environment.ApiUrl + '/FIN0000/GLS1000';

  constructor(private http: HttpClient) {}

  /** 查詢（有分頁/排序） */
  queryFIN55050(body: QueryFIN55050Payload): Observable<any> {
    const url = `${this.baseApi}/queryFIN55050`;
    return this.http.post<any>(url, body);
  }

  /** 匯出 Excel（不分頁） */
  exportFIN55050Excel(body: ExportFIN55050Payload): Observable<HttpResponse<Blob>> {
    const url = `${this.baseApi}/exportFIN55050`;
    return this.http.post(url, body, {
      observe: 'response',
      responseType: 'blob' as 'json',
    }) as Observable<HttpResponse<Blob>>;
  }

  /** 匯出 PDF（不分頁） */
  exportFIN55050PDF(body: ExportFIN55050Payload): Observable<HttpResponse<Blob>> {
    const url = `${this.baseApi}/exportFIN55050PDF`;
    return this.http.post(url, body, {
      observe: 'response',
      responseType: 'blob' as 'json',
    }) as Observable<HttpResponse<Blob>>;
  }
}
