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
  STO_No: string,
  NOT_No: string,
  NOT_Date: string,
  NOT_BegDate: string,
  NOT_EndDate: string,
  NOT_File: string,
  NOT_Status: string,
  NOT_Priority: number,
  NOT_DtlLimit: string,
  NOT_PlayTime: number,
  NOT_Note: string,
  Details: Tls43010Detail[]
}
export interface IUTls43010Request {
  ID?: number, // 編輯用
  NOT_No: string,
  NOT_Date: string | Date | null,
  NOT_BegDate: string | Date | null,
  NOT_EndDate: string | Date | null,
  NOT_Priority: number,
  NOT_Status: string,
  NOT_PlayTime: number,
  NOT_DtlLimit: string,
  NOT_File: string,
  NOT_Note: string,
  Detail: Tls43010Detail[]
}

export interface Tls43010Detail {
  ID?: number, // 編輯用
  NOT_SeqNo: number,
  ECR_No: string,
  TLT_No: string,
  ECR_Type: string,
  ECR_GrpNo: string,
  BUILDING_No: string,
  FLOOR_No: string,
  Area_No: string,
  status: string
  [key: string]: any
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
  queryTLS43010(body: QueryTls43010Request): Observable<ApiResponse<QueryTls43010Response>> {
    return this.http.post<ApiResponse<QueryTls43010Response>>(`${this.apiUrl}/queryTLS43010`, body);
  }

  deleteTLS43010(idList: number[]): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(`${this.apiUrl}/deleteTLS43010`, { idList });
  }

  insertTLS43010(data: IUTls43010Request): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(`${this.apiUrl}/insertTLS43010`, data);
  }

  updateTLS43010(data: IUTls43010Request): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(`${this.apiUrl}/updateTLS43010`, data);
  }
}
