import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseQueryRequest } from '@shared/models/api/base-api.interface';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

// ==================== Request 介面 ====================

/**
 * 查詢形成電匯明細資料
 */
export interface QueryFIN25020Request extends BaseQueryRequest {
  /** 建立日期(起) */
  D_Date_Start?: string | null;
  /** 建立日期(迄) */
  D_Date_End?: string | null;
  /** 匯款日期(起) */
  RMT_Date_Start?: string | null;
  /** 匯款日期(迄) */
  RMT_Date_End?: string | null;
  /** 匯款來源單號 */
  WSLIP_NO?: string | null;
  /** 銀行ID */
  BNK_ID?: string | null;
  /** 銀行帳戶名稱 */
  BNK_AccName?: string | null;
  /** 轉傳票狀態 (空=全部, Y=已轉, N=未轉) */
  VouStatus?: string | null;
}

/**
 * 取得未匯款的匯款來源單號列表
 */
export interface QueryUnremittedPAMRequest {
  /** 建立日期(起) */
  D_Date_Start?: string | null;
  /** 建立日期(迄) */
  D_Date_End?: string | null;
  /** 匯款來源單號 (模糊搜尋) */
  PAM_No?: string | null;
}

/**
 * 取得公司銀行帳戶列表
 */
export interface QueryBankAccountRequest {
  /** 銀行代號 */
  BNK_No?: string | null;
  /** 銀行帳戶名稱 */
  BNK_AccName?: string | null;
}

/**
 * 查詢電匯明細
 */
export interface QueryRemitDetailRequest {
  /** 匯款來源單號 */
  WSLIP_NO: string;
}

/**
 * 確認形成電匯資料
 */
export interface ConfirmRemitRequest {
  /** 匯款日期 */
  RMT_Date: string;
  /** 銀行ID (APS1002.id) */
  BNK_id: number;
  /** 匯款來源單號列表 */
  PAM_NoList: string[];
}

/**
 * 刪除電匯資料
 */
export interface DeleteRemitRequest {
  /** 匯款來源單號列表 */
  PAM_NoList: string[];
}

// ==================== Response 介面 ====================

/**
 * 查詢形成電匯明細資料回應
 */
export interface QueryFIN25020Response {
  /** 匯款來源單號 */
  WSLIP_NO: string;
  /** 建立日期 */
  D_Date: string | null;
  /** 匯款日期 */
  RMT_Date: string | null;
  /** 銀行ID */
  BNK_id: number | null;
  /** 銀行帳戶名稱 */
  BNK_AccName: string | null;
  /** 轉傳票狀態 */
  VouStatus: string | null;
  /** 傳票號碼 */
  VouNo: string | null;
  /** 匯款筆數 */
  RemitCount: number | null;
  /** 匯款總金額 */
  TotalRemitAmt: number | null;
}

/**
 * 未匯款來源單號回應
 */
export interface QueryUnremittedPAMResponse {
  /** 匯款來源單號 */
  PAM_No: string;
  /** 建立日期 */
  D_Date: string;
  /** 是否形成電匯 (Y/N) */
  Remit_Status: string | null;
  /** 筆數 */
  ItemCount: number;
}

/**
 * 公司銀行帳戶回應
 */
export interface QueryBankAccountResponse {
  /** 銀行ID (APS1002.id) */
  id: number;

  BNK_id: string;

  /** 銀行代號 */
  BNK_No: string;
  /** 銀行名稱 */
  BNK_Name: string | null;
  /** 銀行帳號 */
  BNK_AccNo: string;
  /** 銀行帳戶名稱 */
  BNK_AccName: string;
  /** 存款科目編號 */
  BNK_DepositAccNo: string | null;
  /** 存款科目名稱 */
  AccCName: string | null;
  /** 完整顯示 (銀行代號 銀行名稱 - 帳戶名稱 - 帳號) */
  DisplayText: string;
}

/**
 * 電匯明細回應
 */
export interface QueryRemitDetailResponse {
  /** 廠商編號 */
  VEN_No: string;
  /** 廠商名稱 */
  VEN_Name: string | null;
  /** 帳款金額 */
  ACP_Amt: number | null;
  /** 匯款金額 */
  RMT_Amt: number | null;
  /** 匯款手續費 */
  RMT_Fee: number | null;
  /** 現金回饋金額 */
  CASH_BACK_AMT: number | null;
  /** 公司支付電匯手續費 */
  COMP_WIRE_FEE: number | null;
  /** 匯款銀行資訊 */
  BANK_DESC: string | null;
  /** 匯款銀行帳戶名稱 */
  RMT_BnkAccName: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class FIN25020Service {
  private readonly apiUrl = environment.ApiUrl + '/FIN0000/APS1000';

  constructor(private http: HttpClient) { }

  /**
   * 查詢形成電匯明細資料列表
   */
  queryFIN25020(params: QueryFIN25020Request): Observable<ApiResponse<QueryFIN25020Response[]>> {
    return this.http.post<ApiResponse<QueryFIN25020Response[]>>(`${this.apiUrl}/queryFIN25020`, params);
  }

  /**
   * 查詢未匯款的匯款來源單號列表
   */
  queryUnremittedPAM(params: QueryUnremittedPAMRequest): Observable<ApiResponse<QueryUnremittedPAMResponse[]>> {
    return this.http.post<ApiResponse<QueryUnremittedPAMResponse[]>>(`${this.apiUrl}/queryUnremittedPAM`, params);
  }

  /**
   * 查詢公司銀行帳戶列表
   */
  queryBankAccount(params: QueryBankAccountRequest): Observable<ApiResponse<QueryBankAccountResponse[]>> {
    return this.http.post<ApiResponse<QueryBankAccountResponse[]>>(`${this.apiUrl}/queryBankAccount`, params);
  }

  /**
   * 查詢電匯明細
   */
  queryRemitDetail(params: QueryRemitDetailRequest): Observable<ApiResponse<QueryRemitDetailResponse[]>> {
    return this.http.post<ApiResponse<QueryRemitDetailResponse[]>>(`${this.apiUrl}/queryRemitDetail`, params);
  }

  /**
   * 確認形成電匯資料
   */
  confirmRemit(params: ConfirmRemitRequest): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(`${this.apiUrl}/confirmRemit`, params);
  }

  /**
   * 刪除電匯資料
   */
  deleteRemit(params: DeleteRemitRequest): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(`${this.apiUrl}/deleteRemit`, params);
  }
}
