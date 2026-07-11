import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ASS21020Data, ASS21020Delete, ASS21020Query, ASS21020Update, ASS21020UpdateStatus } from '@pages/ass/ass21020/ass21020.model';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

const apiUrl: string = environment.ApiUrl + '/ASS0000/ASS2000';

/** 錶號位置資訊 */
export interface ENG1001Location {
  Mid: number;
  SYS_StoreNo: string;
  ENG_Type: string;
  ENG_MeterNo: string;
  Location_No: string;
  Building_No: string;
  Building_Desc: string;
  Floor_No: string;
  Floor_Desc: string;
  Draw_X: number | null;
  Draw_Y: number | null;
  NET_SPACE: number | null;
}

/** 未設定專櫃清單 */
export interface TLTUnset {
  TLT_No: string;
  TLT_Name: string;
  TLT_bdate: string | null;
  TLT_edate: string | null;
  Water_Flag: string;
  Electric_Flag: string;
  Gas_Flag: string;
  Apply_No: string;
}

@Injectable({ providedIn: 'root' })
export class ASS21020Service {

  constructor(
    private http: HttpClient,
  ) { }

  /**
   * 查詢 ASS21020 數據，並在 Service 層處理 dataKey 的生成。
   * @param query 查詢條件
   * @returns 包含 EnhancedASS21020Data 陣列的回應 Observable
   */
  public queryASS21020(query: ASS21020Query): Observable<ApiResponse<ASS21020Data[]>> {
    // 呼叫 HTTP POST 請求
    return this.http.post<ApiResponse<ASS21020Data[]>>(`${apiUrl}/queryASS21020`, query).pipe(
      // 使用 map 操作符來轉換服務器的回應
      map(res => {
        // 處理 Data 陣列，為每個項目添加 dataKey
        const enhancedData: ASS21020Data[] = res.Data.map(item => ({
          ...item,
          // 邏輯已從 Component 移到此處
          dataKey: item.ENG_MeterNo + '-' + item.ENG_Type
        }));

        // 返回包含增強數據的新回應對象，TotalCount 保持不變
        return {
          ...res,
          Data: enhancedData
        } as ApiResponse<ASS21020Data[]>;
      })
    );
  }

  public updateASS21020(payload: ASS21020Update): Observable<ASS21020UpdateStatus> {
    return this.http.post<ASS21020UpdateStatus>(`${apiUrl}/updateASS21020`, payload)
  }

  public deleteASS21020(payload: ASS21020Delete): Observable<ASS21020UpdateStatus> {
    return this.http.post<ASS21020UpdateStatus>(`${apiUrl}/deleteASS21020`, payload)
  }
}
