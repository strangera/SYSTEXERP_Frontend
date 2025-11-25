import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

// TLS2J020 相關介面定義
export interface TLS2J020AddItem {
  ID: number;
  CHG_ItemName: string;
}

export interface TLS2J020ApiResponse<T> {
  Status: string;
  Data: T;
  Error?: {
    Code: string;
    Message: string;
    Details?: string;
  };
  Meta?: {
    Timestamp: string;
    RequestId: string;
  };
  Message?: string;
  TotalCount?: number;
  TotalPage?: number;
}
@Injectable({
  providedIn: 'root'
})
export class TLS2J020Service {
  apiUrl: string = environment.ApiUrl + '/TLS0000/TLS2000';
  constructor(private http: HttpClient) { }


  queryTLS2J020(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS2J020`, body);
  }
  insertTLS2J020(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/insertTLS2J020`, body);
  }
  updateTLS2J020(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/updateTLS2J020`, body);
  }
  deleteTLS2J020(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/deleteTLS2J020`, body);
  }
  // 品項名稱下拉選單 (編輯用)
  dropdownTLS2J020editCHG_ItemName(body: { ID: string }): Observable<TLS2J020ApiResponse<TLS2J020AddItem[]>> {
    return this.http.post<TLS2J020ApiResponse<TLS2J020AddItem[]>>(
      `${this.apiUrl}/dropdownTLS2J020editCHG_ItemName`,
      body
    );
  }

  // 品項名稱查詢 (新增用) - 支援多種參數格式
  queryTLS2J020_add(body: { ID?: string; bus_type?: string }): Observable<TLS2J020ApiResponse<TLS2J020AddItem[]>> {
    return this.http.post<TLS2J020ApiResponse<TLS2J020AddItem[]>>(
      `${this.apiUrl}/queryTLS2J020_add`,
      body
    );
  }
}
