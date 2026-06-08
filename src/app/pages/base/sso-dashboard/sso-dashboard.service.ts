import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export const ERP_SYSTEM_ID = 'ERP';

// 未來系統擴充在這，目前沒寫在資料庫
export const SYSTEM_CONFIG: Record<string, { color: string, order: number }> = {
  'ERP': { color: '#e98ab1', order: 1 }, // 商場營運 (左上)
  'CRM': { color: '#f3bc18', order: 2 }, // 行銷管理 (右上)
  'HR': { color: '#c6d914', order: 3 }, // 人資系統 (左下)
  'EIP': { color: '#4fbcec', order: 4 }, // EIP (右下)
};

// ==========================================
// 1. Data Models & Base Interfaces
// ==========================================
export interface ApiItem {
  System_Id: string;
  System_Name: string;
  System_Url: string;
  System_ImgFile: string;
  IsEnable?: string;
  Seq_No?: number;
  CRT_Date?: string;
  CRT_USR_No?: string;
  CRT_USR_Name?: string;
  UPD_Date?: string;
  UPD_USR_No?: string;
  UPD_USR_Name?: string; // 已修正原程式碼漏掉的逗號
  dynamicColor?: string;
  customOrder?: number;
}

export interface ApiError {
  Code: string;
  Message: string;
  Details: string;
}

export interface ApiMeta {
  Timestamp: string;
  RequestId: string;
}

// ==========================================
// 2. Request & Response Interfaces
// ==========================================

// POST /SSOLogin/querySSOLogin
export interface QuerySSOLoginReq {
  SystemName?: string;
  IsEnable?: string;
}
// GET /SSOLogin/Inner
export interface UserInfo {
  mid: number,
  id: number,
  user_No: string,
  user_Name: string,
  user_email: string,
  SYS_StoreNo: string,
  STR_Uniform: string,
  CompNo: string,
  USER_PwdExpireDate: string,
  AccessToken: string
}

// GET /SSOLogin/Outer
// (規格書寫 200 返回使用者資訊，401 返回 Problem Details 格式)
export type OuterLoginRes = Record<string, any>;

export interface OuterLoginErrorRes {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  [key: string]: any; // 對應 additionalProp1, additionalProp2...
}

export interface OuterTokenResponse {
  token: string;
  expiresAt: string;
  expiresInSeconds: number;
  tokenType: string;
}

// ==========================================
// 3. Service Implementation
// ==========================================
@Injectable({
  providedIn: 'root',
})
export class SsoDashboardService {
  private readonly apiUrl: string = environment.ApiUrl + '/SSOLogin';
  private readonly http = inject(HttpClient);
  /**
   * 查詢 SSO 系統資料
   */
  querySSOLogin(body: QuerySSOLoginReq = {}): Observable<ApiResponse<ApiItem[]>> {
    return this.http.post<ApiResponse<ApiItem[]>>(`${this.apiUrl}/querySSOLogin`, body);
  }
  /**
     * 高級封裝：獲取經過排序、過濾與顏色加工後的 SSO 清單 (包含寫死的 ERP)
     */
  getTransformedUrlList(body: QuerySSOLoginReq = {}): Observable<ApiItem[]> {
    return this.querySSOLogin(body).pipe(
      map(response => {
        // 1. 加工 API 回傳的資料
        const processedData = (response.Data || []).map(item => {
          const config = SYSTEM_CONFIG[item.System_Id] || { color: '#95a5a6', order: 99 };
          return {
            ...item,
            dynamicColor: config.color,
            customOrder: config.order
          };
        });

        // 2. 注入預設寫死的 ERP 系統
        const defaultErp: ApiItem = {
          System_Id: ERP_SYSTEM_ID,
          System_Name: '商場營運管理系統',
          System_Url: 'account/dashboard',
          System_ImgFile: 'TSRDERP',
          IsEnable: 'Y',
          Seq_No: 1,
          dynamicColor: SYSTEM_CONFIG[ERP_SYSTEM_ID].color,
          customOrder: SYSTEM_CONFIG[ERP_SYSTEM_ID].order,
        };

        // 3. 合併、過濾啟用狀態、並依自訂順序排序
        return [defaultErp, ...processedData]
          .filter(item => item.IsEnable === 'Y')
          .sort((a, b) => (a.customOrder ?? 99) - (b.customOrder ?? 99));
      })
    );
  }
  /**
   * Landing page 導向 內部網站 dashboard 時驗證 token 有效性
   */
  inner(): Observable<ApiResponse<UserInfo>> {
    return this.http.get<ApiResponse<UserInfo>>(`${this.apiUrl}/Inner`);
  }

  /**
   * Landing page 導向 外部網站 dashboard 時驗證 token 有效性
   * @param token 外部驗證用的 token
   */
  outer(token: string): Observable<OuterLoginRes> {
    // 根據規格書，Query 參數名稱為 token
    return this.http.get<OuterLoginRes>(`${this.apiUrl}/Outer`, {
      params: { token: token }
    });
  }

  // 獲取外部 Token
  getOuterToken(): Observable<OuterTokenResponse> {
    return this.http.get<OuterTokenResponse>(`${this.apiUrl}/getOuterToken`);
  }
}
