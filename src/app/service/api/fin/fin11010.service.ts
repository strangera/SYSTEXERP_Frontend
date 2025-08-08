import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { BaseDeleteRequest, BaseQueryRequest, BaseQueryResponse } from '../../../shared/models/api/base-api.interface';

// --- TDS1003 查詢參數 Model 定義 ---
export interface FIN11010QueryRequest extends BaseQueryRequest {
  STO_Uniform?: string;         // 統一編號
  STO_TaxName?: string;         // 稅籍名稱
  STO_Addr?: string;            // 地址
  REP_OrgCodeList?: string[];   // 總繳代號
  STO_StatusList?: string[];    // 狀態清單
  REP_GUIYM_start?: string;     // 發票年月_起
  REP_GUIYM_end?: string;       // 發票年月_迄
}

// --- TDS1003 回應資料 Model 定義 ---
export interface FIN11010Data {
  id: number;
  mid: number;
  STO_No: string;
  STO_TaxNo: string;
  REP_BegGUIYM: string;
  REP_EndGUIYM: string;
  STO_Uniform: string;
  REP_OrgCode: string;
  STO_HQUniform: string;
  STO_TaxName: string;
  STO_City: string;
  STO_PostCode: string;
  STO_Addr: string;
  STO_ManagerName: string;
  STO_AbbName: string;
  STO_Status: string;
  STO_ApplyFlag: string;
  STO_Direct: string;
  STO_ApplyName: string;
  STO_ApplyID: string;
  STO_ApplyTEL: string;
  STO_ApplyTEL_ext: string;
  STO_AreaCode: string;
  CRT_Date: string;         // 建立日期 (ISO字串)
  CRT_USR_No: string;
  CRT_USR_Name: string;
  UPD_Date: string;         // 更新日期 (ISO字串)
  UPD_USR_No: string;
  UPD_USR_Name: string;
}

// --- 新增 TDS1003 資料請求 Model ---
export interface FIN11010InsertRequest {
  STO_Uniform: string;
  STO_TaxName: string;
  STO_TaxNo: string;
  STO_ManagerName: string;
  STO_AbbName: string;
  STO_City: string;
  STO_PostCode: string;
  STO_Addr: string;
  REP_OrgCode: string;
  STO_Direct: string;
  STO_HQUniform: string;
  STO_ApplyFlag: string;
  STO_ApplyName: string;
  STO_ApplyTEL: string;
  STO_ApplyTEL_ext: string;      // 申報人分機
  STO_AreaCode: string;
  STO_ApplyID: string;
  REP_BegGUIYM: string;
}

// --- 更新 TDS1003 資料請求 Model ---
export interface FIN11010UpdateRequest {
  id: number;
  STO_Uniform: string;
  STO_TaxName: string;
  STO_TaxNo: string;
  STO_ManagerName: string;
  STO_AbbName: string;
  STO_City: string;
  STO_PostCode: string;
  STO_Addr: string;
  REP_OrgCode: string;
  STO_Direct: string;
  STO_HQUniform: string;
  STO_ApplyFlag: string;
  STO_ApplyName: string;
  STO_ApplyTEL: string;
  STO_ApplyTEL_ext: string;
  STO_AreaCode: string;
  STO_ApplyID: string;
  REP_BegGUIYM: string;
}

// --- 狀態更新 TDS1003 資料請求 Model ---
export interface FIN11010UpdateStatusRequest {
  id: number;
  REP_BegGUIYM: string;
  STO_Status: string;
}

@Injectable({
  providedIn: 'root'
})
export class FIN11010Service {
  private apiUrl = environment.ApiUrl + '/FIN0000/INV1000';

  constructor(private http: HttpClient) { }

  // 查詢 TDS1003 資料表
  queryFIN11010(data: FIN11010QueryRequest): Observable<BaseQueryResponse<FIN11010Data>> {
    return this.http.post<BaseQueryResponse<FIN11010Data>>(`${this.apiUrl}/queryFIN11010`, data);
  }

  // 取得目前使用中的 TDS1003 資料
  getFIN11010PreviousData(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/getFIN11010PreviousData`, {});
  }

  // 新增 TDS1003 資料
  insertFIN11010(data: FIN11010InsertRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/insertFIN11010`, data);
  }

  // 更新 TDS1003 資料表
  updateFIN11010(data: FIN11010UpdateRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/updateFIN11010`, data);
  }

  // 刪除 TDS1003 資料
  deleteFIN11010(data: BaseDeleteRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/deleteFIN11010`, data);
  }

  // 根據狀態更新 TDS1003 資料
  updateStatusFIN11010(data: FIN11010UpdateStatusRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/updateStatusFIN11010`, data);
  }
}