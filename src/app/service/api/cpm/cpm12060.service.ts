import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseQueryResponse } from '@shared/models/api/base-api.interface';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

// 查詢 CSS3006 資料表
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

// 查詢 CPS3006 資料表_點開主檔
export interface detailCPM12060Request {
  ID: number; // 主鍵識別碼
}

export interface main12060Data {
  ID: number;
  SEQ_ID: string;
  KIND_ID: string;
  KIND_ID_SUB: string;
  CUST_NAME: string;
  SEX: string;
  CONTACT_ADDR: string;
  CONTACT_TEL: string;
  CELL_PHONE: string;
  E_MAIL: string;
  COMPLAIN_NOTES: string;
  COMPLAIN_DATE: Date;
  SUGG_SOURCE: string;
  SUGG_SOURCE_OTHER: string;
  ORG_ID: string;
  MEMBER_ID: string;
  STATUS: string;
  CRT_Date: Date;
  CRT_USR_No: string;
  CRT_USR_Name: string;
  ANSWER: string;
  ANSWER_DATE: Date;
  ANSWER_NAME: string;
}

// 查詢 CPS3006 資料表_點開明細檔
export interface detail12060Data {
  SEQ_ID: string;
  ANSWER: string;
  ANSWER_DATE: Date;
  ANSWER_ID: string;
  CRT_Date: Date;
  CRT_USR_Name: string;
  UPD_Date: Date;
  UPD_USR_Name: string;
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

  // 查詢 CPS3006 資料表_點開主檔
  queryCPM12060_Main(req: detailCPM12060Request): Observable<BaseQueryResponse<main12060Data>> {
    return this.http.post<BaseQueryResponse<main12060Data>>(`${this.apiUrl}/queryCPM12060_Main`, req);
  }

  // 查詢 CPS3006 資料表_點開明細檔
  queryCPM12060_Detail(req: detailCPM12060Request): Observable<BaseQueryResponse<detail12060Data>> {
    return this.http.post<BaseQueryResponse<detail12060Data>>(`${this.apiUrl}/queryCPM12060_Detail`, req);
  }
}
