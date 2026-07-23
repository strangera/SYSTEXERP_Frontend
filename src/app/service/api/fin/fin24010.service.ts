import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface QueryFIN24010Request {
  ACP_No?: string,
  Org_Id?: string,
  ACP_YYYYMM?: string,
  ACP_TermNo?: number,
  AcpAmt_From?: number,
  AcpAmt_To?: number,
  PtaAmt_From?: number,
  PtaAmt_To?: number,
  BalAmt_From?: number,
  BalAmt_To?: number,
  Reserve_From?: number,
  Reserve_To?: number,
  RetReserve_From?: number, // <-- 缺少
  RetReserve_To?: number, // <-- 缺少
  PayType?: string,
  VEN_BNK_No_Param?: string,
  BankAccountNo?: string,
  AccountName?: string,
  CTRLYN?: string,
  CheckTitle?: string,
  ExpectPayDate_From?: string,
  ExpectPayDate_To?: string,
  ACP_Date_From?: string,
  ACP_Date_To?: string,
  VEN_No_Param?: string,
  VEN_Uniform_Param?: string,
  AccNo_Param?: string,
  ACP_SourceNo_Param?: string,
  NoteDesc_Param?: string,
  VouNo_Param?: string,
  VouStatus?: string,
  ACP_Status_Param?: string,
  SubDetailNo_Param?: string,
  HasUnpaid?: string,
  CheckChangedUser?: string, // <-- 缺少
  PTA?: string, // 立沖代號
}

export interface QueryFIN24010Response {
  ID: number,
  ACP_No: string,
  org_id: string,
  ACP_YYYYMM: string,
  acp_termno: number,
  ACP_Date: string,
  VEN_No: string,
  VEN_Name: string,
  VEN_Uniform: string,
  AccNo: string,
  ACP_SourceNo: string,
  NoteDesc: string,
  ACP_Amt: number,
  PTA_Amt: number,
  ACP_Balance: number,
  ACP_ReserveAmt: number,
  RetReserveAmt: number,
  VEN_PayType: string,
  VEN_BNK_No: string,
  VEN_BNK_BranchNo: string,
  VEN_BankAccountNo: string,
  VEN_AccountName: string,
  ACP_ExpectPayDate: string,
  VEN_CheckTitle: string,
  VEN_CTRLYN: string,
  Bank_Name: string,
  Bank_BranchName: string,
  Bank_AccName: string,
  VouNo: string,
  Vou_PostFlag: string,
  Vou_PostFlagName: string,
  ACP_Status: string,
  SubDetailNo: string,
  PTA_Key: string, // 立沖代號
  CRT_Date: string,
  CRT_USR_No: string,
  CRT_USR_Name: string,
  UPD_Date: string,
  UPD_USR_No: string,
  UPD_USR_Name: string,
  POS_VEN_BNK_No: string,
  POS_VEN_BNK_BranchNo: string, // <-- 補上這筆
  POS_VEN_BankAccountNo: string,
  POS_VEN_AccountName: string,
  Diff_BNK_No: string,
  Diff_BankAccountNo: string,
  Diff_AccountName: string,
  TotalRows: number,
  // --- 新增後端組合欄位 ---
  Full_VEN_BNK_No?: string;      // 匯款銀行代號 (帳款檔)
  Full_Bank_Name?: string;       // 匯款銀行名稱 (帳款檔)
  Full_POS_VEN_BNK_No?: string;  // 廠商主檔匯款銀行代號
  Full_POS_Bank_Name?: string;   // 廠商主檔匯款銀行名稱
}

export interface UpdateFIN24010Request {
  ACP_No: string,
  PayType: string,
  BankNo: string,
  BankAcc: string,
  AccName: string,
  ExpectPayDate: string,
  NoteDesc: string,
  SourceNo: string,
  CtrlYN: string
}

export interface UpdateFIN24010RemitRequest {
  ACP_No_List: string[]; // 應付帳款編號清單
}

export interface VoidFIN24010Request {
  ACP_No: string;
}

export interface QueryBankAccountRequest {
  BNK_id: string,
  BNK_No: string,
  BNK_AccNo: string,
  BNK_AccName: string,
  DisplayText: string
}

@Injectable({
  providedIn: 'root'
})
export class Fin24010Service {
  private readonly apiUrl = environment.ApiUrl + '/FIN0000/APS1000';

  constructor(private http: HttpClient) { }

  queryFIN24010(params: QueryFIN24010Request): Observable<ApiResponse<QueryFIN24010Response[]>> {
    return this.http.post<ApiResponse<QueryFIN24010Response[]>>(`${this.apiUrl}/queryFIN24010`, params);
  }
  updateFIN24010(params: UpdateFIN24010Request): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.apiUrl}/updateFIN24010`, params);
  }
  /** 應付帳款維護-異動檢核-更新匯款檔資料 */
  updateFIN24010Remit(params: UpdateFIN24010RemitRequest): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.apiUrl}/updateFIN24010Remit`, params);
  }
  /** 應付帳款維護-作廢 */
  voidFIN24010(params: VoidFIN24010Request): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.apiUrl}/voidFIN24010`, params);
  }
  /** 應付帳款維護-反作廢 */
  unVoidFIN24010(params: VoidFIN24010Request): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.apiUrl}/unVoidFIN24010`, params);
  }

  // FIN25020
  queryBankAccount(): Observable<ApiResponse<QueryBankAccountRequest[]>> {
    return this.http.post<ApiResponse<QueryBankAccountRequest[]>>(`${this.apiUrl}/queryBankAccount`, {});
  }
}
