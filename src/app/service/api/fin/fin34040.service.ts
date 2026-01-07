import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

/** 排序欄位型別 */
export interface SortItem {
  field: string;
  order: 1 | -1;
}

/** Request 型別 - 帳齡分析表查詢條件 */
export interface Fin34040Request {
  /** 分析日期 - ISO 格式 */
  AnalysisDate?: string | null;
  /** 分析區間 */
  AnalysisInterval?: number | null;
  /** 分析期數 */
  AnalysisPeriod?: number | null;
  /** 分析日期別 (1: 預計收款日 / 2: 立帳日) */
  AnalysisDateType?: string | null;
  /** 廠客代號 */
  VEN_No?: string | null;
  /** 立帳日期(起) - ISO 格式 */
  DocDateFrom?: string | null;
  /** 立帳日期(迄) - ISO 格式 */
  DocDateTo?: string | null;
  /** 收款日期 - ISO 格式 */
  RCV_Date?: string | null;
  /** 科目代號 */
  AccNo?: string | null;
  /** 已到期/未到期 (1: 已到期 / 2: 未到期) */
  DueStatus?: string | null;
  /** 是否顯示金額/總計(%) (Y: 顯示 / N: 不顯示) */
  ShowAmountType?: string | null;

  /** 分頁 - 頁碼 */
  PageIndex?: number;
  /** 分頁 - 每頁筆數 */
  PageSize?: number;
  /** 排序 */
  SortBy?: SortItem[];

  /** 擴充欄位 */
  [key: string]: unknown;
}

/** Response Row 型別 - 帳齡分析表資料列 */
export interface Fin34040Row {
  /** 廠商代號 */
  VEN_No?: string;
  /** 廠商名稱 */
  VEN_Name?: string;
  /** 已到期 */
  Expired?: string[];
  /** 未到期 */
  Unexpired?: string[];
  /** 總計 */
  Total?: number;
}

@Injectable({ providedIn: 'root' })
export class Fin34040Service {
  private apiUrl = `${environment.ApiUrl}/FIN0000/ARS1000`;

  constructor(private http: HttpClient) { }

  /**
   * 查詢帳齡分析表
   * @param body 查詢條件
   */
  queryFIN34040(body: Fin34040Request): Observable<ApiResponse<Fin34040Row[]>> {
    return this.http.post<ApiResponse<Fin34040Row[]>>(
      `${this.apiUrl}/queryFIN34040`,
      body
    );
  }

  /**
   * 匯出 Excel
   * @param body 查詢條件
   */
  exportFIN34040Excel(body: Fin34040Request): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/exportFIN34040Excel`, body, {
      observe: 'response',
      responseType: 'blob',
    });
  }

  /**
   * 匯出 PDF
   * @param body 查詢條件
   */
  exportFIN34040PDF(body: Fin34040Request): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/exportFIN34040PDF`, body, {
      observe: 'response',
      responseType: 'blob',
    });
  }
}

