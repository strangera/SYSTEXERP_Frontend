import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

// 查詢條件介面
export interface TLS21040QueryRequest {
  CRD_BinCode?: string;
  BNK_No?: string;
  CRD_TypeList?: string[];
  CRD_KindList?: string[];
}

// 查詢結果資料介面
export interface TLS21040Data {
  id: number;
  CRD_BinCode: string;
  BNK_No: string;
  CRD_Type: string;
  CRD_Kind: string;
  Active_Date: string | Date | null;
  Disable_Date: string | Date | null;
  CRT_Date: string;
  CRT_USR_No: string;
  CRT_USR_Name: string;
  UPD_Date: string;
  UPD_USR_No: string;
  UPD_USR_Name: string;
  CanDel: boolean;
}

// 新增與更新使用的共通介面（更新時需加上 ID）
export interface TLS21040InsertRequest {
  CRD_BinCode: string;
  BNK_No: string;
  CRD_Type: string;
  CRD_Kind: string;
  Active_Date: string;
  Disable_Date: string;
}

export interface TLS21040UpdateRequest extends TLS21040InsertRequest {
  ID: number;
}

// 刪除
export interface TLS21040DeleteRequest {
  idList: number[];
}

@Injectable({
  providedIn: 'root',
})
export class Tls21040Service {
  private apiUrl = environment.ApiUrl + '/TLS0000/TLS2000';

  constructor(private http: HttpClient) { }

  /** 查詢 POS70011 資料表 */
  queryTLS21040(params: TLS21040QueryRequest): Observable<ApiResponse<TLS21040Data[]>> {
    return this.http.post<ApiResponse<TLS21040Data[]>>(`${this.apiUrl}/queryTLS21040`, params);
  }

  /** 新增 */
  insertTLS21040(data: TLS21040InsertRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/insertTLS21040`, data);
  }

  /** 更新 */
  updateTLS21040(data: TLS21040UpdateRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/updateTLS21040`, data);
  }

  /** 刪除 */
  deleteTLS21040(ids: number[]): Observable<ApiResponse<any>> {
    const body: TLS21040DeleteRequest = { idList: ids };
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/deleteTLS21040`, body);
  }

  /** 匯入檔案 */
  uploadTLS21040(file: File): Observable<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/uploadTLS21040`, formData);
  }
  downloadTLS21040Template(): Observable<HttpResponse<Blob>> {
    return this.http.get(`${this.apiUrl}/downloadTLS21040Template`, {
      observe: 'response',
      responseType: 'blob'
    });
  }
}
