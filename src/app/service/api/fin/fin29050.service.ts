import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseQueryRequest, BaseQueryResponse } from '@shared/models/api/base-api.interface';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';

// 查詢請求介面
export interface QueryFIN29050Request extends BaseQueryRequest {
  VEN_No_From?: string;      // 廠商代號(起)
  VEN_No_To?: string;        // 廠商代號(迄)
  ACP_Date_From: string;     // 立帳日期(起) 必填
  ACP_Date_To: string;       // 立帳日期(迄) 必填
  ACP_Amt_From?: number;     // 應付金額(起)
  ACP_Amt_To?: number;       // 應付金額(迄)
  AccNo_From?: string;       // 科目代號(起)
  AccNo_To?: string;         // 科目代號(迄)
}

// 查詢結果資料介面
export interface FIN29050Data {
  VendorNo: string;
  VendorName: string;
  Summary: string;
  BookDate: string;
  VoucherNo: string;
  PayableAmount: number;
  OffsetAmount: number;
  ReservationAmount: number;
  OffsetReservationAmount: number;
  UnpaidAmount: number;
}

@Injectable({ providedIn: 'root' })
export class FIN29050Service {
  private apiUrl = environment.ApiUrl + '/FIN0000/APS1000';

  constructor(private http: HttpClient) { }

  queryFIN29050(data: QueryFIN29050Request): Observable<BaseQueryResponse<FIN29050Data>> {
    return this.http.post<BaseQueryResponse<FIN29050Data>>(`${this.apiUrl}/queryFIN29050`, data);

    // 回傳模擬資料
    return of({
      Status: '0000',
      Message: '',
      TotalCount: 1,
      TotalPage: 1,
      Data: [
        {
          VendorNo: 'V001',
          VendorName: '廠商A',
          Summary: '摘要A',
          BookDate: '2024-01-01',
          VoucherNo: '20251001002',
          PayableAmount: 10000,
          OffsetAmount: 2000,
          ReservationAmount: 500,
          OffsetReservationAmount: 300,
          UnpaidAmount: 7200
        }
      ]
    })
  }

  exportFIN29050_PDF(data: QueryFIN29050Request): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/exportFIN29050PDF`, data, {
      observe: 'response',
      responseType: 'blob'
    });
  }

  exportFIN29050_Excel(data: QueryFIN29050Request): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/exportFIN29050`, data, {
      observe: 'response',
      responseType: 'blob'
    });
  }
}