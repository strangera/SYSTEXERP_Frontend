import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';

export type SortItem = { field: string; order: number };

/** ========== Query (列表) ========== */
export interface QueryFIN63020Request {
  PageSize: number;
  PageIndex: number;
  SortBy?: SortItem[];

  // 對齊 SP_FIN63020Query
  ChkNo?: string; // 票據號碼
  VenNo?: string; // 廠客代號
  CompanyAccNo: string; // 公司銀行科目代號（必填）

  IssueDateFrom?: string; // yyyy-MM-dd
  IssueDateTo?: string;
  ExpireDateFrom?: string;
  ExpireDateTo?: string;
  PayDateFrom?: string;
  PayDateTo?: string;

  AmtFrom?: number;
  AmtTo?: number;

  ChkTitle?: string;
  VenCtrlYN?: string; // Y / N
  Comment?: string;

  OrgId?: string;
  ProjectNo?: string;

  CheckStatus?: string; // 0/1/2/3/4/5
  Status?: string; // 1=確認 2=拋轉
  PickupType?: string; // 0/1/2
  PickupDateFrom?: string; // ISO 或 yyyy-MM-ddTHH:mm:ss
  PickupDateTo?: string;

  PamNo?: string;
  ApCheckAccNo?: string;
  VoucherNo?: string;

  PartyTypeNo?: string;
  ReconKey?: string;

  [key: string]: any;
}

export interface QueryFIN63020Row {
  CanPickupYn: 'Y' | 'N';
  RowNo: number;

  CheckNo: string;
  VendorNo: string;
  CompanyAccNo: string;

  IssueDate: string | null;
  ExpireDate: string | null;
  PayDate: string | null;

  CheckAmount: number;
  CheckTitle: string;

  NoEndorseYn: string; // 顯示：是/否
  Remark: string;

  OrgId: string;

  StatusFlag: string; // 顯示：到期/兌現
  CheckStatus: string; // 顯示：確認/拋轉

  PickupStatus: string; // 顯示：未領/已領/郵寄
  PickupDate: string | null;

  VoucherNo: string | null;
  VoucherNoPaid: string | null;

  [key: string]: any;
}

/** ========== Detail (明細) ========== */
export interface Fin63020QueryDetailRequest {
  ChkNo: string;
}

export interface Fin63020DetailRow {
  // 上半部
  CheckNo: string;
  CompanyAccNo: string;
  CompanyAccName: string;
  VendorNo: string;
  VEN_Name: string;
  IssueDate: string | null;
  ExpireDate: string | null;
  CheckAmount: number | null;

  CheckTitle: string | null;
  NoEndorseYn: 'Y' | 'N' | null;
  Remark: string | null;

  // 下半部
  OrgId: string | null;

  /** 票據狀態(流程)：1確認2拋轉（SP 的 StatusFlag） */
  StatusFlag: '1' | '2' | null;

  VouNo_paid?: string | null; // 已拋轉的傳票編號
  CheckStatus?: string | null; // CHK_Status(0~5)

  PickupType?: string | null; // 0/1/2
  PickupDate?: string | null;
  PayDate?: string | null;
  WithdrawDate?: string | null;

  ProjectNo?: string | null;
  PamNo?: string | null;
  VoucherNo?: string | null; // VouNo_issued
  ApCheckAccNo?: string | null;

  // UpdateDetail 用（你 SP_FIN63020QueryDetail 目前沒 select，但 CRU 會留欄位）
  PickName?: string | null;

  [key: string]: any;
}

/** ========== Update (主檔更新) ========== */
export interface Fin63020UpdateRequest {
  ChkNo: string;
  ChkTitle: string;
  Comment: string; // 備註（SP 要求不可 NULL，空字串 OK）

  NoEndorseYn: 'Y' | 'N';
  Status: string; // 0~5 (CHK_Status)
  PickupType: string; // 0/1/2

  PickupDate: string | null; // 'yyyy-MM-dd HH:mm:ss'
  PayDate: string | null;
  WithdrawDate: string | null;

  [key: string]: any;
}

/** ========== UpdateDetail (領取更新) ========== */
export interface Fin63020UpdateDetailRequest {
  ChkNo: string;
  PickupDate: string; // 'yyyy-MM-dd HH:mm:ss' 或 'yyyy-MM-dd'
  UPD_USRNo: string;
  UPD_USRName: string;
  PickName: string;

  [key: string]: any;
}

@Injectable({ providedIn: 'root' })
export class Fin63020Service {
  // ⚠️ 路徑請依你們後端 Controller 實際調整
  private apiUrl = `${environment.ApiUrl}/FIN6000/FIN63020`;

  constructor(private http: HttpClient) {}

  /** 列表查詢：SP_FIN63020Query */
  queryFIN63020(
    body: QueryFIN63020Request
  ): Observable<ApiResponse<QueryFIN63020Row[]>> {
    return this.http.post<ApiResponse<QueryFIN63020Row[]>>(
      `${this.apiUrl}/queryFIN63020`,
      body
    );
  }

  /** 明細查詢：SP_FIN63020QueryDetail */
  queryFIN63020Detail(
    body: Fin63020QueryDetailRequest
  ): Observable<ApiResponse<Fin63020DetailRow>> {
    return this.http.post<ApiResponse<Fin63020DetailRow>>(
      `${this.apiUrl}/queryFIN63020Detail`,
      body
    );
  }

  /** 更新主檔：SP_FIN63020Update */
  updateFIN63020(
    body: Fin63020UpdateRequest
  ): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/updateFIN63020`,
      body
    );
  }

  /** 領取更新：SP_FIN63020UpdateDetail */
  updateFIN63020Detail(
    body: Fin63020UpdateDetailRequest
  ): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/updateFIN63020Detail`,
      body
    );
  }
}

export { ApiResponse };
