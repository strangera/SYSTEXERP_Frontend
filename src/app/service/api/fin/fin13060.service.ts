/* src/app/service/api/fin/fin13060.service.ts */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';

import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { DropDownItem } from './fin13050.service';

export type QueryResponse<T> = ApiResponse<T[]>;
export interface TalentDropDown {
  tlt_no: string;
  tlt_name: string;
  ven_no: string;
  ven_uniform: string;
}

@Injectable({ providedIn: 'root' })
export class FIN13060Service {
  private apiUrl = environment.ApiUrl;

  constructor(
    private http: HttpClient,

  ) { }
  // 將任何可被 new Date() 解析的值，轉成 yyyy/MM/dd；無法解析就原樣回傳字串


  // 查詢
  queryFIN13060(query: any): Observable<QueryResponse<any>> {
    return this.http
      .post<QueryResponse<any>>(`${this.apiUrl}/FIN0000/INV1000/queryFIN13060`, query)
      .pipe(
        tap((res) => console.log('查詢結果:', res)),

      );
  }

  // 新增
  insertFIN13060(data: any): Observable<ApiResponse<number>> {
    return this.http
      .post<ApiResponse<number>>(`${this.apiUrl}/FIN0000/INV1000/insertFIN13060`, data)
      .pipe(
        tap((res) => console.log('新增結果:', res)),

      );
  }

  // 更新
  updateFIN13060(data: any): Observable<ApiResponse<number>> {
    return this.http
      .post<ApiResponse<number>>(`${this.apiUrl}/FIN0000/INV1000/updateFIN13060`, data)
      .pipe(
        tap((res) => console.log('更新結果:', res)),

      );
  }

  // 明細查詢（若後端提供）
  queryDetailByGUI(param: { GUI_No: string }): Observable<QueryResponse<any>> {
    return this.http
      .post<QueryResponse<any>>(`${this.apiUrl}/FIN0000/INV1000/queryFIN13060Detail`, param)
      .pipe(
        tap((res) => console.log('明細查詢結果:', res)),

      );
  }

  // 對應查詢（若後端提供）
  queryCorrespondByGUI(param: { GUI_Correspond: string }): Observable<QueryResponse<any>> {
    return this.http
      .post<QueryResponse<any>>(`${this.apiUrl}/FIN0000/INV1000/queryFIN13060Correspond`, param)
      .pipe(
        tap((res) => console.log('對應查詢結果:', res)),

      );
  }
  queryAPS2002DropDownList(): Observable<ApiResponse<DropDownItem[]>> {
    // 如果你的後端是 GET，改成 this.http.get<ApiResponse<DropDownItem[]>>(`${this.apiUrl}/queryAPS2002_DropDownList`);
    return this.http
      .post<ApiResponse<DropDownItem[]>>(`${this.apiUrl}/queryFIN13060_TDS1007DropDownList`, {})
      .pipe(
        tap((res) => console.log('APS2002 下拉資料:', res)),
        // 需要共用錯誤處理的話打開下一行
        // catchError(err => this.errorHandler.handle(err))
      );
  }
  /** 🔹刪除：以 id 陣列呼叫 API */
  deleteFIN13060(idList: number[]): Observable<ApiResponse<number>> {
    const payload = { idList };
    return this.http
      .post<ApiResponse<number>>(
        `${this.apiUrl}/FIN0000/INV1000/deleteFIN13060`,
        payload
      )
      .pipe(tap(res => console.log('刪除結果:', res)));
  }
  queryFIN13060TalentDropDown(): Observable<ApiResponse<TalentDropDown[]>> {
    return this.http.post<ApiResponse<TalentDropDown[]>>(`${this.apiUrl}/FIN0000/INV1000/queryFIN13060TalentDropDown`, {});
  }
}

