import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { BaseQueryRequest, BaseQueryResponse } from '../../../shared/models/api/base-api.interface';

// 1. 修正查詢參數 Interface，使其與後端 DTO 結構一致
export interface TLS32010QueryRequest extends BaseQueryRequest {
  // 日期條件
  DateFrom: string | null;  // 統一使用 DateFrom
  DateTo: string | null;    // 統一使用 DateTo
  reportType?: string;      // 報表類型
  eventID?: string | null;  // 活動ID

  // 合約查詢條件：改為字串陣列以匹配前端 multi-select 與後端 List<string>
  FloorList?: string[] | null;
  AreaList?: string[] | null;
  BusTypeList?: string[] | null;
  BusClassList?: string[] | null;
  BusSClassList?: string[] | null;
  CabinetKindList?: string[] | null;
  TermTypeList?: string[] | null;
  OrgList?: string[] | null;
  TltNoList?: string[] | null;

  TaxFlag?: string; // 配合後端改為 TaxFlag (1 或 2)
}

// 查詢結果 Model (保持不變)
export interface TLS32010Data {
  館別: string;
  組織名稱: string;
  櫃別名稱: string;
  專櫃編號: string;
  櫃位名稱: string;
  位置編號: string;
  坪數: number;        // 建議改為 number，前端 formatAmount 會處理
  營業目標: number;
  營業實績: number;
  交易筆數: number;
  客單價: number;
  月坪效: number;
  達成率: number;
  坪數_排名: string;
  營業目標_排名: string;
  營業實績_排名: string;
  交易筆數_排名: string;
  客單價_排名: string;
  月坪效_排名: string;
  達成率_排名: string;
}

@Injectable({
  providedIn: 'root'
})
export class TLS32010Service {
  private apiUrl: string = environment.ApiUrl + '/TLS0000/TLS3000';

  constructor(private http: HttpClient) { }

  // 查詢櫃位營業報表資料
  queryTLS32010(data: TLS32010QueryRequest): Observable<BaseQueryResponse<TLS32010Data>> {
    return this.http.post<BaseQueryResponse<TLS32010Data>>(this.apiUrl + '/queryTLS32010', data);
  }

  // 匯出 PDF
  exportTLS32010PDF(body: TLS32010QueryRequest): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/exportTLS32010PDF`, body, {
      observe: 'response',
      responseType: 'blob'
    });
  }

  // 匯出 Excel
  exportTLS32010Excel(body: TLS32010QueryRequest): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/exportTLS32010Excel`, body, {
      observe: 'response',
      responseType: 'blob'
    });
  }
}
