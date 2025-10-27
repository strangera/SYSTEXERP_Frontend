import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseQueryRequest, BaseQueryResponse } from '@shared/models/api/base-api.interface';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

// Query request interface for TLS53030
export interface TLS53030QueryRequest extends BaseQueryRequest {
  PST_No?: string;              // 盤點單編號:C+倉別+YYYYMM+SSSS
  HOS_No?: string[];            // 倉庫代碼 (陣列)
  LOGO_No?: string[];           // 品牌代碼 (陣列)
  PST_DateStart: string;        // 盤點基準日期(起) - ISO 8601 格式 - 必填
  PST_DateEnd: string;          // 盤點基準日期(迄) - ISO 8601 格式 - 必填
  PST_Status?: string[];        // 盤點狀態 (陣列)
  showDiff?: boolean;           // 是否顯示盤點差異欄位
}

// Detail query request interface for TLS53030
export interface TLS53030DetailQueryRequest {
  MID: number;                  // 商戶編號 - 必填
  PST_No: string;               // 盤點編號:C+倉別+YYYYMM+SSSS - 必填
  SYS_StoreNo: string;          // 公司編號/店號 - 必填
  HOS_No: string;               // 倉別代碼 - 必填
}

// Export PDF request interface for TLS53030
export interface TLS53030ExportPDFRequest {
  MID: number;                  // 商戶編號 - 必填
  PST_No: string;               // 盤點編號:C+倉別+YYYYMM+SSSS - 必填
  SYS_StoreNo: string;          // 公司編號/店號 - 必填
  HOS_No: string;               // 倉別代碼 - 必填
  PST_Date: string;             // 盤點基準日期 - ISO 8601 格式 - 必填
}

// Operation request interface for TLS53030 (盤點結案/反結案/作廢)
export interface TLS53030OperationRequest {
  MID: number;                  // 商戶編號 - 必填
  PST_No: string;               // 盤點編號:C+倉別+YYYYMM+SSSS - 必填
  SYS_StoreNo: string;          // 公司編號/店號 - 必填
  HOS_No: string;               // 倉別代碼 - 必填
}

// Data result interface for TLS53030 (盤點資料)
export interface TLS53030Data {
  id: number;                   // id
  MID: number;                  // 商戶編號
  SYS_StoreNo: string;          // 公司編號/店號
  PST_No: string;               // 盤點單編號:C+倉別+YYYYMM+SSSS
  LOGO_No: string;              // 品牌代碼
  LOGO_CH_NAME: string;         // 品牌名稱
  HOS_No: string;               // 倉庫代碼
  HOS_NAME: string;             // 倉庫名稱
  PST_Date: string;             // 盤點基準日期
  PST_Type: string;             // 盤點類別:1初盤,2複盤,3抽盤
  PST_Status: string;           // 盤點狀態:0盤點資料維護作業,待盤點，1初盤,盤點中 2複盤,盤點完成 3抽盤,小盤結案 4已結案 9作廢
}

// Detail data result interface for TLS53030 (盤點明細資料)
export interface TLS53030DetailData {
  id: number;                   // id
  PLU_PageNum: string;          // 貨架編號
  PLU_MagNo: string;            // 商品管理編號
  PLU_Name: string;             // 商品名稱
  PLU_No: string;               // 國際條碼
  PLU_Unit: string;             // 單位代碼
  UNIT_NAME: string;            // 單位名稱
  SYS_STOCK_QTY: number;        // 庫存量
  PST_Qty1: number;             // 初盤數量
  PST_Qty2: number;             // 複盤數量
  PST_Qty3: number;             // 抽盤數量
  DIFF_Qty: number;             // 差異量
}

// Update detail request interface for TLS53030
export interface TLS53030UpdateDetailRequest {
  MID: number;                  // 商戶編號 - 必填
  PST_No: string;               // 盤點編號:C+倉別+YYYYMM+SSSS - 必填
  SYS_StoreNo: string;          // 公司編號/店號 - 必填
  HOS_No: string;               // 倉別代碼 - 必填
  PLU_MagNo: string;            // 商品管理編號 - 必填
  PST_Qty1: number;             // 初盤數量
  PST_Qty2: number;             // 複盤數量
  PST_Qty3: number;             // 抽盤數量
}

// Update PST Status request interface for TLS53030
export interface TLS53030UpdatePSTStatusRequest {
  MID: number;                  // 商戶編號 - 必填
  PST_No: string;               // 盤點編號:C+倉別+YYYYMM+SSSS - 必填
  SYS_StoreNo: string;          // 公司編號/店號 - 必填
  HOS_No: string;               // 倉別代碼 - 必填
  PST_Status: string;           // 盤點狀態 - 必填
}

@Injectable({
  providedIn: 'root'
})
export class TLS53030Service {
  private apiUrl = environment.ApiUrl + '/TLS0000/TLS5000';

  constructor(private http: HttpClient) { }

  // 查詢盤點資料
  queryTLS53030(data: TLS53030QueryRequest): Observable<BaseQueryResponse<TLS53030Data>> {
    return this.http.post<BaseQueryResponse<TLS53030Data>>(`${this.apiUrl}/queryTLS53030`, data);
  }

  // 查詢盤點明細資料
  queryTLS53030Detail(data: TLS53030DetailQueryRequest): Observable<BaseQueryResponse<TLS53030DetailData>> {
    return this.http.post<BaseQueryResponse<TLS53030DetailData>>(`${this.apiUrl}/queryTLS53030_Detail`, data);
  }

  // 匯出盤點試算表PDF
  exportTLS53030DetailPDF(data: TLS53030ExportPDFRequest): Observable<HttpResponse<Blob>> {
    return this.http.post(
      `${this.apiUrl}/exportTLS53030_DetailPDF`,
      data,
      {
        observe: 'response',
        responseType: 'blob'
      }
    );
  }

  // 盤點結案
  concludeTLS53030(data: TLS53030OperationRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/concludeTLS53030`, data);
  }

  // 盤點反結案
  revertedTLS53030(data: TLS53030OperationRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/revertedTLS53030`, data);
  }

  // 盤點作廢
  voidTLS53030(data: TLS53030OperationRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/voidTLS53030`, data);
  }

  // 更新盤點明細資料
  updateTLS53030Detail(data: TLS53030UpdateDetailRequest[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/updateTLS53030_Detail`, data);
  }

  // 更新盤點狀態
  updateTLS53030PSTStatus(data: TLS53030UpdatePSTStatusRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/updateTLS53030_PST_Status`, data);
  }
}