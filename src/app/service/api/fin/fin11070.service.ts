import { ApiRequest, ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable, of } from 'rxjs';

// Query request interface for FIN11070
export interface FIN11070QueryRequest extends ApiRequest {
  MID: number;                      // 固定為0
  SYS_StoreNo: string;             // 固定為 '10'
  GUI_YYMM: string;                // 申報年月 (YYMM格式)
}

// Data result interface for FIN11070 (空白發票上傳紀錄)
export interface FIN11070Data {
  SYS_StoreNo: string;             // 分店編號
  TXN_No: string;                  // 發票年月
  TXN_GUINO: string;               // 發票字軌
  TXN_Time: string;                // 預計處理時間
  TXN_ProcStatus: string;          // 處理狀態
  TXN_RspnTime: string;            // 實際處理時間
  TXN_RspnCode: string;            // 回應代碼
  TXN_RspnMsg: string;             // 回應訊息
}

// Insert request interface for FIN11070
export interface FIN11070InsertRequest {
  MID: number;                     // 固定為0
  SYS_StoreNo: string;            // 分店編號
  GUI_YYMM: string;               // 申報年月
}

// Insert response interface for FIN11070
export interface FIN11070InsertResponse {
  Errormsg: string;               // 錯誤訊息
  Status: string;                 // 狀態
}

// Download request interface for FIN11070
export interface FIN11070DownloadRequest {
  MID: number;                    // 固定為0
  STO_No: string;                 // 店舖編號
  GUI_YYMM: string;              // 申報年月
}

@Injectable({
  providedIn: 'root'
})
export class FIN11070Service {
  private apiUrl = environment.ApiUrl + '/FIN0000/INV1000';

  constructor(private http: HttpClient) { }

  // 查詢空白發票上傳紀錄
  queryFIN11070(data: FIN11070QueryRequest): Observable<ApiResponse<FIN11070Data[]>> {
    return this.http.post<ApiResponse<FIN11070Data[]>>(`${this.apiUrl}/queryFIN11070`, data);

  }

  // 寫入產製空白發票
  insertFIN11070(data: FIN11070InsertRequest): Observable<ApiResponse<FIN11070InsertResponse[]>> {
    return this.http.post<ApiResponse<FIN11070InsertResponse[]>>(`${this.apiUrl}/insertFIN11070`, data);
  }

  // 下載空白發票檔案
  downloadFIN11070(data: FIN11070DownloadRequest): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/downloadFIN11070`, data, {
      responseType: 'blob',
      observe: 'response'
    });
  }
}
