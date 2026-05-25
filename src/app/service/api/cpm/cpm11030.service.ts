import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { SortMeta } from 'primeng/api';
import { map, Observable, shareReplay } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface QueryCPM11030Request {
  pageSize: number | null;
  pageIndex: number | null;
  SortBy: SortMeta[] | null;
  Loan_No?: string;
  Loan_BDate?: string;
  Loan_EDate?: string;
  User_Name?: string;
  Loan_USR_No?: string;
  Loan_Phone?: string;
  Cert_Type?: string;
  Cert_No?: string;
  Device_Name?: string;
  Service_Id?: string;
}

export interface QueryCPM11030Row {
  ID: number;
  Loan_No: string;
  Service_Id: string;
  Service_Name: string;
  Loan_Date: string;
  Loan_Time: string;
  Loan_Status: string;
  User_Name: string;
  Cert_Type?: string;
  Cert_No?: string;
  Loan_Phone: string;
  /** 設備名稱聚合字串，例: "設備A x1, 設備B x2" */
  Device_Names: string;
  Loan_USR_No?: string;
}

/** 出借明細 (CSS30011) */
export interface QueryCPM11030DetailRow {
  ID: number;
  Seq_No: number;
  Device_ID: string;
  Device_Name: string;
  Qty: number;
  Dtl_Status: string;
  Return_Date?: string;
}

/** =========================
 *  Daily Equip Availability
 *  ========================= */
export interface QueryDailyEquipAvailabilityRequest {
  Service_Id: string;
  CSS_Date?: string;
}

export interface DailyEquipAvailabilityRow {
  Device_ID: string;
  Device_Name: string;
  Device_TotQty: number;
  CSS_CurrentQty: number;
  CSS_PriorQty: number;
}

export interface InsertDailyEquipAvailabilityRequest {
  CSS_Date: Date | null;
  Service_Id: string;
  Device_ID: string;
  CSS_PriorQty: number;
  CSS_LendQty: number;
  CSS_ReturnQty: number;
  CSS_CurrentQty: number;
}

/** 出借明細 DTO (新增 / 更新共用) */
export interface CPM11030DetailItem {
  Device_ID: string;
  Device_Name: string;
  Qty: number;
}

/** =========================
 *  CRU: insert/update CPM11030
 *  ========================= */
export interface InsertCPM11030Request {
  Service_Id: string;
  Loan_Date: string;
  Loan_Time: string;
  Loan_Status: string;
  User_Name: string;
  Cert_Type?: string | null;
  Cert_No?: string | null;
  Loan_Phone?: string | null;
  Details: CPM11030DetailItem[];
}

export interface UpdateCPM11030Request extends InsertCPM11030Request {
  ID: number;
  Loan_No: string;
}

@Injectable({ providedIn: 'root' })
export class Cpm11030Service {
  private readonly apiUrl = `${environment.ApiUrl}/CPM0000/CPM1000`;

  constructor(private readonly http: HttpClient) { }

  queryCPM11030(body: QueryCPM11030Request): Observable<ApiResponse<QueryCPM11030Row[]>> {
    return this.http.post<ApiResponse<QueryCPM11030Row[]>>(`${this.apiUrl}/queryCPM11030`, body).pipe(
      map(response => {
        if (response && Array.isArray(response.Data)) {
          response.Data = response.Data.map(row => {
            let formattedTime = (row.Loan_Time ?? '').trim();
            if (formattedTime.length > 0) {
              formattedTime = formattedTime.padStart(4, '0');
              if (formattedTime.length === 4) {
                formattedTime = `${formattedTime.substring(0, 2)}:${formattedTime.substring(2, 4)}`;
              }
            }
            return { ...row, Loan_Time: formattedTime };
          });
        }
        return response;
      })
    );
  }

  /** 查詢出借明細 (CSS30011) */
  queryCPM11030Detail(Loan_No: string): Observable<ApiResponse<QueryCPM11030DetailRow[]>> {
    return this.http.post<ApiResponse<QueryCPM11030DetailRow[]>>(
      `${this.apiUrl}/queryCPM11030Detail`, { Loan_No }
    );
  }

  queryCPM11030_DailyEquipAvailability(
    body: QueryDailyEquipAvailabilityRequest
  ): Observable<ApiResponse<DailyEquipAvailabilityRow[]>> {
    return this.http.post<ApiResponse<DailyEquipAvailabilityRow[]>>(
      `${this.apiUrl}/queryCPM11030_DailyEquipAvailability`, body
    ).pipe(shareReplay({ bufferSize: 1, refCount: true }));
  }

  insertCPM11030_DailyEquipAvailability(
    body: InsertDailyEquipAvailabilityRequest
  ): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(`${this.apiUrl}/insertCPM11030_DailyEquipAvailability`, body);
  }

  insertCPM11030(body: InsertCPM11030Request): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(`${this.apiUrl}/insertCPM11030`, body);
  }

  updateCPM11030(body: UpdateCPM11030Request): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(`${this.apiUrl}/updateCPM11030`, body);
  }

  exportCPM11030PDF(body: QueryCPM11030Request): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/exportCPM11030_PDF`, body, {
      observe: 'response', responseType: 'blob' as 'json',
    }) as Observable<HttpResponse<Blob>>;
  }

  exportCPM11030Excel(body: QueryCPM11030Request): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/exportCPM11030_Excel`, body, {
      observe: 'response', responseType: 'blob' as 'json',
    }) as Observable<HttpResponse<Blob>>;
  }
}
