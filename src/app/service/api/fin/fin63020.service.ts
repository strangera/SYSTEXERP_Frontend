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

  ChkNo?: string;
  VenNo?: string;
  CompanyAccNo: string;

  IssueDateFrom?: string;
  IssueDateTo?: string;
  ExpireDateFrom?: string;
  ExpireDateTo?: string;
  PayDateFrom?: string;
  PayDateTo?: string;

  AmtFrom?: number;
  AmtTo?: number;

  ChkTitle?: string;
  VenCtrlYN?: string;
  Comment?: string;

  OrgId?: string;
  ProjectNo?: string;

  CheckStatus?: string; // 0~5（顯示用）
  Status?: string;      // 1=確認 2=拋轉（列表顯示用）
  PickupType?: string;

  PickupDateFrom?: string;
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

  NoEndorseYn: string;
  Remark: string;

  OrgId: string;

  StatusFlag: string;
  CheckStatus: string;

  PickupStatus: string;
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

  OrgId: string | null;

  /** 1=確認 2=拋轉 */
  StatusFlag: '1' | '2' | null;

  VouNo_paid?: string | null;
  CheckStatus?: string | null;

  PickupType?: '0' | '1' | '2' | null;
  PickupDate?: string | null;
  PayDate?: string | null;
  WithdrawDate?: string | null;

  ProjectNo?: string | null;
  PamNo?: string | null;
  VoucherNo?: string | null;
  ApCheckAccNo?: string | null;

  PickName?: string | null;

  [key: string]: any;
}

/** ========== Update (主檔更新) ========== */
export interface Fin63020UpdateRequest {
  CheckNo: string;
  CheckTitle: string;
  Remark: string;

  NoEndorseYn: 'Y' | 'N';
  StatusFlag: '1' | '2';
  PickupType: '0' | '1' | '2';

  PickupDate: string | null;
  PayDate: string | null;
  WithdrawDate: string | null;

  [key: string]: any;
}

/** ========== UpdateDetail (領取更新) ========== */
export interface Fin63020UpdateDetailRequest {
  ChkNo: string;
  PickupDate: string;
  UPD_USRNo: string;
  UPD_USRName: string;
  PickName: string;

  [key: string]: any;
}

@Injectable({ providedIn: 'root' })
export class Fin63020Service {
  /** 對齊 Swagger：/FIN0000/NTS1000 */
  private apiUrl = `${environment.ApiUrl}/FIN0000/NTS1000`;

  constructor(private http: HttpClient) {}

  /** 查詢列表 */
  queryFIN63020(
    body: QueryFIN63020Request
  ): Observable<ApiResponse<QueryFIN63020Row[]>> {
    return this.http.post<ApiResponse<QueryFIN63020Row[]>>(
      `${this.apiUrl}/queryFIN63020`,
      body
    );
  }

  /** 查詢明細 */
  queryFIN63020Detail(
    body: Fin63020QueryDetailRequest
  ): Observable<ApiResponse<Fin63020DetailRow>> {
    return this.http.post<ApiResponse<Fin63020DetailRow>>(
      `${this.apiUrl}/queryFIN63020Detail`,
      body
    );
  }

  /** 更新票據主檔（編輯模式） */
  updateFIN63020(
    body: Fin63020UpdateRequest
  ): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/updateFIN63020`,
      body
    );
  }

  /** 支票領取更新 */
  updateFIN63020Detail(
    body: Fin63020UpdateDetailRequest
  ): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/updateFIN63020Detail`,
      body
    );
  }

  /** 匯出 Excel */
  exportFIN63020(body: QueryFIN63020Request): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/exportFIN63020`, body, {
      responseType: 'blob',
    });
  }

  /** 匯出 PDF */
  exportFIN63020PDF(body: QueryFIN63020Request): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/exportFIN63020PDF`, body, {
      responseType: 'blob',
      headers: { Accept: 'application/pdf' },
    });
  }
}

export { ApiResponse };
