import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface fin55030request {
  VouDate_Start: string;
  VouDate_End: string;
  ORG_ID: string;
  AccNo_Start: string;
  AccNo_End: string;
  DetailNo_Start: string;
  DetailNo_End: string;
  PTA_Start: string;
  PTA_End: string;
  SubDetailNo: string;
  PostFlag: string;
  IsSubDetail: boolean;
}

export interface fin55030response {
  VouDate: string;
  VouNo: string;
  ORG_ID: string;
  DetailNo: string;
  NoteDesc: string;
  PTA: string;
  PTA1: number;
  PTA2: number;
}


@Injectable({
  providedIn: 'root'
})
export class Fin55030Service {
  // 立沖科目餘額表 gls3003(gls3002+gls3001)
  apiUrl: string = environment.ApiUrl + '/FIN0000/GLS1000';
  constructor(private http: HttpClient) { }

  // 查詢 gls3003 資料表
  queryFIN55030(body: fin55030request): Observable<ApiResponse<fin55030response[]>> {
    return this.http.post<ApiResponse<fin55030response[]>>(`${this.apiUrl}/queryFIN55030`, body);
  }

  // 匯出 gls3003 資料表 (PDF)
  exportFIN55030PDF(body: any): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/exportFIN55030PDF`, body, {
      responseType: 'blob'
    });
  }

  // 匯出 gls3003 資料表 (Excel)
  exportFIN55030Excel(body: any): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/exportFIN55030Excel`, body, {
      responseType: 'blob'
    });
  }
}
