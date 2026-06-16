import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from 'src/app/shared/utils/rxjs-operators/validate-api-response';
import { environment } from '../../../../environments/environment';
export interface TLS2J030Data {
  ID: number;
  /** 換開編號 */
  CHG_No: string;
  /** 換開日期 */
  GUI_InputDate: string;
  /** 換開發票日期 */
  TXN_Date: string;
  /** 收銀機號 */
  ECR_No: string;
  /** 交易序號 */
  TXN_No: number;
  /** 發票號碼 */
  TXN_GUINo: string;
  /** 銷售金額 */
  TXN_SaleAmt: number;
  /** 未稅金額 */
  TXN_Net: number;
  /** 免稅金額 */
  TXN_SaleNoTax: number;
  /** 稅額 */
  TXN_Tax: number;
  /** 換開狀態 */
  GUI_Status: string;
  /** 刪除日期 */
  GUI_CancelDate: string | null;
  /** 建立日期 */
  CRT_Date: string | null;
  /** 建立人員編號 */
  CRT_USR_No: string | null;
  /** 建立人員姓名 */
  CRT_USR_Name: string | null;
  /** 變更日期 */
  UPD_Date: string | null;
  /** 變更人員編號 */
  UPD_USR_No: string | null;
  /** 變更人員姓名 */
  UPD_USR_Name: string | null;
  /** 是否關帳 */
  isClose: string;
}
export interface TotalData {
  group_name: string; // 統計名稱 (通常是 "總計")
  TXN_SaleAmt: number;
  TXN_Net: number;
  TXN_SaleNoTax: number;
  TXN_Tax: number;
}
@Injectable({
  providedIn: 'root',
})
export class TLS2j030Service {
  private apiUrl = `${environment.ApiUrl}/TLS0000/TLS2000`;

  constructor(private http: HttpClient) { }

  queryTLS2J030(body: any): Observable<ApiResponse<TLS2J030Data[], TotalData[]>> {
    return this.http.post<ApiResponse<TLS2J030Data[], TotalData[]>>(`${this.apiUrl}/queryTLS2J030`, body);
  }
  queryTLS2J030Detail1(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS2J030Detail1`, data);
  }
  queryTLS2J030Detail2(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS2J030Detail2`, data);
  }
  queryTLS2J030Detail3(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS2J030Detail3`, data);
  }
  queryEcrNo() {
    return this.http.post(`${environment.ApiUrl}/TLS0000/TLS2000/queryEcrNo`, {});
  }
  queryTLS2J030TXN_GUI(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS2J030TXN_GUI`, data);
  }
  insertTLS2J030(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/insertTLS2J030`, data);
  }
  deleteTLS2J030(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/deleteTLS2J030`, data);
  }
  exportTLS2J030PDF(data: any): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/exportTLS2J030PDF`, data, { responseType: 'blob' });
  }
}

