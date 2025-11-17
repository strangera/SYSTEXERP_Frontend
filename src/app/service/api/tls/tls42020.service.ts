import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseQueryRequest, BaseQueryResponse } from '@shared/models/api/base-api.interface';
import { environment } from '../../../../environments/environment';
import { Observable, of } from 'rxjs';

// Query request interface for TLS42020
export interface TLS42020QueryRequest extends BaseQueryRequest {
  menuType?: string[];             // 菜單類別
  tltNo?: string[];                // 專櫃編號
  tltName?: string[];              // 專櫃名稱
  SBM_BegDate?: string;            // 開始日期
  SBM_EndDate?: string;            // 結束日期
}

// Data result interface for TLS42020 (POS1027M資料表)
export interface TLS42020Data {
  id: number;                     // ID
  mid: number;                    // MID
  STO_No: string;                 // 店舖編號
  SBM_Type: number;               // 菜單類別
  TLT_No: string;                 // 專櫃編號
  SBM_BegDate: string;            // 開始日期
  SBM_EndDate: string;            // 結束日期
  TLT_Name: string;               // 專櫃名稱
  crt_date: string;               // 建立日期
  crt_usr_no: string;             // 建立者編號
  crt_usr_name: string;           // 建立者姓名
  upd_date: string;               // 更新日期
  upd_usr_no: string;             // 更新者編號
  upd_usr_name: string;           // 更新者姓名
}

// Detail query request interface for TLS42020
export interface TLS42020DetailQueryRequest {
  tltNo: string;                  // 專櫃編號
}

// Detail data result interface for TLS42020 (POS10271資料表)
export interface TLS42020DetailData {
  CRT_Date: string;               // 建立日期
  CRT_USR_No: string;             // 建立者編號
  CRT_USR_Name: string;           // 建立者姓名
  UPD_Date: string;               // 更新日期
  UPD_USR_No: string;             // 更新者編號
  UPD_USR_Name: string;           // 更新者姓名
  ID: number;                     // ID
  MID: number;                    // MID
  STO_No: string;                 // 店舖編號
  SBM_Type: number;               // 子菜單類別
  TLT_No: string;                 // 專櫃編號
  SBM_BegDate: string;            // 開始日期
  SBM_EndDate: string;            // 結束日期
  SBM_SeqNo: string;              // 序號
  PLU_MagNo: string;              // 商品貨號
  PLU_No: string;                 // 國際條碼
  PLU_Name: string;               // 商品名稱
  PLU_PrnName: string;            // 商品列印名稱
  PLU_FixPrc: string | number;    // 商品定價
  PLU_SalePrc: string | number;   // 商品售價
  SBM_BtnNo: string;              // 菜單按鍵序號
}

// Insert request interface for TLS42020M
export interface TLS42020InsertRequest {
  STO_No: string;                 // 店舖編號
  SBM_Type: number;               // 菜單類別
  TLT_No: string;                 // 專櫃編號
  SBM_BegDate: string;            // 開始日期
  SBM_EndDate: string;            // 結束日期
  TLT_Name: string;               // 專櫃名稱
  POS10271: TLS42020InsertDetailData[];  // POS10271子資料
}

// Insert POS10271 detail data interface
export interface TLS42020InsertDetailData {
  MID: number;                    // MID
  STO_No: string;                 // 店舖編號
  SBM_Type: number;               // 子菜單類別
  TLT_No: string;                 // 專櫃編號
  SBM_BegDate: string;            // 開始日期
  SBM_EndDate: string;            // 結束日期
  SBM_SeqNo: string;              // 序號
  PLU_MagNo: string;              // 商品貨號
  PLU_No: string;                 // 國際條碼
  PLU_Name: string;               // 商品名稱
  PLU_PrnName: string;            // 商品列印名稱
  PLU_FixPrc: string;             // 商品定價
  PLU_SalePrc: string;            // 商品售價
  SBM_BtnNo: string;              // 菜單按鍵序號
  status: string;                 // 狀態
}

// Update request interface for TLS42020M
export interface TLS42020UpdateRequest {
  ID: number;                     // ID
  MID: number;                    // MID
  STO_No: string;                 // 店舖編號
  SBM_Type: number;               // 菜單類別
  TLT_No: string;                 // 專櫃編號
  SBM_BegDate: string;            // 開始日期
  SBM_EndDate: string;            // 結束日期
  TLT_Name: string;               // 專櫃名稱
  POS10271: TLS42020UpdateDetailData[];  // POS10271子資料
}

// Update POS10271 detail data interface
export interface TLS42020UpdateDetailData {
  MID: number;                    // MID
  STO_No: string;                 // 店舖編號
  SBM_Type: number;               // 子菜單類別
  TLT_No: string;                 // 專櫃編號
  SBM_BegDate: string;            // 開始日期
  SBM_EndDate: string;            // 結束日期
  SBM_SeqNo: string;              // 序號
  PLU_MagNo: string;              // 商品貨號
  PLU_No: string;                 // 國際條碼
  PLU_Name: string;               // 商品名稱
  PLU_PrnName: string;            // 商品列印名稱
  PLU_FixPrc: string;             // 商品定價
  PLU_SalePrc: string;            // 商品售價
  SBM_BtnNo: string;              // 菜單按鍵序號
  status: string;                 // 狀態
  ID: number;                     // ID
}

// Delete request interface for TLS42020M
export interface TLS42020DeleteRequest {
  idList: number[];               // ID清單
}

// Dropdown request interface for TLS42020
export interface TLS42020DropdownRequest {
  TLT_NO: string[];               // 專櫃編號清單
}

@Injectable({
  providedIn: 'root'
})
export class TLS42020Service {
  private apiUrl = environment.ApiUrl + '/TLS0000/TLS4000';

  constructor(private http: HttpClient) { }

  // 查詢POS1027M資料表
  queryTLS42020(data: TLS42020QueryRequest): Observable<BaseQueryResponse<TLS42020Data>> {
    return this.http.post<BaseQueryResponse<TLS42020Data>>(`${this.apiUrl}/queryTLS42020`, data);
  }

  // 查詢POS10271資料表
  queryTLS42020Detail(data: TLS42020DetailQueryRequest): Observable<BaseQueryResponse<TLS42020DetailData>> {
    return this.http.post<BaseQueryResponse<TLS42020DetailData>>(`${this.apiUrl}/queryTLS42020_Detail`, data);
  }

  // 新增POS1027M資料表
  insertTLS42020M(data: TLS42020InsertRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/insertTLS42020`, data);
  }

  // 更新POS1027M資料表
  updateTLS42020(data: TLS42020UpdateRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/updateTLS42020`, data);
  }

  // 刪除POS1027M資料表
  deleteTLS42020(data: TLS42020DeleteRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/deleteTLS42020`, data);
  }

  // 匯入TLS42020資料
  uploadTLS42020(file: File, uploadType: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('uploadType', uploadType);
    return this.http.post<any>(`${this.apiUrl}/uploadTLS42020`, formData);
  }

  // 下載收銀觸控按鍵設定作業Excel規範
  downloadRule(): Observable<any> {
    return this.http.post(`${this.apiUrl}/downloadRule`, {});
  }

  // 專櫃編號下拉選單
  dropdownTLS42020(data: TLS42020DropdownRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/dropdownTLS42020`, data);
  }
}
