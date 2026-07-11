import { ApiRequest, ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

// 查詢客戶意見 Request
export interface QueryCPM12050Request extends ApiRequest {
  SEQ_ID?: string;           // 客戶意見編號
  ID?: number;               // 主鍵ID（可用於查單筆）
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
  CLASS_NAME?: string;       // 責任單位名稱
  ORG_ID?: string;           // 組織
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
  // (處理狀況說明移至上方 ANSWER_YN 註解)
  COMPLAIN_DATE_SS?: string; // 接件日期(秒)
  FileName1?: string;        // 附件檔名1
  FileName2?: string;        // 附件檔名2
  FileName3?: string;        // 附件檔名3
  CLOSE_DATE?: Date;         // 結案日期
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
  ORG_ID?: string;           // 組織
  CLASS_ID?: string;         // 責任單位 CLASS_ID
  COMPLAIN_NOTES?: string;   // 顧客意見內容
  CUST_NAME?: string;        // 客戶姓名
  SEX?: string;              // 性別
  CONTACT_ADDR?: string;     // 聯絡地址
  CONTACT_TEL?: string;      // 聯絡電話
  CELL_PHONE?: string;       // 手機號碼
  E_MAIL?: string;           // Email
  SUGG_SOURCE_OTHER?: string; // 其他建議來源
  ANSWER_YN?: string;        // 是否已回覆（Y/N/S 等）
  STATUS?: string;          // 處理狀態（S:已建立 W:已派單 Y:處理中 Z:結案）
  SUGG_TYPE?: string;        // 建議類型 (客訴/表揚)
  CLASS_EMAIL?: string;      // 分類 Email
  MEMBER_ID?: string;        // 會員編號
  COMPLAIN_DATE?: string;    // 接件日期 (ISO string)
  ALERT_DATE?: string;       // 提醒日期 (yyyy-MM-dd)
  USR_NO?: string;           // 使用者編號
  USR_NAME?: string;         // 使用者名稱
}

// 新增客戶意見明細 Request
export interface InsertCPM12050DetailRequest {
  SEQ_ID: string;            // 主檔意見編號（CSS3006.SEQ_ID）
  ANSWER?: string;           // 回覆內容
  ANSWER_ID?: string;        // 回覆人員編號
  USR_NO?: string;           // 使用者編號
  USR_NAME?: string;         // 使用者名稱
}

// 修改客戶意見主檔 Request
export interface UpdateCPM12050Request {
  ID: number;                // 主鍵ID
  KIND_ID?: string;          // 意見類型
  KIND_ID_SUB?: string;      // 意見類型子類
  CUST_NAME?: string;        // 客戶姓名
  SEX?: string;              // 性別
  CONTACT_ADDR?: string;     // 聯絡地址
  CONTACT_TEL?: string;      // 聯絡電話
  CELL_PHONE?: string;       // 手機號碼
  E_MAIL?: string;           // Email
  COMPLAIN_NOTES?: string;   // 顧客意見內容
  SUGG_SOURCE?: string;      // 建議來源
  SUGG_SOURCE_OTHER?: string; // 其他建議來源
  SUGG_TYPE?: string;        // 建議類型 (客訴/表揚)
  ANSWER_YN?: string;        // 是否已回覆（Y/N/S 等）
  CLASS_EMAIL?: string;      // 分類 Email
  ORG_ID?: string;           // 組織
  CLASS_ID?: string;         // 責任單位 CLASS_ID
  MEMBER_ID?: string;        // 會員編號
  STATUS?: string;           // 處理狀況
  USR_NO?: string;           // 使用者編號
  USR_NAME?: string;         // 使用者名稱
  ALERT_DATE?: string;       // 提醒日期 (ISO string)
}

// 修改客戶意見明細 Request
export interface UpdateCPM12050DetailRequest {
  ID: number;                // 主鍵ID
  SEQ_ID?: string;           // 客戶意見編號
  ANSWER?: string;           // 回覆內容
  ANSWER_ID?: string;        // 回覆人員編號
  USR_NO?: string;           // 使用者編號
  USR_NAME?: string;         // 使用者名稱
}

// 派單 Request
export interface DispatchCPM12050Request {
  ID: number;                // 主鍵ID
  USR_NO?: string;           // 使用者編號
  USR_NAME?: string;         // 使用者名稱
}

// 結案 Request
export interface CloseCPM12050Request {
  ID: number;                // 主鍵ID
  CLOSE_MEMO?: string;       // 結案備註
  USR_NO?: string;           // 使用者編號
  USR_NAME?: string;         // 使用者名稱
}

// 查詢客戶意見明細 Request
export interface QueryCPM12050DetailRequest {
  ID: number;                // 主鍵ID
  SEQ_ID: string;            // 客戶意見編號
}

// CSS10031 意見類別細項
export interface CSS10031Item {
  ID: number;
  KIND_ItemID: string;
  KIND_Name: string;
}

// 客戶意見明細 Response 資料結構（含主檔完整欄位，供 CRU 畫面使用）
export interface CPM12050DetailData {
  // 主檔識別
  MAIN_ID: number;           // 主檔 ID
  SEQ_ID?: string;           // 客戶意見編號
  // CSS3006 主檔完整欄位
  mid?: number;
  SYS_StoreNo?: string;
  KIND_ID?: string;
  KIND_ID_SUB?: string;
  CUST_NAME?: string;
  SEX?: string;
  MEMBER_ID?: string;
  CONTACT_ADDR?: string;
  CONTACT_TEL?: string;
  CELL_PHONE?: string;
  E_MAIL?: string;
  SUGG_SOURCE?: string;
  SUGG_SOURCE_OTHER?: string;
  SUGG_TYPE?: string;
  COMPLAIN_NOTES?: string;
  COMPLAIN_DATE?: string;
  ALERT_DATE?: string;
  SERVER_NAME?: string;
  ANSWER_YN?: string;
  CLASS_ID?: string;
  CLASS_EMAIL?: string;
  USERNAME?: string;
  STATUS?: string;
  CLOSE_DATE?: string;
  FileName1?: string;
  FileName2?: string;
  FileName3?: string;
  CRT_Date?: string;
  CRT_USR_No?: string;
  CRT_USR_Name?: string;
  UPD_Date?: string;
  UPD_USR_No?: string;
  UPD_USR_Name?: string;
  ORG_ID?: string;
  // CSS3007 明細欄位（無明細時為 null）
  DETAIL_ID?: number;        // 明細 ID，null 代表此筆無明細
  ANSWER?: string;           // 處理紀錄
  ANSWER_ID?: string;        // 處理者
  ANSWER_DATE?: string;      // 處理日期時間
  ANSWER_DATE_MM?: string;
  ANSWER_DATE_SS?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CPM12050Service {
  private apiUrl = environment.ApiUrl + '/CPM0000/CPM1000';

  constructor(private http: HttpClient) { }

  // 查詢
  queryCPM12050(req: QueryCPM12050Request): Observable<ApiResponse<CPM12050Data[]>> {
    return this.http.post<ApiResponse<CPM12050Data[]>>(`${this.apiUrl}/queryCPM12050`, req);
  }

  // 明細查詢
  queryCPM12050Detail(req: QueryCPM12050DetailRequest): Observable<ApiResponse<CPM12050DetailData[]>> {
    return this.http.post<ApiResponse<CPM12050DetailData[]>>(`${this.apiUrl}/queryCPM12050Detail`, req);
  }

  // 主檔新增（支援 JSON 或 FormData（含檔案））
  insertCPM12050(req: InsertCPM12050Request | FormData): Observable<any> {
    if (req instanceof FormData) {
      return this.http.post(`${this.apiUrl}/insertCPM12050`, req);
    }
    return this.http.post(`${this.apiUrl}/insertCPM12050`, req);
  }

  // 明細新增（多筆）
  insertCPM12050Detail(req: InsertCPM12050DetailRequest[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/insertCPM12050Detail`, req);
  }

  // 主檔修改（支援 JSON 或 FormData（含檔案））
  updateCPM12050(req: UpdateCPM12050Request | FormData): Observable<any> {
    // 若為 FormData（含檔案），直接傳遞讓瀏覽器自動設定 multipart boundary
    if (req instanceof FormData) {
      return this.http.post(`${this.apiUrl}/updateCPM12050`, req);
    }
    // 否則以 JSON 傳遞
    return this.http.post(`${this.apiUrl}/updateCPM12050`, req);
  }

  // 明細修改
  // 明細修改（支援多筆）
  updateCPM12050Detail(req: UpdateCPM12050DetailRequest[] | UpdateCPM12050DetailRequest): Observable<any> {
    const url = `${this.apiUrl}/updateCPM12050Detail`;
    if (Array.isArray(req)) {
      // 明確指定為 JSON 陣列，避免中間攔截器或其他邏輯改變內容型別
      return this.http.post(url, req, { headers: { 'Content-Type': 'application/json' } });
    }
    return this.http.post(url, req);
  }

  // Excel 匯出（後端生成，含明細展開）
  exportCPM12050Excel(req: QueryCPM12050Request): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/exportCPM12050Excel`, req, { responseType: 'blob' });
  }

  // PDF 匯出（後端生成，含明細展開）
  exportCPM12050Pdf(req: QueryCPM12050Request): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/exportCPM12050Pdf`, req, { responseType: 'blob' });
  }

  // 派單
  dispatchCPM12050(req: DispatchCPM12050Request): Observable<any> {
    return this.http.post(`${this.apiUrl}/dispatchCPM12050`, req);
  }

  // 結案
  closeCPM12050(req: CloseCPM12050Request): Observable<any> {
    return this.http.post(`${this.apiUrl}/closeCPM12050`, req);
  }

  // 依意見子類型取得類別資訊細項 (CSS10031)
  queryCPM12050CSS10031(kindSubId: string): Observable<ApiResponse<CSS10031Item[]>> {
    return this.http.post<ApiResponse<CSS10031Item[]>>(`${this.apiUrl}/queryCPM12050CSS10031`, { KIND_SubID: kindSubId });
  }
}
