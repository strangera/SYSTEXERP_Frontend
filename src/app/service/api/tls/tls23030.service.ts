/* src/app/service/api/tls/tls23030.service.ts */
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable, map, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
export interface TLS23030SumPayNoRow {
  PAY_NO: string;
  PAY_NAME: string;
  CRD_Type: string;   // 後端可能同時給 CRD_Name
  CRD_Name: string;
  Total_TXN_PayAmt: number;
}

export interface POS1006Item {
  No: string;
  Name: string;
  PAY_Type: string;
}

/** 新增：付款別彙總（依 PAY_NO/CRD） */
export interface TLS23030SumPayNoRow {
  PAY_NO: string;
  PAY_NAME: string;
  CRD_Type: string;
  CRD_Name: string;
  Total_TXN_PayAmt: number;
}

@Injectable({ providedIn: 'root' })
export class TLS23030Service {
  private apiUrl: string = environment.ApiUrl;

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  // 既有：明細查詢
  queryTLS23030(body: any): Observable<any> {
    const url = `${this.apiUrl}/TLS0000/TLS2000/queryTLS23030`;
    return this.http.post<any>(url, body).pipe(
      tap(res => console.log('🎯 TLS23030 查詢結果:', res)),
    );
  }

  // 既有：彙總查詢
  queryTLS23030Summary(body: any): Observable<any> {
    const url = `${this.apiUrl}/TLS0000/TLS2000/queryTLS23030_Summary`;
    return this.http.post<any>(url, body).pipe(
      tap(res => console.log('🎯 TLS23030 Summary 結果:', res)),
    );
  }

  // 既有：POS1006 下拉
  queryPOS1006_DropDownList(): Observable<ApiResponse<POS1006Item>> {
    const url = `${this.apiUrl}/TLS0000/TLS2000/queryPOS1006_DropDownList`;
    return this.http.post<ApiResponse<POS1006Item>>(url, {}).pipe(
      tap(res => console.log('🎯 POS1006 下拉原始資料:', res)),
    );
  }

  queryPOS1006Options(): Observable<Array<{ label: string; value: string; payload: POS1006Item }>> {
    return this.queryPOS1006_DropDownList().pipe(
      map(res => (Array.isArray(res?.Data) ? res.Data : []).map(x => ({
        label: `${x.No}-${x.Name}`,
        value: x.No,
        payload: x,
      })))
    );
  }



  // ================= 匯出 =================

  /** 匯出 Excel（不分頁） */
  exportTLS23030Excel(body: any): Observable<HttpResponse<Blob>> {
    const url = `${this.apiUrl}/TLS0000/TLS2000/exportTLS23030`;
    const payload = this.stripPaging(body);
    return this.http.post(url, payload, {
      observe: 'response',
      responseType: 'blob' as 'json',
    }) as Observable<HttpResponse<Blob>>;
  }

  /** 匯出 PDF（不分頁） */
  exportTLS23030PDF(body: any): Observable<HttpResponse<Blob>> {
    const url = `${this.apiUrl}/TLS0000/TLS2000/exportTLS23030PDF`;
    const payload = this.stripPaging(body);
    return this.http.post(url, payload, {
      observe: 'response',
      responseType: 'blob' as 'json',
    }) as Observable<HttpResponse<Blob>>;
  }

  /** 匯出 Excel（彙總，不分頁） */
  exportTLS23030SummaryExcel(body: any): Observable<HttpResponse<Blob>> {
    const url = `${this.apiUrl}/TLS0000/TLS2000/exportTLS23030_Summary`;
    const payload = this.stripPaging(body);
    return this.http.post(url, payload, {
      observe: 'response',
      responseType: 'blob' as 'json',
    }) as Observable<HttpResponse<Blob>>;
  }

  /** 匯出 PDF（彙總，不分頁） */
  exportTLS23030SummaryPDF(body: any): Observable<HttpResponse<Blob>> {
    const url = `${this.apiUrl}/TLS0000/TLS2000/exportTLS23030_SummaryPDF`;
    const payload = this.stripPaging(body);
    return this.http.post(url, payload, {
      observe: 'response',
      responseType: 'blob' as 'json',
    }) as Observable<HttpResponse<Blob>>;
  }

  /** 匯出不需要分頁鍵（保留 SortBy 讓後端能照前端排序） */
  private stripPaging<T extends Record<string, any>>(input: T): Omit<T, 'PageSize' | 'PageIndex' | 'OrderBy' | 'Offset'> {
    if (!input) return input as any;
    const { PageSize, PageIndex, OrderBy, Offset, ...rest } = input;
    return rest as any;
  }

  queryTLS23030_SumPayNo(body: any) {
    const url = `${this.apiUrl}/TLS0000/TLS2000/queryTLS23030_SumPayNo`;
    return this.http.post<ApiResponse<TLS23030SumPayNoRow>>(url, body);
  }

}
