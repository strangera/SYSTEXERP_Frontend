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
}
