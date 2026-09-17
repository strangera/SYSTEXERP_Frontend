import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from './tls25030.service';

export interface InsertTLS47010Request {
  DEFTBL_List: string;
  POS1002_List: string;
}

/** 下傳批次追蹤鍵 */
export interface TLS47010TrackingKey {
  ID: number;
  CRT_Date: string;
  EXP_Type: string;
  EXP_EcrLst: string | null;
}

export interface InsertTLS47010Response {
  TrackingKeys: TLS47010TrackingKey[];
}

/** 當天下傳紀錄(全部使用者) */
export interface TLS47010TodayRecord {
  ID: number;
  EXP_Type: string | null;
  EXP_EcrLst: string | null;
  StatusText: string;
  Reason: string | null;
  EXP_Time: string | null;
  CRT_USR_No: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class TLS47010Service {
  private readonly apiUrl = environment.ApiUrl;
  private readonly http = inject(HttpClient);
  insertTLS47010(data: InsertTLS47010Request): Observable<ApiResponse<InsertTLS47010Response>> {
    return this.http.post<ApiResponse<InsertTLS47010Response>>(`${this.apiUrl}/TLS0000/TLS4000/insertTLS47010`, data);
  }
  queryTLS47010TodayRecords(): Observable<ApiResponse<TLS47010TodayRecord[]>> {
    return this.http.post<ApiResponse<TLS47010TodayRecord[]>>(`${this.apiUrl}/TLS0000/TLS4000/queryTLS47010TodayRecords`, {});
  }
}
