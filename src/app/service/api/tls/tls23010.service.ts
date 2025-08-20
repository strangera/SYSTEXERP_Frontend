import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
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

queryTLS23010Detail(body: {
  SYS_StoreNo: string;
  TXN_Date: string;   // 後端接受 ISO 字串即可
  ECR_No: string;
  TXN_No: number;
}): Observable<any[]> {
  const url = `${this.apiUrl}/TLS0000/TLS2000/queryTLS23010_Detail`;

  return this.http.post<BaseQueryResponse<any>>(url, body).pipe(
    map(r => r?.Data ?? []),                // 明細放在回應的 Data 陣列
    tap(list => console.log('📦 Detail count:', list?.length ?? 0)),
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
