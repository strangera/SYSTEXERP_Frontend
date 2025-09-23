import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { ApiResponse } from '@service/system/auth.service';

// 組織及對象維護作業 (GLS1016)
export interface Fin52040Request {
  RefCode: string;
  RefName: string;
  UniformNo: string;

  CRT_USR_No: string;
  UPD_USR_No: string;
}

export interface Fin52040Response {
  RefCode: string;
  RefName: string;
  UniformNo: string;
}

@Injectable({
  providedIn: 'root'
})
export class FIN52040Service {
  private apiUrl = `${environment.ApiUrl}/FIN0000/GLS1000`;

  constructor(private http: HttpClient) {}

  // 查詢 對象及對帳維護作業
  queryFIN52040(data: Fin52040Request): Observable<ApiResponse<Fin52040Response[]>> {
    return this.http.post<ApiResponse<Fin52040Response[]>>(`${this.apiUrl}/queryFIN52040`, data);
  }

  // 新增 對象及對帳維護作業
  insertFIN52040(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/insertFIN52040`, data);
  }

  // 修改 對象及對帳維護作業
  updateFIN52040(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/updateFIN52040`, data);
  }

  // 刪除 對象及對帳維護作業
  deleteFIN52040(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/deleteFIN52040`, data);
  }

  // 統一編號 下拉選單
  queryVendorList(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryVendorList`, data);
  }
}
