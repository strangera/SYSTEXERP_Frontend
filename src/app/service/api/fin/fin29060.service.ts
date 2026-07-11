import { ApiError, ApiMeta, ApiRequest } from '@shared/utils/rxjs-operators/validate-api-response';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

// 查詢請求介面
export interface QueryFIN29060Request extends ApiRequest {
  OrderBy?: string;                   // 排序欄位
  Offset?: number;                    // 偏移量
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
  ShowUnpaid?: boolean;               // 顯示未付款 (true=顯示, false=不顯示)
  ShowZeroBalance?: boolean;          // 顯示零餘額 (true=顯示, false=不顯示)
}

// 明細查詢請求介面
export interface QueryFIN29060DetailRequest {
  VouNo: string;                      // 傳票號碼
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
  PayVoucherNo: string;                  // 傳票號碼
  NotPayAmt: number;                  // 未付金額
}

// 總計資料介面
export interface FIN29060TotalData {
  VendorNo: string;                   // 廠商編號
  ACP_Amt_Subtotal: number;          // 立帳金額小計
  PayAmy_Subtotal: number;           // 付款金額小計
  NotPayAmt_Subtotal: number;        // 未付金額小計
  ACP_Amt_Total: number;             // 立帳金額總計
  PayAmy_Total: number;              // 付款金額總計
  NotPayAmt_Total: number;           // 未付金額總計
}

// 查詢回應資料結構
export interface FIN29060ResponseData {
  mainData: FIN29060Data[];           // 主要資料
  totalData: FIN29060TotalData[];     // 總計資料
}

// 自訂查詢回應介面
export interface FIN29060QueryResponse {
  Status: string;
  Data: FIN29060ResponseData;
  Error?: ApiError;
  Meta?: ApiMeta;
  Message: string;
  TotalCount: number;
  TotalPage: number;
}
@Injectable({ providedIn: 'root' })
export class FIN29060Service {
  private apiUrl = environment.ApiUrl + '/FIN0000/APS1000';

  constructor(private http: HttpClient) { }

  queryFIN29060(data: QueryFIN29060Request): Observable<any> {
    return this.http.post<FIN29060QueryResponse>(`${this.apiUrl}/queryFIN29060`, data).pipe(
      map(res => ({
        ...res,
        Data: res?.Data?.mainData ?? [],
        totalData: res?.Data?.totalData ?? [],
        TotalCount: res?.TotalCount ?? 0,
        TotalPage: res?.TotalPage ?? 0
      }))
    );
  }

  queryFIN29060Detail(data: QueryFIN29060DetailRequest): Observable<HttpResponse<Blob>> {
    return this.http.post(
      `${this.apiUrl}/queryFIN29060Detail`,
      data,
      { observe: 'response', responseType: 'blob' }
    );
  }

  exportFIN29060_Excel(data: QueryFIN29060Request): Observable<HttpResponse<Blob>> {
    return this.http.post(
      `${this.apiUrl}/exportFIN29060_Excel`,
      data,
      { observe: 'response', responseType: 'blob' }
    );
  }


  exportFIN29060_PDF(data: QueryFIN29060Request): Observable<HttpResponse<Blob>> {
    return this.http.post(
      `${this.apiUrl}/exportFIN29060_PDF`,
      data,
      { observe: 'response', responseType: 'blob' }
    );
  }
}
