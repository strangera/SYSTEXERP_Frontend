import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../fin/fin26010.service'; // 假設此 ApiResponse 包含 Status, Data, TotalCount 等

// --- 介面定義 ---

export interface CPM12030Request {
  PageSize?: number;
  PageIndex?: number;
  SortBy?: { field: string; order: number }[];
  KIND_ID?: string;
  KIND_SubID?: string;
  KIND_SubName?: string;
}

export interface CPM12030Data {
  ID: number;
  KIND_ID: string;
  KIND_Name: string;
  KIND_SubID: string;
  KIND_SubName: string;
  CRT_Date: string;
  CRT_USR_No: string;
  CRT_USR_Name: string;
  UPD_Date: string;
  UPD_USR_No: string;
  UPD_USR_Name: string;
}

export interface CSS1004Data {
  ID: number;
  mid?: number;
  SYS_StoreNo?: string;
  ORG_ID?: string;
  KIND_SubID: string;
  CLASS_ID: string;
  CRT_Date?: string;
  CRT_USR_No?: string;
  CRT_USR_Name?: string;
  UPD_Date?: string;
  UPD_USR_No?: string;
  UPD_USR_Name?: string;
}

export interface CreateCPM12030Request {
  KIND_ID: string;
  KIND_SubID: string;
  KIND_SubName: string;
}

export interface UpdateCPM12030Request {
  ID: number;
  KIND_ID: string;
  KIND_SubID: string;
  KIND_SubName: string;
}

@Injectable({
  providedIn: 'root'
})
export class Cpm12030Service {
  // 修改路徑為 Swagger 定義的路徑
  apiUrl: string = environment.ApiUrl + '/CPM0000/CPM1000';

  constructor(private http: HttpClient) { }

  /** 查詢清單 */
  queryCPM12030(body: CPM12030Request): Observable<ApiResponse<CPM12030Data[]>> {
    return this.http.post<ApiResponse<CPM12030Data[]>>(`${this.apiUrl}/queryCPM12030`, body);
  }

  /** 新增 */
  createCPM12030(body: CreateCPM12030Request): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.apiUrl}/createCPM12030`, body);
  }

  /** 查詢明細 (單筆) */
  queryCPM12030Detail(body: { ID: number }): Observable<ApiResponse<CSS1004Data[]>> {
    return this.http.post<ApiResponse<CSS1004Data[]>>(`${this.apiUrl}/queryCPM12030Detail`, body);
  }

  /** 修改 */
  updateCPM12030(body: UpdateCPM12030Request): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.apiUrl}/updateCPM12030`, body);
  }

  /** 刪除 */
  deleteCPM12030(body: { IDs: number[] }): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.apiUrl}/deleteCPM12030`, body);
  }
}
