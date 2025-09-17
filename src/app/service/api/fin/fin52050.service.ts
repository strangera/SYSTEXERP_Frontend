import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

// 科目大分類代號維護
export class Fin52050Service {
  private apiUrl = `${environment.ApiUrl}/FIN0000/GLS1000`;
  constructor(private http: HttpClient) {}
  
  // 查詢 GLS1003 科目大類設定檔
  queryFIN52050(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryFIN52050`, data);
  }
  
  // 新增 GLS1003 科目大類設定檔
  insertFIN52050(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/insertFIN52050`, data);
  }
}
