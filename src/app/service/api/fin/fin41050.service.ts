import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

//主查詢API回應
export interface fin41050response {
  Status: string,
  Data: fin41050data[];
  Error: {
    Code: string;
    Message: string;
    Details: string;
  }
  TotalCount: number;
  TotalPage: number;
}

export interface fin41050data {
  ID: number;
  Org_ID: string; // 部門代號
  Org_Name: string; // 部門名稱
  Budget_Version: string; // 版本
  Budget_Year: string; // 年
  Budget_Month: string; // 月
  AccNo: string; // 會計科目
  AccCName: string; // 會計科目名稱
  Budget: string; // 金額
  Remark: string; // 備註
}

@Injectable({
  providedIn: 'root'
})
export class Fin41050Service {
  // 查詢部門預算編製明細維護
  apiUrl: string = environment.ApiUrl + '/Controllers/FIN40000';
  constructor(private http: HttpClient) { }

  // 查詢部門預算編製明細維護
  queryFIN41050(body: any): Observable<fin41050response> {
    return this.http.post<fin41050response>(`${this.apiUrl}/queryFIN41050`, body);
  }

  // 更新部門預算編製明細維護
  updateFIN41050(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/updateFIN41050`, body);
  }

  //刪除部門預算編製明細維護
  deleteFIN41050(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/deleteFIN41050`, body);
  }
}
