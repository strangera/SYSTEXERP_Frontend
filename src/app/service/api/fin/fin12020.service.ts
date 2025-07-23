import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseQueryRequest, BaseQueryResponse } from '../../../shared/models/api/base-api.interface';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

// --- FIN12020 查詢參數 Model 定義 ---
export interface FIN12020QueryRequest extends BaseQueryRequest {
  GUI_YYMM_start?: string;        // 發票年月(起)
  GUI_YYMM_end?: string;          // 發票年月(訖)
  GUI_TRACK?: string;             // 字軌
  GUINo_start?: string;           // 發票號碼(起)
  GUINo_end?: string;             // 發票號碼(迄)
  GUIPaperList?: string[];        // 發票類別清單
  ECR_NOList?: string[];          // 收銀機號清單
  GUI_StatusList?: string[];      // 發票狀態清單
  SAL_TypeList?: string[];        // 使用別清單
}

// --- FIN12020 回應資料 Model 定義 ---
export interface FIN12020Data {
  GUI_YYMM?: string;         // 發票年月
  ECR_NO?: string;           // 收銀機號
  GUI_TRACK?: string;        // 字軌
  GUI_SNOS?: string;         // 發票號碼(起)
  GUI_ENOS?: string;         // 發票號碼(迄)
  TOT_NOS?: number;          // 總張數
  USED_NOS?: number;         // 已用張數
  FREE_NOS?: number;         // 未用張數
  GUIPaper?: number;         // 發票類別
  SAL_Type?: string;         // 使用別
  CRT_Date?: string;         // 建立日期
  CRT_USR_No?: string;       // 建立人員編號
}

@Injectable({
  providedIn: 'root'
})
export class FIN12020Service {

  private apiUrl = environment.ApiUrl + '/FIN0000/INV1000';

  constructor(private http: HttpClient) { }

  // 查詢
  queryFIN12020(params: FIN12020QueryRequest): Observable<BaseQueryResponse<FIN12020Data>> {
    return this.http.post<BaseQueryResponse<FIN12020Data>>(`${this.apiUrl}/queryFIN12020`, params);
  }
}