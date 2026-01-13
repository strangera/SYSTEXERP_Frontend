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

/** Request */
export interface Fin34040Request {
  /** 分頁 - 每頁筆數 */
  PageSize?: number;
  /** 分頁 - 頁碼 */
  PageIndex?: number;
  /** 排序欄位 */
  OrderBy?: string | null;
  /** 偏移量 */
  Offset?: number;
  /** 排序 */
  SortBy?: SortItem[];
  /** 分析日期 - ISO 格式 */
  AnalysisDate?: string | null;
  /** 分析區間(日) */
  IntervalDays?: number | null;
  /** 分析期數 */
  AnalysisPeriods?: number | null;
  /** 分析日期別 */
  AnalysisDateType?: string | null;
  /** 廠客代號(起) */
  VEN_No_From?: string | null;
  /** 廠客代號(迄) */
  VEN_No_To?: string | null;
  /** 立帳日期(起) - ISO 格式 */
  ARS_Date_From?: string | null;
  /** 立帳日期(迄) - ISO 格式 */
  ARS_Date_To?: string | null;
  /** 收款日期 - ISO 格式 */
  PayDate?: string | null;
  /** 科目代號(起) */
  AccNo_From?: string | null;
  /** 科目代號(迄) */
  AccNo_To?: string | null;
  /** 已到期/未到期 */
  DueType?: string | null;
  /** 是否顯示百分比 */
  ShowPercent?: boolean;
}

/** Bucket 定義 */
export interface Fin34040Bucket {
  /** 到期別 ("O"=已到期, "N"=未到期) */
  Side: string;
  /** 到期別名稱 */
  SideName: string;
  /** Bucket 編號 */
  BucketNo: number;
  /** Bucket 名稱 */
  BucketName: string;
  /** 天數(起) */
  DaysFrom: number;
  /** 天數(迄) */
  DaysTo: number;
  /** 日期(起) - ISO 格式 */
  DateFrom: string;
  /** 日期(迄) - ISO 格式 */
  DateTo: string;
}

/** Summary 資料 */
export interface Fin34040Summary {
  /** 廠商代號 */
  VEN_No: string;
  /** 廠商名稱 */
  VEN_Name: string;
  /** 已到期 Buckets (key 為 BucketNo 的數字字串) */
  DueBuckets: Record<string, number>;
  /** 未到期 Buckets (key 為 BucketNo 的數字字串) */
  EndBuckets: Record<string, number>;
  /** 總計金額 */
  TotalAmt: number;
}

/** Total 總計資料 */
export interface Fin34040Total {
  /** 總計 Buckets (key 為 BucketNo 的數字字串) */
  TotalBuckets: Record<string, number>;
  /** 總計金額 */
  TotalAmt: number;
}

/** Response */
export interface Fin34040Response {
  /** Buckets 定義 */
  Buckets: Fin34040Bucket[];
  /** Summaries 資料（用於 footer） */
  Summaries: Fin34040Summary[];
  /** Total 總計 */
  Total: Fin34040Total;
}

@Injectable({ providedIn: 'root' })
export class Fin34040Service {
  private apiUrl = `${environment.ApiUrl}/FIN0000/ARS1000`;

  constructor(private http: HttpClient) { }

  /**
   * 查詢帳齡分析表
   * @param body 查詢條件
   */
  queryFIN34040(body: Fin34040Request): Observable<ApiResponse<Fin34040Response>> {
    return this.http.post<ApiResponse<Fin34040Response>>(
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

