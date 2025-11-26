import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseQueryRequest, BaseQueryResponse } from '@shared/models/api/base-api.interface';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

// 查詢請求介面
export interface QueryFIN29060Request extends BaseQueryRequest {
  STO_No?: string;                    // 門市編號
  VEN_No_From?: string;               // 廠商編號起
  VEN_No_To?: string;                 // 廠商編號迄
  ODM_Date_From?: string;             // 立帳日期起
  ODM_Date_To?: string;               // 立帳日期迄
  PayRefDate_From?: string;           // 開票/匯款日期起
  PayRefDate_To?: string;             // 開票/匯款日期迄
  AccNo_From?: string;                // 科目代號起
  AccNo_To?: string;                  // 科目代號迄
  ACP_Desc?: string;                  // 應付帳款描述
  ShowUnpaid?: boolean;               // 顯示未付款
  ShowZeroBalance?: boolean;          // 顯示零餘額
}

// 查詢結果資料介面
export interface FIN29060Data {
  ACP_No: string;                     // 應付帳款編號
  VendorNo: string;                   // 廠商編號
  VendorName: string;                 // 廠商名稱
  AccNo: string;                      // 會計科目
  PostDate: string;                   // 立帳日期
  ACP_Amt: number;                    // 立帳金額
  Summary: string;                    // 摘要
  PayAmt: number;                     // 付款金額
  PayRefDate: string;                 // 開票/匯款日期
  BalanceAmt: number;                 // 帳款餘額
  PaymentNo: string;                  // 電匯/開票/單號
  VoucherNo: string;                  // 傳票號碼
}


@Injectable({ providedIn: 'root' })
export class FIN29060Service {
  private apiUrl = environment.ApiUrl + '/FIN0000/APS1000';

  constructor(private http: HttpClient) { }
  queryFIN29060(data: QueryFIN29060Request): Observable<BaseQueryResponse<FIN29060Data>> {
    return this.http.post<BaseQueryResponse<FIN29060Data>>(`${this.apiUrl}/queryFIN29060`, data);
  }
  queryFIN29060Detail(data: QueryFIN29060Request): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/queryFIN29060Detail`, data, {
      observe: 'response',
      responseType: 'blob'
    });
  }
  exportFIN29060_Excel(data: QueryFIN29060Request): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/exportFIN29060_Excel`, data, {
      observe: 'response',
      responseType: 'blob'
    });
  }
}
