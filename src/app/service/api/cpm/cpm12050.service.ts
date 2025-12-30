import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseQueryRequest, BaseQueryResponse } from '@shared/models/api/base-api.interface';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

// 查詢客戶意見 Request
export interface QueryCPM12050Request extends BaseQueryRequest {
  SEQ_ID?: string;           // 客戶意見編號
  CUST_NAME?: string;        // 客戶姓名
  SEX?: string;              // 性別
  STATUS?: string;           // 處理狀況
  KIND_ID?: string;          // 意見類型
  SUGG_SOURCE?: string;      // 建議來源
  CONTACT_TEL?: string;      // 聯絡電話
  CELL_PHONE?: string;       // 手機號碼
  E_MAIL?: string;           // Email
  COMPLAIN_NOTES?: string;   // 顧客意見內容
  ORG_ID?: string;           // 責任單位
  CRT_USR_Name?: string;     // 建檔人員
  COMPLAIN_DATE_F?: string;  // 接件日期(起)
  COMPLAIN_DATE_T?: string;  // 接件日期(迄)
}

// 客戶意見 Response 資料結構
export interface CPM12050Data {
  ID: number;                // 主鍵ID
  Mid?: number;              // Mid
  SYS_StoreNo?: string;      // 店櫃號碼
  SEQ_ID?: string;           // 客戶意見編號
  KIND_ID?: string;          // 意見類型
  CUST_NAME?: string;        // 客戶姓名
  SEX?: string;              // 性別
  CONTACT_ADDR?: string;     // 聯絡地址
  CONTACT_TEL?: string;      // 聯絡電話
  CELL_PHONE?: string;       // 手機號碼
  E_MAIL?: string;           // Email
  COMPLAIN_NOTES?: string;   // 顧客意見內容
  COMPLAIN_DATE?: Date;      // 接件日期
  SERVER_NAME?: string;      // 服務人員名稱
  ANSWER_DATE?: Date;        // 回覆日期
  ANSWER_NAME?: string;      // 回覆人員名稱
  ANSWER?: string;           // 回覆內容
  CLASS_ID?: string;         // 分類編號
  ORG_ID?: string;           // 責任單位
  MEMBER_ID?: string;        // 會員編號
  STATUS?: string;           // 處理狀況
  CPRIORITY?: number;        // 優先順序
  CGROUP?: string;           // 群組
  ALERT_DATE?: Date;         // 提醒日期
  SUGG_SOURCE?: string;      // 建議來源
  ANSWER_YN?: string;        // 是否回覆
  KIND_ID_SUB?: string;      // 意見類型子類
  USERNAME?: string;         // 使用者名稱
  ALERT_DATE_MM?: string;    // 提醒日期(月)
  ALERT_DATE_SS?: string;    // 提醒日期(秒)
  ANSWER_DATE_MM?: string;   // 回覆日期(月)
  ANSWER_DATE_SS?: string;   // 回覆日期(秒)
  SUGG_SOURCE_OTHER?: string;// 其他建議來源
  COMPLAIN_DATE_MM?: string; // 接件日期(月)
  COMPLAIN_DATE_SS?: string; // 接件日期(秒)
  FileName1?: string;        // 附件檔名1
  FileName2?: string;        // 附件檔名2
  FileName3?: string;        // 附件檔名3
  CRT_Date?: Date;           // 建檔日期
  CRT_USR_No?: string;       // 建檔人員編號
  CRT_USR_Name?: string;     // 建檔人員名稱
  UPD_Date?: Date;           // 更新日期
  UPD_USR_No?: string;       // 更新人員編號
  UPD_USR_Name?: string;     // 更新人員名稱
}

// 新增客戶意見 Request
export interface InsertCPM12050Request {
  KIND_ID?: string;          // 意見類型
  KIND_ID_SUB?: string;      // 意見類型子類
  SUGG_SOURCE?: string;      // 建議來源
  ORG_ID?: string;           // 責任單位
  COMPLAIN_NOTES?: string;   // 顧客意見內容
  CUST_NAME?: string;        // 客戶姓名
  SEX?: string;              // 性別
  CONTACT_ADDR?: string;     // 聯絡地址
  CONTACT_TEL?: string;      // 聯絡電話
  CELL_PHONE?: string;       // 手機號碼
  E_MAIL?: string;           // Email
  SUGG_SOURCE_OTHER?: string; // 其他建議來源
  MEMBER_ID?: string;        // 會員編號
  USR_NO?: string;           // 使用者編號
  USR_NAME?: string;         // 使用者名稱
}

// 新增客戶意見明細 Request
export interface InsertCPM12050DetailRequest {
  ID: number;                // 主鍵ID
  ANSWER?: string;           // 回覆內容
  ANSWER_ID?: string;        // 回覆人員編號
  USR_NO?: string;           // 使用者編號
  USR_NAME?: string;         // 使用者名稱
}
// 查詢客戶意見明細 Request
export interface QueryCPM12050DetailRequest {
  ID: number;                // 主鍵ID
  SEQ_ID: string;            // 客戶意見編號
}

// 客戶意見明細 Response 資料結構
export interface CPM12050DetailData {
  ID: number;                // 主鍵ID
  SEQ_ID?: string;           // 客戶意見編號
  ANSWER?: string;           // 回覆內容
  ANSWER_ID?: string;        // 回覆人員編號
  ANSWER_DATE?: string;      // 回覆日期
  ANSWER_DATE_MM?: string;   // 回覆日期(月)
  ANSWER_DATE_SS?: string;   // 回覆日期(秒)
  CRT_Date?: string;         // 建檔日期
  CRT_USR_No?: string;       // 建檔人員編號
  CRT_USR_Name?: string;     // 建檔人員名稱
  UPD_Date?: string;         // 更新日期
  UPD_USR_No?: string;       // 更新人員編號
  UPD_USR_Name?: string;     // 更新人員名稱
}

@Injectable({
  providedIn: 'root'
})
export class CPM12050Service {
  private apiUrl = environment.ApiUrl + '/CPM0000/CPM1000';

  constructor(private http: HttpClient) { }

  // 查詢
  queryCPM12050(req: QueryCPM12050Request): Observable<BaseQueryResponse<CPM12050Data>> {
    return this.http.post<BaseQueryResponse<CPM12050Data>>(`${this.apiUrl}/queryCPM12050`, req);
  }

  // 明細查詢
  queryCPM12050Detail(req: QueryCPM12050DetailRequest): Observable<BaseQueryResponse<CPM12050DetailData>> {
    return this.http.post<BaseQueryResponse<CPM12050DetailData>>(`${this.apiUrl}/queryCPM12050Detail`, req);
  }

  // 主檔新增
  insertCPM12050(req: InsertCPM12050Request): Observable<any> {
    return this.http.post(`${this.apiUrl}/insertCPM12050`, req);
  }

  // 明細新增
  insertCPM12050Detail(req: InsertCPM12050DetailRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/insertCPM12050Detail`, req);
  }
}