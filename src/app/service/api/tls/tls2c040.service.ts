import { ApiRequest, ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

// --- Interfaces ---

/** 查詢專櫃暫存傳票查詢作業 Request */
export interface QueryTLS2C040Request extends ApiRequest {
  SrcSheetTypeList?: string[];   // 傳票種類
  VouDate_Start?: string;        // 傳票日期(起)
  VouDate_End?: string;          // 傳票日期(迄)
  PostFlagList?: string[];       // 傳票狀態
  No?: string;                   // 結帳單號
}

/** 應收/應付明細查詢 Request */
export interface QueryTLS2C040_SubDetailRequest extends ApiRequest {
  id: number;
}

/** 更新GLS6001資料表 Request */
export interface UpdateTLS2C040Request {
  id: number;
  Remark: string;
  GLS6002List: {
    id: number;
    NoteDesc: string;
    AccNo?: string;
    ORG_ID?: string;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class TLS2C040Service {
  private apiUrl = environment.ApiUrl + '/TLS0000/TLS2000';

  constructor(private http: HttpClient) { }

  /**
   * 1. 查詢主檔與分錄明細 (TLS2C040)
   * 將回傳結構扁平化，並對 GLS6002 分錄進行預設排序
   */
  queryTLS2C040(req: QueryTLS2C040Request): Observable<ApiResponse<any[]>> {
    return this.http.post<ApiResponse<any[]>>(`${this.apiUrl}/queryTLS2C040`, req).pipe(
      map(response => {
        if (response.Data && Array.isArray(response.Data)) {
          response.Data = response.Data.map((item: any) => ({
            ...item._GLS6001,
            _GLS6002List: this.sortGLS6002(item._GLS6002List),
            TotalDAmt: item.TotalDAmt,
            TotalCAmt: item.TotalCAmt
          }));
        }
        return response;
      })
    );
  }

  /**
   * 2. 查詢應收明細 (GLS6004)
   */
  queryTLS2C040_GLS6004(req: QueryTLS2C040_SubDetailRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS2C040_GLS6004`, req).pipe(
      map(res => this.handleSubDetailSort(res, '_GLS6004List', req))
    );
  }

  /**
   * 3. 查詢應付明細 (GLS6005)
   */
  queryTLS2C040_GLS6005(req: QueryTLS2C040_SubDetailRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS2C040_GLS6005`, req).pipe(
      map(res => this.handleSubDetailSort(res, '_GLS6005List', req))
    );
  }

  /**
   * 4. 更新GLS6001資料表
   */
  updateTLS2C040(req: UpdateTLS2C040Request): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/updateTLS2C040`, req);
  }

  // --- 私有工具方法 ---

  /**
   * 通用子明細排序處理 (應收/應付)
   */
  private handleSubDetailSort(response: any, listKey: string, req: any): any {
    const list = response.Data?.[listKey];
    if (list && Array.isArray(list)) {
      const sortBy = Array.isArray(req?.SortBy) ? req.SortBy : [];
      if (sortBy.length) {
        // 動態排序邏輯
        list.sort((a, b) => {
          for (const s of sortBy) {
            const field = s.field;
            const order = Number(s.order) === -1 ? -1 : 1;
            const va = a[field], vb = b[field];

            if (va == null && vb == null) continue;
            if (va == null) return -1 * order;
            if (vb == null) return 1 * order;

            const na = Number(va), nb = Number(vb);
            const cmp = (!isNaN(na) && !isNaN(nb)) ? na - nb : String(va).localeCompare(String(vb));
            if (cmp !== 0) return cmp * order;
          }
          return 0;
        });
      } else {
        // 預設排序 (accno)
        list.sort((a: any, b: any) => (a.accno || '').localeCompare(b.accno || ''));
      }
    }
    return response;
  }

  /**
   * 私有排序方法：依據借貸 (D先C後) 與 科目 (AccNo)
   */
  private sortGLS6002(list: any[]): any[] {
    if (!list) return [];
    return [...list].sort((a, b) => {
      // 1. 先依據 AccDC 排序 (D 在前，C 在後)
      if (a.AccDC !== b.AccDC) {
        return a.AccDC === 'D' ? -1 : 1;
      }
      // 2. 依據科目代碼遞增排序
      return (a.AccNo || '').localeCompare(b.AccNo || '');
    });
  }
}
