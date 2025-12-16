import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';

/** =========================
 *  API DTOs (依你貼的 Swagger)
 *  ========================= */

export type SortItem = { field: string; order: number };

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
  Loan_Date: string; // ISO string
  Loan_Time: string; // string
  User_Name: string;
  Loan_Phone: string;
  Loan_USR_No: string;
  Cert_Type: string;
  Cert_No: string;

  [key: string]: any;
}

export interface QueryDailyEquipAvailabilityRequest {
  Service_Id: string;
}

export interface DailyEquipAvailabilityRow {
  Device_ID: string;
  Device_Name: string;
  Device_Qty: number;
}

export interface InsertDailyEquipAvailabilityRequest {
  CSS_Date: string;     // ISO string
  Service_Id: string;
  Device_ID: string;
  CSS_PriorQty: number;
  CSS_LendQty: number;
  CSS_ReturnQty: number;
  CSS_CurrentQty: number;
}

/** =========================
 *  (可選) CPM11030 CRU (若後端有提供)
 *  ========================= */
export interface Cpm11030CruPayload {
  ID?: number;
  Loan_No?: string;
  Loan_Date: string;     // ISO / yyyy-MM-dd (依你後端實作)
  Loan_Time?: string;    // HH:mm:ss
  Service_Id: string;
  User_Name: string;
  Loan_USR_No: string;
  Loan_Phone: string;
  Cert_Type: string;
  Cert_No: string;
  Device_ID?: string;
  Device_Name?: string;
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

  /** 每日設備可出借量：新增 /insertCPM11030_DailyEquipAvailability
   *  Swagger 看起來是「一次新增一筆」，所以這裡提供逐筆送出（forkJoin）
   */
  insertCPM11030_DailyEquipAvailability(
    body: InsertDailyEquipAvailabilityRequest
  ): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/insertCPM11030_DailyEquipAvailability`,
      body
    );
  }

  /** 批次儲存（逐筆 insert） */
  saveDailyEquipAvailabilityBatch(items: InsertDailyEquipAvailabilityRequest[]) {
    if (!items?.length) {
      // 讓呼叫端好處理：回一個 forkJoin 空陣列會直接 complete，這裡給個最小保險
      return forkJoin([]);
    }
    return forkJoin(items.map((x) => this.insertCPM11030_DailyEquipAvailability(x)));
  }

  /** (可選) CPM11030 新增/修改：如果你後端確實有這兩支，就可直接用
   *  沒有的話，你可以先留著，或改成你實際 endpoint。
   */
  insertCPM11030(body: Cpm11030CruPayload): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/insertCPM11030`, body);
  }

  updateCPM11030(body: Cpm11030CruPayload): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/updateCPM11030`, body);
  }
}

export { ApiResponse };
