import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseQueryRequest, BaseQueryResponse } from '@shared/models/api/base-api.interface';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

// 查詢請求介面
export interface QueryFIN31020Request extends BaseQueryRequest {
  CAR_AccNo?: string;  // 調整科目代號
  CAR_Type?: string;   // 加減項
  Remark?: string;     // 備註
}

// 查詢結果資料介面
export interface FIN31020Data {
  CAR_AccNo: string;      // 調整科目代號
  CAR_Type: number;       // 加減項 (1:加項, 2:減項)
  Remark: string;         // 備註
  CRT_Date: string;       // 建立日期
  CRT_USR_No: string;     // 建立人員代號
  CRT_USR_Name: string;   // 建立人員姓名
  UPD_Date: string;       // 更新日期
  UPD_USR_No: string;     // 更新人員代號
  UPD_USR_Name: string;   // 更新人員姓名
}

@Injectable({
  providedIn: 'root'
})
export class FIN31020Service {
  private readonly apiUrl = `${environment.ApiUrl}/FIN0000/ARS1000`;

  constructor(private http: HttpClient) { }

  queryFIN31020(data: QueryFIN31020Request): Observable<BaseQueryResponse<FIN31020Data>> {
    return this.http.post<BaseQueryResponse<FIN31020Data>>(`${this.apiUrl}/queryFIN31020`, data);
  }

  queryFIN31020Detail(data: { id: number }): Observable<{ Data: FIN31020Data }> {
    return this.http.post<{ Data: FIN31020Data }>(`${this.apiUrl}/queryFIN31020Detail`, data);
  }

  insertFIN31020(data: Omit<FIN31020Data, 'CRT_Date' | 'CRT_USR_No' | 'CRT_USR_Name' | 'UPD_Date' | 'UPD_USR_No' | 'UPD_USR_Name'>): Observable<{ Success: boolean; Message: string }> {
    return this.http.post<{ Success: boolean; Message: string }>(`${this.apiUrl}/insertFIN31020`, data);
  }

  updateFIN31020(data: FIN31020Data): Observable<{ Success: boolean; Message: string }> {
    return this.http.post<{ Success: boolean; Message: string }>(`${this.apiUrl}/updateFIN31020`, data);
  }
}
