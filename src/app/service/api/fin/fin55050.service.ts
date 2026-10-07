import { ApiRequest, ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

// 查詢 Request
export interface QueryFIN55050Request extends ApiRequest {
  SortBy?: { field: string; order: number }[];
  DateFrom: string;
  DateTo: string;
  OrgIdList?: string[];
  AccNoFrom?: string;
  AccNoTo?: string;
  VendorFrom?: string;
  VendorTo?: string;
  PTAFrom?: string;
  PTATo?: string;
  Target?: string;
  Project?: string;
  Notes?: string;
  VoucherType?: string;
  VouStatusList?: string[];
  IsTarget?: string;
  ReportMode?: string;

  OrgId?: string;
}

// 明細 Row
export interface FIN55050Detail {
  DataType?: string;   // 期初 / 明細 / 總計
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
  AccFullLabel?: string;
}

export interface GroupedFIN55050Detail extends FIN55050Detail {
  AccNo: string;
  AccCName: string;
  VouDate: string;
}

// 巢狀父資料（包含 _Details）
export interface FIN55050Data {
  AccNo: string;
  AccCName: string;
  VouDate: string;
  _Details: FIN55050Detail[];
}

export interface VouNoIndexEntry {
  parent: {
    AccNo: string;
    AccCName: string;
    VouDate: string;
  };
  rows: FIN55050Detail[];
  meta: VoucherMeta;
}

export interface VoucherMeta {
  vouNo: string;          // 傳票編號
  vouDate: string;        // 傳票日期
  vouStatus: string | null; // 狀態（從 rows 第一個非空的 VouStatus 推得）
  vouType: string | null;   // 傳票型態（若後端沒有，就先 null；可用 setVoucherType 設定）
}

export interface ExportFIN55050Payload {
  SortBy?: { field: string; order: number }[];
  DateFrom: string;
  DateTo: string;
  OrgIdList: string[];
  IsCludeDownOrg: string;
  AccNoFrom: string;
  AccNoTo: string;
  VendorFrom: string;
  VendorTo: string;
  PTAFrom: string;
  PTATo: string;
  Target: string;
  Project: string;
  Notes: string;
  VoucherType: string;
  VouStatusList: string[];
  IsTarget: string;
  ReportMode: string;
  ACCT_KEY: string;
  AmtFrom?: number | null;
  AmtTo?: number | null;
  /** 匯出會科是否單一頁（Y=不拆分頁/N=依會科拆分頁），未帶預設 N */
  IsExportSingle?: string;
}

export interface VendorPickerItem {
  VEN_No: string;
  VEN_Name: string;
}

export interface VendorPickerRequest {
  VEN_No?: string;
  VEN_Name?: string;
  PageIndex?: number;
  PageSize?: number;
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

  constructor(private http: HttpClient) { }

  /** 查詢分類帳（回傳含 _Details 的巢狀資料） */
  queryFIN55050(req: QueryFIN55050Request): Observable<ApiResponse<FIN55050Data[]>> {
    return this.http.post<ApiResponse<FIN55050Data[]>>(`${this.apiUrl}/queryFIN55050`, req);
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

  /** 匯出明細 PDF */
  exportFIN55050DetailPDF(body: { VouNo: string; SignatureDataType?: string }): Observable<HttpResponse<Blob>> {
    const url = `${this.apiUrl}/exportFIN55050DetailPDF`;
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
  queryVendorPicker(req: VendorPickerRequest): Observable<DropDownResp<VendorPickerItem[]>> {
    return this.http.post<DropDownResp<VendorPickerItem[]>>(`${this.apiUrl}/queryVendorPicker`, req);
  }

  queryFIN55050Detail(body: { VouNo: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryFIN55050Detail`, body);
  }

}
