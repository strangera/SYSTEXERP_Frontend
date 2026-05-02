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
  /** 應收ID */
  ARS_ID?: string | null;
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

/**
 * 收款沖帳完整新增 (包含收款、票據、帳款)
 */
export interface InsertFIN32030CompleteRequest {
  /** 組織代號 */
  STO_No: string;
  /** 收款單號 (後端自動產生 R+YYYYMMDDXXX) */
  RCV_No?: string | null;
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
  RecvDetails?: RecvDetailItem[] | null;
  /** 票據明細 */
  CheckDetails?: CheckDetailItem[] | null;
  /** 帳款明細 */
  ARDetails?: ARRecvAcctDetailItem[] | null;
}

/**
 * 收款沖帳完整更新 (包含收款、票據、帳款)
 */
export interface UpdateFIN32030CompleteRequest {
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
  RecvDetails?: RecvDetailItem[] | null;
  /** 票據明細 */
  CheckDetails?: CheckDetailItem[] | null;
  /** 帳款更新明細 */
  ARDetails?: ARRecvAcctUpdateDetailItem[] | null;
}

// ==================== Response 介面 ====================

/**
 * 帳款刪除明細
 */
export interface ARRecvAcctDeleteDetailItem {
  /** ARS4001 主鍵 id */
  id: number;
}

/**
 * 帳款刪除
 */
export interface DeleteFIN32030ARRecvAcctRequest {
  /** 要刪除的帳款 id 清單 */
  Details?: ARRecvAcctDeleteDetailItem[] | null;
}

/**
 * 收款單刪除明細
 */
export interface RecvDeleteDetailItem {
  /** 收款單號 */
  RCV_No: string;
}

/**
 * 收款沖帳完整刪除 (含帳款/票據/明細/主檔)
 */
export interface DeleteFIN32030RecvCascadeBatchRequest {
  /** 要刪除的收款單清單 */
  Details?: RecvDeleteDetailItem[] | null;
}

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
  /** 收款項目明細 (已解析為陣列) */
  RecvItems?: RecvDetailResponse[] | null;
  /** 應收沖帳明細 (已解析為陣列) */
  Receipts?: ARAcctDetailResponse[] | null;
  /** 票據明細 (已解析為陣列) */
  Checks?: CheckDetailResponse[] | null;
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

/**
 * 收款項目下拉選單查詢
 */
export interface QueryCapItemDropdownRequest {
  /** 收款項目代號 */
  CAP_Item?: string | null;
  /** 會計科目 */
  AccNo?: string | null;
}

/**
 * 收款項目下拉選單回應
 */
export interface QueryCapItemDropdownResponse {
  /** 收款項目代號 */
  CAP_Item?: string | null;
  /** 收款項目名稱 */
  CAP_Name?: string | null;
  /** 會計科目 */
  AccNo?: string | null;
  /** 會計科目名稱 */
  AccCName?: string | null;
  /** 傳票格式 (1=票據/2=應收票據/E=票據) */
  Voucher_Type?: string | null;
  /** 是否為立沖科目 (Y/N) */
  ABAT_YN?: string | null;
}

/**
 * 沖帳代號查詢
 */
export interface QueryAbatAcctRequest {
  /** 會計科目 */
  AccNo?: string | null;
  /** 傳票號碼 (模糊查詢) */
  VouNo?: string | null;
  /** 立沖代號 (模糊查詢) */
  PTA?: string | null;
  /** 廠商代號 (精確查詢) */
  VEN_No?: string | null;
}

/**
 * 沖帳代號查詢回應
 */
export interface QueryAbatAcctResponse {
  /** 序號 */
  RowNum?: number | null;
  /** 傳票號碼 */
  VouNo?: string | null;
  /** 摘要 */
  NoteDesc?: string | null;
  /** 借方(餘額) */
  DebitAmt?: number | null;
  /** 貸方(餘額) */
  CreditAmt?: number | null;
  /** 立沖代號 */
  PTA?: string | null;
  /** 廠商代號 */
  VEN_No?: string | null;
  /** 廠商統一編號 */
  VEN_Uniform?: string | null;
  /** 廠商簡稱 */
  VEN_ShortName?: string | null;
}

/**
 * 銀行分行下拉選單回應
 */
export interface QueryBankBranchDropdownResponse {
  /** 全省銀行代號 (銀行代號+分行代號) */
  BNK_All?: string | null;
  /** 銀行代號 */
  BNK_No?: string | null;
  /** 銀行名稱 */
  BNK_Name?: string | null;
  /** 銀行簡稱 */
  BNK_ShortName?: string | null;
  /** 分行代號 */
  BNK_BranchNo?: string | null;
  /** 分行名稱 */
  BNK_BranchName?: string | null;
  /** 帳號長度 */
  ACC_LEN?: number | null;
  /** 最大帳號長度 */
  ACC_LEN_MAX?: number | null;
}
/**
 * 業務員下拉選單回應
 */
export interface QueryARS1001DropdownResponse {
  /** ID */
  ID?: number | null;

  /** 主檔 ID */
  MID?: number | null;

  /** 業務代碼 */
  Sales_Id?: string | null;

  /** 使用者編號 */
  User_no?: string | null;

  /** 使用者名稱 */
  User_Name?: string | null;

  /** 組織代碼 */
  ORG_ID?: string | null;

  /** 建立時間 */
  CRT_Date?: string | null; // ISO DateTime 字串

  /** 建立者編號 */
  CRT_USR_No?: string | null;

  /** 建立者名稱 */
  CRT_USR_Name?: string | null;

  /** 更新時間 */
  UPD_Date?: string | null;

  /** 更新者編號 */
  UPD_USR_No?: string | null;

  /** 更新者名稱 */
  UPD_USR_Name?: string | null;
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
   * 收款項目查詢
   */
  queryRecvItem(params: Record<string, never>): Observable<ApiResponse<QueryRecvItemResponse[]>> {
    return this.http.post<ApiResponse<QueryRecvItemResponse[]>>(`${this.apiUrl}/queryRecvItem`, params);
  }

  /**
   * 收款沖帳完整新增 (包含收款、票據、帳款)
   */
  insertFIN32030Complete(params: InsertFIN32030CompleteRequest): Observable<ApiResponse<Record<string, never>>> {
    return this.http.post<ApiResponse<Record<string, never>>>(`${this.apiUrl}/InsertFIN32030Complete`, params);
  }

  /**
   * 收款沖帳完整更新 (包含收款、票據、帳款)
   */
  updateFIN32030Complete(params: UpdateFIN32030CompleteRequest): Observable<ApiResponse<Record<string, never>>> {
    return this.http.post<ApiResponse<Record<string, never>>>(`${this.apiUrl}/UpdateFIN32030Complete`, params);
  }

  /**
   * 收款項目下拉選單查詢
   */
  queryCapItemDropdown(params?: QueryCapItemDropdownRequest): Observable<ApiResponse<QueryCapItemDropdownResponse[]>> {
    return this.http.post<ApiResponse<QueryCapItemDropdownResponse[]>>(`${this.apiUrl}/queryCapItemDropdown`, params || {});
  }

  /**
   * 銀行分行下拉選單查詢
   */
  queryBankBranchDropdown(): Observable<ApiResponse<QueryBankBranchDropdownResponse[]>> {
    return this.http.post<ApiResponse<QueryBankBranchDropdownResponse[]>>(`${this.apiUrl}/queryBankBranchDropdown`, {});
  }
  /**
   * 業務員下拉選單查詢
   */
  queryARS1001Dropdown(): Observable<ApiResponse<QueryARS1001DropdownResponse[]>> {
    return this.http.post<ApiResponse<QueryARS1001DropdownResponse[]>>(`${this.apiUrl}/queryARS1001Dropdown`, {});
  }

  /**
   * 沖帳代號查詢 (ARS3001)
   */
  queryAbatAcct(params: QueryAbatAcctRequest): Observable<ApiResponse<QueryAbatAcctResponse[]>> {
    return this.http.post<ApiResponse<QueryAbatAcctResponse[]>>(`${this.apiUrl}/queryAbatAcct`, params);
  }

  /**
   * 帳款刪除 (ARS4001 + 回沖 ARS3001.PTA_Amt)
   */
  deleteFIN32030ARRecvAcct(params: DeleteFIN32030ARRecvAcctRequest): Observable<ApiResponse<Record<string, never>>> {
    return this.http.post<ApiResponse<Record<string, never>>>(`${this.apiUrl}/DeleteFIN32030ARRecvAcct`, params);
  }

  /**
   * 收款沖帳完整刪除 (含帳款/票據/明細/主檔)
   */
  deleteFIN32030RecvCascadeBatch(params: DeleteFIN32030RecvCascadeBatchRequest): Observable<ApiResponse<Record<string, never>>> {
    return this.http.post<ApiResponse<Record<string, never>>>(`${this.apiUrl}/DeleteFIN32030RecvCascadeBatch`, params);
  }
}
