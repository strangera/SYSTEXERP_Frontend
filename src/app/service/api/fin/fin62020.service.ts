import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface Fin62020ApiResult extends ApiResponse<Fin62020QueryResponseItem[]> {
  // 這裡的 Data: Fin62020QueryResponseItem[] 是繼承自 ApiResponse<T>

  // 手動加入後端 GrandTotal 和 Subtotals 的屬性到頂層
  GrandTotal: Fin62020QueryResponse['GrandTotal'];
  Subtotals: Fin62020QueryResponse['Subtotals'];
}

export interface Fin62020QueryResponse {
  GrandTotal: Fin62020FooterData | null;
  QueryData: Fin62020QueryResponseItem[]
  Subtotals: Fin62020Subtotals[]
}

export interface Fin62020FooterData {
  Tran_Amt: number,
  Fee_Amt: number,
  Total_Amt: number
}

export interface Fin62020Subtotals {
  Tran_Amt: number,
  Fee_Amt: number,
  Total_Amt: number,
  Tran_Date: string
}

// 假設您的 API 回傳結構 (ApiResponse<T>) 已經在別處定義，
// 但為了獨立性，我們先定義回傳的資料模型 (Response Item)
export interface Fin62020QueryResponseItem {
  ID?: number;
  Tran_No?: string;
  BNK_No_In?: string;
  BNK_No_Out?: string;
  Tran_Amt: number; // 金額
  Fee_Amt?: number; // 手續費
  Remark?: string;
  Tran_Date?: string; // 建議使用 string 或 Date 物件
  Tran_Status?: string;

  // 聯表欄位
  BNK_No_In_Name?: string;
  BNK_No_Out_Name?: string;

  // 計算欄位
  Total_Amt: number; // 合計 (Tran_Amt + Fee_Amt)

  // POS1032 報表備註欄位
  Report_Line1?: string;
  Report_Line2?: string;
  Report_Line3?: string;
  Report_Line4?: string;
  Report_Line5?: string;

  // 建立/更新資訊
  CRT_Date?: string;
  CRT_USR_Name?: string;
  // ... 其他欄位 (如 MID, VouNo 等)
}

// 假設查詢請求的資料結構 (QueryBase 包含分頁/排序)
export interface Fin62020QueryRequest {

  Tran_No?: string;
  BNK_No_In?: string;
  BNK_No_Out?: string;

  Tran_Date_Start?: string; // 建議使用 string
  Tran_Date_End?: string;
  CRT_Date_Start?: string;
  CRT_Date_End?: string;

  IsLoadRemark: boolean; // 是否讀取報表備註
}

@Injectable({
  providedIn: 'root'
})
export class Fin62020Service {
  private readonly baseUrl = `${environment.ApiUrl}/FIN0000/NTS1000`;


  constructor(
    private readonly http: HttpClient,
    private readonly datePipe: DatePipe
  ) { }

  /**
   * 1. 查詢 APS4001 銀行調撥資料
   * POST /FIN0000/NTS1000/queryFIN62020
   * @param data 查詢條件 (含分頁、排序)
   * @returns 返回查詢結果 (含資料列表與總筆數)
   */
  queryFIN62020(data: Fin62020QueryRequest): Observable<Fin62020ApiResult> {

    return this.http.post<ApiResponse<Fin62020QueryResponse>>(`${this.baseUrl}/queryFIN62020`, data).pipe(
      map(res => {

        // 關鍵：將 QueryData 賦值給頂層 Data 屬性，並加上 Subtotals/GrandTotal
        return {
          ...res, // 繼承 Status, TotalCount, TotalPage, Data (原始的 Fin62020QueryResponse)
          Data: res.Data.QueryData.map(item => ({
            ...item,
            Tran_Date: this.datePipe.transform(item.Tran_Date, 'yyyy-MM-dd'),
          })),
          Subtotals: res.Data.Subtotals.map(item => ({
            ...item,
            Tran_Date: this.datePipe.transform(item.Tran_Date, 'yyyy-MM-dd'),
          })),
          GrandTotal: res.Data.GrandTotal
        } as Fin62020ApiResult; // 強制轉換為我們期望的類型
      })
    ) as Observable<Fin62020ApiResult>; // 確保整個 Observable 流的類型正確
  }
}
