import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseQueryRequest } from '@shared/models/api/base-api.interface';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';

// ==================== 查詢 Request ====================

/** 詢價登錄查詢條件 */
export interface QueryASS12020Request extends BaseQueryRequest {
  /** 品項編號 (QueryFASITEM_DropDownList 未實作前可留空) */
  GOODS_ID?: string | null;
  /** 供應商編號 */
  SUPPLIER_ID?: string | null;
  /** 品項進價(報價金額) 起 */
  PRICE_FROM?: number | null;
  /** 品項進價(報價金額) 訖 */
  PRICE_TO?: number | null;
  /** 品項單價 起 */
  UNIT_PRICE_FROM?: number | null;
  /** 品項單價 訖 */
  UNIT_PRICE_TO?: number | null;
  /** 品項單位 (SYS1000 UNIT) */
  GOODS_UNIT?: string | null;
  /** 報價期限 起 */
  EXPDATE_FROM?: string | null;
  /** 報價期限 訖 */
  EXPDATE_TO?: string | null;
  /** 登錄批號 */
  BATCH_NO?: string | null;
}

// ==================== 查詢結果列 ====================

/** 詢價登錄查詢結果一筆 */
export interface ASS12020QueryRow {
  /** 主鍵 (登錄批號或 ID，供編輯/刪除用) */
  id?: number | string;
  /** 登錄批號 */
  BATCH_NO?: string | null;
  /** 供應商編號 */
  SUPPLIER_ID?: string | null;
  /** 登錄日期 */
  LOG_DATE?: string | null;
  /** 報價期限 */
  EXPDATE?: string | null;
  /** 說明 */
  NOTES?: string | null;
}

// ==================== 新增/更新 Request ====================

/** 詢價登錄明細一筆 */
export interface ASS12020DetailItem {
  NEED_ID?: string | null;
  GOODS_ID?: string | null;
  GOODS_PRICE?: number | null;
  PURCHASE_QTY?: number | null;
  QTY?: number | null;
  GOODS_UNIT?: string | null;
  TOTAL_AMT?: number | null;
  EXPIRE_LIMIT?: number | null;
  WH_ID?: string | null;
  NOTES?: string | null;
}

/** 詢價登錄新增 Request */
export interface ASS12020InsertRequest {
  SUPPLIER_ID: string;
  EXPDATE: string;
  NOTES?: string | null;
  Details: ASS12020DetailItem[];
}

/** 詢價登錄更新 Request */
export interface ASS12020UpdateRequest extends ASS12020InsertRequest {
  id: number | string;
}

// ==================== 編輯用 (取得單筆) ====================

/** 詢價登錄主檔+明細 (編輯頁載入用) */
export interface ASS12020Detail {
  id?: number | string;
  SUPPLIER_ID?: string | null;
  EXPDATE?: string | null;
  NOTES?: string | null;
  Details?: ASS12020DetailItem[];
}

// ==================== 套用請購申請單 ====================

/** 請購申請單清單一筆 (套用視窗表格用) */
export interface ApplyPurchaseRequestRow {
  /** 需求編號 (或主鍵，供套用時取得明細用) */
  NEED_ID?: string | null;
  /** 申請人 */
  APPLICANT?: string | null;
  /** 申請部門 */
  DEPT?: string | null;
  /** 日期 */
  REQ_DATE?: string | null;
  /** 筆數 */
  ROW_COUNT?: number | null;
}

// ==================== Service ====================

const emptyApiMeta = {
  Timestamp: '',
  RequestId: '',
};

@Injectable({
  providedIn: 'root',
})
export class ASS12020Service {
  private readonly apiUrl = environment.ApiUrl + '/ASS0000/ASS1000';

  constructor(private http: HttpClient) {}

  /**
   * 詢價登錄查詢
   */
  queryASS12020(body: QueryASS12020Request): Observable<ApiResponse<ASS12020QueryRow[]>> {
    // TODO: 接真實 API
    return of({
      Status: '0000',
      Data: [],
      TotalCount: 0,
      TotalPage: 0,
      Message: '',
      Error: null,
      Meta: emptyApiMeta,
    });
    // return this.http.post<ApiResponse<ASS12020QueryRow[]>>(`${this.apiUrl}/queryASS12020`, body);
  }

  /**
   * 新增詢價登錄
   */
  insertASS12020(body: ASS12020InsertRequest): Observable<ApiResponse<unknown>> {
    // TODO: 接真實 API
    return of({
      Status: '0000',
      Data: {},
      TotalCount: 0,
      TotalPage: 0,
      Message: '',
      Error: null,
      Meta: emptyApiMeta,
    });
    // return this.http.post<ApiResponse<unknown>>(`${this.apiUrl}/insertASS12020`, body);
  }

  /**
   * 取得套用請購申請單清單
   */
  getApplyPurchaseRequestList(): Observable<ApiResponse<ApplyPurchaseRequestRow[]>> {
    // TODO: 接專用 API
    return of({
      Status: '0000',
      Data: [],
      TotalCount: 0,
      TotalPage: 0,
      Message: '',
      Error: null,
      Meta: emptyApiMeta,
    });
    // return this.http.post<ApiResponse<ApplyPurchaseRequestRow[]>>(`${this.apiUrl}/getApplyPurchaseRequestList`, {});
  }

  /**
   * 取得單筆請購申請單明細 (套用至詢價登錄用)
   */
  getApplyPurchaseRequestDetail(needId: string): Observable<ApiResponse<{ SUPPLIER_ID?: string; EXPDATE?: string; NOTES?: string; Details: ASS12020DetailItem[] }>> {
    // TODO: 接專用 API
    return of({
      Status: '0000',
      Data: { Details: [] },
      TotalCount: 0,
      TotalPage: 0,
      Message: '',
      Error: null,
      Meta: emptyApiMeta,
    });
    // return this.http.post<...>(`${this.apiUrl}/getApplyPurchaseRequestDetail`, { needId });
  }

  /**
   * 取得單筆詢價登錄 (編輯頁用)
   */
  getASS12020Detail(id: string | number): Observable<ApiResponse<ASS12020Detail>> {
    // TODO: 接真實 API
    return of({
      Status: '0000',
      Data: {
        id,
        SUPPLIER_ID: '',
        EXPDATE: '',
        NOTES: '',
        Details: [],
      },
      TotalCount: 0,
      TotalPage: 0,
      Message: '',
      Error: null,
      Meta: emptyApiMeta,
    });
    // return this.http.post<ApiResponse<ASS12020Detail>>(`${this.apiUrl}/getASS12020Detail`, { id });
  }

  /**
   * 更新詢價登錄
   */
  updateASS12020(id: number | string, body: ASS12020UpdateRequest): Observable<ApiResponse<unknown>> {
    // TODO: 接真實 API
    return of({
      Status: '0000',
      Data: {},
      TotalCount: 0,
      TotalPage: 0,
      Message: '',
      Error: null,
      Meta: emptyApiMeta,
    });
    // return this.http.post<ApiResponse<unknown>>(`${this.apiUrl}/updateASS12020`, { ...body, id });
  }

  /**
   * 刪除詢價登錄
   */
  deleteASS12020(idList: number[]): Observable<ApiResponse<unknown>> {
    // TODO: 接真實 API
    return of({
      Status: '0000',
      Data: {},
      TotalCount: 0,
      TotalPage: 0,
      Message: '',
      Error: null,
      Meta: emptyApiMeta,
    });
    // return this.http.post<ApiResponse<unknown>>(`${this.apiUrl}/deleteASS12020`, { idList });
  }
}
