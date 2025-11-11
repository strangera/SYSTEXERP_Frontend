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

// === 取 LOGO/HOS_No 選項（label: "代碼 - 中文"）===
getLogoHosOptions(): Observable<{
  logoOptions: Array<{ label: string; value: string }>;
  hosOptions: Array<{ label: string; value: string }>;
}> {
  return this.queryPLULOGO_HOS_No_DropDownList().pipe(
    map((res) => {
      const rows = this.extractLogoHosRows(res);

      // LOGO_No -> Name
      const logoMap = new Map<string, string>();
      // HOS_No -> 中文名稱（可能欄位叫 Name 或 HOS_NAME，都兼容）
      const hosMap = new Map<string, string>();

      for (const r of rows) {
        const no  = (r?.No ?? '').trim();              // LOGO_No
        const nm  = (r?.Name ?? '').trim();            // 可能是 LOGO 名或倉別名（API 規格會放這）
        const hos = (r?.HOS_No ?? '').trim();          // 倉別代碼
        const hosName = (r as any)?.HOS_NAME?.toString().trim?.() || nm; // 若有 HOS_NAME 優先用

        if (no && !logoMap.has(no)) logoMap.set(no, nm);
        if (hos && !hosMap.has(hos)) hosMap.set(hos, hosName);
      }

      const logoOptions = Array.from(logoMap.entries())
        .map(([no, name]) => ({
          label: name ? `${no} - ${name}` : no,
          value: no,
        }))
        // 可選：依代碼排序
        .sort((a, b) => a.value.localeCompare(b.value, 'zh-Hant'));

      const hosOptions = Array.from(hosMap.entries())
        .map(([hos, name]) => ({
          label: name ? `${hos} - ${name}` : hos,   // ★ 關鍵：顯示「代碼 - 中文」
          value: hos,
        }))
        .sort((a, b) => a.value.localeCompare(b.value, 'zh-Hant'));

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
