import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
// 科目三碼代號維護
export class Fin52070Service {
  private apiUrl = `${environment.ApiUrl}/FIN0000/GLS1000`;
  constructor(private http: HttpClient) { }

  // 查詢 GLS1004 科目類別設定檔
  queryFIN52070(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryFIN52070`, data);
  }

  // 新增 GLS1004 科目類別設定檔
  insertFIN52070(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/insertFIN52070`, data);
  }

  updateFIN52070(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/updateFIN52070`, data);
  }

  deleteFIN52070(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/deleteFIN52070`, data);
  }

  // 下拉 GLS1004 中分類列表
  queryParentClassDropdown(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryParentClassDropdown`, data);
  }
}
