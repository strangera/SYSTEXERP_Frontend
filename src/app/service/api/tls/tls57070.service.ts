import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { SortMeta } from 'primeng/api';

/**
 * 查詢存貨月結表 (queryTLS57070) 的請求主體介面
 */
export interface Tls57070Request {
  PageSize?: number;
  PageIndex?: number;
  SortBy?: SortMeta[];
  STK_YM: string; // 庫存年月 (Stock Year Month)，必填
  HOS_NOList?: string[]; // 院區編號列表
  LOGO_NoList?: string[]; // 專櫃編號列表
  ShowType?: string; // 顯示類型
}

/**
 * 存貨月結表查詢結果 (Datas) 的單筆資料介面
 */
export interface Tls57070DataItem {
  LOGO_No: string;
  LOGO_CH_NAME: string;
  PLU_MagNo: string;
  PLU_Name: string;
  STK_PRIORQTY: number; // 期初數量
  STK_PRIORCOST: number; // 期初成本
  STK_STOCKQTY: number; // 進貨數量
  STK_STOCKCOST: number; // 進貨成本
  STK_REJECTQTY: number; // 退貨數量
  STK_REJECTCOST: number; // 退貨成本
  STK_SALEQTY: number; // 銷貨數量
  STK_SALECOST: number; // 銷貨成本
  STK_SALENET: number; // 銷貨淨額
  STK_MOVEINQTY: number; // 調入數量
  STK_MOVEINCOST: number; // 調入成本
  STK_MOVEOUTQTY: number; // 調出數量
  STK_MOVEOUTCOST: number; // 調出成本
  STK_DIFFQTY: number; // 差異數量
  STK_DIFFCOST: number; // 差異成本
  STK_SCRAPQTY: number; // 報廢數量
  STK_SCRAPCOST: number; // 報廢成本
  STK_TAKEQTY: number; // 盤盈數量
  STK_TAKECOST: number; // 盤盈成本
  STK_RETAKEQTY: number; // 盤虧數量
  STK_RETAKECOST: number; // 盤虧成本
  STK_TRDINQTY: number; // 轉入數量
  STK_TRDINCOST: number; // 轉入成本
  STK_TRDOUTQTY: number; // 轉出數量
  STK_TRDOUTCOST: number; // 轉出成本
  STK_SYSADJUSTCOST: number; // 系統調整成本
  STK_CURRENTQTY: number; // 期末數量
  STK_CURRENTCOST: number; // 期末成本
  PLU_SALEPRCNET: number; // 淨價
  PLU_SALEPRC: number; // 售價
  STK_UNITCOST: number; // 單位成本
  SALENET: number; // 總淨銷售額
  GROSSPROFIT: number; // 毛利
  GROSSPROFITMARGIN: string; // 毛利率
}

/**
 * 存貨月結表 API 回應的 Data 結構介面
 */
export interface Tls57070ResponseData {
  Datas: Tls57070DataItem[];
  SumData: Tls57070DataItem; // 總計資料
  DetailSumData: Tls57070DataItem[]; // 可能的分組彙總資料 (例如依 LOGO_No)
}
@Injectable({
  providedIn: 'root'
})
export class Tls57070Service {

  // API 的基礎路徑 (與 Tls57130Service 相同)
  apiUrl = `${environment.ApiUrl}/TLS0000/TLS5000`;

  constructor(private http: HttpClient) { }

  /**
   * 查詢存貨月結表 (queryTLS57070)
   * POST /TLS0000/TLS5000/queryTLS57070
   * @param body 包含查詢條件、分頁和排序資訊的請求主體。
   * @returns 包含 Tls57070ResponseData 結構的 API 回應。
   */
  queryTLS57070(body: Tls57070Request): Observable<any> {
    const url = `${this.apiUrl}/queryTLS57070`;
    // 注意：回傳類型是 ApiResponse<Tls57070ResponseData>，而不是 DataItem[]
    return this.http.post<any>(url, body).pipe(
      map(response => {
        return {
          Data: response.Data.Datas,
          TotalCount: response.TotalCount, // 假設沒有分頁，總數是資料長度
          SumData: response.Data.SumData,
          DetailSumData: response.Data.DetailSumData
        };
      })
    );
  }

  /**
   * 匯出存貨月結表 (exportTLS57070)
   * POST /TLS0000/TLS5000/exportTLS57070
   * @param body 包含查詢條件、分頁和排序資訊的請求主體。
   * @returns 包含匯出檔案的 Blob 物件 (帶有完整的 HttpResponse)。
   */
  exportTLS57070(body: Tls57070Request): Observable<HttpResponse<Blob>> {
    const url = `${this.apiUrl}/exportTLS57070`;
    // 與 Tls57130Service 保持一致的匯出格式
    return this.http.post(url, body, { observe: 'response', responseType: 'blob' });
  }

  /**
   * 匯出存貨月結表PDF (exportTLS57070PDF)
   * POST /TLS0000/TLS5000/exportTLS57070PDF
   * @param body 包含查詢條件、分頁和排序資訊的請求主體。
   * @returns 包含匯出 PDF 檔案的 Blob 物件 (帶有完整的 HttpResponse)。
   */
  exportTLS57070PDF(body: Tls57070Request): Observable<HttpResponse<Blob>> {
    const url = `${this.apiUrl}/exportTLS57070PDF`;
    // 與 Tls57130Service 保持一致的匯出格式
    return this.http.post(url, body, { observe: 'response', responseType: 'blob' });
  }
}
