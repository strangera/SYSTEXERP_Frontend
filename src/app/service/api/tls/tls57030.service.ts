import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SortMeta } from 'primeng/api';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';

// --- Interface 定義 ---

/** 商品庫存表查詢條件 */
export interface QueryTLS57030Request {
  PageSize: number;
  PageIndex: number;
  SortBy?: SortMeta[];
  HOS_No?: string | null;
  LOGO_No?: string | null;
  PLU_MagNo?: string | null;
  PLU_No?: string | null;
  PLU_OrgPLUNo?: string | null;
  STK_Date?: string | null;       // 建議在傳入前 transform 為 yyyy-MM-dd
  ShowStockRange?: string;
  DisplayRowNumber?: string;
}

/** 商品庫存表單筆資料項目 (對應 queryTLS57030Response) */
export interface TLS57030Detail {
  ID: number;
  MID: string;
  LOGO_CH_NAME: string;
  HOS_NAME: string;
  PLU_MagNo: string;
  PLU_Name: string;
  PLU_No: string;
  PLU_OrgPLUNo: string;
  CAT_LName: string;
  CAT_MName: string;
  CAT_SName: string;
  PLU_OrderPrc: number;
  PLU_SalePrc: number;
  STK_CurrentQty: number;
  sumPLU_OrderPrc: number;
  sumPLU_SalePrc: number;
}

/** 新的後端回傳資料包裝 (對應 queryTLS57030ApiResponse) */
export interface TLS57030DataPackage {
  QueryData: TLS57030Detail[]; // 分頁後的明細
  AllData: TLS57030Detail[];   // 用於計算加總或匯出的全部資料
}
@Injectable({
  providedIn: 'root',
})
export class TLS57030Service {
  private apiUrl = `${environment.ApiUrl}/TLS0000/TLS1000`;

  constructor(private http: HttpClient) { }

  /** * 查詢商品庫存表作業資料
   * 使用 map 處理回傳結構，確保 Component 端可以直接讀取 response.Data
   */
  queryTLS57030(data: QueryTLS57030Request): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS57030`, data).pipe(
      map(res => {
        // 假設後端外層仍有 ApiResponse { Status, Data, TotalCount... }
        if (res.Data) {
          return {
            ...res,
            // 將後端的 QueryData 對應到前端習慣使用的 Data 欄位
            Data: res.Data.QueryData || [],
            AllData: res.Data.AllData || [],
            // 如果後端 TotalCount 在外層就直接用，否則可能要從 QueryData 長度取
            TotalCount: res.TotalCount || 0
          };
        }
        return res;
      })
    );
  }

  /** 匯出每日商品進銷存報表 Excel */
  exportTLS57030Excel(body: QueryTLS57030Request): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/ExportTLS57030Excel`, body,
      {
        observe: 'response',
        responseType: 'blob'
      }
    );
  }

  /** 匯出每日商品進銷存報表 PDF */
  exportTLS57030PDF(body: QueryTLS57030Request): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/exportTLS57030PDF`, body,
      {
        observe: 'response',
        responseType: 'blob'
      }
    );
  }
}
