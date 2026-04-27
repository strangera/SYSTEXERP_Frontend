import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Fin73010data {
  "SeqNo": number, // 序號
  "PCS_No": string, // 零用金單號
  "PCS_Date": Date, // 零用金申請日期
  "PCS_UsrNo": string, // 零用金申請人員代碼
  "PCS_UsrName": string, // 零用金申請人員姓名
  "PCS_OrgID": string, // 零用金申請人員組織代碼
  "PCS_OrgName": string, // 零用金申請人員組織名稱
  "Keep_UsrNo": string, // 零用金保管人代碼
  "Keep_UsrName": string, // 零用金保管人姓名
  "Keep_OrgID": string, // 零用金保管人組織代碼
  "Keep_OrgName": string, // 零用金保管人組織名稱
  "PCS_Status": string, // 單據狀態
  "PCS_StatusName": string, // 單據狀態名稱
  "PCS_RqstNo": string, // 支出請款單號
  "PCS_SeqNo": number, // 項次
  "AccNo": string, // 費用會計科目編號
  "AccName": string, // 費用會計科目名稱
  "NOTeDesc": string, // 項目摘要
  "PCS_DtlType": string, // 明細類別
  "PCS_DtlTypeName": string, // 明細類別名稱
  "PCS_GUINo": string, //發票 / 收據號碼
  "ORG_ID": string, // 費用科目組織代碼
  "Dtl_OrgName": string, // 費用科目組織名稱
  "PUR_Date": Date, // 憑證日期
  "PCS_Net": number, // 未稅金額
  "PCS_Tax": number, // 稅額
  "PCS_Amt": number, // 含稅金額
  "RowTypeDesc": string, // 列別說明
  "RowType": number // 列別 (0=明細 1=小計 2=總計)
}

export interface FIN73010Response {
  Status: string;
  Data: Fin73010data[]; // 查詢結果資料陣列
  Error: {
    Code: string;
    Message: string
    Details: string;
  }
  Message: string;
  TotalCount: number; // 總筆數
  TotalPage: number; // 總頁數
}

export interface POS2064MPC_Response {
  Status: string;
  Data: POS2064MPC[];
  Error: {
    Code: string;
    Message: string;
    Details: string;
  },
  TotalCount: number,
  TotalPage: number
}

export interface POS2064MPC {
  PCS_No: string;
  PCS_Date: string;
  PCS_UsrNo: string;
}


@Injectable({ providedIn: 'root' })
export class FIN73010Service {
  // FIN73010-零用金支付表
  apiUrl: string = environment.ApiUrl + '/FIN0000/FIN70000';
  constructor(private http: HttpClient) { }

  // 零用金單號 下拉選單
  queryPOS2064MPCS_NoDropDownList(body: any): Observable<POS2064MPC_Response> {
    return this.http.post<POS2064MPC_Response>(`${this.apiUrl}/queryPOS2064MPCS_NoDropDownList`, body);
  }


  // 查詢 零用金支付表
  queryFIN73010(body: any): Observable<FIN73010Response> {
    return this.http.post<FIN73010Response>(`${this.apiUrl}/queryFIN73010`, body);
  }

  // 匯出 零用金支付表 PDF
  exportPDFFIN73010(body: any): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/exportPDFFIN73010`, body, { responseType: 'blob' });
  }

  // 匯出 零用金支付表 Excel
  exportExcelFIN73010(body: any): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/exportExcelFIN73010`, body, { responseType: 'blob' });
  }
}