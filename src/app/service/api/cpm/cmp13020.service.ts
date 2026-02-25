/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SortMeta } from 'primeng/api';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { map } from 'rxjs/operators';

export interface QueryCPM13020Request {
  TXN_BDate?: string; // yyyy-MM-dd
  TXN_EDate?: string; // yyyy-MM-dd
  PAY_No?: string;    // 後端使用 LIKE @PAY_No，空則不送
  pageIndex?: number;
  pageSize?: number;
  SortBy?: SortMeta[];
}

@Injectable({ providedIn: 'root' })
export class Cpm13020Service {
  // 依你提供的實際路由
  private allUrl = `${environment.ApiUrl}/CPM0000/CPM1000/queryCPM13020_All`;
  private posUrl = `${environment.ApiUrl}/CPM0000/CPM1000/queryCPM13020_Pos`;

  constructor(private http: HttpClient) { }

  /** 全館彙總（後端分頁/排序） */
  queryAll(body: QueryCPM13020Request): Observable<any> {
    return this.http.post<any>(this.allUrl, body);
  }

  /** 機台彙總（後端分頁/排序） */
  queryPos(body: QueryCPM13020Request): Observable<any> {
    return this.http.post<any>(this.posUrl, body);
  }
  queryAllForReport(body: QueryCPM13020Request): Observable<{ Data: any[]; TotalCount: number; GrandTotal: any }> {
  return this.queryAll(body).pipe(
    map((res: any) => ({
      Data: Array.isArray(res?.Data?.mainData) ? res.Data.mainData : (Array.isArray(res?.Data) ? res.Data : []),
      TotalCount: Number(res?.TotalCount ?? 0),
      GrandTotal: res?.Data?.totalData?.[0]
        ? {
            TXN_PayAmt: Number(res.Data.totalData[0]?.TXN_Total_PayAmt ?? 0),
            TXN_CustCnt: Number(res.Data.totalData[0]?.TXN_Total_CustCnt ?? 0),
          }
        : null,
    }))
  );
}

queryPosForReport(body: QueryCPM13020Request): Observable<{ Data: any[]; TotalCount: number; GrandTotal: any }> {
  return this.queryPos(body).pipe(
    map((res: any) => ({
      Data: Array.isArray(res?.Data?.mainData) ? res.Data.mainData : (Array.isArray(res?.Data) ? res.Data : []),
      TotalCount: Number(res?.TotalCount ?? 0),
      GrandTotal: res?.Data?.totalData?.[0]
        ? {
            TXN_PayAmt: Number(res.Data.totalData[0]?.TXN_Total_PayAmt ?? 0),
            TXN_CustCnt: Number(res.Data.totalData[0]?.TXN_Total_CustCnt ?? 0),
          }
        : null,
    }))
  );
}
}
