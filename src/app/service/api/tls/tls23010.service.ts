import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { ErrorHandlerService } from '../../system/error-handler.service';
import { BaseQueryRequest, BaseQueryResponse } from '../../../shared/models/api/base-api.interface';


export interface TLS23010QueryRequest extends BaseQueryRequest {
  TXN_DateStart?: string;
  TXN_DateEnd?: string;
  ECR_No?: string[];
  TXN_No_Start?: number;
  TXN_No_End?: number;
  TLT_No?: string[];
  TXN_GUIBegNo?: string;
  TXN_GUIEndNo?: string;
  TXN_Status?: string[];
  TXN_FlagStatus?: string[];
  USR_No?: string;
  TXN_PreOrderNo?: string;
  TXN_PkngUID?: string;
  TXN_MemCard?: string;
  TXN_Uniform?: string;
  TXN_GUILoveCode?: string;
  TXN_GUI_CarrType?: string[];
  TXN_GUI_CarrId?: string;
  rece_yn?: 's' | '';
  cash_yn?: 's' | '';
  tlt_building?: string;
  tlt_floor?: string[];
  org_id?: string[];
}

export interface TLS23010Data {
  SYS_StoreNo: string;
  TXN_Date: string;
  ECR_No: string;
  TXN_No: number;
  tlt_no: string;
  tlt_name: string;
  TXN_Uniform: string;
  TXN_GUIBegNo: string;
  gui_track: string;
  GUIBegNo: string;
  GUIEndNo: string;
  TXN_TotGUI: number;
  TXN_TotSaleAmt: number;
  TXN_TotOver: number;
  TXN_VIP: string;
  TXN_Mode: string;
  TXN_PreOrder: string;
  TXN_Status: string;
  TXN_StatusName: string;
  TXN_TaxFreeCertNo: string;
  TXN_Time: string;
  USR_No: string;
  TXN_PreOrderNo: string;
  ORG_TXN_Date: string;
  ORG_ECR_No: string;
  ORG_TXN_No: number;
  TXN_PkngUID: string;
  TXN_MemID: string;
  TXN_TotDisc: number;
  GUILoveStatus: string;
  TXN_GUILoveCode: string;
  TXN_GUIRemark: string;
  TXN_GUI_CarrType: string;
  DonateType: string;
  TXN_GUI_CarrId: string;
  TXN_PrintTimes: number;
  TXN_PrintGUI: string;
  CRD_Type: string;
  CRD_Name: string;
  CRD_No: string;
  TERM_No: number;
  TXN_PayAmt: number;
}

@Injectable({ providedIn: 'root' })
export class TLS23010Service {
  private apiUrl: string = environment.ApiUrl;

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {}

  /** 查詢（主檔） */
  queryTLS23010(body: any, displayMode: 'Detail' | 'Summary' = 'Detail'): Observable<any> {
    const url = `${this.apiUrl}/TLS0000/TLS2000/queryTLS23010`;
    return this.http.post<any>(url, body).pipe(
      tap(response => console.log(`🎯 TLS23010 ${displayMode} 查詢結果:`, response)),
      catchError((error) => this.errorHandler.handleError(error))
    );
  }

  /** 明細查詢（展開列） */
  queryTLS23010Detail(body: {
    SYS_StoreNo: string;
    TXN_Date: string;
    ECR_No: string;
    TXN_No: number;
  }): Observable<any[]> {
    const url = `${this.apiUrl}/TLS0000/TLS2000/queryTLS23010_Detail`;
    return this.http.post<BaseQueryResponse<any>>(url, body).pipe(
      map(r => r?.Data ?? []),
      tap(list => console.log('📦 Detail count:', list?.length ?? 0)),
      catchError(err => this.errorHandler.handleError(err))
    );
  }

  /** 彙總查詢（不帶分頁） */
queryTLS23010Summary(body: any): Observable<any> {
  const url = `${this.apiUrl}/TLS0000/TLS2000/queryTLS23010_Summary`;
  return this.http.post<any>(url, body).pipe(
    tap(r => console.log('🎯 TLS23010 Summary 查詢結果:', r)),
    catchError(err => this.errorHandler.handleError(err))
  );
}

  // ================= 匯出 =================

  /**
   * 匯出 Excel（不分頁）
   * POST /TLS0000/TLS2000/exportTLS23010
   */
/** 匯出 Excel（不分頁） */
exportTLS23010Excel(body: TLS23010QueryRequest): Observable<HttpResponse<Blob>> {
  const url = `${this.apiUrl}/TLS0000/TLS2000/exportTLS23010`;
  const payload = this.stripPaging(body);

  return this.http.post(url, payload, {
    observe: 'response',
    // ⚠️ 針對你的型別多載：把 blob 斷言成 'json'
    responseType: 'blob' as 'json',
  }) as Observable<HttpResponse<Blob>>;
}

/** 匯出 PDF（不分頁） */
exportTLS23010PDF(body: TLS23010QueryRequest): Observable<HttpResponse<Blob>> {
  const url = `${this.apiUrl}/TLS0000/TLS2000/exportTLS23010PDF`;
  const payload = this.stripPaging(body);

  return this.http.post(url, payload, {
    observe: 'response',
    // ⚠️ 同上
    responseType: 'blob' as 'json',
  }) as Observable<HttpResponse<Blob>>;
}

  /**
   * 工具：移除分頁相關欄位（匯出不需要）
   * 保留 SortBy（讓後端可依前端排序）
   */
  private stripPaging<T extends Record<string, any>>(input: T): Omit<T, 'PageSize' | 'PageIndex' | 'OrderBy' | 'Offset'> {
    if (!input) return input as any;
    const { PageSize, PageIndex, OrderBy, Offset, ...rest } = input;
    return rest as any;
  }
}
