import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
// 科目三碼代號維護
export class Fin52070Service {
  private apiUrl = `${environment.ApiUrl}/FIN0000/GLS1000`;
  constructor(private http: HttpClient) {}
    
  // 查詢 GLS1004 科目類別設定檔
  queryFIN52070(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryFIN520700`, data);
  }
    
  // 新增 GLS1004 科目類別設定檔
  insertFIN52070(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/insertFIN520700`, data);
  }

  // 下拉 GLS1004 中分類列表
  queryParentClassDropdown(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryParentClassDropdown`, data);
  }
}
