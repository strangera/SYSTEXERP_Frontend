/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SortMeta } from 'primeng/api';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

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
}
