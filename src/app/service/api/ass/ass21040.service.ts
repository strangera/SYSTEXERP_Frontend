import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@service/system/auth.service';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface ClearingASS21040 {
  SYS_StoreNo: string;
  Mid: number;
  EngTypes: string;
  ClearingYM: string;
}

export interface ClearingASS21040Response {
  IsClearingSuccess: boolean;
  ErrorMsg: string;
}

// 新增取消結算的請求介面，與 ClearingASS21040 相同
export interface CancelClearingASS21040 {
  SYS_StoreNo: string;
  Mid: number;
  EngTypes: string;
  ClearingYM: string;
}

// 新增取消結算的響應介面
export interface CancelClearingASS21040Response {
  IsCancelClearingSuccess: boolean;
  ErrorMsg: string;
}

export interface printASS21040 {
  SYS_StoreNo: string;
  Mid: number;
  EngTypes: string;
  ClearingYM: string;
}

export interface printASS21040Response {
  Print_URL: string;
}

@Injectable({
  providedIn: 'root'
})
export class ASS21040Service {
  // 能源抄表作業
  apiUrl: string = environment.ApiUrl + '/ASS0000/ASS2000';

  constructor(private http: HttpClient) { }

  ClearingASS21040(body: ClearingASS21040): Observable<ApiResponse<ClearingASS21040Response>> {
    return this.http.post<ApiResponse<ClearingASS21040Response>>(`${this.apiUrl}/ClearingASS21040`, body);
  }

  printASS21040(body: printASS21040): Observable<ApiResponse<printASS21040Response>> {
    return this.http.post<ApiResponse<printASS21040Response>>(`${this.apiUrl}/printASS21040`, body);
  }

  /**
   * 取消結算能源攤提計算
   * @param body 包含 SYS_StoreNo, Mid, EngTypes, ClearingYM
   */
  CancelClearingASS21040(body: CancelClearingASS21040): Observable<ApiResponse<CancelClearingASS21040Response>> {
    return this.http.post<ApiResponse<CancelClearingASS21040Response>>(`${this.apiUrl}/CancelClearingASS21040`, body);
  }
}
