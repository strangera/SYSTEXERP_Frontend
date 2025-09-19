import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface LogoHosApiRow {
  No: string;      // 品牌(Logo)編號
  Name: string;    // 品牌名稱
  HOS_No: string;  // 倉別編號
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

  // === 你原本就有的 ===
  queryTLS55070(body: any): Observable<any> {
    const url = `${this.apiUrl}/TLS0000/TLS5000/queryTLS55070`;
    return this.http.post<any>(url, body);
  }

  exportTLS55070PDF(queryBody: any, fileName?: string, reportTitle?: string): Observable<HttpResponse<Blob>> {
    const url = `${this.apiUrl}/TLS0000/TLS5000/exportTLS55070`;
    const core = this.stripForExport(queryBody);
    const now = new Date();
    const ts = `${now.getFullYear()}${(now.getMonth()+1+'').padStart(2,'0')}${(now.getDate()+'').padStart(2,'0')}_${(now.getHours()+'').padStart(2,'0')}${(now.getMinutes()+'').padStart(2,'0')}`;
    const wrapper = {
      FileName: fileName ?? `TLS55070_${ts}`,
      ReportTitle: reportTitle ?? 'TLS55070 銷售明細報表',
      queryTLS55070Request: core,
    };
    return this.http.post(url, wrapper, {
      observe: 'response',
      responseType: 'blob' as 'json',
    }) as Observable<HttpResponse<Blob>>;
  }

  /** 匯出用清理（照你現在的版本）：去掉 OrderBy/Offset/PageSize/PageIndex；是否去掉 SortBy 依你當前設定 */
  private stripForExport<T extends Record<string, any>>(input: T): T {
    if (!input) return input;
    const clone: any = { ...input };
    delete clone.OrderBy;  delete clone.orderBy;
    delete clone.Offset;   delete clone.offset;
    // 如果匯出也不想帶 SortBy，再解開下一行：
    // delete clone.SortBy;   delete clone.sortBy;
    delete clone.PageSize; delete clone.pageSize;
    delete clone.PageIndex;delete clone.pageIndex;
    return clone;
  }

  // === 新增：取 LOGO/HOS_No 下拉 ===

  /** 打 API 取得原始資料 */
  queryPLULOGO_HOS_No_DropDownList(): Observable<LogoHosApiResponse> {
    const url = `${this.apiUrl}/queryPLULOGO_HOS_No_DropDownList`;
    return this.http.post<LogoHosApiResponse>(url, {}); // 若需要帶參數可自行擴充
  }

  /**
   * 轉成下拉用 options：
   * - LOGO_No：依 No 去重，label="No - Name"，value=No
   * - HOS_NO：依 HOS_No 去重，label=value=HOS_No
   */
  getLogoHosOptions(): Observable<{
    logoOptions: Array<{ label: string; value: string }>;
    hosOptions: Array<{ label: string; value: string }>;
  }> {
    return this.queryPLULOGO_HOS_No_DropDownList().pipe(
      map((res) => {
        const rows = this.extractLogoHosRows(res); // ← 重點：展平所有 Data

        const logoMap = new Map<string, string>(); // No -> Name（去重）
        const hosSet = new Set<string>();          // HOS_No 去重

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

    // 初始推入：先看 payload.Data，否則整個 payload
    if (payload?.Data !== undefined) {
      stack.push(payload.Data);
    } else {
      stack.push(payload);
    }

    while (stack.length) {
      const cur = stack.pop();

      if (!cur) continue;

      if (Array.isArray(cur)) {
        // 陣列就整批推回去跑
        for (let i = 0; i < cur.length; i++) stack.push(cur[i]);
        continue;
      }

      if (typeof cur === 'object') {
        // 若有 Data 欄位（任意層），繼續往內展
        if (cur.Data !== undefined) {
          stack.push(cur.Data);
        }

        // 葉節點（真的有我們要的欄位）
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