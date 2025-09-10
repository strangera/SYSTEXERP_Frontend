import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Fin13080Service {
  private apiUrl = `${environment.ApiUrl}/FIN0000/INV1000`;

  constructor(private http: HttpClient) {}

  // 查詢 例行作業-折讓資料刪除作業 (FIN13080)
  queryFIN13080(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryFIN13080`, data);
  }

  // 更新 例行作業-折讓資料刪除作業 (FIN13080)
  updateFIN13080(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/updateFIN13080`, data);
  }
}
