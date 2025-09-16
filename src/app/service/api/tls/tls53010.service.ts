import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseQueryRequest, BaseQueryResponse, BaseDeleteRequest } from '@shared/models/api/base-api.interface';
import { environment } from '../../../../environments/environment';
import { Observable, of } from 'rxjs';

// Query request interface for TLS53010
export interface TLS53010QueryRequest extends BaseQueryRequest {
  PST_No?: string;              // 盤點單編號
  HOS_No?: string;              // 倉別代碼/名稱
  LOGO_No?: string;             // 品牌代碼/名稱
  PST_Date_B?: string;          // 盤點基準日期(起) - ISO 8601 格式
  PST_Date_E?: string;          // 盤點基準日期(訖) - ISO 8601 格式
  PST_Status?: string[];        // 盤點單狀態 (多選)
}

// Data result interface for TLS53010 (盤點單資料)
export interface TLS53010Data {
  PST_No: string;               // 盤點單編號
  HOS_No: string;               // 倉別代碼
  HOS_Name: string;             // 倉別名稱
  LOGO_No: string;              // 品牌代碼
  LOGO_Name: string;            // 品牌名稱
  PST_Date: string;             // 盤點基準日期
  PST_Status: string;           // 盤點單狀態
}

@Injectable({
  providedIn: 'root'
})
export class TLS53010Service {
  private apiUrl = environment.ApiUrl + '/TLS0000/TLS5000';

  constructor(private http: HttpClient) { }

  // 查詢盤點單
  queryTLS53010(data: TLS53010QueryRequest): Observable<BaseQueryResponse<TLS53010Data>> {
    // return this.http.post<BaseQueryResponse<TLS53010Data>>(`${this.apiUrl}/queryTLS53010`, data);

    // 回傳模擬資料
    return of({
      Status: 'Success',
      Message: '',
      TotalCount: 1,
      TotalPage: 1,
      Data: [
        {
          PST_No: 'PST20240101001',
          HOS_No: '0001',
          HOS_Name: '化妝品',
          LOGO_No: '0001',
          LOGO_Name: '迪奧',
          PST_Date: '2024-01-01',
          PST_Status: '未完成'
        },
      ]
    })
  }
}
