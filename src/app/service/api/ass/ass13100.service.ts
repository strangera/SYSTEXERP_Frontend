import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  ASS13100ApproveRequest,
  ASS13100DeleteRequest,
  ASS13100ExportPDFRequest,
  ASS13100QueryRow,
  ASS13100UpdateRequest,
  InsertASS13100Request,
  InsertASS13100ResponseData,
  QueryDetailASS13100Request,
  QueryDetailASS13100ResponseData,
  QueryASS13100Request,
  UploadASS13100ResponseData,
} from '@pages/ass/ass13100/ass13100.model';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ASS13100Service {
  /** ASS 資產管理共用 API Prefix */
  private readonly apiUrl = `${environment.ApiUrl}/ASS0000/ASS1000`;

  constructor(private readonly http: HttpClient) {}

  /**
   * 查詢清點單
   */
  queryASS13100(body: QueryASS13100Request): Observable<ApiResponse<ASS13100QueryRow[]>> {
    return this.http.post<ApiResponse<ASS13100QueryRow[]>>(`${this.apiUrl}/queryASS13100`, body);
  }

  /**
   * 新增清點單（產生清點單）
   */
  insertASS13100(body: InsertASS13100Request): Observable<ApiResponse<InsertASS13100ResponseData>> {
    return this.http.post<ApiResponse<InsertASS13100ResponseData>>(`${this.apiUrl}/insertASS13100`, body);
  }

  /**
   * 取得單筆清點單明細（編輯 / 明細頁）
   */
  queryDetailASS13100(body: QueryDetailASS13100Request): Observable<ApiResponse<QueryDetailASS13100ResponseData>> {
    return this.http.post<ApiResponse<QueryDetailASS13100ResponseData>>(`${this.apiUrl}/queryDetailASS13100`, body);
  }

  /**
   * 修改清點單（確認按鈕）
   */
  updateASS13100(body: ASS13100UpdateRequest): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(`${this.apiUrl}/updateASS13100`, body);
  }

  /**
   * 刪除清點單（查詢頁多筆刪除）
   */
  deleteASS13100(body: ASS13100DeleteRequest): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(`${this.apiUrl}/deleteASS13100`, body);
  }

  /**
   * 清點單結案（approveASS13100）
   */
  approveASS13100(body: ASS13100ApproveRequest): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(`${this.apiUrl}/approveASS13100`, body);
  }

  /**
   * 匯出資產清點作業 PDF（exportPDFASS13100）
   */
  exportPDFASS13100(body: ASS13100ExportPDFRequest): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/exportPDFASS13100`, body, {
      observe: 'response',
      responseType: 'blob',
    });
  }

  /**
   * 上傳盤點機檔案
   */
  uploadASS13100(file: File, chkId: string): Observable<ApiResponse<UploadASS13100ResponseData>> {
    const formData = new FormData();
    formData.append('FILENAME', file.name);
    formData.append('CHK_ID', chkId);
    formData.append('File', file, file.name);

    return this.http.post<ApiResponse<UploadASS13100ResponseData>>(`${this.apiUrl}/uploadASS13100`, formData);
  }
  downloadASS13100CsvTemplate() {
  return this.http.get(
    `${this.apiUrl}/downloadASS13100CsvTemplate`,
    {
      responseType: 'blob',
    }
  );
}
}
