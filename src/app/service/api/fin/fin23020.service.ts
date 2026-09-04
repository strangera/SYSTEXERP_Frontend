import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Option } from '@service/utility/dropdown-api.model';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { catchError, map, Observable, of, shareReplay } from 'rxjs';
import { environment } from 'src/environments/environment';

/** 查詢可拋轉暫付款申請清單 Request (對應 SP_FIN23020Query) */
export interface QueryFIN23020Request {
  PREP_NOS?: string | null;
  PREP_NOE?: string | null;
  pageIndex?: number;
  pageSize?: number;
  SortBy?: { field: string; order: number }[];
}

/** 查詢可拋轉暫付款申請清單單筆 Response */
export interface QueryFIN23020Response {
  RowNum: number;
  id: number;
  PrepNo: string;
  VenNo: string;
  VenName: string;
  ApplyDate: string;
  PlanCloseDate: string;
  PlanPayDate: string;
  PrepAmt: number;
  Remark: string;
}

/** 預覽拋轉傳票 Request (對應 SP_FIN23020Detail) */
export interface DetailFIN23020Request {
  id: number;
}

/** 預覽拋轉傳票-表頭 */
export interface DetailFIN23020Header {
  VouNo: string;
  VouTypeName: string;
  VouForm: string;
  VouDate: string;
  VouSummary: string;
  CRT_USR_No: string;
  CRT_USR_Name: string;
  CRT_Date: string;
  id: number;
  PREP_NO: string;
  PREP_Amt: number;
}

/** 預覽拋轉傳票-明細單筆 */
export interface DetailFIN23020Line {
  SeqNo: number;
  AcctCode: string;
  AcctName: string;
  VenNo: string;
  Summary: string;
  DebitAmt: number;
  CreditAmt: number;
  DeptCode: string;
  DeptName: string;
  OffsetCode: string;
  ActivityCode: string;
}

/** 預覽拋轉傳票 Response */
export interface DetailFIN23020Response {
  Header: DetailFIN23020Header | null;
  Details: DetailFIN23020Line[];
}

/**
 * 確定拋轉 Request (對應 SP_FIN23020Posting)
 * 2026-09-04 起借貸科目代號改由前端畫面確認/調整後傳入，為後端必填欄位。
 * DebitOrgId/CreditOrgId/DebitOffsetNo 已改由 SP 端用 APS3010.CostOrg / 自動產生立沖 PTA，
 * 後端已忽略這三個欄位，僅保留簽章相容，前端仍可照舊帶值。
 */
export interface PostingFIN23020Request {
  id: number;
  DebitAccNo: string;
  CreditAccNo: string;
  DebitSummary?: string | null;
  CreditSummary?: string | null;
  DebitOrgId?: string | null;
  CreditOrgId?: string | null;
  DebitOffsetNo?: string | null;
  VouSummary?: string | null;
  /** 傳票日期。SP_FIN23020Posting 已新增 @VouDate 參數(取代原本內部寫死的 GETDATE())，不帶值時後端預設今天。 */
  VouDate?: string | null;
}

/** 確定拋轉 Response */
export interface PostingFIN23020Response {
  Success: boolean;
  Message: string;
  VouNo?: string | null;
}

/**
 * 會計科目下拉(GLS1005 FIN23020 專用)。
 * 沿用 fin53010Service.queryGls1005Fin53010() 的作法：
 * 帶出 AccDC(借貸方屬性 D:借方 C:貸方)供前端判斷開放借方/貸方金額欄位，
 * 不共用 DropdownApiService.queryGls1005_ledgerMD()(該下拉多處共用，不帶 AccDC)。
 */
export interface Gls1005Fin23020DropdownItem {
  AccNo: string;
  AccCName: string;
  AccDC: string;
}

@Injectable({
  providedIn: 'root'
})
export class Fin23020Service {
  apiUrl = environment.ApiUrl;

  constructor(private http: HttpClient) { }

  /** 查詢可拋轉暫付款申請清單 (呼叫 SP_FIN23020Query) */
  queryFIN23020(body: QueryFIN23020Request): Observable<ApiResponse<QueryFIN23020Response[]>> {
    return this.http.post<ApiResponse<QueryFIN23020Response[]>>(
      `${this.apiUrl}/FIN0000/APS1000/queryFIN23020`,
      body
    );
  }

  /** 預覽拋轉傳票(表頭+明細) (呼叫 SP_FIN23020Detail) */
  detailFIN23020(body: DetailFIN23020Request): Observable<ApiResponse<DetailFIN23020Response>> {
    return this.http.post<ApiResponse<DetailFIN23020Response>>(
      `${this.apiUrl}/FIN0000/APS1000/detailFIN23020`,
      body
    );
  }

  /** 確定拋轉 (呼叫 SP_FIN23020Posting) */
  postingFIN23020(body: PostingFIN23020Request): Observable<ApiResponse<PostingFIN23020Response>> {
    return this.http.post<ApiResponse<PostingFIN23020Response>>(
      `${this.apiUrl}/FIN0000/APS1000/postingFIN23020`,
      body
    );
  }

  /** 查詢會計科目(GLS1005 FIN23020 專用下拉，含 AccDC 借貸方屬性) */
  queryGls1005Fin23020(): Observable<Option[] | null> {
    return this.http
      .post<ApiResponse<Gls1005Fin23020DropdownItem[]>>(
        `${this.apiUrl}/queryGLS1005_FIN23020_DropDownList`,
        {}
      )
      .pipe(
        map(response => {
          const data = response?.Data;
          return data
            ? data.map(item => ({
              ...item,
              value: (item.AccNo ?? '').trim(),
              label: `${(item.AccNo ?? '').trim()} - ${item.AccCName ?? ''}`,
            }))
            : null;
        }),
        catchError(err => {
          console.error('API /queryGLS1005_FIN23020_DropDownList 失敗:', err);
          return of(null);
        }),
        shareReplay({ bufferSize: 1, refCount: true })
      );
  }
}
