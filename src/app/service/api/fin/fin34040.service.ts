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

/* ===================== 明細 API 相關介面 ===================== */

/** 明細查詢 Request */
export interface Fin34040DetailRequest {
  /** 廠客代號 */
  VenNo: string;
  /** 立帳日期起 (yyyy-MM-dd) */
  ARS_DateFrom?: string | null;
  /** 立帳日期迄 (yyyy-MM-dd) */
  ARS_DateTo?: string | null;
  /** 分析日期 (yyyy-MM-dd) */
  BaseDate: string;
}

/** 明細資料列 */
export interface Fin34040DetailRow {
  /** 序號（明細為流水號，總計為「總計」） */
  SeqNo: string;
  /** 是否為總計列 */
  IsTotal: boolean;
  /** 應收 ID */
  ARS_No: string;
  /** 組織代號 */
  ORG_ID: string;
  /** 組織名稱 */
  Org_Name: string;
  /** 帳款年月 */
  Sam_yyymm: string;
  /** 帳款帳次 */
  Sam_Termno: number;
  /** 應收金額 */
  RCV_ARS_Amt: number;
  /** 沖帳金額 */
  PTA_Amt: number;
  /** 應收帳款餘額 */
  Pay_AMT: number;
  /** 立帳日期 */
  ARS_Date: string;
  /** 預計收款日 */
  PTA_Date: string;
  /** 廠客代號 */
  VEN_No: string;
  /** 廠客名稱 */
  VEN_Name: string;
  /** 統一編號 */
  VEN_Uniform: string;
  /** 會計科目代號 */
  AccNo: string;
  /** 會計科目名稱 */
  AccCName: string;
  /** 帳款來源單號 */
  ARS_SourceNo: string;
  /** 傳票號碼 */
  VouNo: string;
  /** 狀態代號 */
  ARS_Status: string;
  /** 狀態名稱 */
  ARS_StatusName: string;
}

/** 明細 Response */
export interface Fin34040DetailResponse {
  /** 應收帳款明細（最後一筆為總計） */
  Details: Fin34040DetailRow[];
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

  /**
   * 查詢應收帳款明細
   * @param body 明細查詢條件
   */
  queryFIN34040Detail(body: Fin34040DetailRequest): Observable<ApiResponse<Fin34040DetailResponse>> {
    return this.http.post<ApiResponse<Fin34040DetailResponse>>(
      `${this.apiUrl}/queryFIN34040Detail`,
      body
    );
  }
}

