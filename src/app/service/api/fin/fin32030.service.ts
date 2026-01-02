import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseQueryRequest } from '@shared/models/api/base-api.interface';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

// ==================== Request 介面 ====================

/**
 * 收款沖帳維護查詢
 */
export interface QueryFIN32030Request extends BaseQueryRequest {
  /** 收款單號 */
  RCV_No?: string | null;
  /** 收款日期起 */
  DateFrom?: string | null;
  /** 收款日期迄 */
  DateTo?: string | null;
  /** 應收金額起 */
  AmtFrom?: number | null;
  /** 應收金額迄 */
  AmtTo?: number | null;
  /** 傳票單號起 */
  VouFrom?: string | null;
  /** 傳票單號迄 */
  VouTo?: string | null;
  /** 備註 */
  Remark?: string | null;
}

/**
 * 應收未收查詢
 */
export interface QueryFIN32030ARRequest extends BaseQueryRequest {
  /** 組織編號 */
  STO_No?: string | null;
  /** 廠客代號 */
  VEN_No?: string | null;
  /** 立帳日期起 */
  DateFrom?: string | null;
  /** 立帳日期迄 */
  DateTo?: string | null;
}

/**
 * 收款項目查詢 (含收款、票據、應收沖帳資料)
 */
export interface QueryFIN32030RecvAllRequest extends BaseQueryRequest {
  /** 收款單號 */
  RCV_No?: string | null;
  /** 收款日期起 */
  DateFrom?: string | null;
  /** 收款日期迄 */
  DateTo?: string | null;
  /** 應收金額起 */
  AmtFrom?: number | null;
  /** 應收金額迄 */
  AmtTo?: number | null;
  /** 傳票單號起 */
  VouFrom?: string | null;
  /** 傳票單號迄 */
  VouTo?: string | null;
  /** 備註 */
  Remark?: string | null;
}

/**
 * 收款沖帳新增
 */
export interface InsertFIN32030RecvRequest {
  /** 組織代號 */
  STO_No: string;
  /** 收款單號 (前端產生 R+YYYYMMDDXXX) */
  RCV_No: string;
  /** 收款日期 */
  RCV_Date: string;
  /** 業務員代號 */
  Sales_Id?: string | null;
  /** 公司代號 */
  CompNo: string;
  /** 傳票號碼 */
  VouNo?: string | null;
  /** 備註 */
  Remark?: string | null;
  /** 狀態 */
  Status: string;
  /** 使用者ID */
  UserId: string;
  /** 使用者名稱 */
  UserName: string;
  /** 收款項目明細 */
  Detail?: RecvDetailItem[] | null;
}

/**
 * 收款項目明細
 */
export interface RecvDetailItem {
  /** 收款項目代號 */
  CAP_Item: string;
  /** 收款金額 */
  ARS_Amt: number;
  /** 備註 */
  NoteDesc?: string | null;
}

/**
 * 收款沖帳更新
 */
export interface UpdateFIN32030RecvRequest {
  /** 組織代號 */
  STO_No: string;
  /** 收款單號 */
  RCV_No: string;
  /** 收款日期 */
  RCV_Date: string;
  /** 業務員代號 */
  Sales_Id?: string | null;
  /** 公司代號 */
  CompNo: string;
  /** 傳票號碼 */
  VouNo?: string | null;
  /** 備註 */
  Remark?: string | null;
  /** 狀態 */
  Status: string;
  /** 使用者ID */
  UserId: string;
  /** 使用者名稱 */
  UserName: string;
  /** 收款項目明細 */
  Detail?: RecvDetailItem[] | null;
}

/**
 * 票據新增
 */
export interface InsertFIN32030CheckRequest {
  /** 組織代號 */
  STO_No: string;
  /** 收款單號 */
  RCV_No?: string | null;
  /** 業務員代號 */
  Sales_Id: string;
  /** 使用者ID */
  UserId: string;
  /** 使用者名稱 */
  UserName: string;
  /** 票據明細 */
  Checks?: CheckDetailItem[] | null;
}

/**
 * 票據明細
 */
export interface CheckDetailItem {
  /** 票據號碼 */
  CHK_No: string;
  /** 廠客代號 */
  VEN_No?: string | null;
  /** 往來銀行代號 */
  BNK_No: string;
  /** 分行代號 */
  BNK_BranchNo: string;
  /** 客戶銀行帳號 */
  BNK_AccNo?: string | null;
  /** 收票日 */
  CHK_ReceDate?: string | null;
  /** 到期日 */
  CHK_ExpireDate: string;
  /** 預兌日 */
  CHK_PreDate?: string | null;
  /** 票面金額 */
  CHK_Amt: number;
  /** 票據種類 (1=支票/2=本票/3=匯票) */
  CHK_Type?: string | null;
  /** 是否客票 (Y/N) */
  Ticket_YN?: string | null;
  /** 備註 */
  CHK_Comment?: string | null;
  /** 會計科目 */
  AccNo?: string | null;
  /** 組織 */
  ORG_ID?: string | null;
  /** 活動代號 */
  ProjectNo?: string | null;
}

/**
 * 票據更新
 */
export interface UpdateFIN32030CheckRequest {
  /** 組織代號 */
  STO_No: string;
  /** 使用者ID */
  UserId: string;
  /** 使用者名稱 */
  UserName: string;
  /** 票據明細 */
  Checks?: CheckDetailItem[] | null;
}

/**
 * 帳款新增
 */
export interface InsertFIN32030ARRecvAcctRequest {
  /** 使用者ID */
  UserId: string;
  /** 使用者名稱 */
  UserName: string;
  /** 帳款明細 */
  Details?: ARRecvAcctDetailItem[] | null;
}

/**
 * 帳款明細
 */
export interface ARRecvAcctDetailItem {
  /** 組織代號 */
  STO_No: string;
  /** 收款單號 */
  RCV_No: string;
  /** 收款日期 */
  RCV_Date: string;
  /** 廠客代號 */
  VEN_No: string;
  /** 應收ID */
  ARS_No: string;
  /** 匯款號碼 */
  Remit_No?: string | null;
  /** 支票號碼 */
  Check_No?: string | null;
  /** 票據號碼 */
  CHK_No?: string | null;
  /** 應收金額 */
  ARS_Amt: number;
  /** 應收狀態 */
  ARS_Status: string;
}

/**
 * 帳款更新
 */
export interface UpdateFIN32030ARRecvAcctRequest {
  /** 使用者ID */
  UserId: string;
  /** 使用者名稱 */
  UserName: string;
  /** 帳款更新明細 */
  Details?: ARRecvAcctUpdateDetailItem[] | null;
}

/**
 * 帳款更新明細
 */
export interface ARRecvAcctUpdateDetailItem {
  /** ID */
  Id: number;
  /** 應收金額 */
  ARS_Amt?: number | null;
  /** 票據號碼 */
  CHK_No?: string | null;
}

// ==================== Response 介面 ====================

/**
 * 收款沖帳維護查詢回應
 */
export interface QueryFIN32030Response {
  /** 收款單號 */
  RCV_No?: string | null;
  /** 收款日期 */
  RCV_Date?: string | null;
  /** 業務員代號 */
  Sales_Id?: string | null;
  /** 傳票號碼 */
  VouNo?: string | null;
  /** 備註 */
  Remark?: string | null;
  /** 總金額 */
  TotalAmount?: number | null;
}

/**
 * 應收未收查詢回應
 */
export interface QueryFIN32030ARResponse {
  /** 序號 */
  RowNum?: number | null;
  /** 應收ID */
  ARS_ID?: string | null;
  /** 廠客代號 */
  VEN_No?: string | null;
  /** 廠客名稱 */
  VEN_Name?: string | null;
  /** 應收金額 */
  ARS_Amt?: number | null;
  /** 立帳日 */
  ARS_Date?: string | null;
  /** 已收款金額 */
  PaidAmt?: number | null;
  /** 未收款金額 */
  UnpaidAmt?: number | null;
  /** 預計收款日 */
  PTA_Date?: string | null;
  /** 摘要 */
  NoteDesc?: string | null;
}

/**
 * 收款項目查詢回應 (含收款、票據、應收沖帳資料)
 */
export interface QueryFIN32030RecvAllResponse {
  /** ID */
  id?: number | null;
  /** MID */
  mid?: string | null;
  /** 組織編號 */
  STO_No?: string | null;
  /** 收款單號 */
  RCV_No?: string | null;
  /** 收款日期 */
  RCV_Date?: string | null;
  /** 業務員代號 */
  Sales_Id?: string | null;
  /** 總帳科目ID */
  gls3001_id?: number | null;
  /** 公司代號 */
  CompNo?: string | null;
  /** 傳票號碼 */
  VouNo?: string | null;
  /** 備註 */
  Remark?: string | null;
  /** 狀態 */
  Status?: string | null;
  /** 建立日期 */
  CRT_Date?: string | null;
  /** 建立人員代號 */
  CRT_USR_No?: string | null;
  /** 建立人員名稱 */
  CRT_USR_Name?: string | null;
  /** 修改日期 */
  UPD_Date?: string | null;
  /** 修改人員代號 */
  UPD_USR_No?: string | null;
  /** 修改人員名稱 */
  UPD_USR_Name?: string | null;
  /** 總金額 */
  TotalAmt?: number | null;
  /** 收款項目明細 JSON */
  RecvItemsJson?: string | null;
  /** 收款主檔資料 JSON */
  ReceiptsJson?: string | null;
  /** 票據明細 JSON */
  ChecksJson?: string | null;
}

/**
 * 收款項目明細回應
 */
export interface RecvDetailResponse {
  /** 序號 */
  SeqNo?: number | null;
  /** 收款項目代號 */
  CAP_Item?: string | null;
  /** 收款項目名稱 */
  CAP_ItemName?: string | null;
  /** 收款金額 */
  ARS_Amt?: number | null;
  /** 備註 */
  NoteDesc?: string | null;
  /** 會計科目 */
  AccNo?: string | null;
}

/**
 * 票據明細回應
 */
export interface CheckDetailResponse {
  /** 票據號碼 */
  CHK_No?: string | null;
  /** 廠客代號 */
  VEN_No?: string | null;
  /** 廠客名稱 */
  VEN_Name?: string | null;
  /** 往來銀行代號 */
  BNK_No?: string | null;
  /** 銀行名稱 */
  BNK_Name?: string | null;
  /** 分行代號 */
  BNK_BranchNo?: string | null;
  /** 分行名稱 */
  BNK_BranchName?: string | null;
  /** 客戶銀行帳號 */
  BNK_AccNo?: string | null;
  /** 收票日 */
  CHK_ReceDate?: string | null;
  /** 到期日 */
  CHK_ExpireDate?: string | null;
  /** 預兌日 */
  CHK_PreDate?: string | null;
  /** 票面金額 */
  CHK_Amt?: number | null;
  /** 票據種類 (1=支票/2=本票/3=匯票) */
  CHK_Type?: string | null;
  /** 票據種類名稱 */
  CHK_TypeName?: string | null;
  /** 是否客票 (Y/N) */
  Ticket_YN?: string | null;
  /** 狀態 */
  Status?: string | null;
  /** 狀態名稱 */
  StatusName?: string | null;
  /** 備註 */
  CHK_Comment?: string | null;
  /** 會計科目 */
  AccNo?: string | null;
  /** 會計科目名稱 */
  AccName?: string | null;
}

/**
 * 應收沖帳明細回應
 */
export interface ARAcctDetailResponse {
  /** ID */
  Id?: number | null;
  /** 應收ID */
  ARS_ID?: string | null;
  /** 廠客代號 */
  VEN_No?: string | null;
  /** 廠客名稱 */
  VEN_Name?: string | null;
  /** 應收金額 */
  ARS_Amt?: number | null;
  /** 票據號碼 */
  CHK_No?: string | null;
  /** 沖銷金額 */
  WriteOffAmt?: number | null;
  /** 立帳日期 */
  ARS_Date?: string | null;
  /** 傳票號碼 */
  VouNo?: string | null;
}

/**
 * 收款項目查詢回應
 */
export interface QueryRecvItemResponse {
  /** 收款項目代號 */
  CAP_Item?: string | null;
  /** 收款項目名稱 */
  CAP_ItemName?: string | null;
  /** 會計科目 */
  AccNo?: string | null;
  /** 會計科目名稱 */
  AccName?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class FIN32030Service {
  private readonly apiUrl = environment.ApiUrl + '/FIN0000/ARS1000';

  constructor(private http: HttpClient) { }

  /**
   * 收款沖帳維護查詢
   */
  queryFIN32030(params: QueryFIN32030Request): Observable<ApiResponse<QueryFIN32030Response[]>> {
    return this.http.post<ApiResponse<QueryFIN32030Response[]>>(`${this.apiUrl}/queryFIN32030`, params);
  }

  /**
   * 應收未收查詢
   */
  queryFIN32030AR(params: QueryFIN32030ARRequest): Observable<ApiResponse<QueryFIN32030ARResponse[]>> {
    return this.http.post<ApiResponse<QueryFIN32030ARResponse[]>>(`${this.apiUrl}/queryFIN32030AR`, params);
  }

  /**
   * 收款項目查詢 (含收款、票據、應收沖帳資料)
   */
  queryFIN32030RecvAll(params: QueryFIN32030RecvAllRequest): Observable<ApiResponse<QueryFIN32030RecvAllResponse[]>> {
    return this.http.post<ApiResponse<QueryFIN32030RecvAllResponse[]>>(`${this.apiUrl}/queryFIN32030RecvAll`, params);
  }

  /**
   * 收款沖帳新增
   */
  insertFIN32030Recv(params: InsertFIN32030RecvRequest): Observable<ApiResponse<object>> {
    return this.http.post<ApiResponse<object>>(`${this.apiUrl}/insertFIN32030Recv`, params);
  }

  /**
   * 收款沖帳更新
   */
  updateFIN32030Recv(params: UpdateFIN32030RecvRequest): Observable<ApiResponse<object>> {
    return this.http.post<ApiResponse<object>>(`${this.apiUrl}/updateFIN32030Recv`, params);
  }

  /**
   * 票據新增
   */
  insertFIN32030Check(params: InsertFIN32030CheckRequest): Observable<ApiResponse<object>> {
    return this.http.post<ApiResponse<object>>(`${this.apiUrl}/insertFIN32030Check`, params);
  }

  /**
   * 票據更新
   */
  updateFIN32030Check(params: UpdateFIN32030CheckRequest): Observable<ApiResponse<object>> {
    return this.http.post<ApiResponse<object>>(`${this.apiUrl}/updateFIN32030Check`, params);
  }

  /**
   * 帳款新增
   */
  insertFIN32030ARRecvAcct(params: InsertFIN32030ARRecvAcctRequest): Observable<ApiResponse<object>> {
    return this.http.post<ApiResponse<object>>(`${this.apiUrl}/insertFIN32030ARRecvAcct`, params);
  }

  /**
   * 帳款更新
   */
  updateFIN32030ARRecvAcct(params: UpdateFIN32030ARRecvAcctRequest): Observable<ApiResponse<object>> {
    return this.http.post<ApiResponse<object>>(`${this.apiUrl}/updateFIN32030ARRecvAcct`, params);
  }

  /**
   * 收款項目查詢
   */
  queryRecvItem(params: Record<string, never>): Observable<ApiResponse<QueryRecvItemResponse[]>> {
    return this.http.post<ApiResponse<QueryRecvItemResponse[]>>(`${this.apiUrl}/queryRecvItem`, params);
  }
}
