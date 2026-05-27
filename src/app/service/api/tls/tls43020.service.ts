import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface QueryTls43020Request {
  PageSize?: number,
  PageIndex?: number,
  SortBy?: { field: string, order: number }[],
  NOT_No?: string,
  NOT_Date?: string,
  NOT_BegDate_Start?: string,
  NOT_BegDate_End?: string,
  NOT_EndDate_Start?: string,
  NOT_EndDate_End?: string,
  NOT_File?: string,
  NOT_Status?: string,
}

export interface VerifyTls43020Request {
  ID: number,
  NOT_Status: string,
  NOT_No: string
}

export interface QueryTls43020Response {
  ID: number,
  STO_No: string,
  NOT_No: string,
  NOT_Date: string,
  NOT_BegDate: string,
  NOT_EndDate: string,
  NOT_File: string,
  NOT_Status: string,
  NOT_Priority: number,
  NOT_DtlLimit: string,
  NOT_PlayTime: number,
  NOT_Note: string,
  Details: Tls43010Detail[]
}

export interface Tls43010Detail {
  ID?: number, // 編輯用
  NOT_SeqNo: number,
  ECR_No: string,
  TLT_No: string,
  ECR_Type: string,
  ECR_GrpNo: string,
  BUILDING_No: string,
  FLOOR_No: string,
  Area_No: string,
  status: string
  [key: string]: any
}

// 新增：下傳 Request 介面定義
export interface DownloadTls43020Request {
  IsAllSelected: boolean;
  // 全選時必傳：複用查詢 DTO 結構
  QueryConditions?: QueryTls43020Request | null;
  // 手動勾選時必傳
  ExportDetails?: {
    ID: number;
    STO_No: string;
    NOT_No: string;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class Tls43020Service {
  private apiUrl = `${environment.ApiUrl}/TLS0000/TLS4000`;

  constructor(private http: HttpClient) { }

  /**
   * 查詢POS50011 廣告資訊設定檔 的 API 呼叫
   */
  queryTls43020(body: QueryTls43020Request): Observable<ApiResponse<QueryTls43020Response[]>> {
    return this.http.post<ApiResponse<QueryTls43020Response[]>>(`${this.apiUrl}/queryTLS43020`, body);
  }

  /**
   * 審核TLS43020資料表 的 API 呼交
   */
  verifyTls43020(body: VerifyTls43020Request): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/verifyTLS43020`, body);
  }

  /**
   * 反審核TLS43020資料表 的 API 呼叫
   */
  unverifyTls43020(body: VerifyTls43020Request): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/unverifyTLS43020`, body);
  }

  /**
   * 新增：下傳TLS43020廣告資訊 的 API 呼叫
   * @param body 下傳請求物件 (DownloadTls43020Request)
   * @returns 包含 ApiResponse 的 API 回傳結果
   */
  downloadTls43020(body: DownloadTls43020Request): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/downloadTLS43020`, body);
  }
}
