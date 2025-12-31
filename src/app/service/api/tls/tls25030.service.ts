import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';

/** =========================
 *  Common
 *  ========================= */
export type SortItem = { field: string; order: number };

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
  Error?: {
    Code?: string;
    Message?: string;
    Details?: string;
  };
  Meta?: {
    Timestamp?: string;
    RequestId?: string;
  };
}
export type OptionItem = { value: string; label: string };

/** =========================
 *  Query: /queryTLS25030
 *  ========================= */
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

  deduct_date_s?: string; // ISO string
  deduct_date_e?: string; // ISO string
  fine_date_s?: string;   // ISO string
  fine_date_e?: string;   // ISO string

  fine_no?: string;
  org_id?: string;
  crt_usr_no?: string;

  /** 後端目前是 string? floors，多選通常會用逗號字串 */
  floors?: string;

  upd_date?: string;      // ISO string
  fine_status?: string;

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

  [key: string]: any;
}

/** =========================
 *  Detail: /queryTLS25030Detail
 *  ========================= */
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

/** =========================
 *  Insert/Update/UpdateStatus
 *  ========================= */
export interface InsertTLS25030Request {
  tlt_no: string;
  talent_id: number;
  org_id: string;
  fine_date: string;      // ISO datetime
  fine_amount: number;
  Violation_type: string; // 注意：後端 Insert 用 Violation_type (大寫 V)
  pay_type: string;
  deduct_date: string;    // ISO datetime

  Violation_Facts?: string;
  violation_otherdesc?: string;
  pay_otherdesc?: string;
}

export interface UpdateTLS25030Request {
  fine_no: string;
  Violation_type: string;
  pay_type: string;
  deduct_date: string; // ISO datetime

  Violation_Facts?: string;
  violation_otherdesc?: string;
  pay_otherdesc?: string;
}

export interface UpdateTLS25030StatusRequest {
  fine_status: string; // 0=作廢 1=建立
  fine_noList: string[];
}

@Injectable({ providedIn: 'root' })
export class TLS25030Service {
  private apiUrl = `${environment.ApiUrl}/TLS0000/TLS2000`;
  private DLapiUrl = `${environment.ApiUrl}`;

  /** ✅ 下拉快取（你把 endpoint 改成實際存在的就能用） */
  private dropdownOnce$?: Observable<{
    violationType: DropDownListResponse;
    capItem: DropDownListResponse;
    org: DropDownListResponse;
    floors: DropDownListResponse;
    payType: DropDownListResponse;
  }>;

  constructor(private http: HttpClient) {}

  /** ✅ Query/CRU 共用下拉（只打一次） */
  getDropdownsOnce(): Observable<{
    violationType: DropDownListResponse;
    capItem: DropDownListResponse;
    org: DropDownListResponse;
    floors: DropDownListResponse;
    payType: DropDownListResponse;
  }> {
    if (!this.dropdownOnce$) {
      this.dropdownOnce$ = forkJoin({
        violationType: this.queryTLS25030_ViolationType_DropDownList(),
        capItem: this.queryTLS25030_CapItem_DropDownList(),
        org: this.queryTLS25030_Org_DropDownList(),
        floors: this.queryTLS25030_Floors_DropDownList(),
        payType: this.queryTLS25030_PayType_DropDownList(),
      }).pipe(shareReplay(1));
    }
    return this.dropdownOnce$;
  }

  /** 列表查詢：/queryTLS25030 */
  queryTLS25030(body: QueryTLS25030Request): Observable<ApiResponse<QueryTLS25030Row[]>> {
    return this.http.post<ApiResponse<QueryTLS25030Row[]>>(`${this.apiUrl}/queryTLS25030`, body);
  }

  /** 明細：/queryTLS25030Detail */
  queryTLS25030Detail(body: QueryTLS25030DetailRequest): Observable<ApiResponse<QueryTLS25030DetailResponse>> {
    return this.http.post<ApiResponse<QueryTLS25030DetailResponse>>(`${this.apiUrl}/queryTLS25030Detail`, body);
  }

  /** 新增：/insertTLS25030 */
  insertTLS25030(body: InsertTLS25030Request): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.apiUrl}/insertTLS25030`, body);
  }

  /** 更新：/updateTLS25030 */
  updateTLS25030(body: UpdateTLS25030Request): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.apiUrl}/updateTLS25030`, body);
  }

  /** 更新狀態：/updateTLS25030Status */
  updateTLS25030Status(body: UpdateTLS25030StatusRequest): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.apiUrl}/updateTLS25030Status`, body);
  }

  // ================= 匯出（可選：若後端有做 export 再打開） =================

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

  // ================= 下拉（請改成你專案實際 endpoint） =================
  queryTLS25030_ViolationType_DropDownList(body?: any): Observable<DropDownListResponse> {
    return this.http.post<DropDownListResponse>(`${this.DLapiUrl}/queryTLS25030_ViolationType_DropDownList`, body ?? {});
  }
  queryTLS25030_CapItem_DropDownList(body?: any): Observable<DropDownListResponse> {
    return this.http.post<DropDownListResponse>(`${this.DLapiUrl}/queryTLS25030_CapItem_DropDownList`, body ?? {});
  }
  queryTLS25030_Org_DropDownList(body?: any): Observable<DropDownListResponse> {
    return this.http.post<DropDownListResponse>(`${this.DLapiUrl}/queryTLS25030_Org_DropDownList`, body ?? {});
  }
  queryTLS25030_Floors_DropDownList(body?: any): Observable<DropDownListResponse> {
    return this.http.post<DropDownListResponse>(`${this.DLapiUrl}/queryTLS25030_Floors_DropDownList`, body ?? {});
  }
  queryTLS25030_PayType_DropDownList(body?: any): Observable<DropDownListResponse> {
    return this.http.post<DropDownListResponse>(`${this.DLapiUrl}/queryTLS25030_PayType_DropDownList`, body ?? {});
  }
}

export { ApiResponse };
