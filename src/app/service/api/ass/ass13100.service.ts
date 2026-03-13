import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  ASS13100CloseRequest,
  ASS13100DeleteRequest,
  ASS13100DetailResponse,
  ASS13100GenerateRequest,
  ASS13100GenerateResponse,
  ASS13100PrintRequest,
  ASS13100QueryRow,
  ASS13100UpdateRequest,
  QueryASS13100Request,
} from '@pages/ass/ass13100/ass13100.model';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ASS13100Service {
  /** ASS 資產管理共用 API Prefix（暫依其他 ASS12xx Service 規則） */
  private readonly apiUrl = `${environment.ApiUrl}/ASS0000/ASS1000`;

  constructor(private readonly http: HttpClient) {}

  /**
   * 查詢清點單
   */
  queryASS13100(body: QueryASS13100Request): Observable<ApiResponse<ASS13100QueryRow[]>> {
    return this.http.post<ApiResponse<ASS13100QueryRow[]>>(`${this.apiUrl}/queryASS13100`, body);
  }

  /**
   * 產生清點單（新增）
   */
  insertASS13100(body: ASS13100GenerateRequest): Observable<ApiResponse<ASS13100GenerateResponse>> {
    return this.http.post<ApiResponse<ASS13100GenerateResponse>>(`${this.apiUrl}/insertASS13100`, body);
  }

  /**
   * 取得單筆清點單明細（編輯 / 明細頁）
   */
  detailASS13100(inventoryNo: string): Observable<ApiResponse<ASS13100DetailResponse>> {
    return this.http.post<ApiResponse<ASS13100DetailResponse>>(`${this.apiUrl}/detailASS13100`, { InventoryNo: inventoryNo });
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
   * 清點單結案
   */
  closeASS13100(body: ASS13100CloseRequest): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(`${this.apiUrl}/closeASS13100`, body);
  }

  /**
   * 列印盤點表
   */
  printASS13100(body: ASS13100PrintRequest): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/printASS13100`, body, {
      observe: 'response',
      responseType: 'blob',
    });
  }

  /**
   * 上傳盤點機檔案
   *
   * 後端正式 API 規格尚未定稿，先以 FormData + 區間參數預留呼叫方式。
   */
  uploadASS13100DeviceFile(file: File, inventoryNoFrom: string, inventoryNoTo: string): Observable<ApiResponse<unknown>> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    formData.append('InventoryNoFrom', inventoryNoFrom);
    formData.append('InventoryNoTo', inventoryNoTo);

    return this.http.post<ApiResponse<unknown>>(`${this.apiUrl}/uploadASS13100DeviceFile`, formData);
  }
}

