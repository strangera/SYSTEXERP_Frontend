/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface QueryFIN55050Payload {
  pageSize: number;
  pageIndex: number;
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

export interface ExportFIN55050Payload {
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

export interface DropDownResp<T = { No: string; Name: string }[]> {
  Status: string;
  Data: T;
  Error?: { Code: string; Message: string; Details?: string };
  Meta?: { Timestamp: string; RequestId: string };
  Message?: string;
  TotalCount?: number;
  TotalPage?: number;
}

@Injectable({ providedIn: 'root' })
export class FIN55050Service {
  private baseApi = environment.ApiUrl + '/FIN0000/GLS1000';

  constructor(private http: HttpClient) {}

  /** 查詢（有分頁/排序） */
  queryFIN55050(body: QueryFIN55050Payload): Observable<any> {
    const url = `${this.baseApi}/queryFIN55050`;
    return this.http.post<any>(url, body);
    // 如果你的實際 query 路徑是根目錄也可改成：environment.ApiUrl + '/queryFIN55050'
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

  // =============================
  // ✅ 下拉：POST、無 Body（null）
  // =============================

  /** 對象別下拉 (SubDetailNoOptions) */
  queryGLS1016_DropDownList(): Observable<DropDownResp> {
    const url = `${environment.ApiUrl}/queryGLS1016_DropDownList`;
    return this.http.post<DropDownResp>(url, null);
  }

  /** 傳票型態下拉 (VoucherKindOptions) */
  queryGLS1010_DropDownList(): Observable<DropDownResp> {
    const url = `${environment.ApiUrl}/queryGLS1010_DropDownList`;
    return this.http.post<DropDownResp>(url, null);
  }
}
