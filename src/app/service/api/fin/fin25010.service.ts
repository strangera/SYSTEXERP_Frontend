import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiRequest, ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

// 查詢產生電匯付款資料 Request
export interface QueryFIN25010Request extends ApiRequest {
  PAM_No?: string;           // 匯款來源單號
  D_Date_b?: string;         // 建立日期(起)
  D_Date_e?: string;         // 建立日期(迄)
  PTA_Date_b?: string;       // 收/付款日(起)
  PTA_Date_e?: string;       // 收/付款日(迄)
  Remit_Status?: string;     // 是否形成電匯(Y/N)
  WSLIP_NO?: string;         // 匯款單號(電匯單號)
  payday_Counts?: string;    // 付款天數
}

// 產生電匯付款資料 Response
export interface FIN25010Data {
  ID: number;                // 主鍵ID
  PAM_No: string;           // 匯款來源單號
  D_Date?: string;           // 建立日期
  PTA_Date?: string;         // 付款日期
  Remit_Status?: string;     // 是否形成電匯(Y/N)
  WSLIP_NO?: string;         // 匯款單號
}

// 查詢下拉選單 Request
export interface QueryDropFIN25010Request extends ApiRequest {
  PTA_Date_b?: string;  // 收/付款日(起)
  PTA_Date_e?: string;  // 收/付款日(迄)
  Remit_Status?: string;         // 是否形成電匯(Y/N)
  PAM_No?: string;               // 匯款來源單號
}

// 查詢下拉選單 Response
export interface QueryDropFIN25010Response {
  PAM_No?: string;               // 匯款來源單號
  D_Date?: string;               // 建立日期
  Remit_Status?: string;         // 是否形成電匯(Y/N)
}

// 查詢產生電匯付款資料 新增查詢Request
export interface QueryAddFIN25010Request extends ApiRequest {
  ACP_ExpectPayDate?: string;  // 收/付款日
  ven_no_b?: string;           // 廠客代號(起)
  ven_no_e?: string;           // 廠客代號(迄)
  ACP_No?: string;             // 應付帳款ID
  Voucher_Kind?: string;     // 傳票型態
  VEN_PayType?: string;       // 付款方式
}

// 查詢產生電匯付款資料 新增查詢Response
export interface QueryAddFIN25010Response {
  UniqueKey?: string; // <--- 新增這一行
  ID: number;
  acp_no?: string;
  ven_no?: string;
  ven_name?: string;
  IN_TYPE?: string;
  ACP_Amt?: number;
  OriginalACP_Amt?: number; // 原始付款金額，供前端校驗調整後金額不可超過原始金額
  acp_DATE?: string;
  PTA_Date?: string;
  NoteDesc?: string;
  ACCNO?: string;
  ACP_STATUS?: string;
  Voucher_Kind?: string;
  VEN_PayType?: string;
  ORG_ID?: string;
  ACP_YYYYMM?: string;
  ACP_TERMNO?: string;
  Remit_Status?: string;
  RMT_TYPE?: string;
  PTA?: string;
}

// 新增 APS3009 資料表 Request
export interface InsertFIN25010Request {
  D_Date?: string;            // 建立日期
  APS3009?: APS3009Item[];    // APS3009 資料表項目
}

export interface DeleteFIN25010Item {
  // 匯款來源單號
  PAM_No: string;
}

/** 刪除電匯付款資料請求 */
export interface DeleteFIN25010Request {
  selectList: DeleteFIN25010Item[];
}

export interface APS3009Item {
  ID: number;                // ID
  RMT_TYPE?: string;          // 應收應付別(1=應付, 2=應收)
  VEN_No?: string;            // 廠客代號
  APAR_No?: string;           // 應收/應付單號
  ACP_YYYYMM?: string;        // 應付帳款年月
  acp_termno?: number;        // 帳款帳次
  ACP_Amt?: number;           // 帳款金額
  PTA_Date?: string;          // 沖帳日期
  NoteDesc?: string;          // 摘要(傳票上的摘要)
  IN_TYPE?: string;           // 資料來源別(1=應付, 2=應收, 3=保留款)
  Remit_Status?: string;      // 是否產生電匯(Y/N) (0=作廢N 2=建立Y)
}

// 檢視頁面查詢 Request
export interface QueryDetailFIN25010Request extends ApiRequest {
  PAM_No: string; // 必要條件
}

@Injectable({
  providedIn: 'root'
})
export class FIN25010Service {
  private apiUrl = environment.ApiUrl + '/FIN0000/APS1000';

  constructor(private http: HttpClient) { }

  // 查詢
  queryFIN25010(req: QueryFIN25010Request): Observable<ApiResponse<FIN25010Data[]>> {
    return this.http.post<ApiResponse<FIN25010Data[]>>(`${this.apiUrl}/queryFIN25010`, req);
  }

  // 在 FIN25010Service 類別中新增此方法
  queryDetailFIN25010(req: QueryDetailFIN25010Request): Observable<ApiResponse<QueryAddFIN25010Response[]>> {
    return this.http.post<ApiResponse<QueryAddFIN25010Response[]>>(`${this.apiUrl}/query_detailFIN25010`, req);
  }
  // 查詢下拉選單
  queryDropFIN25010(req: QueryDropFIN25010Request): Observable<ApiResponse<QueryDropFIN25010Response[]>> {
    return this.http.post<ApiResponse<QueryDropFIN25010Response[]>>(`${this.apiUrl}/query_dropFIN25010`, req);
  }

  // 新增頁面-查詢產生電匯付款資料
  queryAddFIN25010(req: QueryAddFIN25010Request): Observable<ApiResponse<QueryAddFIN25010Response[]>> {
    return this.http.post<ApiResponse<QueryAddFIN25010Response[]>>(`${this.apiUrl}/query_addFIN25010`, req)
      .pipe(
        map(response => {
          if (response.Data && response.Data.length > 0) {
            response.Data = response.Data.map(item => ({
              ...item,
              // 生成唯一 Key: 來源別 + 原始ID
              UniqueKey: `${item.IN_TYPE}_${item.ID}`
            }));
          }
          return response;
        })
      );
  }

  // 新增 APS3009 資料表
  insertFIN25010(data: InsertFIN25010Request): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/insertFIN25010`, data);
  }

  // 刪除資料
  deleteFIN25010(body: DeleteFIN25010Request): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(`${this.apiUrl}/deleteFIN25010`, body);
  }
}
