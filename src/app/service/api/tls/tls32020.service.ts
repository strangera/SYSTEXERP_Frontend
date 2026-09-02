import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface TLS32020QueryRequest {
  // 基準日期
  BaseDateFrom: string | null;
  BaseDateTo: string | null;
  // 比較日期
  CompareDateFrom: string | null;
  CompareDateTo: string | null;
  FloorList: string[] | null;
  AreaList: string[] | null;
  BuildingList: string[] | null;
  BusTypeList: string[] | null;
  BusClassList: string[][] | null;
  BusSClassList: string[][] | null;
  CounterKindList: string[] | null;
  OrgList: string[] | null;
  TalentNoList: string[] | null;
  TermTypeList: string[] | null;
  TaxMode: string;
  OwnerInvFlag: string;
  DayType: string;
  PreSale?: boolean;
  ConsumerNum?: boolean;
  ShowBuilding?: boolean;
}

export interface TLS32020Data {
  SeqNo: number,
  YM: string,
  Building: string,
  BuildingName: string,

  // ======================= 基準期 (Base) 欄位 =======================
  BaseTarget: number,
  BaseSale: number,
  BaseAchieveRate: number,
  BaseTxnCnt: number,
  BaseTicket: number,
  BasePyeff: number,
  BasePyContrib: number,
  BaseTltSpace: number,
  Base_PrePerformance: number,
  Base_ConsumerNum: number,
  Base_ConsumerOrder: number,

  // ======================= 比較期 (Compare) 欄位 =======================
  CompareTarget: number,
  CompareSale: number,
  CompareAchieveRate: number,
  CompareTxnCnt: number,
  CompareTicket: number,
  ComparePyeff: number,
  ComparePyContrib: number,
  CompareTltSpace: number,
  Comp_PrePerformance: number,
  Comp_ConsumerNum: number,
  Comp_ConsumerOrder: number,

  // ======================= 差異 (Difference) 欄位 =======================
  DiffAmt: number,
  GrowthRate: number,
  DiffTxn: number,
  DiffTicket: number,
  DiffPyeff: number,
  DiffPyContrib: number,
  DiffSquare: number,
  Diff_PrePerformance: number,
  Diff_ConsumerNum: number,
  Diff_ConsumerOrder: number,

  // ======================= 狀態 欄位 =======================
  BasePreOrderAmt?: number; // 預售業績（舊欄位，SP 保留相容，值與 Base_PrePerformance 相同）
}

@Injectable({
  providedIn: 'root'
})
export class TLS32020Service {
  private apiUrl: string = environment.ApiUrl + '/TLS0000/TLS3000';

  constructor(private http: HttpClient) { }

  queryTLS32020(body: TLS32020QueryRequest) {
    return this.http.post<ApiResponse<TLS32020Data[]>>(this.apiUrl + '/queryTLS32020', body);
  }
  exportTLS32020PDF(
    body: TLS32020QueryRequest
  ): Observable<HttpResponse<Blob>> { // 將回傳類型改為 HttpResponse<Blob>
    return this.http.post(
      `${this.apiUrl}/exportTLS32020PDF`,
      body,
      {
        observe: 'response',
        responseType: 'blob'
      }
    );
  }
  /**
   * 匯出進貨/退貨單據統計報表 (Excel) 的 API 呼叫
   * 請求參數與查詢介面 (QueryTLS32020Request) 相同
   * @param body 統一的匯出請求物件 (QueryTLS32020Request)
   * @returns 包含 Excel 檔案的 Blob 物件
   */
  exportTLS32020Excel(
    body: TLS32020QueryRequest
  ): Observable<HttpResponse<Blob>> { // 將回傳類型改為 HttpResponse<Blob>
    return this.http.post(
      `${this.apiUrl}/exportTLS32020Excel`,
      body,
      {
        observe: 'response',
        responseType: 'blob'
      }
    );
  }
}
