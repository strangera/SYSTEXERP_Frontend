import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseQueryRequest, BaseQueryResponse } from '@shared/models/api/base-api.interface';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

// 查詢專櫃暫存傳票查詢作業 Request
export interface QueryTLS2C040Request extends BaseQueryRequest {
  SrcSheetTypeList?: string[];   // 傳票種類
  VouDate_Start?: string;        // 傳票日期(起)
  VouDate_End?: string;          // 傳票日期(迄)
  PostFlagList?: string[];       // 傳票狀態
  No?: string;                   // 結帳單號
}

// 查詢專櫃暫存傳票查詢作業-應收 Request
export interface QueryTLS2C040_GLS6004Request extends BaseQueryRequest {
  id: number;
}

// 更新GLS6001資料表 Request
export interface UpdateTLS2C040Request {
  id: number;
  Remark: string;
  GLS6002List: {
    id: number;
    NoteDesc: string;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class TLS2C040Service {
  private apiUrl = environment.ApiUrl + '/TLS0000/TLS2000';

  constructor(private http: HttpClient) { }

  // 查詢
  /**
   * 查詢主檔與分錄明細
   */
  queryTLS2C040(req: QueryTLS2C040Request): Observable<BaseQueryResponse<any>> {
    return this.http.post<BaseQueryResponse<any>>(`${this.apiUrl}/queryTLS2C040`, req).pipe(
      map(response => {
        if (response.Data && Array.isArray(response.Data)) {
          response.Data = response.Data.map((item: any) => ({
            ...item._GLS6001,
            _GLS6002List: this.sortGLS6002(item._GLS6002List)
          }));
        }
        return response;
      })
    );
  }

  /**
   * 查詢應收明細 - 同樣加入 accno 排序邏輯
   */
  queryTLS2C040_GLS6004(req: QueryTLS2C040_GLS6004Request): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS2C040_GLS6004`, req).pipe(
      map(response => {
        if (response.Data?._GLS6004List && Array.isArray(response.Data._GLS6004List)) {
          // 如果前端有傳入 SortBy，則依 SortBy 做排序（支援多欄位；order: -1 為遞減）
          const sortBy = Array.isArray(req?.SortBy) ? req.SortBy : [];
          if (sortBy.length) {
            response.Data._GLS6004List.sort((a: any, b: any) => {
              for (const s of sortBy) {
                const field = s.field;
                const order = Number(s.order) === -1 ? -1 : 1;
                const va = a[field];
                const vb = b[field];

                // null / undefined 處理
                if (va == null && vb == null) continue;
                if (va == null) return -1 * order;
                if (vb == null) return 1 * order;

                // 數值比較優先（若可轉為數字）
                const na = Number(va);
                const nb = Number(vb);
                let cmp = 0;
                if (!isNaN(na) && !isNaN(nb)) {
                  cmp = na - nb;
                } else {
                  cmp = String(va).localeCompare(String(vb));
                }

                if (cmp !== 0) return cmp * order;
              }
              return 0;
            });
          } else {
            // fallback：若無 SortBy 則依 accno 遞增排序
            response.Data._GLS6004List.sort((a: any, b: any) => {
              const accA = a.accno || '';
              const accB = b.accno || '';
              return accA.localeCompare(accB);
            });
          }
        }
        return response;
      })
    );
  }

  // 更新GLS6001資料表
  updateTLS2C040(req: UpdateTLS2C040Request): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/updateTLS2C040`, req);
  }

  /**
   * 私有排序方法：依據借貸 (D先C後) 與 科目 (AccNo)
   */
  private sortGLS6002(list: any[]): any[] {
    if (!list) return [];
    return list.sort((a, b) => {
      // 1. 先依據 AccDC 排序 (D 在前，C 在後)
      if (a.AccDC !== b.AccDC) {
        return a.AccDC === 'D' ? -1 : 1;
      }
      // 2. 若 AccDC 相同，則依據科目代碼 (AccNo) 遞增排序
      const accNoA = a.AccNo || '';
      const accNoB = b.AccNo || '';
      return accNoA.localeCompare(accNoB);
    });
  }
}
