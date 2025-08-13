import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { BaseQueryRequest, BaseQueryResponse } from '@shared/models/api/base-api.interface';

// Query request interface for TLS26020
export interface TLS26020QueryRequest extends BaseQueryRequest {
  Sale_DateStart?: string;      // 銷售日期(起) - ISO 8601 格式
  Sale_DateEnd?: string;        // 銷售日期(訖) - ISO 8601 格式
  tlt_building?: string[];      // 館別
  Org_ID?: string[];            // 組織代號
  Org_Name?: string;            // 組織名稱
  tlt_floor?: string[];         // 樓層
}

// 預售總表明細查詢條件
export interface TLS26020DetailRequest {
  tlt_no: string;               // 專櫃編號
  Sale_DateStart: string;      // 銷售日期(起) - ISO 8601 格式
  Sale_DateEnd: string;        // 銷售日期(訖) - ISO 8601 格式
}

// Data result interface for TLS26020 (預售總表資料)
export interface TLS26020Data {
  tlt_no: string;               // 專櫃編號
  tlt_name: string;             // 櫃位名稱
  txn_TotGUI: number;           // 發票總數
  txn_TotSaleAmt: number;       // 銷售總金額
  details?: TLS26020DetailData[]; // 展開的詳細資料
}

// 預售總表明細回應資料
export interface TLS26020DetailData {
  TXN_DATE: string;             // 交易日期 - ISO 8601 格式
  ECR_NO: string;               // 收銀機號
  TXN_NO: number;               // 交易序號
  TXN_GUIBegNo_Pre: string;     // 發票起號前綴
  TXN_GUIBegNo: string;         // 發票起號
  TXN_GUIEndNo: string;         // 發票迄號
  TXN_TotGUI: number;           // 發票總數
  TXN_TotSaleAmt: number;       // 銷售總金額
}

@Injectable({
  providedIn: 'root'
})
export class TLS26020Service {
  private apiUrl = environment.ApiUrl + '/TLS0000/TLS2000';

  constructor(private http: HttpClient) { }

  // 查詢預售總表
  queryTLS26020(data: TLS26020QueryRequest): Observable<BaseQueryResponse<TLS26020Data>> {
    return this.http.post<BaseQueryResponse<TLS26020Data>>(`${this.apiUrl}/queryTLS26020`, data);

    // 回傳假資料
    return new Observable<BaseQueryResponse<TLS26020Data>>(observer => {
      const response: BaseQueryResponse<TLS26020Data> = {
        Data: [
          {
            tlt_no: '001',
            tlt_name: '櫃位A',
            txn_TotGUI: 100,
            txn_TotSaleAmt: 50000,
            details: [
              {
                TXN_DATE: '2023-10-01T00:00:00Z',
                ECR_NO: 'ECR001',
                TXN_NO: 123456,
                TXN_GUIBegNo_Pre: 'A',
                TXN_GUIBegNo: '0001',
                TXN_GUIEndNo: '0100',
                TXN_TotGUI: 100,
                TXN_TotSaleAmt: 50000
              }
            ]
          }
        ],
        TotalCount: 1,
        Status: '',
        Message: '',
        TotalPage: 1
      };
      observer.next(response);
      observer.complete();
    });

  }

  // 查詢預售總表明細
  queryTLS26020Detail(data: TLS26020DetailRequest): Observable<BaseQueryResponse<TLS26020DetailData>> {
    return this.http.post<BaseQueryResponse<TLS26020DetailData>>(`${this.apiUrl}/queryTLS26020_Detail`, data);

    // 回傳假資料
    return new Observable<BaseQueryResponse<TLS26020DetailData>>(observer => {
      const response: BaseQueryResponse<TLS26020DetailData> = {
        Data: [
          {
            TXN_DATE: '2023-10-01T00:00:00Z',
            ECR_NO: 'ECR001',
            TXN_NO: 123456,
            TXN_GUIBegNo_Pre: 'A',
            TXN_GUIBegNo: '0001',
            TXN_GUIEndNo: '0100',
            TXN_TotGUI: 100,
            TXN_TotSaleAmt: 50000
          },
          {
            TXN_DATE: '2023-10-01T00:00:00Z',
            ECR_NO: 'ECR001',
            TXN_NO: 123456,
            TXN_GUIBegNo_Pre: 'A',
            TXN_GUIBegNo: '0001',
            TXN_GUIEndNo: '0100',
            TXN_TotGUI: 100,
            TXN_TotSaleAmt: 50000
          },
          {
            TXN_DATE: '2023-10-01T00:00:00Z',
            ECR_NO: 'ECR001',
            TXN_NO: 123456,
            TXN_GUIBegNo_Pre: 'A',
            TXN_GUIBegNo: '0001',
            TXN_GUIEndNo: '0100',
            TXN_TotGUI: 100,
            TXN_TotSaleAmt: 50000
          }
        ],
        TotalCount: 1,
        Status: '',
        Message: '',
        TotalPage: 1
      };
      observer.next(response);
      observer.complete();
    });
  }
}