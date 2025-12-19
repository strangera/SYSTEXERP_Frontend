import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';

export type SortItem = { field: string; order: number };

/** ========== Query (列表) ========== */
export interface QueryFIN63020Request {
  PageSize?: number | null;
  PageIndex?: number | null;
  SortBy?: SortItem[] | null;

  ChkNo?: string | null;
  VenNo?: string | null;
  CompanyAccNo?: string | null;

  IssueDateFrom?: string | null;
  IssueDateTo?: string | null;
  ExpireDateFrom?: string | null;
  ExpireDateTo?: string | null;
  PayDateFrom?: string | null;
  PayDateTo?: string | null;

  AmtFrom?: number | null;
  AmtTo?: number | null;

  ChkTitle?: string | null;
  VenCtrlYN?: string | null;
  Comment?: string | null;

  OrgId?: string | null;
  ProjectNo?: string | null;

  CheckStatus?: string | null;
  Status?: string | null;
  PickupType?: string | null;

  PickupDateFrom?: string | null;
  PickupDateTo?: string | null;

  PamNo?: string | null;
  ApCheckAccNo?: string | null;
  VoucherNo?: string | null;

  PartyTypeNo?: string | null;
  ReconKey?: string | null;

  // 兼容你們 BasicQueryPageComponent / table-report 可能帶的小寫 key
  pageSize?: number | null;
  pageIndex?: number | null;
  orderBy?: string | null;
  offset?: number | null;

  OrderBy?: string | null;
  Offset?: number | null;

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
  Remark?: string;

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
  queryFIN63020(body: QueryFIN63020Request): Observable<ApiResponse<QueryFIN63020Row[]>> {
    return this.http.post<ApiResponse<QueryFIN63020Row[]>>(
      `${this.apiUrl}/queryFIN63020`,
      body
    );
  }

  /** 查詢明細 */
  queryFIN63020Detail(body: Fin63020QueryDetailRequest): Observable<ApiResponse<Fin63020DetailRow>> {
    return this.http.post<ApiResponse<Fin63020DetailRow>>(
      `${this.apiUrl}/queryFIN63020Detail`,
      body
    );
  }

  /** 更新票據主檔（編輯模式） */
  updateFIN63020(body: Fin63020UpdateRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/updateFIN63020`, body);
  }

  /** 支票領取更新 */
  updateFIN63020Detail(body: Fin63020UpdateDetailRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/updateFIN63020Detail`, body);
  }

  /** 匯出 Excel（不分頁） */
  exportFIN63020Excel(body: QueryFIN63020Request): Observable<HttpResponse<Blob>> {
    const url = `${this.apiUrl}/exportFIN63020`;
    const payload = this.stripPaging(body);

    return this.http.post(url, payload, {
      observe: 'response',
      responseType: 'blob' as 'json',
    }) as Observable<HttpResponse<Blob>>;
  }

  /** 匯出 PDF（不分頁） */
  exportFIN63020PDF(body: QueryFIN63020Request): Observable<HttpResponse<Blob>> {
    const url = `${this.apiUrl}/exportFIN63020PDF`;
    const payload = this.stripPaging(body);

    return this.http.post(url, payload, {
      observe: 'response',
      responseType: 'blob' as 'json',
      headers: new HttpHeaders({ Accept: 'application/pdf' }),
    }) as Observable<HttpResponse<Blob>>;
  }

  /**
   * - 同時移除大小寫鍵：pageSize/pageIndex/orderBy/offset 與 PageSize/PageIndex/OrderBy/Offset
   * - 保留 SortBy（讓後端可依前端排序）
   */
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
