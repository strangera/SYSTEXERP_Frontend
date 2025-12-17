import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';

/** =========================
 *  Common
 *  ========================= */
export type SortItem = { field: string; order: number };

/** =========================
 *  Query: /queryCPM11030
 *  ========================= */
export interface QueryCPM11030Request {
  PageSize: number;
  PageIndex: number;
  SortBy?: SortItem[];

  Loan_No?: string;
  Loan_BDate?: string; // ISO string
  Loan_EDate?: string; // ISO string
  User_Name?: string;
  Loan_USR_No?: string;
  Loan_Phone?: string;
  Cert_Type?: string;
  Cert_No?: string;
  Device_Name?: string;
  Device_ID?: string;
  Service_Id?: string;

  [key: string]: any;
}

export interface QueryCPM11030Row {
  ID: number;
  Loan_No: string;
  Service_Id: string;

  Loan_Date: string;   // ISO datetime
  Loan_Time: string;   // string
  Loan_Status: string; // string

  User_Name: string;
  Cert_Type: string;
  Cert_No: string;
  Loan_Phone: string;

  Device_ID: string;
  Device_Name: string;

  Loan_USR_No?: string;

  [key: string]: any;
}

/** =========================
 *  Daily Equip Availability
 *  ========================= */
export interface QueryDailyEquipAvailabilityRequest {
  Service_Id: string;
}

export interface DailyEquipAvailabilityRow {
  Device_ID: string;
  Device_Name: string;
  Device_Qty: number;
}

export interface InsertDailyEquipAvailabilityRequest {
  CSS_Date: string; // ISO string
  Service_Id: string;
  Device_ID: string;
  CSS_PriorQty: number;
  CSS_LendQty: number;
  CSS_ReturnQty: number;
  CSS_CurrentQty: number;
}

/** =========================
 *  CRU: insert/update CPM11030
 *  ========================= */
export interface InsertCPM11030Request {
  Service_Id: string;
  Loan_Date: string;   // ISO datetime
  Loan_Time: string;   // string
  Loan_Status: string; // string
  User_Name: string;
  Cert_Type: string;
  Cert_No: string;
  Loan_Phone: string;
  Device_ID: string;
  Device_Name: string;
}

export interface UpdateCPM11030Request extends InsertCPM11030Request {
  ID: number;
  Loan_No: string;
}

@Injectable({ providedIn: 'root' })
export class Cpm11030Service {
  private apiUrl = `${environment.ApiUrl}/CPM0000/CPM1000`;

  constructor(private http: HttpClient) {}

  /** 列表查詢：/queryCPM11030 */
  queryCPM11030(body: QueryCPM11030Request): Observable<ApiResponse<QueryCPM11030Row[]>> {
    return this.http.post<ApiResponse<QueryCPM11030Row[]>>(
      `${this.apiUrl}/queryCPM11030`,
      body
    );
  }

  /** 每日設備可出借量：查詢 /queryCPM11030_DailyEquipAvailability */
  queryCPM11030_DailyEquipAvailability(
    body: QueryDailyEquipAvailabilityRequest
  ): Observable<ApiResponse<DailyEquipAvailabilityRow[]>> {
    return this.http.post<ApiResponse<DailyEquipAvailabilityRow[]>>(
      `${this.apiUrl}/queryCPM11030_DailyEquipAvailability`,
      body
    );
  }

  /** 每日設備可出借量：新增 /insertCPM11030_DailyEquipAvailability（一次一筆） */
  insertCPM11030_DailyEquipAvailability(
    body: InsertDailyEquipAvailabilityRequest
  ): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/insertCPM11030_DailyEquipAvailability`,
      body
    );
  }

  /** 新增：/insertCPM11030 */
  insertCPM11030(body: InsertCPM11030Request): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/insertCPM11030`, body);
  }

  /** 更新：/updateCPM11030 */
  updateCPM11030(body: UpdateCPM11030Request): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/updateCPM11030`, body);
  }

  // ================= 匯出 =================

  /** 匯出 PDF（不分頁） */
  exportCPM11030PDF(body: QueryCPM11030Request): Observable<HttpResponse<Blob>> {
    const url = `${this.apiUrl}/exportCPM11030_PDF`;
    const payload = this.stripPaging(body);
    return this.http.post(url, payload, {
      observe: 'response',
      responseType: 'blob' as 'json',
    }) as Observable<HttpResponse<Blob>>;
  }

  /** 匯出 Excel（不分頁） */
  exportCPM11030Excel(body: QueryCPM11030Request): Observable<HttpResponse<Blob>> {
    const url = `${this.apiUrl}/exportCPM11030_Excel`;
    const payload = this.stripPaging(body);
    return this.http.post(url, payload, {
      observe: 'response',
      responseType: 'blob' as 'json',
    }) as Observable<HttpResponse<Blob>>;
  }

  /**
   * 工具：移除分頁相關欄位（匯出不需要）
   * - 同時移除大小寫鍵：pageSize/pageIndex/orderBy/offset 與 PageSize/PageIndex/OrderBy/Offset
   * - 保留 SortBy
   */
  private stripPaging<T extends Record<string, any>>(input: T): Omit<T,
    'PageSize' | 'PageIndex' | 'OrderBy' | 'Offset' |
    'pageSize' | 'pageIndex' | 'orderBy' | 'offset'
  > {
    if (!input) return input as any;
    const {
      PageSize, PageIndex, OrderBy, Offset,
      pageSize, pageIndex, orderBy, offset,
      ...rest
    } = input as any;
    return rest as any;
  }
}

export { ApiResponse };
