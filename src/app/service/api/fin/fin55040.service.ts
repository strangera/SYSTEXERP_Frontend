import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface fin55040request {
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

// 攤平後的
export interface fin55040response {
  PTA: string;
  VouNo: string;
  AccNo: string;
  AccCName: string;
  NoteDesc: string;
  PTA1: number;
  PTA2: number;
  PTA3: number;
}

// 明細 Row
export interface FIN55040Detail {
  PTA: string;
  VouNo: string;
  AccNo: string;
  AccCName: string;
  NoteDesc: string;
  PTA1: number;
  PTA2: number;
  PTA3: number;
}

// 巢狀父資料（包含 data 與 summary）
export interface FIN55040Data {
  AccNo: string;
  AccCName: string;
  data: FIN55040Detail[];
  summary: { PTA1_Total: number; PTA2_Total: number; PTA3_Total: number; };
}


@Injectable({
  providedIn: 'root'
})
export class Fin55040Service {
  // 立沖科目明細表 gls3003(LF_gls3002 + LF_gls3001)
  apiUrl: string = environment.ApiUrl + '/FIN0000/GLS1000';
  constructor(private http: HttpClient) { }

  // 查詢 gls3003 資料表
  queryFIN55040(body: fin55040request): Observable<ApiResponse<FIN55040Data[]>> {
    return this.http.post<ApiResponse<FIN55040Data[]>>(`${this.apiUrl}/queryFIN55040`, body);
  }

  // 匯出 gls3003 資料表 (PDF)
  exportFIN55040PDF(body: any): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/exportFIN55040PDF`, body, {
      responseType: 'blob'
    });
  }

  // 匯出 gls3003 資料表 (Excel)
  exportFIN55040Excel(body: any): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/exportFIN55040Excel`, body, {
      responseType: 'blob'
    });
  }
}
