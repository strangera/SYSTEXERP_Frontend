import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface ass14010MainResponse {
  Status: string;
  Data: {
    QueryData: ass14010mainData[]; // 資料列陣列
    TotalRows: number;
    TotalPages: number;
  };
  Error: {
    Code: string;
    Message: string;
    Details: string;
  };
  TotalCount: number;
  TotalPage: number;
}

//ass14010mainData
export interface ass14010mainData {
  'ID': string;
  'RECEIPT_NO': string; // 發票/收據號碼
  'TOKEN_NO': string; // 進貨單號
  'RECEIPT_INS_ID': string; // 發票維護單號
  'SUPPLIER_ID': string; // 供應商代碼
  'SUPPLIER_NAME': string; // 供應商名稱
  'RECEIPT_TYPE': string; // 單據種類(0發票 1收據)
  'RECEIPT_TYPE_NAME': string; // 單據種類名稱
  'INV_FORMAT': string; // 發票格式
  'TAX_CODE': string; // 稅別
  'TAX_CODE_NAME': string; // 稅別名稱
  'NTX_AMT': number; // 未稅金額
  'TX_AMT': number; // 稅額
  'AMT': number; // 含稅金額
  'REDU_CODE': string; // 扣抵別
  'REDU_CODE_NAME': string; // 扣抵別名稱

  'RECEIPT_STATUS': string; // 狀態(1.可刪除 2.不可刪除)
  'RowNumber': number; // 分頁序號
}

@Injectable({
  providedIn: 'root'
})
export class Ass14010Service {
  // 發票建檔作業
  apiUrl: string = environment.ApiUrl + '/ASS0000/ASS1000';
  constructor(private http: HttpClient) { }

  // 查詢發票作業
  queryASS14010(body: any): Observable<ass14010MainResponse> {
    return this.http.post<ass14010MainResponse>(`${this.apiUrl}/queryASS14010`, body);
  }

  // 查詢發票作業 明細
  queryDetailASS14010(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryASS14010`, body);
  }

  // 新增 發票建檔作業
  insertASS14010(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/insertASS14010`, body);
  }

  // 更新 發票建檔作業
  updateASS14010(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/updateASS14010`, body);
  }

  // 刪除 發票建檔作業
  deleteASS14010(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/deleteASS14010`, body);
  }

  //匯出 查詢發票建檔作業PDF
  exportPDFASS14010(body: any): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/exportPDFASS14010`, body, { responseType: 'blob' });
  }

  //匯出請款單PDF
  exportPDFPaymentVoucher(body: any): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/exportPDFPaymentVoucher`, body, { responseType: 'blob' });
  }
}
