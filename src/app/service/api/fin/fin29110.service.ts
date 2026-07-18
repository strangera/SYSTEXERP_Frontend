import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NotificationService } from '@shared/components/notification-message/notification.service';
import { FileExportService } from '@shared/service/file-export.service';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

// ==== 主表每列型別（對應 SP_FIN29110Query 回傳欄位） ====
export interface Fin29110Row {
  VendorNo: string;
  VendorName: string;
  SumAmount: number;
  [key: string]: any;
}


// ==== 主表 Request 型別（對應 SP_FIN29110Query 參數） ====
export interface Fin29110Request {
  AnalysisDate?: string;
  BucketDays?: number;
  Periods?: number;
  DateType?: string;
  PayDate?: string;
  DueFlag?: string;
  RefDateFrom?: string;
  RefDateTo?: string;
  VEN_No_From?: string;
  VEN_No_To?: string;
}
// ==== 明細每列型別（對應 SP_FIN29110QueryDetail 回傳欄位） ====
export interface Fin29110DetailRow {
  RowNo: number;
  ACP_No: string;
  org_id: string;
  ACP_YYYYMM: string;
  ACP_TermNo: string;
  ACP_Amt: number;
  PTA_Amt: number;
  ACP_BalanceAmt: number;
  ACP_Date: string;
  ACP_ExpectPayDate: string;
  VEN_No: string;
  VEN_Name: string;
  VEN_Uniform: string;
  AccNo: string;
  ACP_SourceNo: string;
  VouNo: string;
  Status: string;
  AgeDays: number;
}

// ==== 明細 Request 型別（對應 SP_FIN29110QueryDetail 參數） ====
export interface Fin29110DetailRequest {
  PageSize?: number;
  PageIndex?: number;
  SortBy?: { field: string; order: number }[];
  VEN_No: string;
  ACP_DATE_S: string;  // '0001-01-01' = 無下限
  ACP_DATE_E: string;  // '9999-12-31' = 無上限
  PayDate: string;
  AnalysisDate: string;
}

@Injectable({ providedIn: 'root' })
export class Fin29110Service {
  private apiUrl = `${environment.ApiUrl}/FIN0000/APS1000`;

  constructor(
    private http: HttpClient,
    private fileExportService: FileExportService,
    private messageService: NotificationService
  ) { }

  /** 查詢 應付帳款帳齡分析表（主表） */
  queryFIN29110(body: Fin29110Request): Observable<ApiResponse<Fin29110Row[]>> {
    return this.http.post<ApiResponse<Fin29110Row[]>>(
      `${this.apiUrl}/queryFIN29110`, // 確保大小寫與 Swagger 一致
      body
    );
  }

  /** 查詢 明細 */
  queryFIN29110Detail(body: Fin29110DetailRequest): Observable<ApiResponse<Fin29110DetailRow[]>> {
    return this.http.post<ApiResponse<Fin29110DetailRow[]>>(
      `${this.apiUrl}/queryFIN29110_Detail`,
      body
    );
  }

  /** 匯出 Excel API */
  private postExportExcel(body: Fin29110Request): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/ExportFIN29110Excel`, body, {
      responseType: 'blob',
      observe: 'response'
    }) as Observable<HttpResponse<Blob>>;
  }

  /** 匯出 PDF API */
  private postExportPDF(body: Fin29110Request): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/ExportFIN29110PDF`, body, {
      responseType: 'blob',
      observe: 'response'
    }) as Observable<HttpResponse<Blob>>;
  }

  /* ----------------- 封裝後的執行動作 ----------------- */

  /**
   * 執行主表匯出動作
   * @param body 查詢條件
   * @param type 類型: 'Excel' | 'PDF'
   * @param loadingCallback 用於回傳 Loading 狀態
   */
  exportReport(body: Fin29110Request | null, type: 'Excel' | 'PDF', loadingCallback: (loading: boolean) => void): void {
    if (!body) {
      this.messageService.warnBubble('請先執行查詢以產生報表。');
      return;
    }

    const isExcel = type === 'Excel';
    const export$ = isExcel ? this.postExportExcel(body) : this.postExportPDF(body);
    const extension = isExcel ? '.xlsx' : '.pdf';

    this.fileExportService.executeFileExport(
      export$,
      extension,
      loadingCallback
    ).subscribe({
      error: (err) => {
        console.error(`${type} 匯出失敗`, err);
      }
    });
  }

  /** 額外新增：Swagger 上有的明細匯出功能 */
  exportFIN29110DetailExcel(body: Fin29110DetailRequest): Observable<HttpResponse<Blob>> {
    return this.http.post(
      `${this.apiUrl}/ExportFIN29110_DetailExcel`,
      body,
      { responseType: 'blob', observe: 'response' }
    ) as Observable<HttpResponse<Blob>>;
  }
}
