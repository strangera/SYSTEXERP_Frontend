import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface QueryFIN24010Request {
  ACP_No: string,
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
  CheckChangedUser?: string,
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
  ACP_Amt: number,
  PTA_Amt: number,
  ACP_Balance: number,
  ACP_ReserveAmt: number,
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
  CRT_Date: string,
  CRT_USR_No: string,
  CRT_USR_Name: string,
  UPD_Date: string,
  UPD_USR_No: string,
  UPD_USR_Name: string,
  POS_VEN_BNK_No: string,
  POS_VEN_BankAccountNo: string,
  POS_VEN_AccountName: string,
  Diff_BNK_No: string,
  Diff_BankAccountNo: string,
  Diff_AccountName: string,
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
}
