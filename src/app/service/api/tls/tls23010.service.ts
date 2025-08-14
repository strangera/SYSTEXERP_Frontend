import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ErrorHandlerService } from '../../system/error-handler.service';
import { BaseQueryRequest, BaseQueryResponse } from '../../../shared/models/api/base-api.interface';

export interface TLS23010QueryRequest extends BaseQueryRequest {
  TXN_DateStart?: string;      // 交易日期起 (yyyy-MM-ddTHH:mm:ss)
  TXN_DateEnd?: string;        // 交易日期訖 (yyyy-MM-ddTHH:mm:ss)
  ECR_No?: string[];           // 收銀機號
  TXN_No_Start?: number;       // 交易序號(起)
  TXN_No_End?: number;         // 交易序號(迄)
  TLT_No?: string[];           // 專櫃編號
  TXN_GUIBegNo?: string;       // 發票起始號碼
  TXN_GUIEndNo?: string;       // 發票結束號碼
  TXN_Status?: string[];       // 交易狀態
  TXN_FlagStatus?: string[];   // 狀態旗標
  USR_No?: string;             // 收銀員編號
  TXN_PreOrderNo?: string;     // 預售/訂金編號
  TXN_PkngUID?: string;        // 停車卡號
  TXN_MemCard?: string;        // 會員卡號
  TXN_Uniform?: string;        // 統一編號
  TXN_GUILoveCode?: string;    // 愛心碼
  TXN_GUI_CarrType?: string[]; // 載具種類
  TXN_GUI_CarrId?: string;     // 載具號碼
  rece_yn?: 's' | '';          // 是否開立業主發票 (s/空)
  cash_yn?: 's' | '';          // 是否為業主收現 (s/空)
  tlt_building?: string;       // 館別
  tlt_floor?: string[];        // 樓層
  org_id?: string[];           // 組織代碼
}


export interface TLS23010Data {
  ID: number;                 // 流水號
  SYS_StoreNo: string;        // 店號
  TXN_Date: string;           // 交易日期 (ISO 字串，如 2025-08-14T03:52:25.282Z)
  ECR_No: string;             // 收銀機號
  TXN_No: number;             // 交易序號
  tlt_no: string;             // 專櫃編號
  tlt_name: string;           // 專櫃名稱
  TXN_Uniform: string;        // 統一編號
  TXN_GUIBegNo: string;       // 發票起始號碼 (交易層)
  gui_track: string;          // 發票字軌
  GUIBegNo: string;           // 發票號碼(起)
  GUIEndNo: string;           // 發票號碼(迄)
  TXN_TotGUI: number;         // 發票總金額
  TXN_TotSaleAmt: number;     // 銷售總額
  TXN_TotOver: number;        // 溢短金額(總計)
  TXN_VIP: string;            // VIP/會員識別
  TXN_Mode: string;           // 交易模式
  TXN_PreOrder: string;       // 是否為預售/訂金 (Y/N 或代碼)
  TXN_Status: string;         // 交易狀態代碼
  TXN_StatusName: string;     // 交易狀態名稱
  TXN_TaxFreeCertNo: string;  // 免稅證號
  TXN_Time: string;           // 交易時間 (ISO 字串)
  USR_No: string;             // 收銀員編號
  TXN_PreOrderNo: string;     // 預售/訂金編號
  ORG_TXN_Date: string;       // 原交易日期 (ISO 字串)
  ORG_ECR_No: string;         // 原收銀機號
  ORG_TXN_No: number;         // 原交易序號
  TXN_PkngUID: string;        // 停車卡號
  TXN_MemID: string;          // 會員 ID
  TXN_TotDisc: number;        // 折扣總額
  GUILoveStatus: string;      // 愛心捐狀態
  TXN_GUILoveCode: string;    // 愛心碼
  TXN_GUIRemark: string;      // 發票備註
  TXN_GUI_CarrType: string;   // 載具種類
  DonateType: string;         // 捐贈別
  TXN_GUI_CarrId: string;     // 載具號碼
  TXN_PrintTimes: number;     // 發票列印次數
  TXN_PrintGUI: string;       // 是否補印發票 (例: "s" 表示是)
}
@Injectable({
  providedIn: 'root'
})
export class TLS23010Service {
  private apiUrl: string = environment.ApiUrl;

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }
  

  queryTLS23010(body: any, displayMode: 'Detail' | 'Summary' = 'Detail'): Observable<any> {
    const url = `${this.apiUrl}/TLS0000/TLS2000/queryTLS23010`;

    return this.http.post<any>(url, body).pipe(
      tap(response => console.log(`🎯 TLS23010 ${displayMode} 查詢結果:`, response)),
      catchError((error) => this.errorHandler.handleError(error))
    );
  }

  // ✅ 新增：點展開才打的明細 API
  queryTLS23010Detail(body: {
    SYS_StoreNo: string;
    TXN_Date: string;
    ECR_No: string;
    TXN_No: number;
  }): Observable<any> {
    const url = `${this.apiUrl}/TLS0000/TLS2000/queryTLS23010_Detail`;
    return this.http.post<any>(url, body).pipe(
      tap(r => console.log('🎯 TLS23010 明細查詢結果:', r)),
      catchError(err => this.errorHandler.handleError(err))
    );
  }
    // ✅ 新增：彙總（不帶 PageSize/PageIndex）
  queryTLS23010Summary(body: any): Observable<any> {
    const url = `${this.apiUrl}/TLS0000/TLS2000/queryTLS23010_Summary`;
    return this.http.post<any>(url, body).pipe(
      tap(r => console.log('🎯 TLS23010 Summary 查詢結果:', r)),
      catchError(err => this.errorHandler.handleError(err))
    );
  }
}
