import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseQueryRequest, BaseQueryResponse } from '@shared/models/api/base-api.interface';
import { environment } from 'src/environments/environment';

// 查詢 Request
export interface QueryFIN55010Request extends BaseQueryRequest {
  DateFrom: string;
  DateTo: string;
  VouNoFrom?: string;
  VouNoTo?: string;
  CRT_USR?: string;
  CRT_DateFrom?: string;
  CRT_DateTo?: string;
  VoucherTypeList?: string[];
  VouStatusList?: string[];
}

// 查詢結果 Row
export interface FIN55010Detail {
  VouNo: string;
  VoucherType_Name: string;
  VouDate: string;
  VouStatus: string;
  NoteDesc: string;
  VoucherType: string;
  VouAmt: number;
  DetailCount: number;
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

export interface ExportFIN55010Payload {
  VouNoList: string[];
  PrintType: string;
}

@Injectable({ providedIn: 'root' })
export class FIN55010Service {
  private apiUrl = environment.ApiUrl + '/FIN0000/GLS1000';

  constructor(private http: HttpClient) { }

  /** 查詢傳票列印 */
  queryFIN55010(req: QueryFIN55010Request): Observable<BaseQueryResponse<FIN55010Detail>> {
    return this.http.post<BaseQueryResponse<FIN55010Detail>>(`${this.apiUrl}/queryFIN55010`, req);
  }

  /** 傳票型態下拉 (VoucherTypeOptions) */
  queryGLS1010_DropDownList(): Observable<DropDownResp> {
    const url = `${environment.ApiUrl}/queryGLS1010_DropDownList`;
    return this.http.post<DropDownResp>(url, null);
  }

  /** 匯出傳票列印PDF */
  exportFIN55010PDF(payload: ExportFIN55010Payload): Observable<HttpResponse<Blob>> {
    const url = `${this.apiUrl}/exportFIN55010PDF`;
    return this.http.post(url, payload, { observe: 'response', responseType: 'blob' });
  }
}