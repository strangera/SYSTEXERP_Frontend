import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseQueryRequest, BaseQueryResponse } from '../../../shared/models/api/base-api.interface';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

// --- FIN11050 查詢參數 Model 定義 ---
export interface FIN11050QueryRequest extends BaseQueryRequest {
  INV_GUIType?: string;      // 發票格式代號
  INV_GUIName?: string;      // 發票格式名稱
}

// --- FIN11050 回應資料 Model 定義 ---
export interface FIN11050Data {
  id: number;                // 主鍵ID
  mid: number;               // 關聯ID
  INV_GUIType: string;       // 發票格式代號
  INV_GUIName: string;       // 發票格式名稱
  CRT_Date: string;          // 建立日期
  CRT_USR_No: string;        // 建立人員編號
  CRT_USR_Name: string;      // 建立人員名稱
  UPD_Date: string;          // 更新日期
  UPD_USR_No: string;        // 更新人員編號
  UPD_USR_Name: string;      // 更新人員名稱
}

// --- 新增 FIN11050 資料請求 Model ---
export interface FIN11050InsertRequest {
  INV_GUIType: string;       // 發票格式代號
  INV_GUIName: string;       // 發票格式名稱
}

// --- 更新 FIN11050 資料請求 Model ---
export interface FIN11050UpdateRequest {
  id: number;                // 主鍵ID
  INV_GUIType: string;       // 發票格式代號
  INV_GUIName: string;       // 發票格式名稱
}

// --- 刪除 FIN11050 資料請求 Model ---
export interface FIN11050DeleteRequest {
  INV_GUITypeList: string[]; // 發票格式代號列表
}

@Injectable({
  providedIn: 'root'
})
export class Fin11050Service {

  private apiUrl = environment.ApiUrl + '/FIN0000/INV1000';

  constructor(private http: HttpClient) { }

  // 查詢
  queryFIN11050(data: FIN11050QueryRequest): Observable<BaseQueryResponse<FIN11050Data>> {
    return this.http.post<BaseQueryResponse<FIN11050Data>>(`${this.apiUrl}/queryFIN11050`, data);
  }

  // 新增
  insertFIN11050(data: FIN11050InsertRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/insertFIN11050`, data);
  }

  // 修改
  updateFIN11050(data: FIN11050UpdateRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/updateFIN11050`, data);
  }

  // 刪除
  deleteFIN11050(data: FIN11050DeleteRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/deleteFIN11050`, data);
  }
}