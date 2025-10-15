import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseQueryRequest, BaseQueryResponse } from '@shared/models/api/base-api.interface';
import { environment } from 'src/environments/environment';

// 查詢專櫃暫存傳票查詢作業 Request
export interface QueryTLS2C040Request extends BaseQueryRequest {
  SrcSheetTypeList?: string[];   // 傳票種類
  VouDate_Start?: string;        // 傳票日期(起)
  VouDate_End?: string;          // 傳票日期(迄)
  PostFlagList?: string[];       // 傳票狀態
  No?: string;                   // 結帳單號
}

// 更新GLS6001資料表 Request
export interface UpdateTLS2C040Request {
  id: number;
  Remark: string;
  GLS6002List: {
    id: number;
    NoteDesc: string;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class TLS2C040Service {
  private apiUrl = environment.ApiUrl + '/TLS0000/TLS2000';

  constructor(private http: HttpClient) { }

  // 查詢
  queryTLS2C040(req: QueryTLS2C040Request): Observable<BaseQueryResponse<any>> {
    return this.http.post<BaseQueryResponse<any>>(`${this.apiUrl}/queryTLS2C040`, req);
  }

  // 更新GLS6001資料表
  updateTLS2C040(req: UpdateTLS2C040Request): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/updateTLS2C040`, req);
  }
}