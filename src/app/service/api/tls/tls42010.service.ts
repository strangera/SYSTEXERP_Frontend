import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from './tls25030.service';
// ----------------------------------------------------------------
// 2. 實體資料型態 (Entities)
// ----------------------------------------------------------------

/** 主檔 POS1004M 資料型態 */
export interface POS1004Master {
  id: number;
  mid: number;
  ECR_KBType: string;
  USR_Level: string;
  ECR_KBDesc: string;
  TSB_Name: string;
  crt_date: string;
  crt_usr_no: string;
  crt_usr_name: string;
  upd_date: string;
  upd_usr_no: string;
  upd_usr_name: string;
  kg_keypage?: number; // 根據元件邏輯補上
}

/** 明細 POS1004 資料型態 */
export interface POS1004Detail {
  ID?: number;
  MID?: number;
  ECR_KBType: string;
  USR_Level: string;
  KB_ScanCode: string;
  KB_Func?: string;
  KB_Arg1?: string;
  KB_Arg2?: string;
  KB_Arg3?: string;
  KB_Display1?: string;
  KB_Display2?: string;
  KB_Font?: string;
  KB_Size?: number;
  KB_Fonttyped?: string;
  KB_Style?: string;
  KB_Switch?: string;
  KB_Width?: number;
  KB_Height?: number;
  KB_Merge?: string;
  KB_Color?: string;
  KB_FontColor?: string;
  KB_KeyPage: number;
  CRT_Date?: string;
  CRT_USR_No?: string;
  CRT_USR_Name?: string;
  UPD_Date?: string;
  UPD_USR_No?: string;
  UPD_USR_Name?: string;
  TSB_Name?: string;
}

/** 下拉選單資料型態 */
export interface USRLevelOption {
  keyUSR_Level: string,
  valueUSR_Level: string,
  ECR_KBType: string,
  ECR_KBDesc: string,
}

export interface KBFuncOption {
  KB_Func: string;
  KB_Desc: string;
}

// ----------------------------------------------------------------
// 3. Request Payloads
// ----------------------------------------------------------------

export interface Tls42010MQuery {
  pageSize?: number;
  pageIndex?: number;
  USR_Level?: string;
  ECR_KBDesc?: string;
  SortBy?: { field: string; order: number }[];
}

export interface Tls42010DetailQuery {
  USR_Level: string[];
}

export interface Tls42010InsertPayload {
  ECR_KBType: string;
  USR_Level: string;
  ECR_KBDesc: string;
  TSB_Name: string;
  POS1004Disc: POS1004Detail[];
}

export interface Tls42010UpdatePayload {
  ID: number;
  ECR_KBType: string;
  USR_Level: string;
  ECR_KBDesc: string;
  TSB_Name: string;
  POS1004: POS1004Detail[];
}

export interface Tls42010DropdownReq {
  USR_Level?: string[];
  KB_Func?: string[];
}

// ----------------------------------------------------------------
// 4. Service Implementation
// ----------------------------------------------------------------

@Injectable({
  providedIn: 'root'
})
export class Tls42010Service {
  private apiUrl = `${environment.ApiUrl}/TLS0000/TLS4000`;

  constructor(private http: HttpClient) { }

  /** 查詢 POS1004M 資料表 (主檔) */
  queryTLS42010M(data: Tls42010MQuery): Observable<ApiResponse<POS1004Master[]>> {
    return this.http.post<ApiResponse<POS1004Master[]>>(`${this.apiUrl}/queryTLS42010M`, data);
  }

  /** 查詢 POS1004 資料表 (明細) */
  queryTLS42010_Detail(data: Tls42010DetailQuery): Observable<ApiResponse<POS1004Detail[]>> {
    return this.http.post<ApiResponse<POS1004Detail[]>>(`${this.apiUrl}/queryTLS42010_Detail`, data);
  }

  /** 新增 POS1004M 資料表 */
  insertTLS42010M(data: Tls42010InsertPayload): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.apiUrl}/insertTLS42010M`, data);
  }

  /** 更新 POS1004M 資料表 */
  updateTLS42010M(data: Tls42010UpdatePayload): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.apiUrl}/updateTLS42010M`, data);
  }

  /** 取得鍵盤編號下拉選單 */
  dropdownTLS42010(data: Tls42010DropdownReq = { USR_Level: [] }): Observable<ApiResponse<USRLevelOption[]>> {
    return this.http.post<ApiResponse<USRLevelOption[]>>(`${this.apiUrl}/dropdownTLS42010`, data);
  }

  /** 取得 功能代碼/名稱 下拉選單 */
  dropdownTLS42010Func(data: Tls42010DropdownReq = { KB_Func: [] }): Observable<{ label: string; value: string }[]> {
    return this.http.post<ApiResponse<KBFuncOption[]>>(`${this.apiUrl}/dropdownTLS42010Func`, data).pipe(
      map(res => {
        const list = res?.Data ?? [];
        return list.map(item => ({
          label: `${item.KB_Func} - ${item.KB_Desc}`,
          value: item.KB_Func
        }));
      })
    );
  }

  /** 根據 ID 列表刪除 POS1004M 資料 */
  deleteTLS42010(idList: string[]): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.apiUrl}/deleteTLS42010`, { idList });
  }

  /** 根據 USR_Level 和 KB_KeyPage 刪除特定的頁面資料 */
  deletepageTLS42010(data: { USR_Level: string; KB_KeyPage: number }): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.apiUrl}/deletepageTLS42010`, data);
  }

  /** 下檔 POS1004M 資料 (執行預存程序功能) */
  execSpFuncTLS42010(idList: string[]): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.apiUrl}/ExecSpFuncTLS42010`, { idList });
  }
}
