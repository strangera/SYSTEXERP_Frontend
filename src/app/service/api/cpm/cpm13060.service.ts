import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { SortMeta } from 'primeng/api';

/** ======== Request 型別 ======== */
export interface QueryCPM13060Request {
  PageSize: number;
  PageIndex: number;
  OrderBy?: string;
  Offset?: number;
  SortBy?: SortMeta[];
  TXN_BDATE?: string;
  TXN_EDATE?: string;
}

/** ======== Response 型別 ======== */
export interface QueryCPM13060Response {
  Status: string;
  Data: {
    Datas: CPM13060Data[];     // 主資料清單
    SumData: CPM13060SumData;  // 總計列資料
  };
  TotalCount: number;
  Message: string;
}

/** ======== 明細資料欄位 ======== */
export interface CPM13060Data {
  building_desc: string;        // 館別
  floor_desc: string;           // 樓層
  ECR_SubGroup: string;         // 繳費機編號
  PKG_disc_rule_name: string;   // 折扣規則
  Total_Fee: number;            // 金額
  Total_Time: number;           // 時數
  CNT: number;                  // 筆數
}

/** ========  總計資料欄位 ======== */
export interface CPM13060SumData {
  building_desc?: string;
  floor_desc?: string;
  ECR_SubGroup?: string;
  PKG_disc_rule_name?: string;
  Total_Fee?: number;
  Total_Time?: number;
  CNT?: number;
}

@Injectable({
  providedIn: 'root'
})
export class Cpm13060Service {
  private apiUrl = `${environment.ApiUrl}/CPM0000/CPM1000`;

  constructor(private http: HttpClient) {}

 queryCPM13060(data: any): Observable<any> {
  return this.http.post<any>(`${this.apiUrl}/queryCPM13060`, data).pipe(

    map(res => {
      // 保留原始 Data 結構
      return {
        Status: res.Status,
        Message: res.Message,
        TotalCount: res.TotalCount,
        Data: res.Data
      };
    })
  );
}

  /** 匯出 Excel */
  exportCPM13060(body: QueryCPM13060Request): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/exportCPM13060`, body, {
      observe: 'response',
      responseType: 'blob',
    });
  }

  /** 匯出 PDF */
  exportCPM13060PDF(body: QueryCPM13060Request): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/exportCPM13060PDF`, body, {
      observe: 'response',
      responseType: 'blob',
    });
  }
}
