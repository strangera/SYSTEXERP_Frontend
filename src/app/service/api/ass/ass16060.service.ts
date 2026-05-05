import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ASS16060QueryRequest, ASS16060QueryRow } from '@pages/ass/ass16060/ass16060.model';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

// Response 資料結構（CRU / 畫面用，與查詢列 ASS16060QueryRow 分開）
export interface ASS16060Data {
  id: string;
  returnNote: string; // 退回單號
  returnerCode: string; // 退回人代號
  warehouse: string; // 倉別
  departmentCode: string; // 部門代號
  returnDate: string; // 退回日期
  returnStatus: string; // 退回狀態
  detailCount: string; // 明細筆數
}

export interface ASS16060DetailData {
  id: string;
  itemCode: string; // 品項代碼
  unit: string; // 單位
  returnQty: string; // 退回數量
  remark: string; // 說明
}

/** 新增更新資料介面 */
export interface ASS16060Request {
  id?: number; // 記錄 ID
  warehouse: string; // 倉別
  returnerCode: string; // 退回人代號
  departmentCode: string; // 部門代號
  applyDate: string; // 申請日期
  retExp: string; // 退回說明
  items: ASS16060DetailData[]; // 明細資料
}

@Injectable({
  providedIn: 'root',
})
export class ASS16060Service {
  private readonly apiUrl = `${environment.ApiUrl}/ASS0000/ASS1000`;

  constructor(private readonly http: HttpClient) {}

  queryASS16060(
    body: ASS16060QueryRequest,
  ): Observable<ApiResponse<ASS16060QueryRow[]>> {
    return this.http.post<ApiResponse<ASS16060QueryRow[]>>(
      `${this.apiUrl}/queryASS16060`,
      body,
    );
  }
}
