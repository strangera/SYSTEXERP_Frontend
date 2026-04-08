import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from './fin26010.service';

export interface TDS1008Req {
  PageSize: number;
  PageIndex: number;
  SortBy?: { field: string; order: number }[];
  INV_ItemNo?: string;
  INV_ItemName?: string;
}

export interface TDS1008Data {
  ID: number,
  INV_ItemNo: string,
  INV_ItemName: string,
  INV_UsageType: string,
  CRT_Date: string,
  CRT_USR_No: string,
  CRT_USR_Name: string,
  UPD_Date: string,
  UPD_USR_No: string,
  UPD_USR_Name: string
}
@Injectable({
  providedIn: 'root',
})
export class Fin11040Service {
  private apiUrl: string = environment.ApiUrl + '/FIN0000/INV1000';

  constructor(private http: HttpClient) { }

  /** 查詢 TDS1008 資料表 */
  queryFIN11040(payload: TDS1008Req): Observable<ApiResponse<TDS1008Data[]>> {
    return this.http.post<ApiResponse<TDS1008Data[]>>(`${this.apiUrl}/queryFIN11040`, payload);
  }

  /** 新增 TDS1008 資料 */
  insertFIN11040(payload: {
    insertFIN11040Detail: {
      INV_ItemNo: string;
      INV_ItemName: string;
      INV_UsageType: string;
    }[];
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/insertFIN11040`, payload);
  }

  /** 更新 TDS1008 資料表 */
  updateFIN11040(payload: {
    ID: number | null;
    INV_ItemNo: string;
    INV_ItemName: string;
    INV_UsageType: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/updateFIN11040`, payload);
  }

  /** 刪除 TDS1008 資料 */
  deleteFIN11040(payload: {
    idList: number[];
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/deleteFIN11040`, payload);
  }
}
