import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseQueryRequest } from '../../../shared/models/api/base-api.interface';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';

// --- TLS2C010 查詢參數 Model 定義 ---
export interface TLS2C010QueryRequest extends BaseQueryRequest {
  TXN_Date: string;               // 銷售日期
}

// --- TLS2C010 匯出請求參數 Model 定義 ---
export interface TLS2C010ExportRequest {
  FileName: string;
  ReportTitle: string;
  queryTLS2C010Request: TLS2C010QueryRequest;
}

@Injectable({
  providedIn: 'root'
})
export class TLS2C010Service {

  private apiUrl = environment.ApiUrl + '/TLS0000/TLS2000';

  constructor(private http: HttpClient) { }

  // 查詢專櫃日暫存傳票報表
  queryTLS2C010(params: TLS2C010QueryRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS2C010`, params);
  }

  // 取得專櫃日暫存傳票報表最近關帳日期
  getTLS2C010Date(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/GetTLS2C010Date`, {});
  }

  // 匯出專櫃日暫存傳票報表
  exportTLS2C010(
    body: TLS2C010ExportRequest
  ): Observable<HttpResponse<Blob>> {
    return this.http.post(
      `${this.apiUrl}/exportTLS2C010`,
      body,
      {
        observe: 'response',
        responseType: 'blob'
      }
    );
  }

  // 匯出專櫃日暫存傳票報表PDF
  exportTLS2C010PDF(
    body: TLS2C010ExportRequest
  ): Observable<HttpResponse<Blob>> {
    return this.http.post(
      `${this.apiUrl}/exportTLS2C010PDF`,
      body,
      {
        observe: 'response',
        responseType: 'blob'
      }
    );
  }
}