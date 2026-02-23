import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface SortItem { field: string; order: number }

export interface DropDownItem {
  No: string;
  Name: string;
}
export interface DropDownListResponse {
  Status?: string;
  Data?: DropDownItem[];
  Message?: string;
  TotalCount?: number;
  TotalPage?: number;
  Error?: { Code?: string; Message?: string; Details?: string };
  Meta?: { Timestamp?: string; RequestId?: string };
}
export interface OptionItem { value: string; label: string }

export interface QueryTLS25030Request {
  PageSize: number;
  PageIndex: number;
  SortBy?: SortItem[];

  tlt_no?: string;
  tlt_name?: string;
  violation_type?: string;
  cap_item?: string;

  amount_s?: number;
  amount_e?: number;

  deduct_date_s?: string;
  deduct_date_e?: string;
  fine_date_s?: string;
  fine_date_e?: string;

  fine_no?: string;
  org_id?: string;
  crt_usr_no?: string;

  floors?: string;
  upd_date?: string;
  fine_status?: string;

  pay_type?: string;

  [key: string]: any;
}

export interface QueryTLS25030Row {
  TotalCount: number;
  RowNo?: string;
  ID: number;

  fine_no?: string;
  tlt_no?: string;
  tlt_name?: string;

  deduct_date?: string;

  Violation_type?: string;
  Violation_type_Name?: string;

  CAP_Item?: string;
  CAP_Name?: string;

  fine_amount?: string;

  org_id?: string;
  Org_Name?: string;

  fine_date?: string;

  CRT_USR_No?: string;
  CRT_USR_Name?: string;

  UPD_Date?: string;

  payment_status?: string;
  payment_status_Name?: string;

  violation_otherdesc?: string;

  fine_status?: string;

  [key: string]: any;
}

export interface QueryTLS25030DetailRequest {
  fine_no: string;
}
export interface QueryTLS25030DetailResponse {
  ID: number;
  fine_no?: string;
  tlt_no?: string;
  talent_id?: string;
  org_id?: string;
  fine_date?: string;
  fine_status?: string;

  CAP_Type?: string;
  CAP_Item?: string;

  fine_amount?: string;
  Violation_Facts?: string;
  Violation_type?: string;

  violation_otherdesc?: string;

  pay_type?: string;
  pay_otherdesc?: string;

  payment_status?: string;
  deduct_date?: string;

  APAR_No?: string;

  CRT_USR_No?: string;
  CRT_USR_Name?: string;
  CRT_Date?: string;

  UPD_USR_No?: string;
  UPD_USR_Name?: string;
  UPD_Date?: string;

  [key: string]: any;
}

export interface InsertTLS25030Request {
  tlt_no: string;
  talent_id: number;
  org_id: string;
  fine_date: string;
  fine_amount: number;
  Violation_type: string;
  pay_type: string;
  deduct_date: string;

  Violation_Facts?: string;
  violation_otherdesc?: string;
  pay_otherdesc?: string;
}

export interface UpdateTLS25030Request {
  fine_no: string;
  Violation_type: string;
  pay_type: string;
  deduct_date: string;

  Violation_Facts?: string;
  violation_otherdesc?: string;
  pay_otherdesc?: string;
}

export interface UpdateTLS25030StatusRequest {
  fine_status: string;
  fine_noList: string[];
}

@Injectable({ providedIn: 'root' })
export class TLS25030Service {
  private apiUrl = `${environment.ApiUrl}/TLS0000/TLS2000`;

  // ✅ dropdown endpoints 若在別的 controller，可自行調整
  private baseUrl = `${environment.ApiUrl}`;

  constructor(private http: HttpClient) { }

  queryTLS25030(body: QueryTLS25030Request): Observable<ApiResponse<QueryTLS25030Row[]>> {
    return this.http.post<ApiResponse<QueryTLS25030Row[]>>(`${this.apiUrl}/queryTLS25030`, body);
  }

  queryTLS25030Detail(body: QueryTLS25030DetailRequest): Observable<ApiResponse<QueryTLS25030DetailResponse>> {
    return this.http.post<ApiResponse<QueryTLS25030DetailResponse>>(`${this.apiUrl}/queryTLS25030Detail`, body);
  }

  insertTLS25030(body: InsertTLS25030Request): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.apiUrl}/insertTLS25030`, body);
  }

  updateTLS25030(body: UpdateTLS25030Request): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.apiUrl}/updateTLS25030`, body);
  }

  updateTLS25030Status(body: UpdateTLS25030StatusRequest): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.apiUrl}/updateTLS25030Status`, body);
  }

  // ================= 匯出（你原本的） =================
  exportTLS25030PDF(body: QueryTLS25030Request): Observable<HttpResponse<Blob>> {
    const url = `${this.apiUrl}/exportTLS25030_PDF`;
    const payload = this.stripPaging(body);
    return this.http.post(url, payload, {
      observe: 'response',
      responseType: 'blob' as 'json',
    }) as Observable<HttpResponse<Blob>>;
  }

  exportTLS25030Excel(body: QueryTLS25030Request): Observable<HttpResponse<Blob>> {
    const url = `${this.apiUrl}/exportTLS25030_Excel`;
    const payload = this.stripPaging(body);
    return this.http.post(url, payload, {
      observe: 'response',
      responseType: 'blob' as 'json',
    }) as Observable<HttpResponse<Blob>>;
  }

  private stripPaging<T extends Record<string, any>>(input: T): any {
    if (!input) return input as any;
    const { PageSize, PageIndex, OrderBy, Offset, pageSize, pageIndex, orderBy, offset, ...rest } = input as any;
    return rest as any;
  }

  // ================= ✅ Dropdowns Once（新增） =================



}

export { ApiResponse };

