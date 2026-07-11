import { ApiRequest, ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

// --- FIN15060 查詢參數 Model 定義 ---
export interface FIN15060QueryRequest extends ApiRequest {
  INV_YM: string;                     // 申報年月
  STO_TaxNo: string;                  // 稅籍編號
}

// --- FIN15060 回應資料 Model 定義 ---
export interface FIN15060Data {
  INV_DeclareYM: string;              // 所屬年月份
  INV_GUIDate: string;                // 開立發票日期
  INV_GUINo: string;                  // 字軌號碼
  INV_Name: string;                   // 買受人名稱
  TXN_Uniform: string;                // 買受人統一編號
  GoodsOrServicesName: string;        // 貨物或勞務名稱
  GoodsQty: number;                   // 數量
  ExportMethod: string;               // 外銷方式
  INV_DocName: string;                // 證明文件名稱
  INV_DocNo: string;                  // 證明文件號碼
  NonCustomsExportAmt: number;        // 非經海關出口金額
  INV_ExportType: string;             // 出口報單類別
  INV_ExportNo: string;               // 出口報單號碼
  CustomsExportAmt: number;           // 經海關出口金額
  ExportDate: string;                 // 輸出或結匯日期
}

// --- 列印請求參數 Model 定義 ---
export interface FIN15060PrintRequest {
  INV_YM: string;                     // 申報年月
  STO_TaxNo: string;                  // 稅籍編號
}

@Injectable({
  providedIn: 'root'
})
export class FIN15060Service {
  private apiUrl: string = environment.ApiUrl + '/FIN0000/INV1000';

  constructor(private http: HttpClient) { }

  // 查詢
  queryFIN15060(data: FIN15060QueryRequest): Observable<ApiResponse<FIN15060Data[]>> {
    return this.http.post<ApiResponse<FIN15060Data[]>>(`${this.apiUrl}/queryFIN15060`, data);
  }

  // 產出零稅率銷售額清單
  printFIN15060(data: FIN15060PrintRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/printFIN15060`, data);
  }
}
