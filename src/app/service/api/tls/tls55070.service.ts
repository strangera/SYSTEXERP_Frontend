// src/app/service/api/tls/tls55070.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, map, forkJoin } from 'rxjs';
import { environment } from '../../../../environments/environment';

// === 泛用下拉 ===
export interface SimpleDropRow { No: string; Name: string; }
export interface SimpleDropResp {
  Status?: string;
  Data?: SimpleDropRow[];
  TotalCount?: number;
  TotalPage?: number;
  Message?: string;
}

@Injectable({ providedIn: 'root' })
export class TLS55070Service {
  private apiUrl = environment.ApiUrl;
  constructor(private http: HttpClient) {}

  // === 查詢 ===
  queryTLS55070(body: any): Observable<any> {
    const url = `${this.apiUrl}/TLS0000/TLS5000/queryTLS55070`;
    return this.http.post<any>(url, body);
  }

  // === 匯出 ===
  exportTLS55070Excel(queryBody: any): Observable<HttpResponse<Blob>> {
    const url = `${this.apiUrl}/TLS0000/TLS5000/exportTLS55070`;
    const core = this.stripForExport(queryBody);
    return this.http.post(url, core, { observe: 'response', responseType: 'blob' as 'json' }) as Observable<HttpResponse<Blob>>;
  }
  exportTLS55070PDF(queryBody: any): Observable<HttpResponse<Blob>> {
    const url = `${this.apiUrl}/TLS0000/TLS5000/exportTLS55070PDF`;
    const core = this.stripForExport(queryBody);
    return this.http.post(url, core, { observe: 'response', responseType: 'blob' as 'json' }) as Observable<HttpResponse<Blob>>;
  }
  private stripForExport<T extends Record<string, any>>(input: T): T {
    if (!input) return input;
    const clone: any = { ...input };
    delete clone.OrderBy;  delete clone.orderBy;
    delete clone.Offset;   delete clone.offset;
    delete clone.PageSize; delete clone.pageSize;
    delete clone.PageIndex;delete clone.pageIndex;
    return clone;
  }

  // =========================================================
  // 下拉：改成單一責任 + 合併一次回傳，避免重複打 API
  // =========================================================

  /** 1) 倉別：用 /queryPOS2034_DropDownList（POST、空 body） */
  queryPOS2034_DropDownList(): Observable<SimpleDropResp> {
    const url = `${this.apiUrl}/queryPOS2034_DropDownList`;
    return this.http.post<SimpleDropResp>(url, {});   // ★空 body
  }

  /** 2) 品牌（LOGO）：這裡用你現場有的標準「單一下拉」API。
   *   若你已經有 /queryPOS1002_DropDownList，就用它；若沒有，維持原本那支即可。
   */
  queryPOS1002_DropDownList(): Observable<SimpleDropResp> {
    const url = `${this.apiUrl}/queryPOS1002_DropDownList`;
    return this.http.post<SimpleDropResp>(url, {});
  }

  /** 將 LOGO + 倉別一次取回（避免在 component 內各自訂閱造成重複打） */
  getLogoAndHosOptions(): Observable<{
    logoOptions: Array<{ label: string; value: string }>;
    hosOptions:  Array<{ label: string; value: string }>;
  }> {
    return forkJoin({
      logo: this.queryPOS1002_DropDownList(),
      hos:  this.queryPOS2034_DropDownList(),
    }).pipe(
      map(({ logo, hos }) => {
        const toOptions = (rows?: SimpleDropRow[]) =>
          (rows ?? []).map(x => ({
            label: x.Name ? `${x.No} - ${x.Name}` : x.No,
            value: x.No,
          })).sort((a, b) => a.value.localeCompare(b.value, 'zh-Hant'));

        return {
          logoOptions: toOptions(logo?.Data),
          hosOptions:  toOptions(hos?.Data),   // ★ 倉別走 POS2034
        };
      })
    );
  }
}
