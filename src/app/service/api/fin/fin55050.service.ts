import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseQueryRequest, BaseQueryResponse } from '@shared/models/api/base-api.interface';
import { environment } from 'src/environments/environment';

// 查詢 Request
export interface QueryFIN55050Request extends BaseQueryRequest {
  DateFrom: string;
  DateTo: string;
  OrgIdList?: string[];
  AccNoList?: string[];
  VendorNoList?: string[];
  PTAFrom?: string;
  PTATo?: string;
  TargetNoList?: string[];
  Notes?: string;
  VouTypeList?: string[];
  VouStatusList?: string[];
  IsTarget: string;
}

// 明細 Row
export interface FIN55050Detail {
  VouNo: string;
  Ven_Name: string;
  VouStatus: string;
  ORG_ID: string;
  Org_Name: string;
  ProjectNo: string;
  PTA: string;
  NoteDesc: string;
  AccAmt_D: number;
  AccAmt_C: number;
  OpeningBal: number;
}

// 巢狀父資料（包含 _Details）
export interface FIN55050Data {
  AccNo: string;
  AccCName: string;
  VouDate: string;
  _Details: FIN55050Detail[];
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
  private apiUrl = environment.ApiUrl + '/FIN0000/GLS1000';

  constructor(private http: HttpClient) {}

  /** 查詢分類帳（回傳含 _Details 的巢狀資料） */
  queryFIN55050(req: QueryFIN55050Request): Observable<BaseQueryResponse<FIN55050Data>> {
    return this.http.post<BaseQueryResponse<FIN55050Data>>(`${this.apiUrl}/queryFIN55050`, req);
  }

  /** 匯出 Excel（不分頁） */
  exportFIN55050Excel(body: ExportFIN55050Payload): Observable<HttpResponse<Blob>> {
    const url = `${this.apiUrl}/exportFIN55050`;
    return this.http.post(url, body, {
      observe: 'response',
      responseType: 'blob' as 'json',
    }) as Observable<HttpResponse<Blob>>;
  }

  /** 匯出 PDF（不分頁） */
  exportFIN55050PDF(body: ExportFIN55050Payload): Observable<HttpResponse<Blob>> {
    const url = `${this.apiUrl}/exportFIN55050PDF`;
    return this.http.post(url, body, {
      observe: 'response',
      responseType: 'blob' as 'json',
    }) as Observable<HttpResponse<Blob>>;
  }
  
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
queryFIN55050Detail(body: { VouNo: string }): Observable<any> {
  const url = `${this.apiUrl}/queryFIN55050Detail`.replace('/FIN0000/GLS1000', '/FIN0000/GLS1000'); // 保持同路徑前綴
  return this.http.post<any>(`${environment.ApiUrl}/FIN0000/GLS1000/queryFIN55050Detail`, body);
}

}
