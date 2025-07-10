import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment'; // 請確認你的 environment 路徑是否正確
import { ApiResponse } from '../../system/auth.service'; // 請確認你的 ApiResponse 介面路徑是否正確

export interface TLS21030Request {
  money_type?: string; // 結帳方式 10=十日結、15=半月結、30=月結
  term_no?: number; // 帳次 Default:
  race_yn?: string; // 是否使用業主發票 (Y=是、N=否)
  bill_remarks?: string; // 說明 存為html格式
  tlt_no?: string; // 專櫃編號 (table: TALTALENT_BILL_NOTES_DETALL)
}

export interface TLS21030Data {
  id: number; // 主鍵 ID
  tlt_no: string; // 專櫃編號 (table: TALTALENT_BILL_NOTES_DETALL)
  tlt_name: string; // 專櫃名稱
  money_type: string; // 結帳方式 10=十日結、15=半月結、30=月結
  term_no: number; // 帳次 Default: 1
  race_yn: string; // 是否使用業主發票 (Y=是、N=否)
  bill_remark1: string; // 說明1 存為html格式
  bill_remark2: string; // 說明2 存為html格式
  bill_remark3: string; // 說明3 存為html格式
  CRT_Date: string; // 建立日期
  CRT_USR_No: string; // 建立人員
  CRT_USR_Name: string; // 建立人員名稱
  UPD_Date: string; // 更新日期
  UPD_USR_No: string; // 更新人員
  UPD_USR_Name: string; // 更新人員名稱
}

@Injectable({
  providedIn: 'root',
})
export class Tls21030Service {
  private apiUrl: string = environment.ApiUrl + '/TLS0000/TLS2000';

  constructor(private http: HttpClient) { }

  /**
   * (查詢對帳單備註資料)
   * 查詢 TALTALENT_BILL_NOTES、TALTALENT_BILL_NOTES_DETALL、TLTTALENT  資料表
   * @param params 查詢條件
   * @returns 包含 TLS21030Data 陣列的 API 響應
   */
  queryTLS21030(params: TLS21030Request): Observable<ApiResponse<TLS21030Data[]>> {
    return this.http.post<ApiResponse<TLS21030Data[]>>(`${this.apiUrl}/queryTLS21030`, params);
  }
  /**
   * 新增對帳單備註資料
   * @param data 包含對帳單備註資料
   * @returns API 響應 (通常為成功訊息或 ID)
   */
  deleteTLS21030(ids: number[]): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(`${this.apiUrl}/deleteTLS21030`, ids);
  }

  // /**
  //  * 新增 POS2031 (退貨驗收主檔) 資料表
  //  * @param data 包含退貨驗收主檔及明細資料
  //  * @returns API 響應 (通常為成功訊息或 ID)
  //  */
  // insertTLS52040(data: TLS52040Request): Observable<ApiResponse<any>> {
  //   return this.http.post<ApiResponse<any>>(`${this.apiUrl}/insertTLS52040`, data);
  // }

  // /**
  //  * 更新 POS2031、POS2032 (退貨驗收主檔及明細) 資料
  //  * @param data 包含退貨驗收主檔及明細資料
  //  * @returns API 響應
  //  */
  // updateTLS52040(data: TLS52040Request): Observable<ApiResponse<any>> {
  //   return this.http.post<ApiResponse<any>>(`${this.apiUrl}/updateTLS52040`, data);
  // }
}
