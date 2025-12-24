import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';

export type SortItem = { field: string; order: number };

/** ========== Query (清單) ========== */
export interface QueryFIN64010Request {
  PageSize?: number | null;
  PageIndex?: number | null;
  SortBy?: SortItem[] | null;

  ChkNo?: string | null;
  VenNo?: string | null;

  /** 多選：全省銀行代號(BNK_No+BNK_BranchNo) */
  BankNoList?: string | null;

  /** 客戶銀行帳號：ARS4004.BNK_AccNo */
  CustBankAccNo?: string | null;

  /** 託收日起迄（以最新託收日優先） */
  ColleDateFrom?: string | null;
  ColleDateTo?: string | null;

  /** 多選：APS1002.BNK_DepositAccNo */
  CompanyAccNoList?: string | null;

  /** 公司代號：GLS1005 取科目名稱 */
  CompNo?: string | null;

  ReceDateFrom?: string | null;
  ReceDateTo?: string | null;

  /** 多選：收票業務員代碼 */
  SalesIdList?: string | null;

  RcvNo?: string | null;

  ExpireDateFrom?: string | null;
  ExpireDateTo?: string | null;

  PreDateFrom?: string | null;
  PreDateTo?: string | null;

  CashDateFrom?: string | null;
  CashDateTo?: string | null;

  AmtFrom?: number | null;
  AmtTo?: number | null;

  ChkType?: string | null;   // 1/2/3
  TicketYN?: string | null;  // Y/N

  Comment?: string | null;

  OrgId?: string | null;
  ProjectNo?: string | null;

  ChkTitle?: string | null;

  TranStatus?: string | null; // 0/1/2
  ChkStatus?: string | null;  // 0~5

  VouNo?: string | null;

  // 兼容
  pageSize?: number | null;
  pageIndex?: number | null;
  orderBy?: string | null;
  offset?: number | null;

  OrderBy?: string | null;
  Offset?: number | null;

  [key: string]: any;
}

export interface QueryFIN64010Row {
  SEQ_NO?: number;
  ID?: number; // ARS4004.ID

  CHK_No?: string;

  VEN_No?: string;
  VEN_Name?: string;

  BNK_No?: string;    // 全省銀行代號（票面銀行：BNK_No+BNK_BranchNo）
  BNK_Name?: string;  // 銀行名稱

  CHK_ColleDate?: string | null;

  AccNo?: string;
  AccName?: string;

  BNK_AccNo?: string;     // 公司銀行科目代號（ARS4004.CHK_BNK_No）
  BNK_AccName?: string;   // 託收銀行科目名稱（APS1002）

  CHK_ReceDate?: string | null;
  Sales_Id?: string | null;

  RCV_No?: string | null;

  CHK_ExpireDate?: string | null;
  CHK_CashDate?: string | null;

  CHK_Amt?: number | null;

  CHK_Type?: string | null;
  CHK_Type_Name?: string | null;

  Ticket_YN?: string | null;
  Ticket_YN_Name?: string | null;

  CHK_Comment?: string | null;

  ORG_ID?: string | null;
  Org_Name?: string | null;

  Tran_Status?: string | null;
  Tran_Status_Name?: string | null;

  CHK_Status?: string | null;
  CHK_Status_Name?: string | null;

  VouNo?: string | null;

  [key: string]: any;
}

/** ========== Detail (明細) ========== */
export interface QueryFIN64010DetailRequest {
  Id: number;       // ARS4004.id
  CompNo?: string;  // optional
}

export interface FIN64010DetailRow {
  id: number;
  mid?: number;
  STO_No?: string;

  CHK_No?: string;

  VEN_No?: string;
  VEN_Name?: string;

  BNK_No?: string; // 票面銀行全省代號(可視為 BNK_Key)
  BNK_Name?: string;
  BNK_BranchName?: string;

  BNK_AccNo?: string; // 客戶銀行帳號
  CHK_ColleDate?: string | null;

  CHK_BNK_No?: string; // 託收銀行代號(含分行)
  CHK_BNK_AccName?: string; // 託收銀行名稱(APS1002 AccName)

  CHK_ReceDate?: string | null;
  Sales_Id?: string | null;
  Sales_Name?: string | null;

  CHK_ExpireDate?: string | null;
  RCV_No?: string | null;
  CHK_PreDate?: string | null;

  CHK_CashDate?: string | null;

  CHK_Amt?: number | null;

  Ticket_YN?: string | null;
  Ticket_YN_Name?: string | null;

  CHK_Type?: string | null;
  CHK_Type_Name?: string | null;

  CHK_Comment?: string | null;

  ORG_ID?: string | null;
  Org_Name?: string | null;

  ProjectNo?: string | null;
  ProjectName?: string | null;

  CHK_Status?: string | null;
  CHK_Status_Name?: string | null;

  Tran_Status?: string | null;
  Tran_Status_Name?: string | null;

  AccNo?: string | null;
  AccName?: string | null;

  VouNo?: string | null;

  ObjectType?: string | null;
  ObjectKey?: string | null;

  /** 前端用：回填 update 必填 */
  BNK_Key?: string | null;     // = BNK_No + BNK_BranchNo（這裡可直接用 BNK_No 欄位當 key）
  COL_BNK_id?: string | null;  // 託收帳戶 APS1002.BNK_id（需由下拉選取）

  [key: string]: any;
}

/** ========== Update ========== */
export interface FIN64010UpdateRequest {
  Id: number;

  BNK_Key: string;
  BNK_AccNo: string;

  CHK_No: string;
  CHK_Amt: number;

  CHK_ExpireDate: string;
  CHK_ReceDate: string;

  VEN_No: string;

  CHK_Status: string;     // 0~5
  COL_BNK_id: string;     // APS1002.BNK_id

  // optional
  CHK_Type?: string | null;
  Ticket_YN?: string | null;
  CHK_Comment?: string | null;
  ORG_ID?: string | null;
  ProjectNo?: string | null;
  RCV_No?: string | null;
  CHK_PreDate?: string | null;

  CHK_ColleDate?: string | null; // Status=2 required
  CHK_CashDate?: string | null;  // Status=3 required
  CHK_BackDate?: string | null;  // Status=5 required

  UPD_USR_No: string;
  UPD_USR_Name: string;

  [key: string]: any;
}

@Injectable({ providedIn: 'root' })
export class Fin64010Service {
  private apiUrl = `${environment.ApiUrl}/FIN0000/NTS1000`;

  constructor(private http: HttpClient) {}

  queryFIN64010(body: QueryFIN64010Request): Observable<ApiResponse<QueryFIN64010Row[]>> {
    return this.http.post<ApiResponse<QueryFIN64010Row[]>>(
      `${this.apiUrl}/queryFIN64010`,
      body
    );
  }

  queryFIN64010Detail(body: QueryFIN64010DetailRequest): Observable<ApiResponse<FIN64010DetailRow>> {
    return this.http.post<ApiResponse<FIN64010DetailRow>>(
      `${this.apiUrl}/queryFIN64010Detail`,
      body
    );
  }

  updateFIN64010(body: FIN64010UpdateRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/updateFIN64010`, body);
  }

  /** 若你未來要做匯出，可以直接沿用 FIN63020 的做法 */
  exportFIN64010PDF?(body: QueryFIN64010Request): Observable<HttpResponse<Blob>> {
    const url = `${this.apiUrl}/exportFIN64010PDF`;
    const payload = this.stripPaging(body);

    return this.http.post(url, payload, {
      observe: 'response',
      responseType: 'blob' as 'json',
      headers: new HttpHeaders({ Accept: 'application/pdf' }),
    }) as Observable<HttpResponse<Blob>>;
  }

  private stripPaging<T extends Record<string, any>>(
    input: T
  ): Omit<
    T,
    | 'PageSize' | 'PageIndex' | 'OrderBy' | 'Offset'
    | 'pageSize' | 'pageIndex' | 'orderBy' | 'offset'
  > {
    if (!input) return input as any;

    const {
      PageSize, PageIndex, OrderBy, Offset,
      pageSize, pageIndex, orderBy, offset,
      ...rest
    } = input as any;

    return rest as any;
  }
}

export { ApiResponse };
