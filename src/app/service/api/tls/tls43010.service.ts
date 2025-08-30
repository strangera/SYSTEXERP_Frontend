import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ApiResponse } from './tls23030.service';
import { Observable } from 'rxjs';

export interface QueryTls43010Request {
  NOT_No: string,
  NOT_Date: string,
  NOT_BegDate_Start: string,
  NOT_BegDate_End: string,
  NOT_EndDate_Start: string,
  NOT_EndDate_End: string,
  NOT_File: string,
  NOT_Status: string,
}

export interface QueryTls43010Response {
  ID: number,
  NOT_No: string,               /*廣告案號，編號規則 NTM + 廣告日期YYMMDD + 流水號4碼，例如 MTN2401010001 */
  NOT_Date: string,             /*廣告日期*/
  NOT_BegDate: string,          /*有效開始日期時間*/
  NOT_EndDate: string,          /*有效結束日期時間*/
  NOT_Status: string,           /*狀態 0=未確認(未審核) 1=已確認(已審核) 2=已刪除*/
  NOT_Priority: number,   /*優先順序，預設值為0(在同一段時間的優先順序9-0, 9最優先)*/
  NOT_File: string,         /*媒體檔案名稱*/
  NOT_Note: string,         /*備註*/
  NOT_PlayTime: number,   /*媒體檔播放秒數，預設值為30*/
  NOT_DtlLimit: string,       /*是否限制播放條件，POS50012*/
  /*  0=不限制(預設值)*/
  /*  1=符合明細設定的機台才播放*/
  /*  2=不符合明細設定的機台才播放*/
  NOT_AprvDate: string,      /*核准日期 YYYY/MM/DD*/
  NOT_AprvUsrNo: string,    /*核准人員*/
  NOT_AprvUsrName: string,  /*核准人員姓名*/
  NOT_DelDate: string,      /*刪除日期 YYYY/MM/DD*/
  NOT_DelUsrNo: string,   /*刪除人員*/
  NOT_DelUsrName: string,  /*刪除人員姓名*/

  CRT_Date: string,      /*建立日期*/
  CRT_USR_No: string,   /*建立人員*/
  CRT_USR_Name: string,  /*建立人員姓名*/
  UPD_Date: string,     /*變更日期*/
  UPD_USR_No: string,   /*變更人員*/
  UPD_USR_Name: string,  /*變更人員姓名*/
}

@Injectable({
  providedIn: 'root'
})
export class Tls43010Service {
  private apiUrl = `${environment.ApiUrl}/TLS0000/TLS4000`;

  constructor(private http: HttpClient) { }

  /**
    * 查詢POS50011 廣告資訊設定檔 的 API 呼叫
    * @param body 統一的查詢請求物件 (QueryTls43010Request)
    * @returns 包含 QueryTls43010ApiResponse 結構的 API 回傳結果
    */
  queryTls43010(body: QueryTls43010Request): Observable<ApiResponse<QueryTls43010Response>> {
    return this.http.post<ApiResponse<QueryTls43010Response>>(`${this.apiUrl}/queryTls43010`, body);
  }
}
