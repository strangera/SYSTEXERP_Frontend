import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

// 科目中分類代號維護
export class Fin52060Service {
  private apiUrl = `${environment.ApiUrl}/FIN0000/GLS1000`;
  constructor(private http: HttpClient) {}
    
  // 查詢 GLS1004 科目類別設定檔
  queryFIN52060(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryFIN52060`, data);
  }
    
  // 新增 GLS1004 科目類別設定檔
  insertFIN52060(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/insertFIN52060`, data);
  }

  // 下拉 GLS1003 大分類列表
  queryClassAttrDropdown(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryClassAttrDropdown`, data);
  }
}
