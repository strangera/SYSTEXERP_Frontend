import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';

@Injectable({ providedIn: 'root' })
export class FIN13020Service {
  private apiUrl = environment.ApiUrl;

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService,
  ) {}

  queryFIN13020(query: any): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/FIN0000/INV1000/queryFIN13020`, query)
      .pipe(tap((res) => console.log('查詢結果:', res)));
  }

  insertFIN13020(data: any): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/FIN0000/INV1000/insertFIN13020`, data)
      .pipe(tap((res) => console.log('新增結果:', res)));
  }

  updateFIN13020(data: any): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/FIN0000/INV1000/updateFIN13020`, data)
      .pipe(tap((res) => console.log('更新結果:', res)));
  }

  deleteFIN13020(idList: number[]): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/FIN0000/INV1000/deleteFIN13020`, { idList })
      .pipe(tap((res) => console.log('刪除結果:', res)));
  }

  queryINV1000List(param: { GUI_Track: string; InvoiceNumber?: string; PageIndex?: number; PageSize?: number }) {
    return this.http.post<ApiResponse<any[]>>(
      `${this.apiUrl}/FIN0000/INV1000/queryFIN13020_InvoiceNumber`,
      param,
    );
  }
queryFIN13100ByVoucherNo(voucherNo: string) {
  return this.http.post<any>(`${this.apiUrl}/FIN0000/INV1000/queryFIN13100`, {
    PageSize: 10,
    PageIndex: 1,
    VouNoStart: voucherNo,
    VouNoEnd: voucherNo,
  });
}
  // ✅ 依「字軌+號碼」查對應資訊（預設 Source=APS）
  queryCorrespondByGUINoCorrespond(param: {
    InvoiceNumber_Correspond: string;
    Source?: 'APS' | 'POS' | string;
  }) {
    return this.http.post<any>(
      `${this.apiUrl}/FIN0000/INV1000/queryFIN13020_Correspond`,
      {
        Source: 'APS',
        ...param,
      },
    );
  }

  // ✅ 新增成功後列印
  // 如果後端回傳 PDF，這樣寫最保險；若只是回 Status，也一樣可用
  printFIN13020(payload: any): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/FIN0000/INV1000/printFIN13020`, payload, {
      observe: 'response',
      responseType: 'blob',
    });
  }
  // ✅ 依字軌+號碼，用 queryFIN13020 撈單筆（編輯/檢視共用）
queryFIN13020ByTrackNo(param: { InvoiceTrack: string; InvoiceNumber: string }) {
  const body: any = {
    GUI_Track: param.InvoiceTrack,
    InvoiceNumberStart: param.InvoiceNumber,
    InvoiceNumberEnd: param.InvoiceNumber,

    // ✅ 保險：補齊分頁排序，撈最新一筆
    pageIndex: 1,
    pageSize: 1,
    SortBy: [{ field: 'ID', order: -1 }],
  };

  return this.queryFIN13020(body);
}
// fin13020.service.ts
printFIN15100(data: {
  INV_DeclareYM: string;
  TXN_Ret_NoS: string;
  TXN_Ret_NoE: string;
  InvoiceTrack?: string | null;
  InvoiceNumberS?: string | null;
  InvoiceNumberE?: string | null;
  Mid: number;
  STO_No: string;
}): Observable<any> {
  const url = `${this.apiUrl}/FIN0000/INV1000/PrintFIN15100`;
  return this.http.post<any>(url, data);
}
}