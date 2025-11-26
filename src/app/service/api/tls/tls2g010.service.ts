import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

// PrintTLS2G010OrgTPL 和 PrintTLS2G010 共用的請求參數
export interface PrintTLS2G010Params {
  BudgetYYMM: string;
  BuildingNos: string[] | null;
  FloorNos: string[] | null;
  SectionNos: string[] | null;
}

// 組織範本下載 API 回傳的單筆資料
export interface PrintTPLUrlData {
  PrintTPLURL: string;
}

// 產生匯出檔 API 回傳的單筆資料
export interface PrintBudgetUrlData {
  PrintBudgetURL: string;
}

// 預估業績匯入 API 回傳的單筆資料
export interface ImportResultData {
  IsImportSuccess: boolean;
  ErrorMsg: string | null;
}
@Injectable({
  providedIn: 'root'
})
export class TLS2G010Service {
  private readonly apiUrl = environment.ApiUrl + '/TLS0000/TLS2000';

  constructor(private http: HttpClient) { }

  /**
   * 組織範本下載
   * POST /TLS0000/TLS2000/PrintTLS2G010OrgTPL
   * @param params 請求參數
   * @returns 包含檔案下載 URL 的 Observable
   */
  public downloadOrgTemplate(params: PrintTLS2G010Params): Observable<ApiResponse<PrintTPLUrlData>> {
    return this.http.post<ApiResponse<PrintTPLUrlData>>(`${this.apiUrl}/PrintTLS2G010OrgTPL`, params);
  }

  /**
   * 空白範本下載
   * POST /TLS0000/TLS2000/PrintTLS2G010EmptyTPL
   * @returns 包含檔案下載 URL 的 Observable
   */
  public downloadEmptyTemplate(): Observable<ApiResponse<PrintTPLUrlData>> {
    return this.http.post<ApiResponse<PrintTPLUrlData>>(`${this.apiUrl}/PrintTLS2G010EmptyTPL`, {});
  }

  /**
   * 產生匯出檔
   * POST /TLS0000/TLS2000/PrintTLS2G010
   * @param params 請求參數
   * @returns 包含匯出檔案 URL 的 Observable
   */
  public generateExportFile(params: PrintTLS2G010Params): Observable<ApiResponse<PrintBudgetUrlData>> {
    return this.http.post<ApiResponse<PrintBudgetUrlData>>(`${this.apiUrl}/PrintTLS2G010`, params);
  }

  /**
   * 預估業績匯入
   * POST /TLS0000/TLS2000/ImportTLS2G010
   * @param file 欲上傳的檔案 (Blob)
   * @returns 包含匯入結果的 Observable
   */
  public importBudget(file: Blob): Observable<ApiResponse<ImportResultData>> {
    const formData = new FormData();
    formData.append('InputBudget', file, 'InputBudget.xlsx'); // 'InputBudget' 應與後端接受的參數名稱一致

    return this.http.post<ApiResponse<ImportResultData>>(`${this.apiUrl}/ImportTLS2G010`, formData);
  }
}
