import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response'; // 根據您的專案路徑調整
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

/** 應付票據撤票作業 - 查詢 Request */
export interface QueryFin63050Request {
  PageSize?: number;
  PageIndex?: number;
  SortBy?: { field: string; order: number }[];
  ChkNo?: string;
  WithdrawDateFrom?: string;
  WithdrawDateTo?: string;
}

/** 應付票據撤票作業 - 列表 Response 資料項 */
export interface Fin63050ListData {
  TotalCount: number;
  CanPickupYn: string;
  RowNo: string;
  CheckNo: string;
  VendorNo: string;
  VEN_Name: string;
  CompanyAccNo: string;
  CompanyAccName: string;
  IssueDate: string;
  ExpireDate: string;
  PayDate: string;
  WithdrawDate: string;
  CheckAmount: number;
  CheckTitle: string;
  NoEndorseYn: string;
  Remark: string;
  OrgId: string;
  Org_Name: string;
  CheckStatus: string;
  StatusFlag: string;
  PickupStatus: string;
  PickupDate: string;
  VoucherNoIssued: string;
  VoucherNoWithdraw: string;
}

/** 應付票據撤票作業 - 明細資料 */
export interface Fin63050DetailData {
  CheckNo: string;
  VendorNo: string;
  VEN_Name: string;
  CompanyAccNo: string;
  CompanyAccName: string;
  IssueDate: Date;
  ExpireDate: Date;
  PayDate: Date;
  WithdrawDate: Date;
  CheckAmount: number;
  CheckTitle: string;
  NoEndorseYn: string;
  Remark: string;
  OrgId: string;
  StatusFlag: string;
  VouNo_paid: string;
  CheckStatus: string;
  PickupType: string;
  PickupDate: Date;
  ProjectNo: string;
  PamNo: string;
  VoucherNoIssued: string;
}

/** 單筆更新 Request */
export interface UpdateFin63050Request {
  CheckNo: string;
  CheckTitle?: string;
  Remark?: string;
  NoEndorseYn?: string;
  StatusFlag?: string;
  PickupType?: string;
  PickupDate?: string | null;
  PayDate?: string | null;
  WithdrawDate?: string | null;
}

/** 批次撤票 Request */
export interface UpdateFin63050DetailRequest {
  WithdrawDate: string | null;
  Remark: string;
  ChkNoList: string[];
}

@Injectable({
  providedIn: 'root'
})
export class Fin63050Service {
  private apiUrl = `${environment.ApiUrl}/FIN0000/NTS1000`;

  constructor(private http: HttpClient) { }

  /**
   * 1. 查詢應付票據撤票作業資料
   */
  queryFIN63050(data: QueryFin63050Request): Observable<ApiResponse<Fin63050ListData[]>> {
    return this.http.post<ApiResponse<Fin63050ListData[]>>(`${this.apiUrl}/queryFIN63050`, data);
  }

  /**
   * 2. 查詢應付票據撤票作業明細資料
   */
  queryFIN63050Detail(data: { ChkNo: string }): Observable<ApiResponse<{ ErrorMsg: string; QueryData: Fin63050DetailData }>> {
    return this.http.post<ApiResponse<{ ErrorMsg: string; QueryData: Fin63050DetailData }>>(`${this.apiUrl}/queryFIN63050Detail`, data);
  }

  /**
   * 3. Update 應付票據 (單筆資料更新)
   */
  updateFIN63050(data: UpdateFin63050Request): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.apiUrl}/updateFIN63050`, data);
  }

  /**
   * 4. 支票撤票功能 (批次撤票)
   */
  updateFIN63050Detail(data: UpdateFin63050DetailRequest): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.apiUrl}/updateFIN63050Detail`, data);
  }

  /**
   * 5. 匯出應付票據撤票作業資料 (Excel)
   */
  exportFIN63050(data: QueryFin63050Request): Observable<HttpResponse<Blob>> {
    // 通常匯出會根據後端回傳格式決定是否需要 responseType: 'blob'
    return this.http.post(`${this.apiUrl}/exportFIN63050`, data,
      {
        observe: 'response',
        responseType: 'blob'
      }
    );
  }

  /**
   * 6. 匯出應付票據撤票作業資料 (PDF)
   */
  exportFIN63050PDF(data: QueryFin63050Request): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/exportFIN63050PDF`, data,
      {
        observe: 'response',
        responseType: 'blob'
      }
    );
  }
}
