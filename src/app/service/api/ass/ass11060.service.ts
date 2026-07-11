import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiRequest, ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

// ==================== Request 介面 ====================

/**
 * 廠商資料查詢
 */
export interface QueryASS11060Request extends ApiRequest {
  /** 廠商代號 */
  VEN_No?: string | null;
  /** 統一編號 */
  VEN_Uniform?: string | null;
  /** 廠商名稱 */
  VEN_Name?: string | null;
  /** 廠商英文名稱 */
  VEN_EngName?: string | null;
  /** 廠商簡稱 */
  VEN_ShortName?: string | null;
  /** 負責人 */
  CHARGE_STAFF?: string | null;
  /** 負責人職稱 */
  CHARGE_TITLE?: string | null;
  /** 負責人身分證 */
  CHARGE_PID?: string | null;
  /** 負責人電話 */
  CHARGE_TEL?: string | null;
  /** 負責人地址 */
  CHARGE_ADDR?: string | null;
  /** 負責人Email */
  CHARGE_EMAIL?: string | null;
  /** 公司登記地址 */
  VEN_Address?: string | null;
  /** 公司登記電話 */
  VEN_Tel?: string | null;
  /** 公司傳真 */
  VEN_Fax?: string | null;
  /** 訂貨地址 */
  ORDER_ADDR?: string | null;
  /** 訂貨電話 */
  ORDER_TEL?: string | null;
  /** 訂貨傳真 */
  ORDER_FAX?: string | null;
  /** 工廠地址 */
  FACTO_ADDR?: string | null;
  /** 工廠電話 */
  FACTO_TEL?: string | null;
  /** 工廠傳真 */
  FACTO_FAX?: string | null;
  /** 交貨方式 */
  DELIVERY?: string | null;
  /** 退貨方式 */
  RETURN_ORDER?: string | null;
  /** 交貨期限 */
  DELIVERY_LIMIT?: number | null;
  /** 備註 */
  VEN_Remark?: string | null;
}

/**
 * 廠商資料更新
 */
export interface UpdateASS11060Request {
  /** 廠商代號 */
  VEN_No: string;
  /** 訂貨地址 */
  ORDER_ADDR?: string | null;
  /** 訂貨電話 */
  ORDER_TEL?: string | null;
  /** 訂貨傳真 */
  ORDER_FAX?: string | null;
  /** 工廠地址 */
  FACTO_ADDR?: string | null;
  /** 工廠電話 */
  FACTO_TEL?: string | null;
  /** 工廠傳真 */
  FACTO_FAX?: string | null;
  /** 交貨方式 */
  DELIVERY?: string | null;
  /** 交貨期限 */
  DELIVERY_LIMIT?: number | null;
  /** 退貨方式 */
  RETURN_ORDER?: string | null;
  /** 備註 */
  VEN_Remark?: string | null;
}

// ==================== Response 介面 ====================

/**
 * 廠商資料查詢回應 (外層包裝)
 */
export interface QueryASS11060DataWrapper {
  TotalCount: number;
  TotalPages: number;
  Data: QueryASS11060Response[];
}

/**
 * 廠商資料查詢回應
 */
export interface QueryASS11060Response {
  /** 廠商代號 */
  VEN_No?: string | null;
  /** 統一編號 */
  VEN_Uniform?: string | null;
  /** 廠商名稱 */
  VEN_Name?: string | null;
  /** 廠商英文名稱 */
  VEN_EngName?: string | null;
  /** 廠商簡稱 */
  VEN_ShortName?: string | null;
  /** 公司登記地址 */
  VEN_Address?: string | null;
  /** 負責人 */
  CHARGE_STAFF?: string | null;
  /** 負責人職稱 */
  CHARGE_TITLE?: string | null;
  /** 負責人身分證 */
  CHARGE_PID?: string | null;
  /** 負責人電話 */
  CHARGE_TEL?: string | null;
  /** 負責人地址 */
  CHARGE_ADDR?: string | null;
  /** 負責人Email */
  CHARGE_EMAIL?: string | null;
}

/**
 * 廠商資料詳細/編輯頁查詢
 */
export interface DetailASS11060Request {
  /** 廠商代號 */
  VEN_No: string;
  /** 統一編號 */
  VEN_Uniform: string;
}

/**
 * 廠商資料詳細/編輯頁回應
 */
export interface DetailASS11060Response {
  /** 廠商代號 */
  VEN_No?: string | null;
  /** 廠商名稱 */
  VEN_Name?: string | null;
  /** 廠商簡稱 */
  VEN_ShortName?: string | null;
  /** 廠商屬性 */
  VEN_Flag?: string | null;
  /** 廠商英文名稱 */
  VEN_EngName?: string | null;
  /** 統一編號 */
  VEN_Uniform?: string | null;
  /** 匯費模式 */
  VEN_RemitFeeMode?: string | null;
  /** 郵遞區號 */
  VEN_Post?: string | null;
  /** 公司登記地址 */
  VEN_Address?: string | null;
  /** 公司登記電話 */
  VEN_Tel?: string | null;
  /** 公司傳真 */
  VEN_Fax?: string | null;
  /** 公司Email */
  VEN_Email?: string | null;
  /** 發票地址 */
  VEN_GUIAddr?: string | null;
  /** 發票Email */
  VEN_GUIEmail?: string | null;
  /** 付款方式 */
  VEN_PayType?: string | null;
  /** 銀行代號 */
  VEN_BNK_No?: string | null;
  /** 銀行分行代號 */
  VEN_BNK_BranchNo?: string | null;
  /** 銀行帳號 */
  VEN_BankAccountNo?: string | null;
  /** 戶名 */
  VEN_AccountName?: string | null;
  /** 付款條件天數 */
  VEN_PayConditionDay?: string | null;
  /** 支票抬頭 */
  VEN_CheckTitle?: string | null;
  /** 廠商狀態 */
  VEN_Status?: string | null;
  /** 核准日期 */
  Approved_Date?: string | null;
  /** 折扣否 */
  VEN_DiscYN?: string | null;
  /** 管控否 */
  VEN_CTRLYN?: string | null;
  /** 折扣起日 */
  VEN_DiscDateB?: string | null;
  /** 折扣迄日 */
  VEN_DiscDateE?: string | null;
  /** 發票載具統編 */
  GUI_ID_WIRE?: string | null;
  /** 備註 */
  VEN_Remark?: string | null;
  /** 建立日期 */
  CRT_Date?: string | null;
  /** 建立人員代號 */
  CRT_USR_No?: string | null;
  /** 建立人員姓名 */
  CRT_USR_Name?: string | null;
  /** 異動日期 */
  UPD_Date?: string | null;
  /** 異動人員代號 */
  UPD_USR_No?: string | null;
  /** 異動人員姓名 */
  UPD_USR_Name?: string | null;
  /** 負責人 */
  CHARGE_STAFF?: string | null;
  /** 負責人職稱 */
  CHARGE_TITLE?: string | null;
  /** 負責人身分證 */
  CHARGE_PID?: string | null;
  /** 負責人電話 */
  CHARGE_TEL?: string | null;
  /** 負責人地址 */
  CHARGE_ADDR?: string | null;
  /** 負責人Email */
  CHARGE_EMAIL?: string | null;
  /** 訂貨地址 */
  ORDER_ADDR?: string | null;
  /** 訂貨電話 */
  ORDER_TEL?: string | null;
  /** 訂貨傳真 */
  ORDER_FAX?: string | null;
  /** 工廠地址 */
  FACTO_ADDR?: string | null;
  /** 工廠電話 */
  FACTO_TEL?: string | null;
  /** 工廠傳真 */
  FACTO_FAX?: string | null;
  /** 送貨方式 */
  DELIVERY?: string | null;
  /** 退貨處理方式 */
  RETURN_ORDER?: string | null;
  /** 廠商送貨期限 */
  DELIVERY_LIMIT?: number | null;
  /** 廠商訂貨地址 */
  VEN_ORDER_ADDR?: string | null;
  /** 廠商訂貨電話 */
  VEN_ORDER_TEL?: string | null;
  /** 廠商訂貨傳真 */
  VEN_ORDER_FAX?: string | null;
  /** 廠商工廠地址 */
  VEN_FACTO_ADDR?: string | null;
  /** 廠商工廠電話 */
  VEN_FACTO_TEL?: string | null;
  /** 廠商工廠傳真 */
  VEN_FACTO_FAX?: string | null;
  /** 廠商送貨方式 */
  VEN_DELIVERY?: string | null;
  /** 廠商退貨處理方式 */
  VEN_RETURN_ORDER?: string | null;
  /** 廠商送貨期限 */
  VEN_DELIVERY_LIMIT?: number | null;
  /** 通訊地址 */
  VEN_PostAddr?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class ASS11060Service {
  private readonly apiUrl = environment.ApiUrl + '/ASS0000/ASS1000';

  constructor(private http: HttpClient) { }

  /**
   * 廠商資料查詢
   * 將巢狀 Data.Data 攤平，回傳 Data 直接為陣列，TotalCount 提升至頂層
   */
  queryASS11060(params: QueryASS11060Request): Observable<ApiResponse<QueryASS11060Response[]>> {
    return this.http.post<ApiResponse<QueryASS11060DataWrapper>>(`${this.apiUrl}/queryASS11060`, params)
      .pipe(
        map(res => ({
          ...res,
          Data: res.Data as unknown as QueryASS11060Response[],
          TotalCount: (res.TotalCount ?? 0),
        }))
      );
  }

  /**
   * 取得廠商詳細/編輯頁資料
   */
  detailASS11060(payload: DetailASS11060Request): Observable<ApiResponse<DetailASS11060Response>> {
    return this.http.post<ApiResponse<DetailASS11060Response>>(`${this.apiUrl}/detailASS11060`, payload);
  }

  /**
   * 廠商資料更新
   */
  updateASS11060(params: UpdateASS11060Request): Observable<ApiResponse<Record<string, never>>> {
    return this.http.post<ApiResponse<Record<string, never>>>(`${this.apiUrl}/updateASS11060`, params);
  }

  /**
   * 匯出 PDF
   */
  exportASS11060PDF(params: QueryASS11060Request): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/exportPDFASS11060`, params, { responseType: 'blob' });
  }

  /**
   * 匯出 Excel
   */
  exportASS11060(params: QueryASS11060Request): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/ExportASS11060`, params, { responseType: 'blob' });
  }
}
