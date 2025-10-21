import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { SortMeta } from 'primeng/api';

/** ================================
 * Request 型別
 * ================================ */
export interface QueryCPM13050Request {
  PageSize: number;
  PageIndex: number;
  OrderBy?: string;
  Offset?: number;
  SortBy?: SortMeta[];
  TXN_BDATE?: string;
  TXN_EDATE?: string;
  shop_nameList?: string[];   // 店家名稱清單
  rule_nameList?: string[];   // 折扣名稱清單
  ShowType?: string;          // 顯示類型
}

/** ================================
 *  Response 型別
 * ================================ */
export interface QueryCPM13050Response {
  Status: string;
  Data: CPM13050DataContainer;
  Message?: string;
  TotalCount?: number;
  TotalPage?: number;
}

/** ================================
 *  Data 容器 (含明細 / 總計 / 小計)
 * ================================ */
export interface CPM13050DataContainer {
  Datas: CPM13050Data[];          // 主資料清單
  SumData?: CPM13050SumData;      // 總計資料
  DetailSumData?: CPM13050SumData[]; // 小計資料清單
}

/** ================================
 *  主資料欄位 (Datas)
 * ================================ */
export interface CPM13050Data {
  TXN_Date: string;               // 交易日期
  PKG_disc_shop_name: string;     // 店家名稱
  PKG_entrance_uuid: string;      // 入場 UUID
  PKG_pricing_start_at: string;   // 開始時間
  PKG_pricing_end_at: string;     // 結束時間
  PKG_license_plate_no: string;   // 車牌號碼
  PKG_disc_rule_name: string;     // 折扣規則名稱
  CNT: number | string;           // 筆數
  PKG_discount_time: number;      // 折扣時數
  PKG_discount_fee: number;       // 折扣金額
}

/** ================================
 * 總計 / 小計 欄位 (SumData / DetailSumData)
 * ================================ */
export interface CPM13050SumData {
  TXN_Date?: string;
  PKG_discount_time?: number;
  PKG_discount_fee?: number;
}

/** ================================
 * Service 定義
 * ================================ */
@Injectable({
  providedIn: 'root'
})
export class Cpm13050Service {
  private apiUrl = `${environment.ApiUrl}/TLS0000/TLS5000`;

  constructor(private http: HttpClient) {}

  /** 查詢 CPM13050 折扣報表 */
  queryCPM13050(body: QueryCPM13050Request): Observable<QueryCPM13050Response> {
    return this.http.post<QueryCPM13050Response>(`${this.apiUrl}/queryCPM13050`, body).pipe(
      map(res => ({
        Status: res.Status,
        Message: res.Message,
        TotalCount: res.TotalCount,
        TotalPage: res.TotalPage,
        Data: res.Data
      }))
    );
  }

  /** 匯出 Excel */
  exportCPM13050(body: QueryCPM13050Request): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/exportCPM13050`, body, {
      observe: 'response',
      responseType: 'blob'
    });
  }

  /** 匯出 PDF */
  exportCPM13050PDF(body: QueryCPM13050Request): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/exportCPM13050PDF`, body, {
      observe: 'response',
      responseType: 'blob'
    });
  }
}
