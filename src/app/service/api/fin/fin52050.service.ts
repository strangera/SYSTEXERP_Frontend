import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})

// 科目大分類代號維護
export class Fin52050Service {
  private apiUrl = `${environment.ApiUrl}/FIN0000/GLS1000`;
  constructor(private http: HttpClient) { }

  // 查詢 GLS1003 科目大類設定檔
  queryFIN52050(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryFIN52050`, data);
  }

  // 新增 GLS1003 科目大類設定檔
  insertFIN52050(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/insertFIN52050`, data);
  }

  updateFIN52050(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/updateFIN52050`, data);
  }
  deleteFIN52050(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/deleteFIN52050`, data);
  }
}
