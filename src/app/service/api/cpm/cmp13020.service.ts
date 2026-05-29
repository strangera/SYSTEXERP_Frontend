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
  PAY_No?: string[];    // 後端使用 LIKE @PAY_No，空則不送
  ECR_No?: string[];    // 收銀機號（機台彙總用）
  pageIndex?: number;
  pageSize?: number;
  SortBy?: SortMeta[];
}
export interface PayNoOption {
  No: string;
  Name: string;
}
export interface ECRDropDownOption {
  ECR_No: string;
  ECR_Name: string;
  building_desc: string | null;
}

export interface DropDownListResponse<T> {
  Status: string;
  Data: T;
  Error?: {
    Code?: string;
    Message?: string;
    Details?: string;
  } | null;
  Meta?: {
    Timestamp?: string;
    RequestId?: string;
  };
  Message?: string;
  TotalCount?: number;
  TotalPage?: number;
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
  queryCPM13020(body: QueryCPM13020Request): Observable<{ Data: any[]; TotalCount: number; GrandTotal: any }> {
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
 private payNoDropUrl = `${environment.ApiUrl}/queryPOS1006_PAY_No_DropDownList`;
  private ecrDropUrl = `${environment.ApiUrl}/CPM0000/CPM1000/queryCPM13020_ECR_DropDown`;

queryPOS1006_PAY_No_DropDownList(): Observable<PayNoOption[]> {
  return this.http
    .post<DropDownListResponse<PayNoOption[]>>(this.payNoDropUrl, {})
    .pipe(map((res) => (Array.isArray(res?.Data) ? res.Data : [])));
}

/** 收銀機號下拉清單（機號、名稱、館別） */
queryCPM13020_ECR_DropDown(): Observable<ECRDropDownOption[]> {
  return this.http
    .get<DropDownListResponse<ECRDropDownOption[]>>(this.ecrDropUrl)
    .pipe(map((res) => (Array.isArray(res?.Data) ? res.Data : [])));
}
}
