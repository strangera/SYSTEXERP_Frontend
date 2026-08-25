/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';

export type SortItem = { field: string; order: number };

/** ========== Query (清單) ========== */
export interface IDropdownItem {
  value?: string;
  tlt_building?: string;
  tlt_floor?: string;
  area_no?: string;
  No: string; // 唯一值
  Name: string; // 用於顯示的名稱
  ShortName?: string; // 用於顯示的簡稱
  VEN_No?: string;  // 廠商編號
  HOS_No?: string; // 品牌編號
  store_way?: string;
  talent_id?: number;
  PAY_Type?: string;
  label?: string; // 用於顯示的標籤
  CAT_LNo?: string;
  CAT_LName?: string;
  CAT_MNo?: string;
  CAT_MName?: string;
  items?: IDropdownItem[];
  ECR_TmplNo?: string; // 環境變數編號 模板編號
  ECR_TmplName?: string; // 環境變數編號 模板備註
  bus_type?: string;
  bus_type_name?: string;
  PAY_OverPay?: string;
  CHG_ItemName_List?: string;
}

export interface QueryFIN64010Request {
  PageSize?: number | null;
  PageIndex?: number | null;
  SortBy?: SortItem[] | null;

  ChkNo?: string | null;
  VenNo?: string | null;

  /** 銀行代號(多選) */
  BankNoList?: string | null;

  /** 客戶銀行帳號：ARS4004.BNK_AccNo */
  CustBankAccNo?: string | null;

  /** 託收日(起/迄) */
  ColleDateFrom?: string | null;
  ColleDateTo?: string | null;

  /** 公司銀行科目代號(多選)：APS1002.BNK_DepositAccNo */
  CompanyAccNoList?: string | null;

  /** 公司代號 */
  CompNo?: string | null;

  /** 收票日(起/迄) */
  ReceDateFrom?: string | null;
  ReceDateTo?: string | null;

  /** 收票業務員代碼(多選) */
  SalesIdList?: string | null;

  /** 收款單號(模糊) */
  RcvNo?: string | null;

  /** 到期日(起/迄) */
  ExpireDateFrom?: string | null;
  ExpireDateTo?: string | null;

  /** 預兌日(起/迄) */
  PreDateFrom?: string | null;
  PreDateTo?: string | null;

  /** 兌現日(起/迄) */
  PayDateFrom?: string | null;
  PayDateTo?: string | null;

  /** 票面金額(起/迄) */
  AmtFrom?: number | null;
  AmtTo?: number | null;

  /** 票據種類(1/2/3) */
  ChkType?: string | null;

  /** 是否客票(Y/N) */
  TicketYN?: string | null;

  /** 備註 */
  Comment?: string | null;

  /** 組織代號 */
  OrgId?: string | null;

  /** 活動代號 */
  ProjectNo?: string | null;

  /** 票據抬頭 */
  ChkTitle?: string | null;

  /** 狀態(0/1/2) */
  TranStatus?: string | null;

  /** 票據狀態(0~5) */
  ChkStatus?: string | null;

  /** 傳票號碼(模糊) */
  VouNo?: string | null;

  [key: string]: any;
}

export interface QueryFIN64010Row {
  TotalCount?: number;
  RowNo?: string;

  ID?: number;

  CheckNo?: string;

  VEN_No?: string;
  VEN_Name?: string;

  BNK_No?: string;
  BNK_Name?: string;

  CHK_ColleDate?: string | null;

  AccNo?: string;
  AccName?: string;

  BNK_AccNo?: string;
  BNK_AccName?: string;

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
  Id: number;
}

/** 依你貼的 FIN64010Response.queryFIN64010DetailResponse */
export interface FIN64010DetailRow {
  id: number;
  mid: number;
  STO_No: string;

  CHK_No?: string;
  VEN_No?: string;
  VEN_Name?: string;

  BNK_No?: string;
  BNK_Name?: string;

  CHK_BNK_No?: string;
  BNK_BranchName?: string;

  CHK_ColleDate?: string | null;

  BNK_AccNo?: string; // 票據上的帳號(後端 Update 必填)
  BNK_AccName?: string;

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

  // 你後端 update 需要的欄位，detail 不一定會回，但先保留相容
  BNK_Key?: string | null;
  COL_BNK_id?: string | null;

  [key: string]: any;
}

/** ========== Update ========== */
/** ✅ 完全對齊你後端 updateFIN64010Request（BNK_Key / BNK_AccNo / COL_BNK_id 必填） */
export interface FIN64010UpdateRequest {
  Id: number;

  BNK_Key: string;     // 票面銀行(必填)
  BNK_AccNo: string;   // 票據上的帳號(必填)
  COL_BNK_id: string;  // 託收帳戶(必填)

  CHK_No: string;      // 必填
  CHK_Amt: number;     // 必填
  CHK_ExpireDate: string; // 必填
  CHK_ReceDate: string;   // 必填
  VEN_No: string;      // 必填
  CHK_Status: string;  // 必填

  CHK_Type?: string | null;
  Ticket_YN?: string | null;
  CHK_Comment?: string | null;

  ORG_ID?: string | null;
  ProjectNo?: string | null;
  RCV_No?: string | null;

  CHK_PreDate?: string | null;
  CHK_ColleDate?: string | null;
  CHK_CashDate?: string | null;
  CHK_BackDate?: string | null;

  [key: string]: any;
}
/** ========== Insert (自行新增，狀態固定為R僅記錄) ========== */
export interface FIN64010InsertRequest {
  BNK_Key: string;     // 票面銀行(必填)
  BNK_AccNo: string;   // 票據上的帳號(必填)
  COL_BNK_id: string;  // 託收帳戶(必填)

  CHK_No: string;      // 必填
  CHK_Amt: number;     // 必填
  CHK_ExpireDate: string; // 必填
  CHK_ReceDate: string;   // 必填
  VEN_No: string;      // 必填

  CHK_Type?: string | null;
  Ticket_YN?: string | null;
  CHK_Comment?: string | null;

  ORG_ID?: string | null;
  ProjectNo?: string | null;
  RCV_No?: string | null;

  CHK_PreDate?: string | null;

  [key: string]: any;
}

export interface Aps1002DropdownItem {
  BNK_DepositAccNo: string;
  ACCCNAME: string | null;
  BNK_No: string;
  BNK_BRANCHNAME: string;
  BNK_AccType: string;
}

@Injectable({ providedIn: 'root' })
export class Fin64010Service {
  private apiUrl = `${environment.ApiUrl}/FIN0000/NTS1000`;
  private DLapiUrl = `${environment.ApiUrl}`;

  constructor(private http: HttpClient) {}

  queryFIN64010(body: QueryFIN64010Request): Observable<ApiResponse<QueryFIN64010Row[]>> {
    return this.http.post<ApiResponse<QueryFIN64010Row[]>>(
      `${this.apiUrl}/queryFIN64010`,
      body
    );
  }

  queryFIN64010Detail(body: QueryFIN64010DetailRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/queryFIN64010Detail`,
      body
    );
  }
  /** 查詢銀行代碼及名稱 queryAPS1002_DropDownList */
queryAPS1002_DropDownList(): Observable<ApiResponse<Aps1002DropdownItem[]>> {
  return this.http.post<ApiResponse<Aps1002DropdownItem[]>>(
    `${this.DLapiUrl}/queryAPS1002_DropDownList`,
    {}
  );
}

  updateFIN64010(body: FIN64010UpdateRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/updateFIN64010`, body);
  }

  insertFIN64010(body: FIN64010InsertRequest): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.apiUrl}/insertFIN64010`, body);
  }

  exportFIN64010(body: QueryFIN64010Request): Observable<HttpResponse<Blob>> {
    const url = `${this.apiUrl}/exportFIN64010`;
    return this.http.post(url, this.stripPaging(body), {
      observe: 'response',
      responseType: 'blob' as 'json',
      headers: new HttpHeaders({
        Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }),
    }) as Observable<HttpResponse<Blob>>;
  }

  exportFIN64010PDF(body: QueryFIN64010Request): Observable<HttpResponse<Blob>> {
    const url = `${this.apiUrl}/exportFIN64010PDF`;
    return this.http.post(url, this.stripPaging(body), {
      observe: 'response',
      responseType: 'blob' as 'json',
      headers: new HttpHeaders({ Accept: 'application/pdf' }),
    }) as Observable<HttpResponse<Blob>>;
  }

  private stripPaging<T extends Record<string, any>>(
    input: T
  ): Omit<T, 'PageSize' | 'PageIndex' | 'OrderBy' | 'Offset' | 'pageSize' | 'pageIndex' | 'orderBy' | 'offset'> {
    if (!input) return input as any;
    const { PageSize, PageIndex, OrderBy, Offset, pageSize, pageIndex, orderBy, offset, ...rest } = input as any;
    return rest as any;
  }
//收票業務員代碼 下拉選單
  queryARS1001_DropDownList(): Observable<ApiResponse<IDropdownItem[]>> {
    return this.http.post<ApiResponse<IDropdownItem[]>>(`${this.DLapiUrl}/queryARS1001DropDownList`, {});
  }
}

export { ApiResponse };
