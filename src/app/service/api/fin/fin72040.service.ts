import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface fin72040Data {
  RowType: number, // 列類型：0 = 明細列 (Detail), 2 = 總計列 (Total)
  IDX: number, // 主檔唯一識別碼 (POS2064M.id) 注意：RowType=2 (總計列) 時此欄位為 NULL
  SeqNo: number, // 顯示項次 (依請款單號及單號排序產生) 注意：RowType=2 (總計列) 時此欄位為 NULL
  RqstNo: string, // 支出請款單號 (格式：TC+YYYYMMDDXXXX)
  VoucherNo: string, // 傳票號碼 (已拋轉傳票後產生的編號)
  TotAmt: number, // 申請金額 當 RowType=0 時：為單筆零用金申請金額 當 RowType=2 時：為該請款單之「申請金額合計」
  PCS_Date: Date, // 零用金申請日期
  PCS_UsrNo: string, // 申請人員工編號
  PCS_UsrName: string // 申請人姓名 (關聯 tblUser 取得)
}

export interface FIN72040Response {
  Status: string;
  Data: {
    Detail: fin72040Data[];
    Total: fin72040Data;
  }
  Error: {
    Code: string;
    Message: string;
    Details: string;
  },
  Message: string;
  TotalCount: number;
  TotalPage: number;
}

export interface FIN72040Reim {
  Status: string;
  Error: {
    Code: string;
    Message: string;
    Details: string;
  },
  Message: string;
  TotalCount: number;
  TotalPage: number;
}

@Injectable({
  providedIn: 'root'
})
export class Fin72040Service {
  // 零用金撥補作業
  apiUrl: string = environment.ApiUrl + '/FIN0000/FIN70000';
  constructor(private http: HttpClient) { }
  // 查詢 零用金撥補作業
  queryFIN72040(body: any): Observable<FIN72040Response> {
    return this.http.post<FIN72040Response>(`${this.apiUrl}/queryFIN72040`, body);
  }

  // 撥補 零用金撥補作業
  reimFIN72040(body: any): Observable<FIN72040Reim> {
    return this.http.post<FIN72040Reim>(`${this.apiUrl}/reimFIN72040`, body);
  }

  // 支出請款單號 下拉 (POS2064MPCS_RqstNoDropDownList)
  POS2064MPCS_RqstNoDropDownList(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/POS2064MPCS_RqstNoDropDownList`, body);
  }
}
