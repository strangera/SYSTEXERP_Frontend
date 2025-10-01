import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface LogoHosApiRow {
  No: string;
  Name: string;
  HOS_No: string;
}
export interface LogoHosApiPack {
  TotalCount?: number;
  Data?: LogoHosApiRow[];
}
export interface LogoHosApiResponse {
  Status?: string;
  Data?: LogoHosApiPack[];
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

  // === 匯出 EXCEL（純查詢條件，去掉 PageIndex/PageSize/OrderBy/Offset）===
  exportTLS55070Excel(queryBody: any): Observable<HttpResponse<Blob>> {
    const url = `${this.apiUrl}/TLS0000/TLS5000/exportTLS55070`;
    const core = this.stripForExport(queryBody);
    return this.http.post(url, core, {
      observe: 'response',
      responseType: 'blob' as 'json',
    }) as Observable<HttpResponse<Blob>>;
  }

  // === 匯出 PDF（純查詢條件，去掉 PageIndex/PageSize/OrderBy/Offset）===
  exportTLS55070PDF(queryBody: any): Observable<HttpResponse<Blob>> {
    const url = `${this.apiUrl}/TLS0000/TLS5000/exportTLS55070PDF`;
    const core = this.stripForExport(queryBody);
    return this.http.post(url, core, {
      observe: 'response',
      responseType: 'blob' as 'json',
    }) as Observable<HttpResponse<Blob>>;
  }

  /** 匯出用清理：去掉 OrderBy/Offset/PageSize/PageIndex（SortBy 保留） */
  private stripForExport<T extends Record<string, any>>(input: T): T {
    if (!input) return input;
    const clone: any = { ...input };
    delete clone.OrderBy;  delete clone.orderBy;
    delete clone.Offset;   delete clone.offset;
    delete clone.PageSize; delete clone.pageSize;
    delete clone.PageIndex;delete clone.pageIndex;
    return clone;
  }

  // === 取 LOGO/HOS_No 下拉 ===
  queryPLULOGO_HOS_No_DropDownList(): Observable<LogoHosApiResponse> {
    const url = `${this.apiUrl}/queryPLULOGO_HOS_No_DropDownList`;
    return this.http.post<LogoHosApiResponse>(url, {});
  }

  getLogoHosOptions(): Observable<{
    logoOptions: Array<{ label: string; value: string }>;
    hosOptions: Array<{ label: string; value: string }>;
  }> {
    return this.queryPLULOGO_HOS_No_DropDownList().pipe(
      map((res) => {
        const rows = this.extractLogoHosRows(res);
        const logoMap = new Map<string, string>();
        const hosSet = new Set<string>();
        for (const r of rows) {
          const no = (r?.No ?? '').trim();
          const name = (r?.Name ?? '').trim();
          const hos = (r?.HOS_No ?? '').trim();
          if (no && !logoMap.has(no)) logoMap.set(no, name);
          if (hos) hosSet.add(hos);
        }
        const logoOptions = Array.from(logoMap.entries()).map(([no, name]) => ({
          label: name ? `${no} - ${name}` : no,
          value: no,
        }));
        const hosOptions = Array.from(hosSet.values()).map((h) => ({
          label: h,
          value: h,
        }));
        return { logoOptions, hosOptions };
      })
    );
  }

  /** 展平任意層級的 Data，擷取具有 No/Name/HOS_No 的葉節點 */
  private extractLogoHosRows(payload: any): LogoHosApiRow[] {
    const out: LogoHosApiRow[] = [];
    const stack: any[] = [];
    if (payload?.Data !== undefined) stack.push(payload.Data);
    else stack.push(payload);

    while (stack.length) {
      const cur = stack.pop();
      if (!cur) continue;

      if (Array.isArray(cur)) {
        for (let i = 0; i < cur.length; i++) stack.push(cur[i]);
        continue;
      }

      if (typeof cur === 'object') {
        if (cur.Data !== undefined) stack.push(cur.Data);

        const hasFields =
          Object.prototype.hasOwnProperty.call(cur, 'No') ||
          Object.prototype.hasOwnProperty.call(cur, 'HOS_No');

        if (hasFields) {
          out.push({
            No: String(cur.No ?? ''),
            Name: String(cur.Name ?? ''),
            HOS_No: String(cur.HOS_No ?? ''),
          });
        }
      }
    }
    return out;
  }
}
