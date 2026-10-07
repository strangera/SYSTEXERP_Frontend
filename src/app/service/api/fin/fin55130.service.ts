import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

// ====================================================================
// FIN55130 資產負債比較表 介面定義
// ====================================================================

/** 查詢請求 Body */
export interface QueryFIN55130Request {
  BaseYM: string;     // 基準年月 (YYYYMM)
  CompareYM: string;  // 比較年月 (YYYYMM)
  Category: string;   // 報表類別
  PrintSign: boolean; // 是否列印核章
  ShowZero: boolean;  // 是否顯示零金額
}

/** 比較表單筆資料項目內容 */
export interface FIN55130DetailItem {
  SectionType: string;
  groupNo: string;
  ItemTitle: string;
  AccNo: string;
  AccCName: string;
  BaseAmt: number;      // 基準額
  CompareAmt: number;   // 比較額
  DiffAmt: number;      // 差異額
  DiffPct: number;      // 差異百分比
  BalanceTotal: number;
  ClassNo: string;
  ClassCName: string;
}

/** 查詢結果 Data 欄位結構 */
export interface FIN55130ResponseData {
  QueryData: FIN55130DetailItem[];    // 查詢明細
  SubTotalData: FIN55130DetailItem[]; // 小計資料
  TotalData: FIN55130DetailItem[];    // 總計資料
  SignData: FIN55130DetailItem[];     // 簽核資料
}

// 匯出回應類型
export type ExportFileResponse = HttpResponse<Blob>;

// ====================================================================
// Service 實作
// ====================================================================

@Injectable({
  providedIn: 'root'
})
export class Fin55130Service {
  private readonly apiUrl = `${environment.ApiUrl}/FIN0000/GLS1000`;

  constructor(private http: HttpClient) { }

  /**
   * 查詢資產負債比較表資料 (FIN55130)
   */
  queryFIN55130(request: QueryFIN55130Request): Observable<ApiResponse<FIN55130ResponseData>> {
    return this.http.post<ApiResponse<FIN55130ResponseData>>(
      `${this.apiUrl}/queryFIN55130`,
      request
    );
  }

  /**
   * 匯出資產負債比較表 (PDF)
   */
  exportFIN55130PDF(request: QueryFIN55130Request): Observable<ExportFileResponse> {
    return this.http.post(`${this.apiUrl}/exportFIN55130PDF`, request, {
      observe: 'response',
      responseType: 'blob'
    });
  }

  /**
   * 匯出資產負債比較表 (Excel)
   */
  exportFIN55130Excel(request: QueryFIN55130Request): Observable<ExportFileResponse> {
    return this.http.post(`${this.apiUrl}/exportFIN55130Excel`, request, {
      observe: 'response',
      responseType: 'blob'
    });
  }
  /**
   * 1.5.4.5 報表查詢(分類帳-15550-FIN55050)
   */
  queryFIN55050(request: QueryFIN55050Request): Observable<ApiResponse<FIN55050Item[]>> {
    return this.http.post<ApiResponse<FIN55050Item[]>>(
      `${this.apiUrl}/queryFIN55050`,
      request
    );
  }

  /**
   * 查詢分類帳明細 (FIN55050Detail)
   */
  queryFIN55050Detail(request: QueryFIN55050DetailRequest): Observable<ApiResponse<FIN55050DetailResponseData>> {
    return this.http.post<ApiResponse<FIN55050DetailResponseData>>(
      `${this.apiUrl}/queryFIN55050Detail`,
      request
    );
  }

  /** 匯出明細 PDF */
  exportFIN55050DetailPDF(body: { VouNo: string; SignatureDataType?: string }): Observable<HttpResponse<Blob>> {
    const url = `${this.apiUrl}/exportFIN55050DetailPDF`;
    return this.http.post(url, body, {
      observe: 'response',
      responseType: 'blob' as 'json',
    }) as Observable<HttpResponse<Blob>>;
  }
}
export interface QueryFIN55050Request {
  DateFrom: string;
  DateTo: string;
  AccNoFrom: string;
  AccNoTo: string;
  PageSize?: number;
  PageIndex?: number;
}

/**
 * 分類帳明細 (Row 內層資料)
 */
export interface FIN55050Detail {
  VouNo: string;
  Ven_Name: string;
  VouStatus: string;
  ORG_ID: string;
  Org_Name: string;
  ProjectNo: string;
  PTA: string;
  NoteDesc: string;
  AccAmt_D: number;
  AccAmt_C: number;
  OpeningBal: number;
}

/**
 * 分類帳主表項目 (Data 陣列內容)
 */
export interface FIN55050Item {
  AccNo: string;
  AccCName: string;
  VouDate: string;
  _Details: FIN55050Detail[];
  displayDetails: FIN55050Detail[];
  lastDetail: FIN55050Detail | null;
}
/**
 * 1.5.4.6 查詢分類帳明細 (Voucher Detail)
 */
export interface QueryFIN55050DetailRequest {
  VouNo: string;
}

export interface VoucherDetailRow {
  VouDate: string;
  VouNo: string;
  UPD_Date: string;
  VouType_Name: string;
  VouStatus: string;
  VoucherType_Name: string;
  ACCNO: string;
  AccCName: string;
  Org_Name: string;
  NoteDesc: string;
  AccAmt_D: number;
  AccAmt_C: number;
  Ven_Name: string;
  Remark: string;
}

export interface FIN55050DetailResponseData {
  _VoucherDetails: VoucherDetailRow[];
  SUM_AccAmt_D: number;
  SUM_AccAmt_C: number;
}
