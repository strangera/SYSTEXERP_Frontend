import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';

export interface SortItem {
  field: string;
  order: number;
}

/** 對齊 SP_FIN63040Query 參數 */
export interface QueryFIN63040Request {
  PageSize: number;
  PageIndex: number;
  SortBy?: SortItem[];

  ChkNo?: string;        // @ChkNo
  CompanyAccNo: string;  // @CompanyAccNo (必填)

  PayDateFrom?: string;  // yyyy-MM-dd
  PayDateTo?: string;    // yyyy-MM-dd
  ExpireDateFrom?: string; // yyyy-MM-dd
  ExpireDateTo?: string;   // yyyy-MM-dd

  [key: string]: any;
}

/** 對齊 SP_FIN63040Query SELECT 回傳欄位 */
export interface QueryFIN63040Row {
  CanCashYn: 'Y' | 'N';
  RowNo: number;

  ChkNo: string;
  VenNo: string;
  VenName: string;

  AccNo: string;
  AccName: string;

  IssueDate: string | null;
  DueDate: string | null;
  PayDate: string | null;

  ChkAmt: number;
  ChkTitle: string;
  NoEndorseYn: string;
  Remark: string;

  OrgId: string;
  OrgName: string;

  Status: string;        // 到期/兌現（顯示）
  CheckStatus: string;   // 確認/拋轉（顯示）
  PickupStatus: string;  // 未領/已領/郵寄（顯示）
  PickupDate: string | null;

  VoucherNo: string | null;
  VoucherNoPaid: string | null;

  [key: string]: any;
}

/** 對齊 SP_FIN63040UpdateDetail 參數 */
export interface FIN63040UpdateDetailRequest {
  ChkNo: string;
  PayDate: string;     // yyyy-MM-dd (date)
  UPD_USRNo: string;
  UPD_USRName: string;
}

@Injectable({ providedIn: 'root' })
export class Fin63040Service {
  private apiUrl = `${environment.ApiUrl}/FIN6000/FIN63040`;

  constructor(private http: HttpClient) {}

  /** 查詢列表（SP_FIN63040Query） */
  queryFIN63040(body: QueryFIN63040Request): Observable<ApiResponse<QueryFIN63040Row[]>> {
    return this.http.post<ApiResponse<QueryFIN63040Row[]>>(`${this.apiUrl}/queryFIN63040`, body);
  }

  /** 確認兌現（SP_FIN63040UpdateDetail） */
  updateFIN63040Detail(body: FIN63040UpdateDetailRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/updateFIN63040Detail`, body);
  }
}

export { ApiResponse };
