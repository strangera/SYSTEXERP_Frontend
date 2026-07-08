import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { ITalentOption } from '../../utility/dropDownList.service';

export type ExportFileResponse = HttpResponse<Blob>;

export interface queryTLS2D010TLTTALENTRequest {
  tlt_noList?: string[]; // 查指定專櫃編號
  tlt_date?: string | null; // 查詢包含該日期的專櫃資料，格式為 yyyy-MM-dd
}

export interface queryTransStatusTLS2D010Response {
  Trans_yyyymm: string;
  Trans_Status: string;
}

@Injectable({
  providedIn: 'root'
})
export class Tls2d010Service {
  apiUrl = `${environment.ApiUrl}/TLS0000/TLS2000`;

  constructor(private http: HttpClient) { }

  queryTLS2D010(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS2D010`, data);
  }
  insertTLS2D010(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/insertTLS2D010`, data);
  }
  deleteTLS2D010(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/deleteTLS2D010`, data);
  }
  updateTLS2D010(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/updateTLS2D010`, data);
  }
  /** 匯入 Excel 檔 */
  uploadExcel(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/uploadExcel`, formData);
  }
  downloadTLS2D010Template(): Observable<ExportFileResponse> {
    return this.http.post(`${this.apiUrl}/downloadTLS2D010Template`, {}, {
      observe: 'response',
      responseType: 'blob'
    });
  }
  queryMaxClsMonth(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryMaxClsMonth`, {});
  }
  queryTransStatusTLS2D010(): Observable<ApiResponse<queryTransStatusTLS2D010Response[]>> {
    return this.http.post<ApiResponse<queryTransStatusTLS2D010Response[]>>(`${this.apiUrl}/queryTransStatusTLS2D010`, {});
  }
  // 查詢專櫃下拉 (取所有契約，含對應資料，依照傳入日期查詢有效的專櫃資料)
  queryTLS2D010TLTTALENTList(params: queryTLS2D010TLTTALENTRequest = {}): Observable<ApiResponse<ITalentOption[]>> {
    return this.http.post<ApiResponse<ITalentOption[]>>(
      `${this.apiUrl}/queryTLS2D010TLTTALENTList`, params
    ).pipe(
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }
}
