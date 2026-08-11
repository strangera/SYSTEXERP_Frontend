import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

//主查詢API回應
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

//明細API回應
export interface ass14010DetailResponse {
  Status: string;
  Data: ass14010detailData; // 資料列陣列
  Error: {
    Code: string;
    Message: string;
    Details: string;
  };
  Message: string;
  TotalCount: number;
  TotalPage: number;
}

export interface ass14010updateResponse {
  Status: string;
  Data: {
    O_MSGTYPE: string; // 訊息類型(S:成功 E:錯誤)
    O_MESSAGE: string; // 訊息內容
  }
  Error: {
    Code: string;
    Message: string;
    Details: string;
  };
  Message: string;
  TotalCount: number;
  TotalPage: number;
}

//查詢頁 主檔
export interface ass14010mainData {
  'ID': number;
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

//明細頁 主檔 + 明細
export interface ass14010detailData {
  'NTX_AMT': number; // 未稅金額
  'TX_AMT': number; // 稅額
  'AMT': number; // 含稅金額
  'Supplier': Ass14010Supplier[]; // 供應商資料
  'Details': Ass14010Items[]; //單據明細
}

// 供應商資料
export interface Ass14010Supplier {
  'RECEIPT_TYPE': string; // 單據種類(0發票 1收據)
  'RECEIPT_NO': string; // 發票號碼
  'RECEIPT_DATE': Date; // 發票日期
  'TICKET_DATE': Date; // 票據到期日
  'DEC_YM': string; // 申報年月(YYYYMM)
  'INV_FORMAT': string; // 發票格式
  'TAX_CODE': string; // 稅別
  'TAX_CODE_NAME'?: string; // 稅別名稱
  'REDU_CODE': string; // 扣抵別
  'REDU_CODE_NAME'?: string; // 扣抵別名稱

  'TICKET_BE': number; // 付款天數
  'TOTAL_AMT': number; // 發票總金額
  'TOTAL_NTX_AMT': number; // 未稅總金額
  'TOTAL_TX_AMT': number; // 稅額總金額
}

// 單據明細
export interface Ass14010Items {
  'TOKEN_NO': string; // 進貨單號 / 採購單號
  'NTX_AMT': number; // 單據未稅金額
  'TX_AMT': number; // 單據稅額
  'AMT': number; // 單據含稅金額
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
  queryDetailASS14010(body: any): Observable<ass14010DetailResponse> {
    return this.http.post<ass14010DetailResponse>(`${this.apiUrl}/queryDetailASS14010`, body);
  }

  // 新增 發票建檔作業
  insertASS14010(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/insertASS14010`, body);
  }

  // 更新 發票建檔作業
  updateASS14010(body: any): Observable<ass14010updateResponse> {
    return this.http.post<ass14010updateResponse>(`${this.apiUrl}/updateASS14010`, body);
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

  // 驗收單號
  queryFAASSCHKD_LIST_DropDownList(body: any): Observable<any> {
    return this.http.post<any>(`${environment.ApiUrl}/QueryFAASSCHKD_LIST_DropDownList`, body);
  }
}
