import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';

export interface QueryDetailTLS23120Request {
  TXN_Date: string; // 交易日期
  TLT_No?: string; // 專櫃編號清單
  bus_type?: string[] | null; // 大分類代碼清單 (TLTBUSTYPE
  ShowBusType?: boolean | null; // 是否顯示大分類
  tlt_building?: string[] | null; // 館別代碼清單 (SYS3800)
  area_no?: string[] | null; // 區域代碼清單 (SYS3A00)
  tlt_floor?: string[] | null; // 樓層清單 (sys3900)
  org_id?: string[] | null; // 組織代碼清單
}
export interface BatchExportTLS23120Request {
  selectList: QueryDetailTLS23120Request[];
}
/** AutoMail Request */
export interface AutoMailTLS23120Request extends BatchExportTLS23120Request {
  SMTP_No: string;
}

@Injectable({ providedIn: 'root' })
export class TLS23120Service {
  private apiUrl = `${environment.ApiUrl}/TLS0000/TLS2000`;

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  queryTLS23120(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS23120`, data);
  }

  queryDetailTLS23120(query: any): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/queryDetailTLS23120`, query)
      .pipe(tap(res => console.log('查詢結果:', res)));
  }

  /** 取得登入分店名稱(POS1001)，與後端 PDF 抬頭同源 */
  getStoreNameTLS23120(): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.apiUrl}/getStoreNameTLS23120`, {});
  }

  /** 匯出 PDF（後端產檔） */
  exportTLS23120PDF(body: any): Observable<HttpResponse<Blob>> {
    const url = `${this.apiUrl}/exportTLS23120PDF`;
    const payload = this.stripPaging(body);
    return this.http.post(url, payload, {
      observe: 'response',
      responseType: 'blob' as 'json',
    }) as Observable<HttpResponse<Blob>>;
  }

  /** 匯出專櫃日對帳單 (ZIP)*/
  exportTLS23120Zip(data: BatchExportTLS23120Request): Observable<any> {
    return this.http.post(`${this.apiUrl}/exportTLS23120Zip`, data, { responseType: 'blob', observe: 'response' });
  }

  /** 網路對帳：將產出的 PDF 儲存至伺服器目錄 */
  onlineTLS23120(data: BatchExportTLS23120Request): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/onlineTLS23120`, data);
  }

  /** AutoMail：將對帳單 PDF 儲存至伺服器並發送郵件(郵件採用常駐程式發送) */
  autoMailTLS23120(data: AutoMailTLS23120Request): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/autoMailTLS23120`, data);
  }

  /** 匯出用：移除分頁欄位（大小寫都處理） */
  private stripPaging<T extends Record<string, any>>(
    input: T
  ): Omit<T,
    'PageSize' | 'PageIndex' | 'OrderBy' | 'Offset' |
    'pageSize' | 'pageIndex' | 'orderBy' | 'offset'
  > {
    if (!input) return input as any;
    const {
      PageSize, PageIndex, OrderBy, Offset,
      pageSize, pageIndex, orderBy, offset,
      ...rest
    } = input as any;
    return rest as any;
  }
}
