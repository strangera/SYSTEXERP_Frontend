import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseQueryRequest, BaseQueryResponse } from '@shared/models/api/base-api.interface';
import { environment } from '../../../../environments/environment';
import { Observable, of } from 'rxjs';

// Query request interface for FIN11070
export interface FIN11070QueryRequest extends BaseQueryRequest {
  MID: number;                      // 固定為0
  SYS_StoreNo: string;             // 固定為 '10'
  GUI_YYMM: number;                // 申報年月 (YYMM格式)
}

// Data result interface for FIN11070 (空白發票上傳紀錄)
export interface FIN11070Data {
  SYS_StoreNo: string;             // 分店編號
  TXN_No: number;                  // 發票年月
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
  queryFIN11070(data: FIN11070QueryRequest): Observable<BaseQueryResponse<FIN11070Data>> {
    return this.http.post<BaseQueryResponse<FIN11070Data>>(`${this.apiUrl}/queryFIN11070`, data);

    // 測試用假資料 (可在開發時使用)
    return of({
      Status: '0000',
      Data: [
        {
          SYS_StoreNo: '10',
          TXN_No: 1,
          TXN_Time: '2025-08-28T07:39:37.159Z',
          TXN_ProcStatus: 'Y',
          TXN_RspnTime: '2025-08-28T07:39:37.159Z',
          TXN_RspnCode: '0000',
          TXN_RspnMsg: '成功'
        }
      ],
      Message: '',
      TotalCount: 1,
      TotalPage: 1
    });
  }

  // 寫入產製空白發票
  insertFIN11070(data: FIN11070InsertRequest): Observable<BaseQueryResponse<FIN11070InsertResponse>> {
    return this.http.post<BaseQueryResponse<FIN11070InsertResponse>>(`${this.apiUrl}/insertFIN11070`, data);
  }

  // 下載空白發票檔案
  downloadFIN11070(data: FIN11070DownloadRequest): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/downloadFIN11070`, data, {
      responseType: 'blob',
      observe: 'response'
    });
  }
}
