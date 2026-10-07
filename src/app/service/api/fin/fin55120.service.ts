import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface QueryFIN55120Request {
  YM: string;
  Category: string; // 根據 API 文件改為 string，若確定只有 1,2,3 可保留聯集型別
  PrintSign: boolean;
  ShowZero: boolean;
}

/**
 * FIN55120 查詢單筆明細資料
 */
export interface FIN55120DetailItem {
  SectionType: string;
  groupName: string;
  ItemTitle: string;
  AccNo: string;
  AccCName: string;
  Balance: number;
  Pct: number;
  BalanceTotal: number;
  PctTotal: number;
}

/**
 * FIN55120 查詢結果資料內容 (Data 欄位)
 */
export interface FIN55120ResponseData {
  QueryData: FIN55120DetailItem[];    // 查詢明細
  SubTotalData: FIN55120DetailItem[]; // 小計資料
  TotalData: FIN55120DetailItem[];    // 總計資料
  SignData: FIN55120DetailItem[];     // 簽核/標記資料
}

// 匯出回應類型
export type ExportFileResponse = HttpResponse<Blob>;

@Injectable({
  providedIn: 'root'
})
export class Fin55120Service {
  private readonly apiUrl = environment.ApiUrl + '/FIN0000/GLS1000';

  constructor(private http: HttpClient) { }

  /**
   * 查詢資產負債表資料 (FIN55120)
   */
  queryFIN55120(request: QueryFIN55120Request): Observable<ApiResponse<FIN55120ResponseData>> {
    return this.http.post<ApiResponse<FIN55120ResponseData>>(
      `${this.apiUrl}/queryFIN55120`,
      request
    );
  }

  /**
   * 匯出資產負債表 (PDF)
   */
  exportFIN55120PDF(request: QueryFIN55120Request): Observable<ExportFileResponse> {
    return this.http.post(`${this.apiUrl}/exportFIN55120PDF`, request, {
      observe: 'response',
      responseType: 'blob'
    });
  }

  /**
   * 匯出資產負債表 (Excel)
   * 備註：已將路徑修正為 exportFIN55120Excel (請確認後端實際路徑)
   */
  exportFIN55120Excel(request: QueryFIN55120Request): Observable<ExportFileResponse> {
    return this.http.post(`${this.apiUrl}/exportFIN55120Excel`, request, {
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
  VouStatusList?: string[];
  ReportMode?: string; // 報表方式(1=只含交易科目；2=含無交易科目)
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
