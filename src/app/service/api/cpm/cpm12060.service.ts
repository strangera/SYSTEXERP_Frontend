import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseQueryResponse } from '@shared/models/api/base-api.interface';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface QueryCPM12060Request {
  COMPLAIN_DATE_S?: string; // 接件日期(起)
  COMPLAIN_DATE_E?: string; // 接件日期(迄)
  ALERT_DATE_S?: string;    // 派單日期(起)
  ALERT_DATE_E?: string;    // 派單日期(迄)
  STATUS?: string;          // 處理狀態(S:已建立,W:已派單,Y:處理中,Z:結案)
}

export interface CPM12060Data {
  SEQ_ID: string; // 單號
  CUST_NAME: string; // 客戶名稱
  SEX: string; // 性別(代碼檔)
  COMPLAIN_DATE: Date; // 提供日期
  CRT_USR_Name: string; // 建立者姓名
  ORG_ID: string; // 處理單位
  STATUS: string; // 處理狀態(S:已建立,W:已派單,Y:處理中,Z:結案)
  ANSWER_DATE_MM: string; // 處理-時
}

@Injectable({
  providedIn: 'root'
})
export class Cpm12060Service {
  private apiUrl = environment.ApiUrl + '/CPM0000/CPM1000';
  constructor(private http: HttpClient) { }

  // 查詢 CSS3006 資料表
  queryCPM12060(req: QueryCPM12060Request): Observable<BaseQueryResponse<CPM12060Data>> {
    return this.http.post<BaseQueryResponse<CPM12060Data>>(`${this.apiUrl}/queryCPM12060`, req);
  }
}
